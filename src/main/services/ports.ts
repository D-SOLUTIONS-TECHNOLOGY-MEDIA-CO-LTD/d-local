import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export interface PortOwner {
  pid: number
  command: string
}

/**
 * Return the process currently LISTENING on a TCP port, or null if free.
 * Uses lsof; only reports listeners this user can see. A caddy-owned port is
 * still reported (callers decide whether that is a conflict or our own server).
 */
export async function getPortOwner(port: number): Promise<PortOwner | null> {
  try {
    // -F pc prints machine-readable fields: p<pid>, c<command>.
    // +c 0 disables the default 9-char command-name truncation.
    const { stdout } = await execAsync(
      `lsof -nP +c 0 -iTCP:${port} -sTCP:LISTEN -F pc`
    )
    let pid = 0
    let command = ''
    for (const line of stdout.split('\n')) {
      if (line.startsWith('p')) pid = parseInt(line.slice(1), 10)
      else if (line.startsWith('c')) command = line.slice(1)
    }
    if (!pid) return null
    return { pid, command }
  } catch {
    // Non-zero exit from lsof means nothing is listening on the port.
    return null
  }
}
