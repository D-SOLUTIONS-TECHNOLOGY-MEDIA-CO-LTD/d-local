import { create } from 'zustand'

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

interface DomainsState {
  domains: Domain[]
  isLoading: boolean
  error: string | null
  
  fetchDomains: () => Promise<void>
  addDomain: (domain: Omit<Domain, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Domain>
  updateDomain: (id: string, data: Partial<Domain>) => Promise<Domain>
  removeDomain: (id: string) => Promise<void>
  startDomain: (id: string) => Promise<boolean>
  stopDomain: (id: string) => Promise<boolean>
}

export const useDomainsStore = create<DomainsState>((set, get) => ({
  domains: [],
  isLoading: false,
  error: null,
  
  fetchDomains: async () => {
    set({ isLoading: true, error: null })
    try {
      const domains = await window.api.domains.list()
      set({ domains, isLoading: false })
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
    }
  },
  
  addDomain: async (domainData) => {
    set({ isLoading: true, error: null })
    try {
      const newDomain = await window.api.domains.add(domainData)
      set(state => ({
        domains: [...state.domains, newDomain],
        isLoading: false
      }))
      return newDomain
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
  
  updateDomain: async (id, data) => {
    set({ isLoading: true, error: null })
    try {
      const updated = await window.api.domains.update(id, data)
      set(state => ({
        domains: state.domains.map(d => d.id === id ? updated : d),
        isLoading: false
      }))
      return updated
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
  
  removeDomain: async (id) => {
    set({ isLoading: true, error: null })
    try {
      await window.api.domains.remove(id)
      set(state => ({
        domains: state.domains.filter(d => d.id !== id),
        isLoading: false
      }))
    } catch (error: any) {
      set({ error: error.message, isLoading: false })
      throw error
    }
  },
  
  startDomain: async (id) => {
    try {
      const success = await window.api.domains.start(id)
      if (success) {
        // Refresh to get updated status
        await get().fetchDomains()
      }
      return success
    } catch (error: any) {
      set({ error: error.message })
      return false
    }
  },
  
  stopDomain: async (id) => {
    try {
      const success = await window.api.domains.stop(id)
      if (success) {
        // Refresh to get updated status
        await get().fetchDomains()
      }
      return success
    } catch (error: any) {
      set({ error: error.message })
      return false
    }
  }
}))
