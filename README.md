# Simple Theme

A simple theme for Pengu Loader with AutoAccept functionality.

## Features

- **Auto Accept**: Automatically accept match making queue
- **Theme Toggle**: Enable or disable the theme from settings menu
- **Multi-language Support**: English and Russian translations included

## Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure Pengu Loader path in `package.json`:
   ```json
   "config": {
       "penguPath": "D:\\Program Files\\Pengu Loader"
   }
   ```
4. Build the project:
   ```bash
   npm run build
   ```

## Project Structure

```
SimpleTheme/
├── src/
│   ├── index.ts                 # Main entry point
│   ├── languages.ts             # Language system
│   ├── plugins/
│   │   ├── autoAccept.ts        # Auto Accept plugin
│   │   ├── settings.ts          # Settings system
│   │   ├── settingsStructure.ts # Settings structure
│   │   └── settingsTabs/
│   │       └── themeSettings.ts # Theme settings tab
│   ├── utils/
│   │   ├── themeDataStore.ts    # DataStore wrapper
│   │   ├── utils.ts             # Utility functions
│   │   └── settingsUtils.ts     # Settings utilities
│   ├── config/
│   │   └── datastoreDefault.js  # Default settings
│   └── locales/
│       ├── default.js           # English translations
│       └── ru-RU.js             # Russian translations
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Usage

After building, the theme will be automatically copied to your Pengu Loader plugins directory.

**Settings:**
- Open the Pengu Loader settings
- Navigate to "Simple Theme" section
- Toggle "Enable Theme" to enable/disable the theme
- Toggle "Auto Accept" to enable/disable auto accept feature

## Adding Translations

To add a new language:
1. Create a new file in `src/locales/` (e.g., `de-DE.js`)
2. Copy the structure from `default.js`
3. Translate the values

## License

WTFPL
