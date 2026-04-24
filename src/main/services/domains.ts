import { shell } from 'electron'
import Store from 'electron-store'
import { v4 as uuidv4 } from 'uuid'
import { exec, spawn, ChildProcess } from 'child_process'
import { promisify } from 'util'
import { updateCaddyConfig } from './caddy'
import { addHostEntry, removeHostEntry } from './hosts'

const execAsync = promisify(exec)

export interface Domain {
  id: string
  name: string
  tld: string
  port: number
  projectPath?: string
  startCommand?: string
  env?: Record<string, string>
  autoStart: boolean
  openBrowserOnStart: boolean
  isRunning?: boolean
  pid?: number
  createdAt: Date
  updatedAt: Date
}

interface DomainsStore {
  domains: Domain[]
}

const store = new Store<DomainsStore>({
  name: 'domains',
  defaults: {
    domains: []
  }
})

// Track running processes
const runningProcesses: Map<string, ChildProcess> = new Map()

export async function getDomains(): Promise<Domain[]> {
  const domains = store.get('domains', [])
  
  // Check which domains are actually running
  const domainsWithStatus = await Promise.all(
    domains.map(async (domain) => {
      const isRunning = await checkPortInUse(domain.port)
      return { ...domain, isRunning }
    })
  )
  
  return domainsWithStatus
}

export async function addDomain(
  domainData: Omit<Domain, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Domain> {
  const domains = store.get('domains', [])
  
  // Check if domain name already exists
  const exists = domains.some(d => d.name === domainData.name)
  if (exists) {
    throw new Error(`Domain ${domainData.name} already exists`)
  }
  
  // Check if port is already mapped
  const portExists = domains.some(d => d.port === domainData.port)
  if (portExists) {
    throw new Error(`Port ${domainData.port} is already mapped to another domain`)
  }
  
  const newDomain: Domain = {
    ...domainData,
    id: uuidv4(),
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  // Add to /etc/hosts
  const fullDomain = `${newDomain.name}${newDomain.tld}`
  await addHostEntry(fullDomain)
  
  // Update Caddy config
  await updateCaddyConfig([...domains, newDomain])
  
  // Save to store
  store.set('domains', [...domains, newDomain])
  
  return newDomain
}

export async function updateDomain(
  id: string, 
  data: Partial<Domain>
): Promise<Domain> {
  const domains = store.get('domains', [])
  const index = domains.findIndex(d => d.id === id)
  
  if (index === -1) {
    throw new Error(`Domain with id ${id} not found`)
  }
  
  const oldDomain = domains[index]
  const updatedDomain: Domain = {
    ...oldDomain,
    ...data,
    updatedAt: new Date()
  }
  
  // If domain name changed, update hosts
  if (data.name && data.name !== oldDomain.name) {
    const oldFullDomain = `${oldDomain.name}${oldDomain.tld}`
    const newFullDomain = `${updatedDomain.name}${updatedDomain.tld}`
    await removeHostEntry(oldFullDomain)
    await addHostEntry(newFullDomain)
  }
  
  domains[index] = updatedDomain
  
  // Update Caddy config
  await updateCaddyConfig(domains)
  
  store.set('domains', domains)
  
  return updatedDomain
}

export async function removeDomain(id: string): Promise<void> {
  const domains = store.get('domains', [])
  const domain = domains.find(d => d.id === id)
  
  if (!domain) {
    throw new Error(`Domain with id ${id} not found`)
  }
  
  // Stop if running
  if (runningProcesses.has(id)) {
    await stopDomain(id)
  }
  
  // Remove from hosts
  const fullDomain = `${domain.name}${domain.tld}`
  await removeHostEntry(fullDomain)
  
  // Update store
  const filteredDomains = domains.filter(d => d.id !== id)
  store.set('domains', filteredDomains)
  
  // Update Caddy config
  await updateCaddyConfig(filteredDomains)
}

export async function startDomain(id: string): Promise<boolean> {
  const domains = store.get('domains', [])
  const domain = domains.find(d => d.id === id)
  
  if (!domain) {
    throw new Error(`Domain with id ${id} not found`)
  }
  
  if (!domain.startCommand || !domain.projectPath) {
    throw new Error('Start command and project path are required')
  }
  
  // Check if already running
  if (await checkPortInUse(domain.port)) {
    return true
  }
  
  // Parse command
  const [cmd, ...args] = domain.startCommand.split(' ')
  
  const child = spawn(cmd, args, {
    cwd: domain.projectPath,
    env: { ...process.env, ...domain.env },
    shell: true,
    detached: true,
    stdio: 'ignore'
  })
  
  child.unref()
  runningProcesses.set(id, child)
  
  // Wait a bit for the process to start
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Open browser if configured
  if (domain.openBrowserOnStart) {
    const fullDomain = `${domain.name}${domain.tld}`
    shell.openExternal(`http://${fullDomain}`)
  }
  
  return true
}

export async function stopDomain(id: string): Promise<boolean> {
  const domains = store.get('domains', [])
  const domain = domains.find(d => d.id === id)
  
  if (!domain) {
    throw new Error(`Domain with id ${id} not found`)
  }
  
  // Find and kill process on the port
  try {
    await execAsync(
      `lsof -ti :${domain.port} | xargs kill -9 2>/dev/null || true`
    )
    
    runningProcesses.delete(id)
    return true
  } catch (error) {
    console.error('Error stopping domain:', error)
    return false
  }
}

async function checkPortInUse(port: number): Promise<boolean> {
  try {
    await execAsync(`lsof -ti :${port}`)
    return true
  } catch {
    return false
  }
}
