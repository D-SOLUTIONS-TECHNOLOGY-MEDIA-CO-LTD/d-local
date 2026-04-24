import { create } from 'zustand'

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

interface ConfigState {
  config: AppConfig | null
  isLoading: boolean
  error: string | null
  
  fetchConfig: () => Promise<void>
  updateConfig: (config: Partial<AppConfig>) => Promise<void>
  exportConfig: () => Promise<void>
  importConfig: () => Promise<void>
}

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: null,
  isLoading: false,
  error: null,
  
  fetchConfig: async () => {
    try {
      const config = await window.api.config.get()
      set({ config })
    } catch (error: any) {
      set({ error: error.message })
    }
  },
  
  updateConfig: async (partial) => {
    const current = get().config
    if (!current) return
    
    try {
      const updated = await window.api.config.update(partial)
      set({ config: updated })
    } catch (error: any) {
      set({ error: error.message })
    }
  },
  
  exportConfig: async () => {
    set({ isLoading: true, error: null })
    try {
      // Create a download link
      const configData = {
        config: get().config,
        exportedAt: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(configData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `d-local-config-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      set({ isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  importConfig: async () => {
    set({ isLoading: true, error: null })
    try {
      // Create file input
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0]
        if (!file) return
        
        const text = await file.text()
        const data = JSON.parse(text)
        
        if (data.config) {
          await get().updateConfig(data.config)
        }
        
        set({ isLoading: false })
      }
      
      input.click()
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  }
}))
