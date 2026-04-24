import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDomainsStore, Domain } from '../store/domains'
import { 
  Play, 
  Square, 
  Globe, 
  MoreVertical, 
  Copy, 
  Pencil, 
  Trash2,
  Terminal,
  FolderOpen,
  Code
} from 'lucide-react'

interface DomainCardProps {
  domain: Domain
}

export function DomainCard({ domain }: DomainCardProps) {
  const { t } = useTranslation()
  const [showMenu, setShowMenu] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { startDomain, stopDomain, removeDomain } = useDomainsStore()
  
  const fullDomain = `${domain.name}${domain.tld}`
  const url = `http://${fullDomain}`
  
  const handleStart = async () => {
    setIsLoading(true)
    try {
      await startDomain(domain.id)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleStop = async () => {
    setIsLoading(true)
    try {
      await stopDomain(domain.id)
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleOpenBrowser = () => {
    window.api.system.openExternal(url)
  }
  
  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url)
  }
  
  const handleOpenClaudeCode = () => {
    if (domain.projectPath) {
      window.api.system.openExternal(`claude://${domain.projectPath}`)
    }
  }
  
  const handleOpenTerminal = () => {
    if (domain.projectPath) {
      window.api.system.openExternal(`terminal://${domain.projectPath}`)
    }
  }
  
  const handleOpenFinder = () => {
    if (domain.projectPath) {
      window.api.system.openPath(domain.projectPath)
    }
  }
  
  const handleRemove = async () => {
    if (window.confirm(t('domain.confirmRemove', { name: fullDomain }))) {
      await removeDomain(domain.id)
    }
  }
  
  return (
    <div className="group relative flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
      {/* Status indicator */}
      <div className={`w-2 h-2 rounded-full ${domain.isRunning ? 'bg-success' : 'bg-muted'}`} />
      
      {/* Domain info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{fullDomain}</span>
          <span className="text-xs text-muted-foreground">:{domain.port}</span>
        </div>
        {domain.projectPath && (
          <div className="text-xs text-muted-foreground truncate mt-0.5">
            {domain.projectPath}
          </div>
        )}
      </div>
      
      {/* Quick actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {domain.isRunning ? (
          <button
            onClick={handleStop}
            disabled={isLoading}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors disabled:opacity-50"
            title={t('actions.stop')}
          >
            <Square className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleStart}
            disabled={isLoading || !domain.startCommand}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors disabled:opacity-50"
            title={domain.startCommand ? t('actions.start') : t('domain.noStartCommand')}
          >
            <Play className="w-4 h-4" />
          </button>
        )}
        
        <button
          onClick={handleOpenBrowser}
          className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
          title={t('actions.openBrowser')}
        >
          <Globe className="w-4 h-4" />
        </button>
        
        {/* More menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowMenu(false)} 
              />
              <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-popover border border-border rounded-lg shadow-lg py-1">
                <button
                  onClick={() => { handleCopyUrl(); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-secondary transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  {t('actions.copyUrl')}
                </button>
                
                {domain.projectPath && (
                  <>
                    <button
                      onClick={() => { handleOpenClaudeCode(); setShowMenu(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-secondary transition-colors"
                    >
                      <Code className="w-4 h-4" />
                      {t('actions.openClaudeCode')}
                    </button>
                    
                    <button
                      onClick={() => { handleOpenTerminal(); setShowMenu(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-secondary transition-colors"
                    >
                      <Terminal className="w-4 h-4" />
                      {t('actions.openTerminal')}
                    </button>
                    
                    <button
                      onClick={() => { handleOpenFinder(); setShowMenu(false); }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-secondary transition-colors"
                    >
                      <FolderOpen className="w-4 h-4" />
                      {t('actions.openFinder')}
                    </button>
                  </>
                )}
                
                <div className="border-t border-border my-1" />
                
                <button
                  onClick={() => { setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-secondary transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  {t('domain.edit')}
                </button>
                
                <button
                  onClick={() => { handleRemove(); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('domain.remove')}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
