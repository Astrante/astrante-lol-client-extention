import defaultSettings from "../config/datastoreDefault.js";

/**
 * Plugin configuration for a setting
 */
interface PluginConfig {
    path: string;           // Path to plugin file
    method?: string;        // Method to call (default: "main")
    args?: any[];           // Arguments to pass to method
}

/**
 * Setting node in the tree - combines hierarchy AND plugin info
 */
interface SettingNode {
    parent: string | null;  // Parent key, null = root
    plugins?: PluginConfig[]; // Plugins to load when this setting is enabled
}

/**
 * Settings tree structure - defines parent-child relationships AND plugins
 * Single source of truth for:
 * - Settings hierarchy (for UI enable/disable logic)
 * - Plugin loading (for auto-loading plugins when enabled)
 */
export const SETTINGS_TREE: { [key: string]: SettingNode } = {
    "theme_enabled": {
        parent: null,  // Root - no dependencies
    },
    "auto_accept": {
        parent: "theme_enabled",
        plugins: [{ path: "./plugins/autoAccept.ts", method: "main", args: [true] }],
    },
    "hide_tft": {
        parent: "theme_enabled",
        // Group setting - no plugins directly, children have their own
    },
    "hide_tft_mode": {
        parent: "hide_tft",
        plugins: [{ path: "./plugins/hideTft.ts", method: "main", args: [] }],
    },
    "hide_tft_tab": {
        parent: "hide_tft",
        plugins: [{ path: "./plugins/hideTft.ts", method: "main", args: [] }],
    },
    "hide_tft_mission": {
        parent: "hide_tft",
        plugins: [{ path: "./plugins/hideTft.ts", method: "main", args: [] }],
    },
};

/**
 * Recursively check if ALL parents of a setting are enabled (does NOT check the setting itself)
 * @param key - The setting key whose parents to check
 * @returns true if ALL parents in the tree are enabled
 */
function areAllParentsEnabled(key: string): boolean {
    const node = SETTINGS_TREE[key];
    if (!node) return true;  // Safety: if key not in tree, treat as root

    const parentKey = node.parent;
    if (parentKey === null) {
        return true;  // Root node - no parents to check
    }

    // Check if parent is enabled
    const parentValue = AstranteData.get(parentKey, false);
    if (!parentValue) {
        return false;
    }

    // Recursively check parent's parents
    return areAllParentsEnabled(parentKey);
}

/**
 * Recursively check if a setting and all its parents are enabled
 * @param key - The setting key to check
 * @returns true if setting and ALL parents are enabled
 */
function isSettingEnabled(key: string): boolean {
    // Check the setting itself
    const currentValue = AstranteData.get(key, false);
    if (!currentValue) {
        return false;
    }

    // Check all parents
    return areAllParentsEnabled(key);
}

const AstranteData = {
    /**
     * Gets a value from the datastore.
     * @param key The key to retrieve.
     * @param fallback The fallback value if the key doesn't exist.
     * @returns The value associated with the key or the fallback.
     */
    get (key: string, fallback = null) {
        const data: Object = window.DataStore.get("AstranteTheme", defaultSettings)
        return data.hasOwnProperty(key) ? data[key] : (defaultSettings[key] ?? fallback);
    },

    /**
     * Sets a value in the datastore.
     * @param key The key to set.
     * @param value The value to associate with the key.
     * @returns True if the key was set successfully, false otherwise.
     */
    set (key: string, value: any) {
        const data: Object = window.DataStore.get("AstranteTheme", defaultSettings)
        data[key] = value
        window.DataStore.set("AstranteTheme", data)
        return true;
    },

    /**
     * Checks if a key exists in the datastore.
     * @param key The key to check for existence.
     * @returns True if the key exists, false otherwise.
     */
    has (key: string) {
        const data: Object = window.DataStore.get("AstranteTheme", defaultSettings);
        return data.hasOwnProperty(key);
    },

    /**
     * Removes a key from the datastore and restores its default value.
     * @param key The key to remove.
     * @returns True if the key was removed, false otherwise.
     */
    remove (key: string) {
        const data: Object = window.DataStore.get("AstranteTheme", defaultSettings);
        if (data.hasOwnProperty(key)) {
            delete data[key];
            window.DataStore.set("AstranteTheme", data);
            return true;
        }
        return false;
    },

    /**
     * Restores the default values of the theme in the datastore.
     */
    restoreDefaults () {
        window.DataStore.set("AstranteTheme", { ...defaultSettings });
        window.reloadClient()
    },

    /**
     * Recursively checks if ALL PARENTS of a setting are enabled (does NOT check the setting itself)
     * Use this for UI - to determine if a checkbox should be enabled/disabled
     * @param key - The setting key whose parents to check
     * @returns true if ALL parents in the tree are enabled
     */
    areAllParentsEnabled(key: string): boolean {
        return areAllParentsEnabled(key);
    },

    /**
     * Recursively checks if a setting itself AND all its parents are enabled
     * Use this for plugins - to determine if a feature should be active
     * @param key - The setting key to check
     * @returns true if setting and ALL parents in the tree are enabled
     */
    isSettingTreeEnabled(key: string): boolean {
        return isSettingEnabled(key);
    }
};

/**
 * Track which plugins have been loaded (to avoid duplicates)
 * Key: plugin path, Value: plugin instance
 */
const loadedPlugins: Map<string, any> = new Map();

/**
 * Load a plugin if not already loaded
 * @param path - Path to plugin file
 * @param method - Method to call (default: "main")
 * @param args - Arguments to pass to method
 */
async function loadPlugin(path: string, method: string = "main", args: any[] = []): Promise<void> {
    // Check if already loaded
    if (loadedPlugins.has(path)) {
        return;
    }

    try {
        const module = await import(path);
        const PluginClass = Object.values(module)[0] as any;
        const plugin = new PluginClass();

        if (typeof plugin[method] === "function") {
            await plugin[method](...args);
        }

        loadedPlugins.set(path, plugin);
        console.log(`[AstranteTheme] Loaded plugin: ${path}`);
    } catch (error) {
        console.error(`[AstranteTheme] Failed to load plugin ${path}:`, error);
    }
}

/**
 * Initialize all enabled plugins from SETTINGS_TREE
 * Scans tree, loads plugins for enabled settings
 */
export async function initializePlugins(): Promise<void> {
    for (const [key, node] of Object.entries(SETTINGS_TREE)) {
        // Check if setting and all parents are enabled
        if (AstranteData.isSettingTreeEnabled(key)) {
            // Load plugins for this setting
            if (node.plugins && node.plugins.length > 0) {
                for (const plugin of node.plugins) {
                    await loadPlugin(plugin.path, plugin.method, plugin.args);
                }
            }
        }
    }
}

window.AstranteData = AstranteData
