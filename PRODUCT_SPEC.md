# D-Local - Local Development Domain Manager

> Quản lý local domains (.local) cho development environment trên macOS

## Overview

**D-Local** là ứng dụng desktop giúp developer quản lý local domains, tự động map ports tới domain names thân thiện, và streamline workflow phát triển với Claude Code.

### Problem Statement

Khi phát triển nhiều dự án cùng lúc:
- Phải nhớ port nào cho dự án nào (localhost:3000, :3001, :3002...)
- Xung đột ports khi chạy nhiều project
- Khó share URL với team members
- Mất thời gian config thủ công cho từng project

### Solution

D-Local tự động:
- Scan ports đang chạy và suggest domain names
- Map domains tới ports (wpdocsgenerator.local → localhost:3000)
- Lưu start commands cho từng project
- Tích hợp với Claude Code workflow

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | Electron |
| Frontend | React + TypeScript |
| UI Library | Tailwind CSS + Radix UI |
| State Management | Zustand |
| Backend/Proxy | Caddy (embedded hoặc system) |
| Build Tool | Vite |
| Package Manager | pnpm |
| i18n | react-i18next |

---

## Features

### Phase 1: Core (MVP)

#### 1.1 Domain Management

**Add Domain**
- Input: Project name, port, start command (optional)
- Auto-suggest domain name từ project folder name
- Validate port availability
- Auto-update /etc/hosts và Caddy config

**Edit Domain**
- Thay đổi port mapping
- Update start command
- Rename domain

**Remove Domain**
- Xóa khỏi /etc/hosts và Caddy config
- Option: giữ lại config để reuse sau

**List Domains**
- Hiển thị tất cả domains đã config
- Status indicator: running/stopped
- Quick actions: start, stop, open in browser, copy URL

#### 1.2 Port Scanner

**Auto Scan**
- Quét ports trong range 3000-9000 (configurable)
- Detect process name đang chạy trên port
- Detect project folder từ process working directory
- Suggest domain name dựa trên folder name

**Manual Scan**
- Scan specific port
- Scan custom range

**Scan Results**
- List ports đang active
- Process name và PID
- Suggested domain name (editable)
- One-click add to domains

#### 1.3 Project Commands

**Save Start Command**
- Lưu command để start project (npm run dev, yarn dev, etc.)
- Working directory
- Environment variables (optional)

**Quick Start**
- Start project từ app với saved command
- Terminal output trong app hoặc external terminal
- Auto-detect khi project đã chạy

**Stop Project**
- Kill process đang chạy trên port
- Graceful shutdown option

#### 1.4 System Tray / Menu Bar

**Menu Bar Icon**
- Status indicator (có project đang chạy hay không)
- Quick access menu

**Quick Menu**
- List active domains với status
- Start/stop project
- Open in browser
- Open main window

#### 1.5 Caddy Management

**Auto Setup**
- Check Caddy installed
- Guide cài đặt nếu chưa có
- Auto-generate Caddyfile
- Auto-start Caddy as service

**Health Check**
- Monitor Caddy status
- Auto-restart nếu crash
- Error notifications

---

### Phase 2: Claude Code Integration

#### 2.1 Folder Detection

**Watch Mode**
- Monitor specified folders cho new projects
- Auto-suggest add domain khi detect new project

**Manual Add**
- Browse và select project folder
- Auto-detect framework và suggest port

**Process Scan**
- Detect Claude Code processes
- Link running projects tới domains

#### 2.2 Quick Actions

**Open in Claude Code**
- Button để mở project folder trong Claude Code
- Command: `claude` hoặc custom path

**Context Menu Integration**
- Right-click domain → Open in Claude Code
- Right-click domain → Open in Terminal
- Right-click domain → Open in Finder

---

### Phase 3: Team Features

#### 3.1 Export/Import Config

**Export**
- Export tất cả domains config ra JSON file
- Option: include/exclude start commands
- Option: include/exclude sensitive data

**Import**
- Import từ JSON file
- Merge hoặc replace existing config
- Conflict resolution UI

**Share Config**
- Generate shareable config file
- Import từ URL (GitHub raw, etc.)

#### 3.2 Project Templates

**Save as Template**
- Lưu project config làm template
- Include: default port, start command, env vars

**Apply Template**
- Apply template cho new project
- Framework-specific templates (Next.js, Vite, etc.)

