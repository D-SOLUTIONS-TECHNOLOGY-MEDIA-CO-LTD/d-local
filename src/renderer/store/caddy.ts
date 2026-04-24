import { create } from 'zustand'

export interface CaddyStatus {
  isRunning: boolean
  isInstalled: boolean
  pid?: number
  version?: string
}

interface CaddyState {
  status: CaddyStatus | null
  isLoading: boolean
  isInstalling: boolean
  error: string | null

  fetchStatus: () => Promise<void>
  startCaddy: () => Promise<boolean>
  stopCaddy: () => Promise<boolean>
  reloadCaddy: () => Promise<boolean>
  installCaddy: () => Promise<boolean>
}

export const useCaddyStore = create<CaddyState>((set, get) => ({
  status: null,
  isLoading: false,
  isInstalling: false,
  error: null,
  
  fetchStatus: async () => {
    try {
      const status = await window.api.caddy.status()
      set({ status })
    } catch (error: any) {
      set({ error: error.message })
    }
  },
  
  startCaddy: async () => {
    set({ isLoading: true, error: null })
    try {
      const success = await window.api.caddy.start()
      if (success) {
        await get().fetchStatus()
      }
      set({ isLoading: false })
      return success
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      return false
    }
  },
  
  stopCaddy: async () => {
    set({ isLoading: true, error: null })
    try {
      const success = await window.api.caddy.stop()
      if (success) {
        await get().fetchStatus()
      }
      set({ isLoading: false })
      return success
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      return false
    }
  },
  
  reloadCaddy: async () => {
    set({ isLoading: true, error: null })
    try {
      const success = await window.api.caddy.reload()
      if (success) {
        await get().fetchStatus()
      }
      set({ isLoading: false })
      return success
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      return false
    }
  },

  installCaddy: async () => {
    set({ isInstalling: true, error: null })
    try {
      await window.api.caddy.install()
      await get().fetchStatus()
      set({ isInstalling: false })
      return true
    } catch (error: any) {
      set({ error: error.message, isInstalling: false })
      return false
    }
  }
}))
