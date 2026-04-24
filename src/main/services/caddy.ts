import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'
import { homedir } from 'os'
import { Domain } from './domains'
import { findCaddyPath, downloadCaddy } from './caddy-installer'

const execAsync = promisify(exec)

const CADDY_CONFIG_DIR = join(homedir(), '.config', 'd-local')
const CADDY_CONFIG_PATH = join(CADDY_CONFIG_DIR, 'Caddyfile')

let resolvedCaddyPath: string | null = null

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
}

export async function getCaddyStatus(): Promise<CaddyStatus> {
  const status: CaddyStatus = {
    isRunning: false,
    isInstalled: false
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

  try {
    await execAsync(
      `"${bin}" start --config "${CADDY_CONFIG_PATH}" --adapter caddyfile`
    )
    return true
  } catch (error) {
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

  const content = generateCaddyfile(domains)
  await writeFile(CADDY_CONFIG_PATH, content, 'utf-8')

  const status = await getCaddyStatus()
  if (status.isRunning) {
    await reloadCaddy()
  }
}

function generateCaddyfile(domains: Domain[]): string {
  const lines: string[] = [
    '# D-Local Caddyfile',
    '# Auto-generated - Do not edit manually',
    ''
  ]

  for (const domain of domains) {
    const fullDomain = `${domain.name}${domain.tld}`
    lines.push(`# ${domain.name}`)
    lines.push(`${fullDomain} {`)
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
