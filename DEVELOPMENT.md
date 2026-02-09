# 🛠️ Development Guide

Guide for developers who want to build, modify, or contribute to Astrante Theme.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Setup](#setup)
- [Project Structure](#project-structure)
- [Building](#building)
- [Creating Installer](#creating-installer)
- [Development Workflow](#development-workflow)
- [Adding Translations](#adding-translations)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before you start, make sure you have:

- **Node.js** 20+ — [Download](https://nodejs.org/)
- **Git** — [Download](https://git-scm.com/)
- **Pengu Loader** installed — [Download](https://pengu-loader.com/)
- **Inno Setup 6.x** (for building installer) — [Download](https://jrsoftware.org/isdl.php)
- TypeScript knowledge
- Basic understanding of League of Legends client plugins

---

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/Astrante/astrante-lol-client-extention.git
cd astrante-lol-client-extention
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure Pengu Loader path

Edit `package.json` and change `penguPath` to your Pengu Loader installation:

```json
"config": {
    "penguPath": "C:\\Program Files\\Pengu Loader"  // Change this!
}
```

### 4. Build the project

```bash
npm run build
```

The built files will be:
- In `dist/` folder
- Automatically copied to your Pengu Loader `plugins/` directory

---

## Project Structure

```
AstranteTheme/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── languages.ts             # Language system
│   ├── plugins/
│   │   ├── autoAccept.ts        # Auto Accept functionality
│   │   ├── settings.ts          # Settings system
│   │   ├── settingsStructure.ts # Settings structure
│   │   └── settingsTabs/
│   │       └── themeSettings.ts # Theme settings UI
│   ├── utils/
│   │   ├── themeDataStore.ts    # DataStore wrapper
│   │   ├── utils.ts             # Utility functions
│   │   └── settingsUtils.ts     # Settings utilities
│   ├── config/
│   │   └── datastoreDefault.js  # Default settings values
│   └── locales/
│       ├── default.js           # English translations
│       └── ru-RU.js             # Russian translations
├── installer/
│   ├── installer.iss            # Inno Setup script
│   ├── build-installer.js       # Installer builder
│   ├── app_icon.ico             # Installer icon
│   └── output/                  # Built installer (gitignored)
├── package.json                 # Project config
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite build config
├── DEVELOPMENT.md               # This file
└── README.md                    # User-facing readme
```

---

## Building

### Development Build

```bash
npm run build
```

This:
1. Compiles TypeScript
2. Bundles with Vite
3. Copies to `dist/`
4. Copies to your Pengu Loader `plugins/` directory

### Manual Build Steps

If you need more control:

```bash
# 1. Compile TypeScript
tsc

# 2. Bundle with Vite
npm run build

# 3. The output is in dist/
```

---

## Creating Installer

To create a distributable installer:

```bash
npm run build:installer
```

This will:
1. Build the project
2. Compile the installer
3. Output to `installer/output/AstranteTheme-Installer.exe`

### Requirements for Installer

- **Inno Setup 6.x** must be installed
- The script auto-detects Inno Setup in:
  - `C:\Program Files (x86)\Inno Setup 6\`
  - `C:\Program Files\Inno Setup 6\`
  - Or in PATH

See [INSTALLER.md](INSTALLER.md) for more details.

---

## Development Workflow

### Making Changes

1. Edit source files in `src/`
2. Build: `npm run build`
3. Test in Pengu Loader
4. Commit changes

### Testing Settings

Settings are stored in:
- **Runtime**: `DataStore` (Pengu's storage)
- **Default values**: `src/config/datastoreDefault.js`

To reset settings, delete the plugin's data in Pengu Loader.

### Adding New Features

1. Create plugin file in `src/plugins/`
2. Import in `src/index.ts`
3. Add settings in `src/plugins/settingsStructure.ts`
4. Add translations in `src/locales/`

---

## Adding Translations

1. Create new file in `src/locales/`:
   - Format: `xx-XX.js` (e.g., `de-DE.js`)
   - Use `default.js` as template

2. Example:

```javascript
// src/locales/de-DE.js
export default {
    themeName: 'Astrante Theme',
    enableTheme: 'Design aktivieren',
    autoAccept: 'Auto-Akzeptieren',
    // ... more translations
};
```

3. Import in `src/languages.ts`:

```typescript
import deDE from './locales/de-DE';

export const languages = {
    'en-US': enUS,
    'ru-RU': ruRU,
    'de-DE': deDE,  // Add this
};
```

---

## Troubleshooting

### Build fails with "Cannot find module"

```bash
rm -rf node_modules package-lock.json
npm install
```

### Changes not showing in Pengu Loader

1. Rebuild: `npm run build`
2. Restart Pengu Loader completely
3. Check Pengu Loader logs for errors

### Installer build fails

Make sure Inno Setup is installed:
```bash
# Check if installed
where ISCC.exe

# If not found, install from:
# https://jrsoftware.org/isdl.php
```

### TypeScript errors

Check `tsconfig.json` and make sure you're using Node.js 20+:

```bash
node --version  # Should be v20+
```

---

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Style

- Use TypeScript for all new code
- Follow existing naming conventions
- Add comments for complex logic
- Update translations for new UI text

---

## License

WTFPL - Do What The F*ck You Want To Public License

---

## Resources

- [Pengu Loader Documentation](https://pengu-loader.com/docs)
- [Pengu Discord](https://discord.gg/pengu)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
