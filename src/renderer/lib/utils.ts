import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit'
  })
}

export function truncatePath(path: string, maxLength: number = 40): string {
  if (path.length <= maxLength) return path
  
  const parts = path.split('/')
  const fileName = parts.pop() || ''
  
  if (fileName.length >= maxLength - 3) {
    return '...' + fileName.slice(-(maxLength - 3))
  }
  
  let truncated = fileName
  for (let i = parts.length - 1; i >= 0; i--) {
    const next = parts[i] + '/' + truncated
    if (next.length + 4 > maxLength) {
      return '.../' + truncated
    }
    truncated = next
  }
  
  return truncated
}

export function sanitizeDomainName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export function isValidPort(port: number): boolean {
  return Number.isInteger(port) && port >= 1 && port <= 65535
}

export function isValidDomainName(name: string): boolean {
  return /^[a-z0-9][a-z0-9-]*[a-z0-9]$|^[a-z0-9]$/.test(name)
}
