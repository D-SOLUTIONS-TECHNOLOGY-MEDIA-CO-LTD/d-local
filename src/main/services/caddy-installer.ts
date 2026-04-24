import { exec } from 'child_process'
import { promisify } from 'util'
import { mkdir, chmod, unlink } from 'fs/promises'
import { existsSync, createWriteStream } from 'fs'
import { join } from 'path'
import { homedir, arch, platform } from 'os'
import { get } from 'https'

const execAsync = promisify(exec)

const CADDY_VERSION = '2.9.1'
const CADDY_BIN_DIR = join(homedir(), '.config', 'd-local', 'bin')
const CADDY_BIN_PATH = join(CADDY_BIN_DIR, 'caddy')

export function getBundledCaddyPath(): string {
  return CADDY_BIN_PATH
}

export function isCaddyDownloaded(): boolean {
  return existsSync(CADDY_BIN_PATH)
}

export async function findCaddyPath(): Promise<string | null> {
  if (existsSync(CADDY_BIN_PATH)) {
    return CADDY_BIN_PATH
  }

  try {
    const { stdout } = await execAsync('which caddy')
    const systemPath = stdout.trim()
    if (systemPath) return systemPath
  } catch {
    // not on PATH
  }

  const commonPaths = [
    '/opt/homebrew/bin/caddy',
    '/usr/local/bin/caddy',
    '/usr/bin/caddy'
  ]
  for (const p of commonPaths) {
    if (existsSync(p)) return p
  }

  return null
}

function getDownloadUrl(): string {
  const os = platform()
  const cpu = arch()

  let osPart: string
  if (os === 'darwin') {
    osPart = 'mac'
  } else if (os === 'linux') {
    osPart = 'linux'
  } else if (os === 'win32') {
    osPart = 'windows'
  } else {
    throw new Error(`Unsupported platform: ${os}`)
  }

  let archPart: string
  if (cpu === 'arm64') {
    archPart = 'arm64'
  } else if (cpu === 'x64') {
    archPart = 'amd64'
  } else {
    throw new Error(`Unsupported architecture: ${cpu}`)
  }

  const ext = os === 'win32' ? 'zip' : 'tar.gz'
  return `https://github.com/caddyserver/caddy/releases/download/v${CADDY_VERSION}/caddy_${CADDY_VERSION}_${osPart}_${archPart}.${ext}`
}

function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const follow = (currentUrl: string) => {
      get(currentUrl, (res) => {
        if (res.statusCode === 302 || res.statusCode === 301) {
          const location = res.headers.location
          if (!location) return reject(new Error('Redirect without location'))
          follow(location)
          return
        }

        if (res.statusCode !== 200) {
          return reject(new Error(`Download failed with status ${res.statusCode}`))
        }

        const file = createWriteStream(destPath)
        res.pipe(file)
        file.on('finish', () => {
          file.close()
          resolve()
        })
        file.on('error', (err) => {
          file.close()
          reject(err)
        })
      }).on('error', reject)
    }
    follow(url)
  })
}

export async function downloadCaddy(
  onProgress?: (stage: string) => void
): Promise<string> {
  await mkdir(CADDY_BIN_DIR, { recursive: true })

  const url = getDownloadUrl()
  const tmpArchive = join(CADDY_BIN_DIR, 'caddy-download.tar.gz')

  try {
    onProgress?.('downloading')
    await downloadFile(url, tmpArchive)

    onProgress?.('extracting')
    await execAsync(`tar -xzf "${tmpArchive}" -C "${CADDY_BIN_DIR}" caddy`)

    await chmod(CADDY_BIN_PATH, 0o755)

    onProgress?.('done')
    return CADDY_BIN_PATH
  } finally {
    if (existsSync(tmpArchive)) {
      await unlink(tmpArchive).catch(() => {})
    }
  }
}
