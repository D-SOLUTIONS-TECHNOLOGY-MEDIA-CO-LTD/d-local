import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDomainsStore } from '../store/domains'
import { useConfigStore } from '../store/config'
import { X, Search, Loader2, Check } from 'lucide-react'

interface ScanResult {
  port: number
  pid: number
  processName: string
  cwd?: string
  suggestedName: string
  selected: boolean
  customName: string
}

interface PortScannerProps {
  onClose: () => void
}

export function PortScanner({ onClose }: PortScannerProps) {
  const { t } = useTranslation()
  const { addDomain, domains } = useDomainsStore()
  const { config } = useConfigStore()
  
  const [results, setResults] = useState<ScanResult[]>([])
  const [isScanning, setIsScanning] = useState(true)
  const [progress, setProgress] = useState(0)
  const [isAdding, setIsAdding] = useState(false)

  const startPort = config?.portScanRange?.start || 3000
  const endPort = config?.portScanRange?.end || 9000
  const tld = config?.defaultTld || '.local'

  // Existing ports to filter out
  const existingPorts = new Set(domains.map(d => d.port))

  const handleScan = async () => {
    setIsScanning(true)
    setProgress(0)
    setResults([])

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(p => Math.min(p + 5, 90))
      }, 100)

      const scanResults = await window.api.scanner.scan(startPort, endPort)

      clearInterval(progressInterval)
      setProgress(100)

      // Filter out already mapped ports and format results
      const formattedResults: ScanResult[] = scanResults
        .filter((r: ScanResult) => !existingPorts.has(r.port))
        .map((r: ScanResult) => ({
          ...r,
          selected: r.processName === 'node',
          customName: r.suggestedName
        }))

      setResults(formattedResults)
    } catch (error) {
      console.error('Scan error:', error)
    } finally {
      setIsScanning(false)
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    handleScan()
  }, [])

  const toggleSelect = (port: number) => {
    setResults(results.map(r => 
      r.port === port ? { ...r, selected: !r.selected } : r
    ))
  }
  
  const updateName = (port: number, name: string) => {
    setResults(results.map(r =>
      r.port === port ? { ...r, customName: name } : r
    ))
  }
  
  const selectedCount = results.filter(r => r.selected).length
  
  const handleAddSelected = async () => {
    const selected = results.filter(r => r.selected)
    if (selected.length === 0) return
    
    setIsAdding(true)
    
    try {
      for (const result of selected) {
        await addDomain({
          name: result.customName,
          tld,
          port: result.port,
          projectPath: result.cwd,
          autoStart: false,
          openBrowserOnStart: false
        })
      }
      onClose()
    } catch (error: any) {
      console.error('Error adding domains:', error)
    } finally {
      setIsAdding(false)
    }
  }
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-background border border-border rounded-xl shadow-xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">{t('scanner.title')}</h2>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-auto p-4">
          {isScanning ? (
            <div className="py-8">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">
                  {t('scanner.scanning', { start: startPort, end: endPort })}
                </span>
              </div>
              
              {/* Progress bar */}
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : results.length === 0 ? (
            <div className="py-8 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-muted-foreground">{t('scanner.noResults')}</p>
              <button
                onClick={handleScan}
                className="mt-4 px-4 py-2 text-sm font-medium bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
              >
                {t('scanner.scanAgain')}
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground mb-4">
                {t('scanner.found', { count: results.length })}
              </p>
              
              {results.map(result => (
                <div
                  key={result.port}
                  className={`p-3 border rounded-lg transition-colors ${
                    result.selected 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:border-muted-foreground'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox */}
                    <button
                      onClick={() => toggleSelect(result.port)}
                      className={`mt-0.5 w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                        result.selected
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-border'
                      }`}
                    >
                      {result.selected && <Check className="w-3 h-3" />}
                    </button>
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-mono font-medium">:{result.port}</span>
                        <span className="text-muted-foreground">{result.processName}</span>
                      </div>
                      
                      {result.cwd && (
                        <div className="text-xs text-muted-foreground truncate mt-0.5">
                          {result.cwd}
                        </div>
                      )}
                      
                      {result.selected && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-muted-foreground">{t('scanner.suggested')}:</span>
                          <input
                            type="text"
                            value={result.customName}
                            onChange={(e) => updateName(result.port, e.target.value)}
                            className="flex-1 px-2 py-1 text-sm bg-secondary border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          <span className="text-xs text-muted-foreground">{tld}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t border-border">
          <button
            onClick={handleScan}
            disabled={isScanning}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <Search className="w-4 h-4" />
            {t('scanner.rescan')}
          </button>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('actions.cancel')}
            </button>
            <button
              onClick={handleAddSelected}
              disabled={selectedCount === 0 || isAdding}
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isAdding 
                ? t('common.loading')
                : t('scanner.addSelected', { count: selectedCount })
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
