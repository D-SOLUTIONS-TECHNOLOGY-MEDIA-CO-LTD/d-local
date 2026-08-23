import { exec } from 'child_process'
import { promisify } from 'util'
import { existsSync } from 'fs'

const execAsync = promisify(exec)

// Tailscale ships its CLI inside the app bundle on macOS; also check the common
// Homebrew / system locations.
const TAILSCALE_PATHS = [
  '/Applications/Tailscale.app/Contents/MacOS/Tailscale',
  '/opt/homebrew/bin/tailscale',
  '/usr/local/bin/tailscale',
  '/usr/bin/tailscale'
]

// Base HTTPS port for D-Local's Tailscale Serve mappings. Kept well clear of the
// default 443 (which Tailscale Serve/other services may already use) so we never
// disturb an existing mapping.
export const TAILSCALE_PORT_BASE = 18443

let resolvedBin: string | null = null

async function getBin(): Promise<string | null> {
  if (resolvedBin) return resolvedBin
  for (const p of TAILSCALE_PATHS) {
    if (existsSync(p)) {
      resolvedBin = p
      return p
    }
  }
  try {
    const { stdout } = await execAsync('which tailscale')
    if (stdout.trim()) {
      resolvedBin = stdout.trim()
      return resolvedBin
    }
  } catch {
    // not on PATH
  }
  return null
}

function parseError(err: unknown): string {
  const raw = (err as { stderr?: string; message?: string })?.stderr
    || (err as Error)?.message
    || String(err)
  return raw.split('\n').filter(Boolean).pop()?.trim() || 'Tailscale error'
}

export interface TailscaleStatus {
  installed: boolean
  running: boolean
  // MagicDNS name of this machine, trailing dot stripped (e.g. host.tailnet.ts.net).
  dnsName?: string
}

export async function getTailscaleStatus(): Promise<TailscaleStatus> {
  const bin = await getBin()
  if (!bin) return { installed: false, running: false }

  try {
    const { stdout } = await execAsync(`"${bin}" status --json`)
    const data = JSON.parse(stdout)
    const running = data.BackendState === 'Running'
    const dnsName = String(data.Self?.DNSName || '').replace(/\.$/, '')
    return { installed: true, running, dnsName: dnsName || undefined }
  } catch {
    return { installed: true, running: false }
  }
}

export interface ServeResult {
  ok: boolean
  url?: string
  error?: string
}

/**
 * Expose a local port to the tailnet over HTTPS at a dedicated port, so other
 * devices (e.g. a phone) can reach the dev server. Uses a distinct HTTPS port
 * per domain — never the default 443 — to avoid disturbing an existing serve.
 */
export async function serveDomain(
  localPort: number,
  tailscalePort: number
): Promise<ServeResult> {
  const bin = await getBin()
  if (!bin) return { ok: false, error: 'Tailscale is not installed' }

  const status = await getTailscaleStatus()
  if (!status.running || !status.dnsName) {
    return { ok: false, error: 'Tailscale is not connected' }
  }

  try {
    await execAsync(
      `"${bin}" serve --bg --https=${tailscalePort} http://127.0.0.1:${localPort}`
    )
    return { ok: true, url: `https://${status.dnsName}:${tailscalePort}` }
  } catch (error) {
    return { ok: false, error: parseError(error) }
  }
}

/** Remove the tailnet mapping for a given HTTPS port. */
export async function unserveDomain(tailscalePort: number): Promise<ServeResult> {
  const bin = await getBin()
  if (!bin) return { ok: false, error: 'Tailscale is not installed' }

  try {
    await execAsync(`"${bin}" serve --https=${tailscalePort} off`)
    return { ok: true }
  } catch (error) {
    return { ok: false, error: parseError(error) }
  }
}
