import { exec } from 'child_process'
import { promisify } from 'util'
import { readFile, writeFile } from 'fs/promises'

const execAsync = promisify(exec)

const HOSTS_PATH = '/etc/hosts'
const START_MARKER = '# D-Local managed - DO NOT EDIT'
const END_MARKER = '# End D-Local managed'

export async function addHostEntry(domain: string): Promise<void> {
  const content = await readFile(HOSTS_PATH, 'utf-8')
  const entry = `127.0.0.1 ${domain}`
  
  // Check if entry already exists
  if (content.includes(entry)) {
    return
  }
  
  let newContent: string
  
  if (content.includes(START_MARKER)) {
    // Add entry before END_MARKER
    newContent = content.replace(
      END_MARKER,
      `${entry}\n${END_MARKER}`
    )
  } else {
    // Add markers and entry at the end
    newContent = content.trimEnd() + '\n\n' +
      START_MARKER + '\n' +
      entry + '\n' +
      END_MARKER + '\n'
  }
  
  await writeHostsWithSudo(newContent)
}

export async function removeHostEntry(domain: string): Promise<void> {
  const content = await readFile(HOSTS_PATH, 'utf-8')
  const entry = `127.0.0.1 ${domain}`
  
  // Check if entry exists
  if (!content.includes(entry)) {
    return
  }
  
  // Remove the entry line
  const lines = content.split('\n')
  const filteredLines = lines.filter(line => line.trim() !== entry)
  
  // Clean up empty managed section
  let newContent = filteredLines.join('\n')
  
  // Check if managed section is empty
  const startIndex = newContent.indexOf(START_MARKER)
  const endIndex = newContent.indexOf(END_MARKER)
  
  if (startIndex !== -1 && endIndex !== -1) {
    const managedSection = newContent.substring(
      startIndex + START_MARKER.length,
      endIndex
    ).trim()
    
    // If empty, remove the entire section
    if (!managedSection) {
      newContent = newContent.substring(0, startIndex).trimEnd() +
        newContent.substring(endIndex + END_MARKER.length)
    }
  }
  
  await writeHostsWithSudo(newContent)
}

export async function getHostEntries(): Promise<string[]> {
  const content = await readFile(HOSTS_PATH, 'utf-8')
  
  const startIndex = content.indexOf(START_MARKER)
  const endIndex = content.indexOf(END_MARKER)
  
  if (startIndex === -1 || endIndex === -1) {
    return []
  }
  
  const managedSection = content.substring(
    startIndex + START_MARKER.length,
    endIndex
  )
  
  return managedSection
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && line.startsWith('127.0.0.1'))
    .map(line => line.replace('127.0.0.1 ', ''))
}

async function writeHostsWithSudo(content: string): Promise<void> {
  // Create a temp file
  const tempFile = `/tmp/hosts-${Date.now()}`
  await writeFile(tempFile, content, 'utf-8')
  
  // Use osascript to prompt for password and copy file
  const script = `
    do shell script "cp '${tempFile}' '${HOSTS_PATH}' && rm '${tempFile}'" with administrator privileges
  `.trim()
  
  try {
    await execAsync(`osascript -e '${script}'`)
  } catch (error: any) {
    // Clean up temp file
    await execAsync(`rm -f '${tempFile}'`).catch(() => {})
    
    if (error.message?.includes('User canceled')) {
      throw new Error('Permission denied by user')
    }
    throw error
  }
}

export async function checkHostsWritable(): Promise<boolean> {
  try {
    // Check if we can read the file
    await readFile(HOSTS_PATH, 'utf-8')
    return true
  } catch {
    return false
  }
}
