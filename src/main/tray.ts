import { Tray, Menu, nativeImage, BrowserWindow, shell, app, clipboard } from 'electron'
import { exec } from 'child_process'
import { join } from 'path'
import { getDomains, Domain } from './services/domains'
import { setQuitting } from './app-state'

let tray: Tray | null = null

export function createTray(mainWindow: BrowserWindow): Tray {
  // Create tray icon (template image for macOS)
  const iconPath = join(__dirname, '../../resources/tray-icon-template.png')
  const icon = nativeImage.createFromPath(iconPath)
  
  // For macOS, use template image for automatic dark/light mode
  if (process.platform === 'darwin') {
    icon.setTemplateImage(true)
  }

  tray = new Tray(icon)
  tray.setToolTip('D-Local')

  // Update menu on click (macOS) or right-click (Windows/Linux)
  tray.on('click', () => {
    updateTrayMenu(mainWindow)
  })

  // Initial menu
  updateTrayMenu(mainWindow)

  return tray
}

export async function updateTrayMenu(mainWindow: BrowserWindow): Promise<void> {
  if (!tray) return

  const domains = await getDomains()
  
  const activeDomains = domains.filter(d => d.isRunning)
  const inactiveDomains = domains.filter(d => !d.isRunning)

  const domainMenuItems = [
    ...activeDomains.map(domain => createDomainMenuItem(domain, mainWindow)),
    ...(activeDomains.length > 0 && inactiveDomains.length > 0 
      ? [{ type: 'separator' as const }] 
      : []),
    ...inactiveDomains.map(domain => createDomainMenuItem(domain, mainWindow))
  ]

  const contextMenu = Menu.buildFromTemplate([
    {
      label: `D-Local ${activeDomains.length > 0 ? '● Active' : '○ Inactive'}`,
      enabled: false
    },
    { type: 'separator' },
    ...domainMenuItems,
    { type: 'separator' },
    {
      label: 'Scan Ports...',
      click: () => {
        mainWindow.show()
        mainWindow.webContents.send('open-port-scanner')
      }
    },
    {
      label: 'Add Domain...',
      click: () => {
        mainWindow.show()
        mainWindow.webContents.send('open-add-domain')
      }
    },
    { type: 'separator' },
    {
      label: 'Open D-Local',
      click: () => mainWindow.show()
    },
    {
      label: 'Settings...',
      click: () => {
        mainWindow.show()
        mainWindow.webContents.send('open-settings')
      }
    },
    { type: 'separator' },
    {
      label: 'Quit',
      click: () => {
        setQuitting(true)
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)
}

function createDomainMenuItem(domain: Domain, mainWindow: BrowserWindow) {
  const statusIcon = domain.isRunning ? '●' : '○'
  const fullDomain = `${domain.name}${domain.tld}`
  
  return {
    label: `${statusIcon} ${fullDomain}`,
    submenu: [
      {
        label: 'Open in Browser',
        click: () => shell.openExternal(`http://${fullDomain}`)
      },
      {
        label: 'Copy URL',
        click: () => {
          clipboard.writeText(`http://${fullDomain}`)
        }
      },
      { type: 'separator' as const },
      domain.isRunning
        ? {
            label: 'Stop',
            click: () => mainWindow.webContents.send('stop-domain', domain.id)
          }
        : {
            label: 'Start',
            click: () => mainWindow.webContents.send('start-domain', domain.id)
          },
      { type: 'separator' as const },
      {
        label: 'Open in Claude Code',
        enabled: !!domain.projectPath,
        click: () => {
          if (domain.projectPath) {
            exec(`claude "${domain.projectPath}"`)
          }
        }
      },
      {
        label: 'Open in Terminal',
        enabled: !!domain.projectPath,
        click: () => {
          if (domain.projectPath) {
            exec(`open -a Terminal "${domain.projectPath}"`)
          }
        }
      },
      {
        label: 'Open in Finder',
        enabled: !!domain.projectPath,
        click: () => {
          if (domain.projectPath) {
            shell.openPath(domain.projectPath)
          }
        }
      }
    ]
  }
}
