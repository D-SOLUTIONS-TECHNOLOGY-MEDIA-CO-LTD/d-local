import { app } from 'electron'
import Store from 'electron-store'
import { writeFile, readFile } from 'fs/promises'
import { Domain } from './domains'

export interface AppConfig {
  language: 'en' | 'vi'
  theme: 'system' | 'light' | 'dark'
  launchAtLogin: boolean
  startMinimized: boolean
  showNotifications: boolean
  defaultTld: string
  portScanRange: {
    start: number
    end: number
  }
  claudeCodePath: string
  watchFolders: string[]
  caddyPath: string
}

export interface ExportData {
  version: string
  exportedAt: string
  domains: Domain[]
  settings?: Partial<AppConfig>
}

const defaultConfig: AppConfig = {
  language: 'en',
  theme: 'system',
  launchAtLogin: false,
  startMinimized: false,
  showNotifications: true,
  defaultTld: '.local',
  portScanRange: {
    start: 3000,
    end: 9000
  },
  claudeCodePath: '/usr/local/bin/claude',
  watchFolders: [],
  caddyPath: '/opt/homebrew/bin/caddy'
}

const store = new Store<{ config: AppConfig }>({
  name: 'config',
  defaults: {
    config: defaultConfig
  }
})

export function getConfig(): AppConfig {
  return store.get('config', defaultConfig)
}

export function updateConfig(partial: Partial<AppConfig>): AppConfig {
  const current = getConfig()
  const updated = { ...current, ...partial }
  store.set('config', updated)
  
  // Handle launch at login
  if (partial.launchAtLogin !== undefined) {
    setLaunchAtLogin(partial.launchAtLogin)
  }
  
  return updated
}

export async function exportConfig(filePath: string): Promise<void> {
  const domainsStore = new Store<{ domains: Domain[] }>({ name: 'domains' })
  const domains = domainsStore.get('domains', [])
  const config = getConfig()
  
  const exportData: ExportData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    domains: domains.map(d => ({
      ...d,
      // Remove runtime properties
      isRunning: undefined,
      pid: undefined
    })) as Domain[],
    settings: config
  }
  
  await writeFile(filePath, JSON.stringify(exportData, null, 2), 'utf-8')
}

export async function importConfig(filePath: string): Promise<{
  domainsImported: number
  settingsImported: boolean
}> {
  const content = await readFile(filePath, 'utf-8')
  const data = JSON.parse(content) as ExportData
  
  // Validate version
  if (!data.version || !data.domains) {
    throw new Error('Invalid config file format')
  }
  
  const result = {
    domainsImported: 0,
    settingsImported: false
  }
  
  // Import domains
  if (data.domains && data.domains.length > 0) {
    const domainsStore = new Store<{ domains: Domain[] }>({ name: 'domains' })
    const existingDomains = domainsStore.get('domains', [])
    
    // Merge domains, skip duplicates by name
    const existingNames = new Set(existingDomains.map(d => d.name))
    const newDomains = data.domains.filter(d => !existingNames.has(d.name))
    
    domainsStore.set('domains', [...existingDomains, ...newDomains])
    result.domainsImported = newDomains.length
  }
  
  // Import settings
  if (data.settings) {
    updateConfig(data.settings)
    result.settingsImported = true
  }
  
  return result
}

function setLaunchAtLogin(enable: boolean): void {
  app.setLoginItemSettings({
    openAtLogin: enable,
    openAsHidden: true
  })
}

export function resetConfig(): AppConfig {
  store.set('config', defaultConfig)
  return defaultConfig
}