---

## UI/UX Design

### Design Principles

1. **Native Feel** - Theo macOS design guidelines
2. **Minimal** - Chỉ hiển thị thông tin cần thiết
3. **Fast** - Quick actions accessible trong 1-2 clicks
4. **Accessible** - Keyboard shortcuts cho power users

### Color Scheme

```
Light Mode:
- Background: #FFFFFF
- Surface: #F5F5F5
- Primary: #2563EB (Blue)
- Success: #22C55E (Green)
- Warning: #F59E0B (Amber)
- Error: #EF4444 (Red)
- Text Primary: #1F2937
- Text Secondary: #6B7280

Dark Mode:
- Background: #1F2937
- Surface: #374151
- Primary: #3B82F6 (Blue)
- Success: #34D399 (Green)
- Warning: #FBBF24 (Amber)
- Error: #F87171 (Red)
- Text Primary: #F9FAFB
- Text Secondary: #9CA3AF
```

### Main Window Layout

```
┌─────────────────────────────────────────────────────────────┐
│  D-Local                                    [_] [□] [×]     │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 🔍 Search domains...                    [+ Add] [⟳] │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ACTIVE (3)                                          │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ ● wpdocsgenerator.local        :3000    [▶][🌐][⋮]  │    │
│  │ ● quotation-cms.local          :3001    [▶][🌐][⋮]  │    │
│  │ ● ima-dashboard.local          :3003    [▶][🌐][⋮]  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ INACTIVE (1)                                        │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ ○ nhaso7.local                 :3002    [▶][🌐][⋮]  │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [Scan Ports]  [Settings]              Caddy: ● Running     │
└─────────────────────────────────────────────────────────────┘
```

### Add Domain Modal

```
┌─────────────────────────────────────────────────────────────┐
│  Add New Domain                                    [×]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Domain Name                                                │
│  ┌─────────────────────────────────────┐                    │
│  │ wpdocsgenerator                     │ .local             │
│  └─────────────────────────────────────┘                    │
│                                                             │
│  Port                                                       │
│  ┌─────────────────────────────────────┐                    │
│  │ 3000                                │                    │
│  └─────────────────────────────────────┘                    │
│                                                             │
│  Project Folder (optional)                                  │
│  ┌─────────────────────────────────────┐ ┌────────┐         │
│  │ /Users/dong/github/wpdocsgenerator  │ │ Browse │         │
│  └─────────────────────────────────────┘ └────────┘         │
│                                                             │
│  Start Command (optional)                                   │
│  ┌─────────────────────────────────────┐                    │
│  │ npm run dev                         │                    │
│  └─────────────────────────────────────┘                    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ☑ Auto-start when D-Local opens                     │    │
│  │ ☐ Open in browser after start                       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│                              [Cancel]  [Add Domain]         │
└─────────────────────────────────────────────────────────────┘
```

### Port Scanner Modal

```
┌─────────────────────────────────────────────────────────────┐
│  Port Scanner                                      [×]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Scanning ports 3000-9000...                    [Stop]      │
│  ████████████████████░░░░░░░░░░░░░░░░░░░░ 45%               │
│                                                             │
│  Found 4 active ports:                                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ☑ :3000  node     /Users/dong/github/wpdocs...      │    │
│  │          Suggested: wpdocsgenerator.local           │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ ☑ :3001  node     /Users/dong/github/quotat...      │    │
│  │          Suggested: quotation-cms.local             │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ ☐ :5432  postgres (System Service)                  │    │
│  │          [Skip system services]                     │    │
│  ├─────────────────────────────────────────────────────┤    │
│  │ ☑ :8080  java     /Users/dong/projects/api...       │    │
│  │          Suggested: api-server.local                │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│                    [Cancel]  [Add Selected (3)]             │
└─────────────────────────────────────────────────────────────┘
```

### Settings Window

