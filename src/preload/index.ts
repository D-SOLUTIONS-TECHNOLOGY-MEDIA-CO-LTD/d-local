import { contextBridge, ipcRenderer } from 'electron'

// Expose APIs to renderer
contextBridge.exposeInMainWorld('api', {
  // Domain operations
  domains: {
    list: () => ipcRenderer.invoke('domains:list'),
    add: (domain: any) => ipcRenderer.invoke('domains:add', domain),
    update: (id: string, data: any) => ipcRenderer.invoke('domains:update', id, data),
    remove: (id: string) => ipcRenderer.invoke('domains:remove', id),
    start: (id: string) => ipcRenderer.invoke('domains:start', id),
    stop: (id: string) => ipcRenderer.invoke('domains:stop', id)
  },
  
  // Port scanner
  scanner: {
    scan: (start: number, end: number) => ipcRenderer.invoke('scanner:scan', start, end)
  },
  
  // Caddy operations
  caddy: {
    status: () => ipcRenderer.invoke('caddy:status'),
    start: () => ipcRenderer.invoke('caddy:start'),
    stop: () => ipcRenderer.invoke('caddy:stop'),
    reload: () => ipcRenderer.invoke('caddy:reload'),
    install: () => ipcRenderer.invoke('caddy:install')
  },
  
  // Config operations
  config: {
    get: () => ipcRenderer.invoke('config:get'),
    update: (config: any) => ipcRenderer.invoke('config:update', config),
    export: (path: string) => ipcRenderer.invoke('config:export', path),
    import: (path: string) => ipcRenderer.invoke('config:import', path)
  },
  
  // System operations
  system: {
    openExternal: (url: string) => ipcRenderer.invoke('system:openExternal', url),
    openPath: (path: string) => ipcRenderer.invoke('system:openPath', path),
    selectDirectory: () => ipcRenderer.invoke('system:selectDirectory')
  },
  
  // Event listeners
  on: (channel: string, callback: (...args: any[]) => void) => {
    const validChannels = [
      'open-port-scanner',
      'open-add-domain',
      'open-settings',
      'start-domain',
      'stop-domain'
    ]
    
    if (validChannels.includes(channel)) {
      ipcRenderer.on(channel, (_, ...args) => callback(...args))
    }
  },
  
  off: (channel: string, callback: (...args: any[]) => void) => {
    ipcRenderer.removeListener(channel, callback)
  }
})

// Type definitions for renderer
declare global {
  interface Window {
    api: {
      domains: {
        list: () => Promise<any[]>
        add: (domain: any) => Promise<any>
        update: (id: string, data: any) => Promise<any>
        remove: (id: string) => Promise<void>
        start: (id: string) => Promise<boolean>
        stop: (id: string) => Promise<boolean>
      }
      scanner: {
        scan: (start: number, end: number) => Promise<any[]>
      }
      caddy: {
        status: () => Promise<any>
        start: () => Promise<boolean>
        stop: () => Promise<boolean>
        reload: () => Promise<boolean>
        install: () => Promise<string>
      }
      config: {
        get: () => Promise<any>
        update: (config: any) => Promise<any>
        export: (path: string) => Promise<void>
        import: (path: string) => Promise<any>
      }
      system: {
        openExternal: (url: string) => Promise<void>
        openPath: (path: string) => Promise<string>
        selectDirectory: () => Promise<string | null>
      }
      on: (channel: string, callback: (...args: any[]) => void) => void
      off: (channel: string, callback: (...args: any[]) => void) => void
    }
  }
}
