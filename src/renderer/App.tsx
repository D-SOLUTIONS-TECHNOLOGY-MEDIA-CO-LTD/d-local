import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DomainList } from './components/DomainList'
import { StatusBar } from './components/StatusBar'
import { AddDomainModal } from './components/AddDomainModal'
import { PortScanner } from './components/PortScanner'
import { Settings } from './components/Settings'
import { useDomainsStore } from './store/domains'
import { useCaddyStore } from './store/caddy'
import { useConfigStore } from './store/config'
import { Search, Plus, RefreshCw, Settings as SettingsIcon } from 'lucide-react'

function App() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [showScanner, setShowScanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  
  const { fetchDomains, isLoading: domainsLoading } = useDomainsStore()
  const { fetchStatus } = useCaddyStore()
  const { fetchConfig, config } = useConfigStore()
  
  useEffect(() => {
    // Initial fetch
    fetchDomains()
    fetchStatus()
    fetchConfig()
    
    // Listen for events from tray
    window.api.on('open-port-scanner', () => setShowScanner(true))
    window.api.on('open-add-domain', () => setShowAddModal(true))
    window.api.on('open-settings', () => setShowSettings(true))
    
    // Refresh status periodically
    const interval = setInterval(() => {
      fetchDomains()
      fetchStatus()
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Apply theme
  useEffect(() => {
    if (config?.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else if (config?.theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      // System theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (isDark) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [config?.theme])
  
  const handleRefresh = async () => {
    await fetchDomains()
    await fetchStatus()
  }
  
  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Title bar drag region */}
      <div className="h-8 flex items-center justify-center drag-region bg-background/50 border-b border-border">
        <span className="text-sm font-medium text-muted-foreground">D-Local</span>
      </div>
      
      {/* Search and actions bar */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('domain.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t('domain.add')}
          </button>
          
          <button
            onClick={handleRefresh}
            disabled={domainsLoading}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${domainsLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 overflow-auto p-4">
        <DomainList searchQuery={searchQuery} />
      </div>
      
      {/* Bottom bar */}
      <div className="border-t border-border p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowScanner(true)}
            className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
          >
            {t('scanner.title')}
          </button>
          
          <button
            onClick={() => setShowSettings(true)}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
        
        <StatusBar />
      </div>
      
      {/* Modals */}
      {showAddModal && (
        <AddDomainModal onClose={() => setShowAddModal(false)} />
      )}
      
      {showScanner && (
        <PortScanner onClose={() => setShowScanner(false)} />
      )}
      
      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}
    </div>
  )
}

export default App
