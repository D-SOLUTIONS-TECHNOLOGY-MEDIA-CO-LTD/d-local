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
  ensureCaddy,
  updateCaddyConfig
} from '../services/caddy'
import { syncAllHosts } from '../services/hosts'
import {
  getTailscaleStatus,
  serveDomain,
  unserveDomain,
  TAILSCALE_PORT_BASE
} from '../services/tailscale'
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

  // One-click repair: reconcile /etc/hosts + Caddyfile from stored domains and
  // ensure Caddy is running. Fixes drift (missing host entry, stale config,
  // stopped proxy) in a single action.
  ipcMain.handle('caddy:repair', async () => {
    try {
      const domains = await getDomains()
      await updateCaddyConfig(domains)
      await syncAllHosts(domains.map(d => `${d.name}${d.tld}`))
      const status = await getCaddyStatus()
      if (!status.isRunning) {
        const started = await startCaddy()
        if (!started) {
          const after = await getCaddyStatus()
          return { ok: false, error: after.lastError || 'Failed to start Caddy' }
        }
      }
      return { ok: true }
    } catch (error: any) {
      return { ok: false, error: error?.message || 'Repair failed' }
    }
  })

  // Tailscale handlers (remote access from other devices on the tailnet)
  ipcMain.handle('tailscale:status', async () => {
    return getTailscaleStatus()
  })

  ipcMain.handle('tailscale:serve', async (_, id: string) => {
    const domains = await getDomains()
    const domain = domains.find(d => d.id === id)
    if (!domain) return { ok: false, error: 'Domain not found' }

    // Reuse a previously assigned port, else pick the next free one from the base.
    let tailscalePort = domain.tailscalePort
    if (!tailscalePort) {
      const used = new Set(
        domains.map(d => d.tailscalePort).filter((p): p is number => !!p)
      )
      tailscalePort = TAILSCALE_PORT_BASE
      while (used.has(tailscalePort)) tailscalePort++
    }

    const result = await serveDomain(domain.port, tailscalePort)
    if (result.ok) {
      await updateDomain(id, { tailscaleServe: true, tailscalePort })
    }
    return result
  })

  ipcMain.handle('tailscale:unserve', async (_, id: string) => {
    const domains = await getDomains()
    const domain = domains.find(d => d.id === id)
    if (!domain) return { ok: false, error: 'Domain not found' }
    if (!domain.tailscalePort) {
      await updateDomain(id, { tailscaleServe: false })
      return { ok: true }
    }

    const result = await unserveDomain(domain.tailscalePort)
    // Turn the flag off regardless; keep the port for easy re-enable.
    await updateDomain(id, { tailscaleServe: false })
    return result
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
