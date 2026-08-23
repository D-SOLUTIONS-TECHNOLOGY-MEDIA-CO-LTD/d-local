import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import { Domain } from './domains'
import { findCaddyPath, downloadCaddy } from './caddy-installer'
import { getConfig } from './config'
import { getPortOwner, PortOwner } from './ports'

const execAsync = promisify(exec)

const CADDY_CONFIG_DIR = join(homedir(), '.config', 'd-local')
const CADDY_CONFIG_PATH = join(CADDY_CONFIG_DIR, 'Caddyfile')

let resolvedCaddyPath: string | null = null

// Last user-facing error from a start/reload attempt, surfaced in the UI so
// failures (e.g. a port conflict) are visible instead of silently swallowed.
let lastError: string | null = null

function getHttpPort(): number {
  const port = getConfig().httpPort
  return typeof port === 'number' && port > 0 ? port : 80
}

/**
 * Extract the human-readable reason from a caddy CLI error. Caddy prints
 * structured JSON logs plus a trailing `Error: ...` line; surface the latter.
 */
function parseCaddyError(err: unknown): string {
  const raw = (err as { stderr?: string; message?: string })?.stderr
    || (err as Error)?.message
    || String(err)
  const match = raw.match(/Error:\s*(.+)/)
  return (match ? match[1] : raw).split('\n')[0].trim()
}

async function getCaddyBin(): Promise<string | null> {
  if (resolvedCaddyPath) return resolvedCaddyPath
  resolvedCaddyPath = await findCaddyPath()
  return resolvedCaddyPath
}

export interface CaddyStatus {
  isRunning: boolean
  isInstalled: boolean
  isDownloading?: boolean
  pid?: number
  version?: string
  httpPort: number
  // Last start/reload error, if any (e.g. port already in use).
  lastError?: string | null
  // Set when the HTTP port is held by a process that is not our caddy.
  portConflict?: PortOwner | null
}

export async function getCaddyStatus(): Promise<CaddyStatus> {
  const httpPort = getHttpPort()
  const status: CaddyStatus = {
    isRunning: false,
    isInstalled: false,
    httpPort,
    lastError
  }

  const caddyBin = await getCaddyBin()
  if (!caddyBin) return status

  try {
    const { stdout: versionOutput } = await execAsync(`"${caddyBin}" version`)
    status.isInstalled = true
    status.version = versionOutput.trim().split(' ')[0]
  } catch {
    return status
  }

  try {
    const { stdout: pidOutput } = await execAsync('pgrep -x caddy')
    if (pidOutput.trim()) {
      status.isRunning = true
      status.pid = parseInt(pidOutput.trim().split('\n')[0], 10)
    }
  } catch {
    // Not running
  }

  // Flag the case where something else holds our HTTP port (Caddy can't bind it).
  if (!status.isRunning) {
    const owner = await getPortOwner(httpPort)
    if (owner && owner.command !== 'caddy') {
      status.portConflict = owner
    }
  }

  return status
}

export async function ensureCaddy(): Promise<string> {
  const existing = await findCaddyPath()
  if (existing) {
    resolvedCaddyPath = existing
    return existing
  }

  const downloaded = await downloadCaddy()
  resolvedCaddyPath = downloaded
  return downloaded
}

export async function startCaddy(): Promise<boolean> {
  const caddyBin = await getCaddyBin()
  if (!caddyBin) {
    const downloaded = await ensureCaddy()
    if (!downloaded) return false
  }

  const bin = resolvedCaddyPath!

  if (!existsSync(CADDY_CONFIG_DIR)) {
    await mkdir(CADDY_CONFIG_DIR, { recursive: true })
  }

  if (!existsSync(CADDY_CONFIG_PATH)) {
    await writeFile(CADDY_CONFIG_PATH, '# D-Local Caddyfile\n')
  }

  // Pre-flight: if the HTTP port is already held by another process, fail with a
  // clear reason instead of letting caddy die with a cryptic bind error.
  const httpPort = getHttpPort()
  const owner = await getPortOwner(httpPort)
  if (owner && owner.command !== 'caddy') {
    lastError = `Port ${httpPort} is in use by ${owner.command} (pid ${owner.pid}). `
      + `Stop it or change the HTTP port in Settings.`
    console.error('Error starting Caddy:', lastError)
    return false
  }

  try {
    await execAsync(
      `"${bin}" start --config "${CADDY_CONFIG_PATH}" --adapter caddyfile`
    )
    lastError = null
    return true
  } catch (error) {
    lastError = parseCaddyError(error)
    console.error('Error starting Caddy:', error)
    return false
  }
}

export async function stopCaddy(): Promise<boolean> {
  const bin = await getCaddyBin()
  if (!bin) return false

  try {
    await execAsync(`"${bin}" stop`)
    return true
  } catch (error) {
    console.error('Error stopping Caddy:', error)
    return false
  }
}

export async function reloadCaddy(): Promise<boolean> {
  const bin = await getCaddyBin()
  if (!bin) return false

  try {
    await execAsync(
      `"${bin}" reload --config "${CADDY_CONFIG_PATH}" --adapter caddyfile`
    )
    lastError = null
    return true
  } catch (error) {
    console.error('Error reloading Caddy:', error)

    await stopCaddy()
    return startCaddy()
  }
}

export async function updateCaddyConfig(domains: Domain[]): Promise<void> {
  if (!existsSync(CADDY_CONFIG_DIR)) {
    await mkdir(CADDY_CONFIG_DIR, { recursive: true })
  }

  const content = generateCaddyfile(domains, getHttpPort())
  await writeFile(CADDY_CONFIG_PATH, content, 'utf-8')

  const status = await getCaddyStatus()
  if (status.isRunning) {
    await reloadCaddy()
  }
}

function generateCaddyfile(domains: Domain[], httpPort: number): string {
  const lines: string[] = [
    '# D-Local Caddyfile',
    '# Auto-generated - Do not edit manually',
    ''
  ]

  // A bare port suffix is only needed for non-standard ports; `http://foo.local`
  // already implies :80 and keeps the URL clean.
  const portSuffix = httpPort === 80 ? '' : `:${httpPort}`

  for (const domain of domains) {
    const fullDomain = `${domain.name}${domain.tld}`
    // Use the http:// scheme so Caddy serves plain HTTP only. A bare site
    // address (e.g. `foo.local {`) makes Caddy enable automatic HTTPS and bind
    // port 443; on machines where another service already holds 443 (Tailscale,
    // VPNs, etc.) Caddy fails to start with "address already in use" and no
    // proxy runs. HTTP also avoids the self-signed cert trust prompts that
    // `.local` HTTPS would otherwise require.
    lines.push(`# ${domain.name}`)
    lines.push(`http://${fullDomain}${portSuffix} {`)
    lines.push(`    reverse_proxy localhost:${domain.port}`)
    lines.push('}')
    lines.push('')
  }

  return lines.join('\n')
}

export async function getCaddyLogs(lines: number = 50): Promise<string[]> {
  try {
    const { stdout } = await execAsync(
      `tail -n ${lines} /tmp/caddy.log 2>/dev/null || echo "No logs available"`
    )
    return stdout.split('\n').filter(line => line.trim())
  } catch {
    return ['No logs available']
  }
}
