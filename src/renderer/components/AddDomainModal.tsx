import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDomainsStore } from '../store/domains'
import { useConfigStore } from '../store/config'
import { X, FolderOpen } from 'lucide-react'

interface AddDomainModalProps {
  onClose: () => void
  initialData?: {
    name?: string
    port?: number
    projectPath?: string
  }
}

export function AddDomainModal({ onClose, initialData }: AddDomainModalProps) {
  const { t } = useTranslation()
  const { addDomain } = useDomainsStore()
  const { config } = useConfigStore()
  
  const [name, setName] = useState(initialData?.name || '')
  const [port, setPort] = useState(initialData?.port?.toString() || '')
  const [projectPath, setProjectPath] = useState(initialData?.projectPath || '')
  const [startCommand, setStartCommand] = useState('')
  const [autoStart, setAutoStart] = useState(false)
  const [openBrowserOnStart, setOpenBrowserOnStart] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const tld = config?.defaultTld || '.local'
  
  const handleSelectFolder = async () => {
    const path = await window.api.system.selectDirectory()
    if (path) {
      setProjectPath(path)
      
      // Auto-suggest name from folder
      if (!name) {
        const folderName = path.split('/').pop() || ''
        const sanitized = folderName
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
        setName(sanitized)
      }
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    // Validation
    if (!name.trim()) {
      setError(t('errors.nameRequired'))
      return
    }
    
    if (!/^[a-z0-9-]+$/.test(name)) {
      setError(t('errors.invalidName'))
      return
    }
    
    if (!port || isNaN(Number(port))) {
      setError(t('errors.portRequired'))
      return
    }
    
    const portNum = parseInt(port, 10)
    if (portNum < 1 || portNum > 65535) {
      setError(t('errors.invalidPort'))
      return
    }
    
    setIsLoading(true)
    
    try {
      await addDomain({
        name: name.trim(),
        tld,
        port: portNum,
        projectPath: projectPath || undefined,
        startCommand: startCommand || undefined,
        autoStart,
        openBrowserOnStart
      })
      onClose()
    } catch (err: any) {
      setError(err.message || t('errors.unknown'))
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-md bg-background border border-border rounded-xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">{t('domain.add')}</h2>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-lg">
              {error}
            </div>
          )}
          
          {/* Domain name */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t('domain.name')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase())}
                placeholder="my-project"
                className="flex-1 px-3 py-2 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <span className="text-sm text-muted-foreground">{tld}</span>
            </div>
          </div>
          
          {/* Port */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t('domain.port')}
            </label>
            <input
              type="number"
              value={port}
              onChange={(e) => setPort(e.target.value)}
              placeholder="3000"
              min="1"
              max="65535"
              className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          
          {/* Project folder */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t('domain.projectPath')} <span className="text-muted-foreground">({t('common.optional')})</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={projectPath}
                onChange={(e) => setProjectPath(e.target.value)}
                placeholder="/Users/you/projects/my-project"
                className="flex-1 px-3 py-2 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={handleSelectFolder}
                className="p-2 text-muted-foreground hover:text-foreground hover:bg-secondary border border-border rounded-lg transition-colors"
              >
                <FolderOpen className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Start command */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              {t('domain.startCommand')} <span className="text-muted-foreground">({t('common.optional')})</span>
            </label>
            <input
              type="text"
              value={startCommand}
              onChange={(e) => setStartCommand(e.target.value)}
              placeholder="npm run dev"
              className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
            />
          </div>
          
          {/* Options */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoStart}
                onChange={(e) => setAutoStart(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm">{t('domain.autoStart')}</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={openBrowserOnStart}
                onChange={(e) => setOpenBrowserOnStart(e.target.checked)}
                className="w-4 h-4 rounded border-border"
              />
              <span className="text-sm">{t('domain.openBrowser')}</span>
            </label>
          </div>
          
          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('actions.cancel')}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? t('common.loading') : t('domain.add')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
