import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      app: {
        name: 'D-Local',
        tagline: 'Local Development Domain Manager'
      },
      common: {
        loading: 'Loading...',
        optional: 'optional',
        save: 'Save',
        cancel: 'Cancel'
      },
      domain: {
        add: 'Add Domain',
        edit: 'Edit Domain',
        remove: 'Remove',
        name: 'Domain Name',
        port: 'Port',
        projectPath: 'Project Folder',
        startCommand: 'Start Command',
        autoStart: 'Auto-start when D-Local opens',
        openBrowser: 'Open in browser after start',
        active: 'Active',
        inactive: 'Inactive',
        search: 'Search domains...',
        noStartCommand: 'No start command configured',
        confirmRemove: 'Are you sure you want to remove {{name}}?',
        empty: {
          title: 'No domains yet',
          description: 'Add your first domain to get started. You can also scan for running ports to auto-detect projects.'
        },
        noResults: 'No domains matching "{{query}}"',
        status: {
          running: 'Running',
          stopped: 'Stopped'
        }
      },
      scanner: {
        title: 'Port Scanner',
        scanning: 'Scanning ports {{start}}-{{end}}...',
        found: 'Found {{count}} active ports',
        suggested: 'Suggested',
        addSelected: 'Add Selected ({{count}})',
        noResults: 'No active ports found in the specified range.',
        scanAgain: 'Scan Again',
        rescan: 'Rescan'
      },
      actions: {
        start: 'Start',
        stop: 'Stop',
        openBrowser: 'Open in Browser',
        openClaudeCode: 'Open in Claude Code',
        openTerminal: 'Open in Terminal',
        openFinder: 'Open in Finder',
        copyUrl: 'Copy URL',
        refresh: 'Refresh',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        export: 'Export Config',
        import: 'Import Config'
      },
      settings: {
        title: 'Settings',
        general: 'General',
        appearance: 'Appearance',
        ports: 'Ports',
        integration: 'Integration',
        advanced: 'Advanced',
        language: 'Language',
        theme: 'Theme',
        'theme.system': 'System',
        'theme.light': 'Light',
        'theme.dark': 'Dark',
        launchAtLogin: 'Launch at login',
        startMinimized: 'Start minimized to menu bar',
        notifications: 'Show notifications',
        defaultTld: 'Default TLD',
        portRange: 'Port scan range',
        claudeCodePath: 'Claude Code path',
        claudeCodePathHelp: 'Path to the claude binary for "Open in Claude Code" feature',
        caddyPath: 'Caddy path',
        exportImport: 'Export / Import'
      },
      caddy: {
        status: 'Caddy Status',
        running: 'Running',
        stopped: 'Stopped',
        notInstalled: 'Not Installed',
        install: 'Install Caddy',
        installing: 'Installing...',
        restart: 'Restart Caddy'
      },
      errors: {
        nameRequired: 'Domain name is required',
        invalidName: 'Domain name can only contain lowercase letters, numbers, and hyphens',
        portRequired: 'Port is required',
        invalidPort: 'Port must be between 1 and 65535',
        unknown: 'An unknown error occurred'
      }
    }
  },
  vi: {
    translation: {
      app: {
        name: 'D-Local',
        tagline: 'Quản lý Local Domains cho Development'
      },
      common: {
        loading: 'Đang tải...',
        optional: 'tùy chọn',
        save: 'Lưu',
        cancel: 'Hủy'
      },
      domain: {
        add: 'Thêm Domain',
        edit: 'Sửa Domain',
        remove: 'Xóa',
        name: 'Tên Domain',
        port: 'Port',
        projectPath: 'Thư mục Project',
        startCommand: 'Lệnh Start',
        autoStart: 'Tự động start khi mở D-Local',
        openBrowser: 'Mở trình duyệt sau khi start',
        active: 'Đang chạy',
        inactive: 'Không hoạt động',
        search: 'Tìm kiếm domains...',
        noStartCommand: 'Chưa cấu hình lệnh start',
        confirmRemove: 'Bạn có chắc muốn xóa {{name}}?',
        empty: {
          title: 'Chưa có domain nào',
          description: 'Thêm domain đầu tiên để bắt đầu. Bạn cũng có thể quét ports đang chạy để tự động phát hiện projects.'
        },
        noResults: 'Không tìm thấy domain nào cho "{{query}}"',
        status: {
          running: 'Đang chạy',
          stopped: 'Đã dừng'
        }
      },
      scanner: {
        title: 'Quét Ports',
        scanning: 'Đang quét ports {{start}}-{{end}}...',
        found: 'Tìm thấy {{count}} ports đang hoạt động',
        suggested: 'Gợi ý',
        addSelected: 'Thêm đã chọn ({{count}})',
        noResults: 'Không tìm thấy ports nào trong phạm vi đã chọn.',
        scanAgain: 'Quét lại',
        rescan: 'Quét lại'
      },
      actions: {
        start: 'Khởi động',
        stop: 'Dừng',
        openBrowser: 'Mở trình duyệt',
        openClaudeCode: 'Mở trong Claude Code',
        openTerminal: 'Mở Terminal',
        openFinder: 'Mở Finder',
        copyUrl: 'Copy URL',
        refresh: 'Làm mới',
        cancel: 'Hủy',
        save: 'Lưu',
        delete: 'Xóa',
        export: 'Xuất Config',
        import: 'Nhập Config'
      },
      settings: {
        title: 'Cài đặt',
        general: 'Chung',
        appearance: 'Giao diện',
        ports: 'Ports',
        integration: 'Tích hợp',
        advanced: 'Nâng cao',
        language: 'Ngôn ngữ',
        theme: 'Chủ đề',
        'theme.system': 'Theo hệ thống',
        'theme.light': 'Sáng',
        'theme.dark': 'Tối',
        launchAtLogin: 'Khởi động cùng hệ thống',
        startMinimized: 'Khởi động thu nhỏ vào menu bar',
        notifications: 'Hiển thị thông báo',
        defaultTld: 'TLD mặc định',
        portRange: 'Phạm vi quét ports',
        claudeCodePath: 'Đường dẫn Claude Code',
        claudeCodePathHelp: 'Đường dẫn tới file claude cho tính năng "Mở trong Claude Code"',
        caddyPath: 'Đường dẫn Caddy',
        exportImport: 'Xuất / Nhập'
      },
      caddy: {
        status: 'Trạng thái Caddy',
        running: 'Đang chạy',
        stopped: 'Đã dừng',
        notInstalled: 'Chưa cài đặt',
        install: 'Cài đặt Caddy',
        installing: 'Đang cài đặt...',
        restart: 'Khởi động lại Caddy'
      },
      errors: {
        nameRequired: 'Tên domain là bắt buộc',
        invalidName: 'Tên domain chỉ được chứa chữ thường, số và dấu gạch ngang',
        portRequired: 'Port là bắt buộc',
        invalidPort: 'Port phải từ 1 đến 65535',
        unknown: 'Đã xảy ra lỗi không xác định'
      }
    }
  }
}

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
