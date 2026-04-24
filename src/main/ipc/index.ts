import { ipcMain, shell, dialog } from 'electron'
import {
  getDomains,
  addDomain,
  updateDomain,
  removeDomain,
  startDomain,
  stopDomain,
  Domain
} from '../services/domains'
import { scanPorts } from '../services/scanner'
import {
  getCaddyStatus,
  startCaddy,
  stopCaddy,
  reloadCaddy,
  ensureCaddy
} from '../services/caddy'
import {
  getConfig,
  updateConfig,
  exportConfig,
  importConfig,
  AppConfig
} from '../services/config'

export function initializeIpcHandlers(): void {
  // Domain handlers
  ipcMain.handle('domains:list', async () => {
    return getDomains()
  })

  ipcMain.handle('domains:add', async (_, domain: Omit<Domain, 'id' | 'createdAt' | 'updatedAt'>) => {
    return addDomain(domain)
  })

  ipcMain.handle('domains:update', async (_, id: string, data: Partial<Domain>) => {
    return updateDomain(id, data)
  })

  ipcMain.handle('domains:remove', async (_, id: string) => {
    return removeDomain(id)
  })

  ipcMain.handle('domains:start', async (_, id: string) => {
    return startDomain(id)
  })

  ipcMain.handle('domains:stop', async (_, id: string) => {
    return stopDomain(id)
  })

  // Port scanner handlers
  ipcMain.handle('scanner:scan', async (_, start: number, end: number) => {
    return scanPorts(start, end)
  })

  // Caddy handlers
  ipcMain.handle('caddy:status', async () => {
    return getCaddyStatus()
  })

  ipcMain.handle('caddy:start', async () => {
    return startCaddy()
  })

  ipcMain.handle('caddy:stop', async () => {
    return stopCaddy()
  })

  ipcMain.handle('caddy:reload', async () => {
    return reloadCaddy()
  })

  ipcMain.handle('caddy:install', async () => {
    return ensureCaddy()
  })

  // Config handlers
  ipcMain.handle('config:get', async () => {
    return getConfig()
  })

  ipcMain.handle('config:update', async (_, config: Partial<AppConfig>) => {
    return updateConfig(config)
  })

  ipcMain.handle('config:export', async (_, path: string) => {
    return exportConfig(path)
  })

  ipcMain.handle('config:import', async (_, path: string) => {
    return importConfig(path)
  })

  // System handlers
  ipcMain.handle('system:openExternal', async (_, url: string) => {
    return shell.openExternal(url)
  })

  ipcMain.handle('system:openPath', async (_, path: string) => {
    return shell.openPath(path)
  })

  ipcMain.handle('system:selectDirectory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })
    return result.filePaths[0] || null
  })
}
