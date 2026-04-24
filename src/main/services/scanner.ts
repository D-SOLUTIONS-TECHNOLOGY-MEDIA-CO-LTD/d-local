import { exec } from 'child_process'
import { promisify } from 'util'
import { basename } from 'path'

const execAsync = promisify(exec)

export interface ScanResult {
  port: number
  pid: number
  processName: string
  cwd?: string
  suggestedName: string
}

export async function scanPorts(start: number, end: number): Promise<ScanResult[]> {
  const results: ScanResult[] = []
  
  try {
    // Get all listening TCP ports
    const { stdout } = await execAsync(
      `lsof -iTCP -sTCP:LISTEN -n -P 2>/dev/null || true`
    )
    
    const lines = stdout.split('\n').filter(line => line.trim())
    
    // Skip header line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]
      const parts = line.split(/\s+/)
      
      if (parts.length < 9) continue
      
      const processName = parts[0]
      const pid = parseInt(parts[1], 10)
      
      // Extract port from the address column (e.g., "*:3000" or "127.0.0.1:3000")
      const addressCol = parts[8]
      const portMatch = addressCol.match(/:(\d+)$/)
      
      if (!portMatch) continue
      
      const port = parseInt(portMatch[1], 10)
      
      // Filter by range
      if (port < start || port > end) continue
      
      // Skip system services (common ports)
      if (isSystemService(port, processName)) continue
      
      // Get working directory if possible
      let cwd: string | undefined
      try {
        const { stdout: cwdOutput } = await execAsync(
          `lsof -p ${pid} 2>/dev/null | grep cwd | awk '{print $NF}'`
        )
        cwd = cwdOutput.trim() || undefined
      } catch {
        // Ignore errors getting cwd
      }
      
      // Generate suggested name
      const suggestedName = generateSuggestedName(processName, cwd, port)
      
      // Check if already in results (avoid duplicates)
      if (!results.some(r => r.port === port)) {
        results.push({
          port,
          pid,
          processName,
          cwd,
          suggestedName
        })
      }
    }
    
    // Sort by port
    results.sort((a, b) => a.port - b.port)
    
  } catch (error) {
    console.error('Error scanning ports:', error)
  }
  
  return results
}

function isSystemService(port: number, processName: string): boolean {
  // Common system services to skip
  const systemServices = [
    'postgres', 'mysql', 'mysqld', 'redis', 'redis-server',
    'mongod', 'mongodb', 'docker', 'containerd',
    'nginx', 'apache', 'httpd', 'caddy'
  ]
  
  // Common system ports
  const systemPorts = [
    22,    // SSH
    80,    // HTTP
    443,   // HTTPS
    3306,  // MySQL
    5432,  // PostgreSQL
    6379,  // Redis
    27017, // MongoDB
  ]
  
  if (systemPorts.includes(port)) return true
  if (systemServices.some(s => processName.toLowerCase().includes(s))) return true
  
  return false
}

function generateSuggestedName(
  processName: string, 
  cwd?: string, 
  port?: number
): string {
  // Try to get name from working directory
  if (cwd) {
    const dirName = basename(cwd)
    
    // Skip generic directory names
    const genericNames = ['src', 'app', 'dist', 'build', 'home', 'Users']
    if (!genericNames.includes(dirName)) {
      return sanitizeName(dirName)
    }
    
    // Try parent directory
    const parentDir = basename(cwd.replace(/\/[^/]+$/, ''))
    if (!genericNames.includes(parentDir)) {
      return sanitizeName(parentDir)
    }
  }
  
  // Try to extract from process name
  if (processName && processName !== 'node') {
    return sanitizeName(processName)
  }
  
  // Fallback to port-based name
  return `project-${port}`
}

function sanitizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 30)
}

export async function getProcessInfo(pid: number): Promise<{
  name: string
  cwd?: string
  command?: string
} | null> {
  try {
    const { stdout: nameOutput } = await execAsync(`ps -p ${pid} -o comm=`)
    const name = nameOutput.trim()
    
    const { stdout: cwdOutput } = await execAsync(
      `lsof -p ${pid} 2>/dev/null | grep cwd | awk '{print $NF}'`
    )
    const cwd = cwdOutput.trim() || undefined
    
    const { stdout: cmdOutput } = await execAsync(`ps -p ${pid} -o args=`)
    const command = cmdOutput.trim() || undefined
    
    return { name, cwd, command }
  } catch {
    return null
  }
}
