import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDomainsStore, Domain } from '../store/domains'
import { useCaddyStore } from '../store/caddy'
import { useTailscaleStore } from '../store/tailscale'
import { TailscaleShareModal } from './TailscaleShareModal'
import { AddDomainModal } from './AddDomainModal'
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
  Code,
  Smartphone,
  Loader2
} from 'lucide-react'

interface DomainCardProps {
  domain: Domain
}

export function DomainCard({ domain }: DomainCardProps) {
  const { t } = useTranslation()
  const [showMenu, setShowMenu] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showEdit, setShowEdit] = useState(false)
  const [tsLoading, setTsLoading] = useState(false)
  const [tsError, setTsError] = useState<string | null>(null)
  const { startDomain, stopDomain, removeDomain, fetchDomains } = useDomainsStore()
  const caddyStatus = useCaddyStore((s) => s.status)
  const tailscaleStatus = useTailscaleStore((s) => s.status)
  const serveTailscale = useTailscaleStore((s) => s.serve)
  const unserveTailscale = useTailscaleStore((s) => s.unserve)

  const fullDomain = `${domain.name}${domain.tld}`
  const httpPort = caddyStatus?.httpPort ?? 80
  const url = httpPort === 80 ? `http://${fullDomain}` : `http://${fullDomain}:${httpPort}`

  // Three-state health: green = proxy up and backend up (reachable),
  // yellow = proxy up but backend down (would 502), red = proxy (Caddy) down.
  const caddyRunning = !!caddyStatus?.isRunning
  const health = !caddyRunning
    ? { dot: 'bg-destructive', label: t('domain.health.proxyDown') }
    : domain.isRunning
      ? { dot: 'bg-success', label: t('domain.health.reachable') }
      : { dot: 'bg-warning', label: t('domain.health.backendDown') }

  // Tailscale remote access (reachable from other tailnet devices, e.g. a phone).
  const tailscaleReady = !!tailscaleStatus?.running
  const tailnetUrl =
    domain.tailscaleServe && tailscaleStatus?.dnsName && domain.tailscalePort
      ? `https://${tailscaleStatus.dnsName}:${domain.tailscalePort}`
      : null

  const handleToggleTailscale = async () => {
    setTsLoading(true)
    setTsError(null)
    try {
      const result = domain.tailscaleServe
        ? await unserveTailscale(domain.id)
        : await serveTailscale(domain.id)
      if (!result.ok) {
        setTsError(result.error || t('tailscale.error'))
      }
      await fetchDomains()
    } finally {
      setTsLoading(false)
    }
  }
  
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
    <div className="group relative bg-card border border-border rounded-lg hover:border-primary/50 transition-colors">
      <div className="flex items-center gap-3 p-3">
      {/* Status indicator */}
      <div className={`w-2 h-2 rounded-full ${health.dot}`} title={health.label} />
      
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
        
        {tailnetUrl && (
          <button
            onClick={() => setShowShare(true)}
            className="p-1.5 text-primary hover:bg-secondary rounded-md transition-colors"
            title={t('tailscale.share')}
          >
            <Smartphone className="w-4 h-4" />
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

                {tailscaleReady && (
                  <button
                    onClick={() => { handleToggleTailscale(); setShowMenu(false); }}
                    disabled={tsLoading}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-secondary transition-colors disabled:opacity-50"
                  >
                    {tsLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Smartphone className="w-4 h-4" />
                    )}
                    {domain.tailscaleServe
                      ? t('tailscale.stopExpose')
                      : t('tailscale.expose')}
                  </button>
                )}

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
                  onClick={() => { setShowEdit(true); setShowMenu(false); }}
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

      {tsError && (
        <div className="px-3 pb-2 text-xs text-destructive">{tsError}</div>
      )}

      {tailnetUrl && (
        <button
          onClick={() => setShowShare(true)}
          className="flex items-center gap-1.5 w-full px-3 pb-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
          title={t('tailscale.share')}
        >
          <Smartphone className="w-3 h-3 shrink-0" />
          <span className="truncate font-mono">{tailnetUrl}</span>
        </button>
      )}

      {showShare && tailnetUrl && (
        <TailscaleShareModal
          url={tailnetUrl}
          domain={fullDomain}
          onClose={() => setShowShare(false)}
        />
      )}

      {showEdit && (
        <AddDomainModal
          domain={domain}
          onClose={() => setShowEdit(false)}
        />
      )}
    </div>
  )
}
