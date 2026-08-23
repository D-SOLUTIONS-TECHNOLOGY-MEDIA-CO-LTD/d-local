import { useTranslation } from 'react-i18next'
import { useCaddyStore } from '../store/caddy'
import { RefreshCw, Download, Loader2, AlertTriangle, Wrench } from 'lucide-react'

export function StatusBar() {
  const { t } = useTranslation()
  const { status, isLoading, isInstalling, startCaddy, stopCaddy, installCaddy, repairCaddy } = useCaddyStore()

  const handleToggle = async () => {
    if (status?.isRunning) {
      await stopCaddy()
    } else {
      await startCaddy()
    }
  }

  const handleInstall = async () => {
    const success = await installCaddy()
    if (success) {
      await startCaddy()
    }
  }

  if (!status?.isInstalled) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <span className="text-warning">Caddy: {t('caddy.notInstalled')}</span>
        <button
          onClick={handleInstall}
          disabled={isInstalling}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isInstalling ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              {t('caddy.installing')}
            </>
          ) : (
            <>
              <Download className="w-3 h-3" />
              {t('caddy.install')}
            </>
          )}
        </button>
      </div>
    )
  }

  // Surface a start/reload failure (e.g. the HTTP port is held by another app).
  const errorText = status?.portConflict
    ? t('caddy.portConflict', {
        port: status.httpPort,
        command: status.portConflict.command,
        pid: status.portConflict.pid
      })
    : status?.lastError || null

  return (
    <div className="flex items-center gap-2 text-sm min-w-0">
      <span className="text-muted-foreground">Caddy:</span>

      <button
        onClick={handleToggle}
        disabled={isLoading}
        className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
      >
        {isLoading ? (
          <RefreshCw className="w-3 h-3 animate-spin" />
        ) : (
          <span className={`w-2 h-2 rounded-full ${status?.isRunning ? 'bg-success' : 'bg-muted'}`} />
        )}

        <span className={status?.isRunning ? 'text-success' : ''}>
          {status?.isRunning ? t('caddy.running') : t('caddy.stopped')}
        </span>
      </button>

      {status?.version && (
        <span className="text-xs text-muted-foreground">
          v{status.version}
        </span>
      )}

      {!status?.isRunning && errorText && (
        <span
          className="flex items-center gap-1 min-w-0 text-xs text-destructive"
          title={errorText}
        >
          <AlertTriangle className="w-3 h-3 shrink-0" />
          <span className="truncate max-w-[220px]">{errorText}</span>
        </span>
      )}

      {!status?.isRunning && (
        <button
          onClick={() => repairCaddy()}
          disabled={isLoading}
          className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
          title={t('caddy.repair')}
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Wrench className="w-3 h-3" />
          )}
          {isLoading ? t('caddy.repairing') : t('caddy.repair')}
        </button>
      )}
    </div>
  )
}
