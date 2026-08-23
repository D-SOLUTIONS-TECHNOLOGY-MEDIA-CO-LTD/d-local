import { app, shell, BrowserWindow } from "electron";
import { join } from "path";
import { initializeIpcHandlers } from "./ipc";
import { createTray } from "./tray";
import { isQuitting, setQuitting } from "./app-state";
import { getCaddyStatus, startCaddy } from "./services/caddy";
import { getDomains } from "./services/domains";

// Simple dev check
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

let mainWindow: BrowserWindow | null = null;

/**
 * Start Caddy on launch so mapped domains work immediately, without the user
 * having to toggle it. No-ops if Caddy isn't installed, is already running, or
 * there are no domains. Failures are non-fatal (surfaced later in the UI).
 */
async function autoStartCaddy(): Promise<void> {
  try {
    const status = await getCaddyStatus();
    if (!status.isInstalled || status.isRunning) return;
    const domains = await getDomains();
    if (domains.length === 0) return;
    await startCaddy();
  } catch (error) {
    console.error("Auto-start Caddy failed:", error);
  }
}

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 15, y: 10 },
    ...(process.platform === "linux"
      ? {
          icon: join(__dirname, "../../resources/icon.png"),
        }
      : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("close", (event) => {
    // Minimize to tray instead of closing
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  // Load the remote URL for development or the local html file for production
  if (isDev && process.env["ELECTRON_RENDERER_URL"]) {
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

// Prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on("second-instance", () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    // Set app user model id for windows
    if (process.platform === "win32") {
      app.setAppUserModelId("vn.d-solutions.d-local");
    }

    // Initialize IPC handlers
    initializeIpcHandlers();

    // Start Caddy in the background so domains are reachable right away.
    autoStartCaddy();

    // Create main window
    createWindow();

    // Create tray
    createTray(mainWindow!);

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      } else {
        mainWindow?.show();
      }
    });
  });

  // Custom quit handler for tray
  app.on("before-quit", () => {
    setQuitting(true);
  });

  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
      app.quit();
    }
  });
}
