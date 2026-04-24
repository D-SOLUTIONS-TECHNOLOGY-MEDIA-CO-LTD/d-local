# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

D-Local is an Electron desktop app for macOS that maps `.local` domains to localhost ports using Caddy as a reverse proxy. It manages `/etc/hosts` entries and a Caddyfile so developers can access `project-name.local` instead of `localhost:3000`.

## Development Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Start dev with hot reload (electron-vite)
pnpm build            # Build for production
pnpm package          # Build + create distributable (electron-builder)
pnpm package:mac      # Build macOS .dmg + .zip (universal binary)
pnpm lint             # ESLint (.ts, .tsx)
pnpm lint:fix         # ESLint with auto-fix
pnpm typecheck        # Full type check (all tsconfigs)
pnpm typecheck:main   # Type check main process only (tsconfig.node.json)
pnpm typecheck:renderer  # Type check renderer only (tsconfig.web.json)
pnpm test             # Vitest
pnpm test:ui          # Vitest with browser UI
pnpm test:coverage    # Vitest with coverage
```

Caddy must be installed: `brew install caddy`

## Architecture

Three-process Electron app built with `electron-vite`:

**Main process** (`src/main/`): Node.js backend. Entry point is `index.ts` which initializes IPC handlers and creates the window + tray. All IPC channels are registered in `ipc/index.ts` as a single `initializeIpcHandlers()` call. Services in `services/` do the actual work:
- `domains.ts` — CRUD + start/stop processes. Uses `electron-store` (file: `domains`). Tracks running child processes in a `Map<string, ChildProcess>`. Port status checked via `lsof`.
- `caddy.ts` — Generates Caddyfile at `~/.config/d-local/Caddyfile`, manages Caddy lifecycle. Auto-reloads on domain changes.
- `hosts.ts` — Manages `/etc/hosts` entries between `# D-Local managed` markers. Writes via `osascript` sudo prompt.
- `scanner.ts` — Scans listening TCP ports via `lsof`, suggests domain names from process CWD.
- `config.ts` — App settings via `electron-store` (file: `config`). Handles export/import of full app state.

**Preload** (`src/preload/index.ts`): Bridges main↔renderer. Exposes `window.api` with namespaced IPC calls: `domains`, `scanner`, `caddy`, `config`, `system`. Also exposes `on`/`off` for event channels from tray menu actions.

**Renderer** (`src/renderer/`): React 18 + TypeScript SPA. State is in three Zustand stores (`store/domains.ts`, `store/caddy.ts`, `store/config.ts`) that mirror the main process data via `window.api`. The stores own all IPC calls — components read from stores, not from `window.api` directly.

### IPC Channel Convention

All channels are namespaced: `namespace:action` (e.g., `domains:list`, `caddy:reload`, `config:get`). To add a new IPC handler: define in `main/ipc/index.ts`, expose in `preload/index.ts`, call from the relevant Zustand store.

### Path Aliases

Configured in both `tsconfig.json` and `electron.vite.config.ts`:
- `@/*` → `src/renderer/*`
- `@components/*`, `@hooks/*`, `@store/*`, `@lib/*`, `@i18n/*`

### Styling

Tailwind CSS with CSS variable-based design tokens (shadcn/ui pattern). Colors defined as HSL CSS variables, referenced via `tailwind.config.js`. Dark mode uses `class` strategy — toggled by adding/removing `dark` on `<html>`. Use semantic color names (`primary`, `muted`, `destructive`, etc.) not raw values.

### i18n

Translations are inline in `src/renderer/i18n/index.ts` (not separate JSON files). Two languages: `en` and `vi`. Use `useTranslation()` hook and `t('key')` in components.

### Window Behavior

The app minimizes to tray on close (not quit). `app.isQuitting` flag controls actual quit. Tray menu (`src/main/tray.ts`) sends events to renderer via `webContents.send()` for actions like opening modals.

## Key Types

The `Domain` interface is duplicated in `src/main/services/domains.ts` and `src/renderer/store/domains.ts`. Both must stay in sync. Similarly `AppConfig` exists in `src/main/services/config.ts` and `src/renderer/store/config.ts`.

## External Dependencies

- **Caddy** — reverse proxy, must be installed on the host. Config at `~/.config/d-local/Caddyfile`.
- **electron-store** — persists domains and config as JSON files in the app's userData directory.
- **Radix UI** — used for dialog, dropdown, select, switch, tabs, toast, tooltip primitives.
- **lucide-react** — icon library.

## Packaging Notes

- `electron-store` and `uuid` must NOT be externalized — they are bundled into `out/main/index.js` via `externalizeDepsPlugin({ exclude: [...] })` in `electron.vite.config.ts`.
- `build/afterPack.js` runs `xattr -cr` on the `.app` bundle to strip resource forks before codesign.
- macOS build outputs universal binaries (Intel + Apple Silicon) to `dist/`.
- Code signing requires an Apple Developer certificate; set `CSC_IDENTITY_AUTO_DISCOVERY=false` to build unsigned.