```
┌─────────────────────────────────────────────────────────────┐
│  Settings                                          [×]      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐                                           │
│  │ General      │  GENERAL                                  │
│  │ Appearance   │  ─────────────────────────────────────    │
│  │ Ports        │                                           │
│  │ Integration  │  Language                                 │
│  │ Advanced     │  ┌─────────────────────────────────┐      │
│  └──────────────┘  │ English                      ▼  │      │
│                    └─────────────────────────────────┘      │
│                                                             │
│                    ☑ Launch at login                        │
│                    ☑ Start minimized to menu bar            │
│                    ☑ Show notifications                     │
│                                                             │
│                    Default TLD                              │
│                    ┌─────────────────────────────────┐      │
│                    │ .local                       ▼  │      │
│                    └─────────────────────────────────┘      │
│                                                             │
│                    Claude Code Path                         │
│                    ┌─────────────────────────────────┐      │
│                    │ /usr/local/bin/claude           │      │
│                    └─────────────────────────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Menu Bar Dropdown

```
┌────────────────────────────────┐
│  D-Local              ● Active │
├────────────────────────────────┤
│  ● wpdocsgenerator.local       │
│    ├─ Open in Browser          │
│    ├─ Copy URL                 │
│    ├─ Stop                     │
│    └─ Open in Claude Code      │
├────────────────────────────────┤
│  ● quotation-cms.local         │
│  ● ima-dashboard.local         │
│  ○ nhaso7.local                │
├────────────────────────────────┤
│  Scan Ports...                 │
│  Add Domain...                 │
├────────────────────────────────┤
│  Open D-Local                  │
│  Settings...                   │
│  Quit                          │
└────────────────────────────────┘
```

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Add new domain | ⌘ + N |
| Scan ports | ⌘ + S |
| Search domains | ⌘ + F |
| Settings | ⌘ + , |
| Refresh status | ⌘ + R |
| Quit | ⌘ + Q |
| Close window | ⌘ + W |
| Toggle domain | Enter (when selected) |
| Open in browser | ⌘ + O |
| Open in Claude Code | ⌘ + Shift + C |
| Copy URL | ⌘ + C |

---

## Data Model

### Domain

```typescript
interface Domain {
  id: string;                    // UUID
  name: string;                  // e.g., "wpdocsgenerator"
  tld: string;                   // e.g., ".local"
  port: number;                  // e.g., 3000
  projectPath?: string;          // e.g., "/Users/dong/github/wpdocsgenerator"
  startCommand?: string;         // e.g., "npm run dev"
  env?: Record<string, string>;  // Environment variables
  autoStart: boolean;            // Start when app opens
  openBrowserOnStart: boolean;   // Open browser after start
  createdAt: Date;
  updatedAt: Date;
}
```

### AppConfig

```typescript
interface AppConfig {
  language: 'en' | 'vi';
  theme: 'system' | 'light' | 'dark';
  launchAtLogin: boolean;
  startMinimized: boolean;
  showNotifications: boolean;
  defaultTld: string;            // Default: ".local"
  portScanRange: {
    start: number;               // Default: 3000
    end: number;                 // Default: 9000
  };
  claudeCodePath: string;        // Path to claude binary
  watchFolders: string[];        // Folders to watch for new projects
  caddyPath: string;             // Path to caddy binary
}
```

### ExportConfig

```typescript
interface ExportConfig {
  version: string;               // Config format version
  exportedAt: Date;
  domains: Domain[];
  settings?: Partial<AppConfig>; // Optional settings
}
```

---

## File Structure

```
d-local/
├── package.json
├── electron.vite.config.ts
├── tsconfig.json
├── tailwind.config.js
├── .env.example
├── README.md
│
├── resources/                   # App resources
│   ├── icon.icns               # macOS icon
│   ├── icon.png                # Menu bar icon
│   └── tray-icon-template.png  # Menu bar template icon
│
├── src/
│   ├── main/                   # Electron main process
│   │   ├── index.ts            # Main entry
│   │   ├── ipc/                # IPC handlers
│   │   │   ├── domains.ts
│   │   │   ├── ports.ts
│   │   │   ├── caddy.ts
│   │   │   └── system.ts
│   │   ├── services/
│   │   │   ├── caddy.ts        # Caddy management
│   │   │   ├── hosts.ts        # /etc/hosts management
│   │   │   ├── scanner.ts      # Port scanner
│   │   │   ├── process.ts      # Process management
│   │   │   └── claude.ts       # Claude Code integration
│   │   ├── store/              # Electron store
│   │   │   ├── domains.ts
│   │   │   └── config.ts
│   │   ├── tray.ts             # Menu bar tray
│   │   └── updater.ts          # Auto updater
│   │
│   ├── preload/                # Preload scripts
│   │   └── index.ts
│   │
│   └── renderer/               # React frontend
│       ├── index.html
│       ├── main.tsx
│       ├── App.tsx
│       ├── components/
│       │   ├── ui/             # Shared UI components
│       │   ├── DomainList.tsx
│       │   ├── DomainCard.tsx
│       │   ├── AddDomainModal.tsx
│       │   ├── PortScanner.tsx
│       │   ├── Settings.tsx
│       │   └── StatusBar.tsx
│       ├── hooks/
│       │   ├── useDomains.ts
│       │   ├── usePortScanner.ts
│       │   └── useCaddy.ts
│       ├── store/
│       │   └── index.ts        # Zustand store
│       ├── i18n/
│       │   ├── index.ts
│       │   ├── en.json
│       │   └── vi.json
│       ├── lib/
│       │   └── utils.ts
│       └── styles/
│           └── globals.css
│
├── scripts/
│   ├── build.sh
│   └── notarize.js             # macOS notarization
│
└── build/                      # Build output
    └── ...
