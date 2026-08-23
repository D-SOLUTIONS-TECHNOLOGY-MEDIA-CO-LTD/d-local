import { create } from 'zustand'

export interface TailscaleStatus {
  installed: boolean
  running: boolean
  dnsName?: string
}

export interface ServeResult {
  ok: boolean
  url?: string
  error?: string
}

interface TailscaleState {
  status: TailscaleStatus | null
  fetchStatus: () => Promise<void>
  serve: (id: string) => Promise<ServeResult>
  unserve: (id: string) => Promise<ServeResult>
}

export const useTailscaleStore = create<TailscaleState>((set) => ({
  status: null,

  fetchStatus: async () => {
    try {
      const status = await window.api.tailscale.status()
      set({ status })
    } catch {
      set({ status: { installed: false, running: false } })
    }
  },

  serve: async (id: string) => {
    return window.api.tailscale.serve(id)
  },

  unserve: async (id: string) => {
    return window.api.tailscale.unserve(id)
  }
}))
