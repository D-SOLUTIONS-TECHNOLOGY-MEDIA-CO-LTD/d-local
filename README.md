# D-Local

<p align="center">
  <img src="resources/icon.png" alt="D-Local Logo" width="128" height="128">
</p>

<p align="center">
  <strong>Local Development Domain Manager for macOS</strong>
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#claude-code-integration">Claude Code</a> •
  <a href="#contributing">Contributing</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/platform-macOS-blue" alt="Platform">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/github/v/release/d-solutions-vn/d-local" alt="Release">
</p>

---

## Problem

When working on multiple projects simultaneously:

```
localhost:3000  → Which project is this again?
localhost:3001  → Frontend or backend?
localhost:3002  → Port conflict! 😤
localhost:8080  → Is this even running?
```

## Solution

D-Local maps your ports to memorable `.local` domains:

```
wpdocsgenerator.local  → localhost:3000 ✓
quotation-cms.local    → localhost:3001 ✓
ima-dashboard.local    → localhost:3003 ✓
```

---

## Features

### 🔍 Smart Port Scanner
Automatically detect running dev servers and suggest domain names based on project folders.

### 🚀 One-Click Project Start
Save start commands for each project. Start your entire dev environment with one click.

### 🖥️ Menu Bar Quick Access
Access all your domains from the menu bar. Start, stop, or open in browser instantly.

### 🤖 Claude Code Integration
Seamlessly integrate with Claude Code workflow. Open projects directly in Claude Code from the app.

### 🌐 Multi-language Support
Available in English and Vietnamese.

### 🎨 Native macOS Experience
Follows macOS design guidelines. Supports light/dark mode.

---

## Installation

### Download

Download the latest release from [GitHub Releases](https://github.com/d-solutions-vn/d-local/releases).

### Using Homebrew (coming soon)

```bash
brew install --cask d-local
```

### Build from Source

```bash
# Clone the repository
git clone https://github.com/d-solutions-vn/d-local.git
cd d-local

# Install dependencies
pnpm install

# Run in development mode
pnpm dev

# Build for production
pnpm build
```

### Prerequisites

D-Local requires [Caddy](https://caddyserver.com/) as the reverse proxy:

```bash
brew install caddy
```

---

## Usage

### Adding a Domain

1. Click **+ Add** or press `⌘ + N`
2. Enter domain name (e.g., `my-project`)
3. Enter port number (e.g., `3000`)
4. Optionally add project folder and start command
5. Click **Add Domain**

Your project is now accessible at `http://my-project.local`

### Scanning Ports

1. Click **Scan Ports** or press `⌘ + S`
2. D-Local will scan ports 3000-9000
3. Select the ports you want to add
4. Edit suggested domain names if needed
5. Click **Add Selected**

### Managing Projects

| Action | How |
|--------|-----|
| Start project | Click ▶ button or right-click → Start |
| Stop project | Click ■ button or right-click → Stop |
| Open in browser | Click 🌐 or `⌘ + O` |
| Copy URL | Right-click → Copy URL or `⌘ + C` |
| Edit domain | Right-click → Edit |
| Remove domain | Right-click → Remove |

### Menu Bar

D-Local lives in your menu bar for quick access:

- View all domains and their status
- Start/stop projects
- Open in browser
- Quick add new domain

---

## Claude Code Integration

D-Local integrates with [Claude Code](https://claude.ai/code) for AI-powered development:

### Open in Claude Code

Right-click any domain → **Open in Claude Code**

Or use keyboard shortcut: `⌘ + Shift + C`

### Auto-detect Projects

D-Local can watch your project folders and automatically suggest adding new projects when detected.

Configure in **Settings → Integration → Watch Folders**

---

## Configuration

### Export/Import

Share your configuration with team members:

**Export:**
1. Go to **Settings → Export Config**
2. Choose what to include (domains, settings)
3. Save JSON file

**Import:**
1. Go to **Settings → Import Config**
2. Select JSON file
3. Choose merge or replace

### Settings

| Setting | Description |
|---------|-------------|
| Language | English or Vietnamese |
| Theme | System, Light, or Dark |
| Launch at login | Start D-Local when macOS starts |
| Start minimized | Start in menu bar only |
| Default TLD | Default domain extension (.local) |
| Port range | Range for port scanner (default: 3000-9000) |
| Claude Code path | Path to claude binary |

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Add new domain | `⌘ + N` |
| Scan ports | `⌘ + S` |
| Search domains | `⌘ + F` |
| Settings | `⌘ + ,` |
| Refresh status | `⌘ + R` |
| Open in browser | `⌘ + O` |
| Open in Claude Code | `⌘ + Shift + C` |
| Copy URL | `⌘ + C` |
| Quit | `⌘ + Q` |

---

## How It Works

D-Local uses [Caddy](https://caddyserver.com/) as a reverse proxy:

```
Browser Request          Caddy              Your Dev Server
─────────────────────────────────────────────────────────────
my-project.local  →  reverse_proxy  →  localhost:3000
```

D-Local manages:
1. `/etc/hosts` - Maps domain to 127.0.0.1
2. `Caddyfile` - Configures reverse proxy rules
3. Caddy process - Ensures proxy is running

---

## Troubleshooting

### Domain not accessible

1. Check if Caddy is running (status in bottom bar)
2. Check if your dev server is running on the correct port
3. Try refreshing with `⌘ + R`

### Permission denied

D-Local needs permission to edit `/etc/hosts`. You may be prompted for your password.

### Caddy not installed

```bash
brew install caddy
```

Then restart D-Local.

### Port conflict

If a port is already in use by another domain:
1. Edit the existing domain to use a different port
2. Or remove the conflicting domain first

---

## Development

### Tech Stack

- **Framework:** Electron
- **Frontend:** React + TypeScript
- **Styling:** Tailwind CSS
- **State:** Zustand
- **Build:** Vite
- **Proxy:** Caddy

### Project Structure

```
d-local/
├── src/
│   ├── main/           # Electron main process
│   ├── preload/        # Preload scripts
│   └── renderer/       # React frontend
├── resources/          # App icons and assets
└── scripts/            # Build scripts
```

### Scripts

```bash
pnpm dev        # Start development
pnpm build      # Build for production
pnpm package    # Create distributable
pnpm lint       # Run linter
pnpm test       # Run tests
```

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Credits

**D-Solutions** - [https://d-solutions.vn](https://d-solutions.vn)

- Website: [d-solutions.vn](https://d-solutions.vn)
- Email: [lienhe@d-solutions.vn](mailto:lienhe@d-solutions.vn)
- Phone: 0972 270 066

---

<p align="center">
  Made with ❤️ by <a href="https://d-solutions.vn">D-Solutions</a>
</p>