```

---

## Localization

### English (en.json)

```json
{
  "app": {
    "name": "D-Local",
    "tagline": "Local Development Domain Manager"
  },
  "domain": {
    "add": "Add Domain",
    "edit": "Edit Domain",
    "remove": "Remove Domain",
    "name": "Domain Name",
    "port": "Port",
    "projectPath": "Project Folder",
    "startCommand": "Start Command",
    "autoStart": "Auto-start when D-Local opens",
    "openBrowser": "Open in browser after start",
    "active": "Active",
    "inactive": "Inactive",
    "status": {
      "running": "Running",
      "stopped": "Stopped"
    }
  },
  "scanner": {
    "title": "Port Scanner",
    "scanning": "Scanning ports {{start}}-{{end}}...",
    "found": "Found {{count}} active ports",
    "suggested": "Suggested",
    "addSelected": "Add Selected ({{count}})"
  },
  "actions": {
    "start": "Start",
    "stop": "Stop",
    "openBrowser": "Open in Browser",
    "openClaudeCode": "Open in Claude Code",
    "openTerminal": "Open in Terminal",
    "openFinder": "Open in Finder",
    "copyUrl": "Copy URL",
    "refresh": "Refresh",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "export": "Export Config",
    "import": "Import Config"
  },
  "settings": {
    "title": "Settings",
    "general": "General",
    "appearance": "Appearance",
    "ports": "Ports",
    "integration": "Integration",
    "advanced": "Advanced",
    "language": "Language",
    "theme": "Theme",
    "launchAtLogin": "Launch at login",
    "startMinimized": "Start minimized to menu bar",
    "notifications": "Show notifications",
    "defaultTld": "Default TLD",
    "portRange": "Port scan range",
    "claudeCodePath": "Claude Code path"
  },
  "caddy": {
    "status": "Caddy Status",
    "running": "Running",
    "stopped": "Stopped",
    "notInstalled": "Not Installed",
    "install": "Install Caddy",
    "restart": "Restart Caddy"
  },
  "errors": {
    "portInUse": "Port {{port}} is already in use",
    "domainExists": "Domain {{domain}} already exists",
    "caddyNotRunning": "Caddy is not running",
    "permissionDenied": "Permission denied. Please run with sudo."
  }
}
```

### Vietnamese (vi.json)

```json
{
  "app": {
    "name": "D-Local",
    "tagline": "Quản lý Local Domains cho Development"
  },
  "domain": {
    "add": "Thêm Domain",
    "edit": "Sửa Domain",
    "remove": "Xóa Domain",
    "name": "Tên Domain",
    "port": "Port",
    "projectPath": "Thư mục Project",
    "startCommand": "Lệnh Start",
    "autoStart": "Tự động start khi mở D-Local",
    "openBrowser": "Mở trình duyệt sau khi start",
    "active": "Đang chạy",
    "inactive": "Không hoạt động",
    "status": {
      "running": "Đang chạy",
      "stopped": "Đã dừng"
    }
  },
  "scanner": {
    "title": "Quét Ports",
    "scanning": "Đang quét ports {{start}}-{{end}}...",
    "found": "Tìm thấy {{count}} ports đang hoạt động",
    "suggested": "Gợi ý",
    "addSelected": "Thêm đã chọn ({{count}})"
  },
  "actions": {
    "start": "Khởi động",
    "stop": "Dừng",
    "openBrowser": "Mở trình duyệt",
    "openClaudeCode": "Mở trong Claude Code",
    "openTerminal": "Mở Terminal",
    "openFinder": "Mở Finder",
    "copyUrl": "Copy URL",
    "refresh": "Làm mới",
    "cancel": "Hủy",
    "save": "Lưu",
    "delete": "Xóa",
    "export": "Xuất Config",
    "import": "Nhập Config"
  },
  "settings": {
    "title": "Cài đặt",
    "general": "Chung",
    "appearance": "Giao diện",
    "ports": "Ports",
    "integration": "Tích hợp",
    "advanced": "Nâng cao",
    "language": "Ngôn ngữ",
    "theme": "Chủ đề",
    "launchAtLogin": "Khởi động cùng hệ thống",
    "startMinimized": "Khởi động thu nhỏ vào menu bar",
    "notifications": "Hiển thị thông báo",
    "defaultTld": "TLD mặc định",
    "portRange": "Phạm vi quét ports",
    "claudeCodePath": "Đường dẫn Claude Code"
  },
  "caddy": {
    "status": "Trạng thái Caddy",
    "running": "Đang chạy",
    "stopped": "Đã dừng",
    "notInstalled": "Chưa cài đặt",
    "install": "Cài đặt Caddy",
    "restart": "Khởi động lại Caddy"
  },
  "errors": {
    "portInUse": "Port {{port}} đã được sử dụng",
    "domainExists": "Domain {{domain}} đã tồn tại",
    "caddyNotRunning": "Caddy không chạy",
    "permissionDenied": "Không có quyền. Vui lòng chạy với sudo."
  }
}
```

---

## Security Considerations

### Permissions

1. **System Admin Rights**
   - Cần sudo để edit /etc/hosts
   - Option 1: Prompt password mỗi lần
   - Option 2: Setup helper tool với elevated permissions (recommended)

2. **File Access**
   - App sandbox với access tới:
     - /etc/hosts (write)
     - ~/.config/caddy/ (read/write)
     - User selected project folders

### Data Storage

1. **Config Storage**
   - Lưu tại: ~/Library/Application Support/D-Local/
   - Format: JSON (encrypted optional)

2. **Sensitive Data**
   - Environment variables có thể chứa secrets
   - Option để encrypt sensitive fields
   - Warning khi export config với env vars

---

## Distribution

### Build Targets

- macOS: DMG, ZIP (for auto-update)
- [Future] Windows: NSIS installer
- [Future] Linux: AppImage, deb

### Auto Update

- Electron auto-updater
- GitHub Releases as update source
- Notify user khi có update mới

### Notarization

- Apple notarization required cho macOS distribution
- Script: scripts/notarize.js

---

## Development Setup

### Prerequisites

```bash
# Node.js 18+
node --version

