import { useTranslation } from 'react-i18next'
import { useDomainsStore } from '../store/domains'
import { DomainCard } from './DomainCard'

interface DomainListProps {
  searchQuery: string
}

export function DomainList({ searchQuery }: DomainListProps) {
  const { t } = useTranslation()
  const { domains, isLoading } = useDomainsStore()
  
  const filteredDomains = domains.filter(domain => 
    domain.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    domain.projectPath?.toLowerCase().includes(searchQuery.toLowerCase())
  )
  
  const activeDomains = filteredDomains.filter(d => d.isRunning)
  const inactiveDomains = filteredDomains.filter(d => !d.isRunning)
  
  if (isLoading && domains.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">{t('common.loading')}</div>
      </div>
    )
  }
  
  if (domains.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="text-4xl mb-4">🌐</div>
        <h3 className="text-lg font-medium mb-2">{t('domain.empty.title')}</h3>
        <p className="text-muted-foreground text-sm max-w-sm">
          {t('domain.empty.description')}
        </p>
      </div>
    )
  }
  
  if (filteredDomains.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center">
        <div className="text-muted-foreground">
          {t('domain.noResults', { query: searchQuery })}
        </div>
      </div>
    )
  }
  
  return (
    <div className="space-y-6">
      {activeDomains.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase text-muted-foreground mb-3 px-1">
            {t('domain.active')} ({activeDomains.length})
          </h2>
          <div className="space-y-2">
            {activeDomains.map(domain => (
              <DomainCard key={domain.id} domain={domain} />
            ))}
          </div>
        </section>
      )}
      
      {inactiveDomains.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase text-muted-foreground mb-3 px-1">
            {t('domain.inactive')} ({inactiveDomains.length})
          </h2>
          <div className="space-y-2">
            {inactiveDomains.map(domain => (
              <DomainCard key={domain.id} domain={domain} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
