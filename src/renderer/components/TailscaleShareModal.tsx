import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import QRCode from 'qrcode'
import { X, Copy, Check } from 'lucide-react'

interface TailscaleShareModalProps {
  url: string
  domain: string
  onClose: () => void
}

/**
 * Shows a scannable QR code + the tailnet URL so the user can open a dev server
 * on another device (e.g. a phone) that is signed into the same tailnet.
 */
export function TailscaleShareModal({ url, domain, onClose }: TailscaleShareModalProps) {
  const { t } = useTranslation()
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    QRCode.toDataURL(url, { width: 240, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(''))
  }, [url])

  const handleCopy = () => {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="w-[320px] bg-card border border-border rounded-xl shadow-xl p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-medium truncate">{t('tailscale.shareTitle')}</h3>
          <button
            onClick={onClose}
            className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-muted-foreground mb-3">
          {t('tailscale.shareHint', { domain })}
        </p>

        <div className="flex justify-center mb-4">
          {qrDataUrl ? (
            <img
              src={qrDataUrl}
              alt="QR code"
              className="w-[220px] h-[220px] rounded-lg bg-white p-2"
            />
          ) : (
            <div className="w-[220px] h-[220px] rounded-lg bg-secondary animate-pulse" />
          )}
        </div>

        <div className="flex items-center gap-2 p-2 bg-secondary rounded-lg">
          <span className="flex-1 text-xs font-mono truncate" title={url}>{url}</span>
          <button
            onClick={handleCopy}
            className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-background transition-colors shrink-0"
            title={t('actions.copyUrl')}
          >
            {copied ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}