# pnpm
npm install -g pnpm

# Caddy
brew install caddy
```

### Install & Run

```bash
# Clone repo
git clone https://github.com/d-solutions-vn/d-local.git
cd d-local

# Install dependencies
pnpm install

# Development
pnpm dev

# Build
pnpm build

# Package
pnpm package
```

### Environment Variables

```bash
# .env.development
VITE_DEV_SERVER_URL=http://localhost:5173

# .env.production
# (none required)
```

---

## Roadmap

### v1.0.0 (MVP)
- [ ] Domain management (add, edit, remove, list)
- [ ] Port scanner
- [ ] Project start commands
- [ ] Menu bar tray
- [ ] Caddy integration
- [ ] Light/dark mode
- [ ] English/Vietnamese

### v1.1.0
- [ ] Claude Code integration
- [ ] Export/Import config
- [ ] Keyboard shortcuts
- [ ] Auto-update

### v1.2.0
- [ ] Watch folders for new projects
- [ ] Project templates
- [ ] Framework detection

### v2.0.0
- [ ] Windows support
- [ ] Linux support
- [ ] Team sync (optional cloud)

---

## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## License

MIT License - see [LICENSE](LICENSE) for details.

---

## Credits

**D-Solutions** - https://d-solutions.vn

Built with:
- [Electron](https://www.electronjs.org/)
- [React](https://reactjs.org/)
- [Caddy](https://caddyserver.com/)
- [Tailwind CSS](https://tailwindcss.com/)
