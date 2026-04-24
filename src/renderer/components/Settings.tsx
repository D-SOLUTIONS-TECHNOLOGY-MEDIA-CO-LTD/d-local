import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useConfigStore } from '../store/config'
import { X, Upload, Download } from 'lucide-react'

interface SettingsProps {
  onClose: () => void
}

type Tab = 'general' | 'appearance' | 'ports' | 'integration'

export function Settings({ onClose }: SettingsProps) {
  const { t, i18n } = useTranslation()
  const { config, updateConfig, exportConfig, importConfig } = useConfigStore()
  
  const [activeTab, setActiveTab] = useState<Tab>('general')
  
  const handleLanguageChange = async (language: 'en' | 'vi') => {
    await i18n.changeLanguage(language)
    updateConfig({ language })
  }
  
  const handleThemeChange = (theme: 'system' | 'light' | 'dark') => {
    updateConfig({ theme })
  }
  
  const handleExport = async () => {
    try {
      await exportConfig()
    } catch (error) {
      console.error('Export error:', error)
    }
  }
  
  const handleImport = async () => {
    try {
      await importConfig()
    } catch (error) {
      console.error('Import error:', error)
    }
  }
  
  const tabs: { id: Tab; label: string }[] = [
    { id: 'general', label: t('settings.general') },
    { id: 'appearance', label: t('settings.appearance') },
    { id: 'ports', label: t('settings.ports') },
    { id: 'integration', label: t('settings.integration') }
  ]
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-background border border-border rounded-xl shadow-xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">{t('settings.title')}</h2>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="w-40 border-r border-border p-2">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full px-3 py-2 text-sm text-left rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-secondary font-medium'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          
          {/* Main content */}
          <div className="flex-1 overflow-auto p-6">
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('settings.language')}
                  </label>
                  <select
                    value={config?.language || 'en'}
                    onChange={(e) => handleLanguageChange(e.target.value as 'en' | 'vi')}
                    className="w-full max-w-xs px-3 py-2 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="en">English</option>
                    <option value="vi">Tiếng Việt</option>
                  </select>
                </div>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config?.launchAtLogin || false}
                      onChange={(e) => updateConfig({ launchAtLogin: e.target.checked })}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm">{t('settings.launchAtLogin')}</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config?.startMinimized || false}
                      onChange={(e) => updateConfig({ startMinimized: e.target.checked })}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm">{t('settings.startMinimized')}</span>
                  </label>
                  
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config?.showNotifications || false}
                      onChange={(e) => updateConfig({ showNotifications: e.target.checked })}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm">{t('settings.notifications')}</span>
                  </label>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <h3 className="text-sm font-medium mb-3">{t('settings.exportImport')}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      {t('actions.export')}
                    </button>
                    <button
                      onClick={handleImport}
                      className="flex items-center gap-2 px-3 py-2 text-sm bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      {t('actions.import')}
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('settings.theme')}
                  </label>
                  <div className="flex gap-2">
                    {(['system', 'light', 'dark'] as const).map(theme => (
                      <button
                        key={theme}
                        onClick={() => handleThemeChange(theme)}
                        className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                          config?.theme === theme
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:border-muted-foreground'
                        }`}
                      >
                        {t(`settings.theme.${theme}`)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'ports' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('settings.defaultTld')}
                  </label>
                  <select
                    value={config?.defaultTld || '.local'}
                    onChange={(e) => updateConfig({ defaultTld: e.target.value })}
                    className="w-full max-w-xs px-3 py-2 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value=".local">.local</option>
                    <option value=".test">.test</option>
                    <option value=".localhost">.localhost</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('settings.portRange')}
                  </label>
                  <div className="flex items-center gap-2 max-w-xs">
                    <input
                      type="number"
                      value={config?.portScanRange?.start || 3000}
                      onChange={(e) => updateConfig({
                        portScanRange: {
                          start: parseInt(e.target.value, 10),
                          end: config?.portScanRange?.end || 9000
                        }
                      })}
                      min="1"
                      max="65535"
                      className="w-24 px-3 py-2 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="text-muted-foreground">-</span>
                    <input
                      type="number"
                      value={config?.portScanRange?.end || 9000}
                      onChange={(e) => updateConfig({
                        portScanRange: {
                          start: config?.portScanRange?.start || 3000,
                          end: parseInt(e.target.value, 10)
                        }
                      })}
                      min="1"
                      max="65535"
                      className="w-24 px-3 py-2 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
              </div>
            )}
            
            {activeTab === 'integration' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('settings.claudeCodePath')}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={config?.claudeCodePath || '/usr/local/bin/claude'}
                      onChange={(e) => updateConfig({ claudeCodePath: e.target.value })}
                      className="flex-1 max-w-md px-3 py-2 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {t('settings.claudeCodePathHelp')}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t('settings.caddyPath')}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={config?.caddyPath || '/opt/homebrew/bin/caddy'}
                      onChange={(e) => updateConfig({ caddyPath: e.target.value })}
                      className="flex-1 max-w-md px-3 py-2 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
