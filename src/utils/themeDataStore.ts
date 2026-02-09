import defaultSettings from "../config/datastoreDefault.js";
import utils from "./utils.js";

// Import all plugins statically so they're bundled
import { AutoAccept } from "../plugins/autoAccept.js";
import { HideTft } from "../plugins/hideTft.js";

// Plugin registry - maps paths to imported plugin classes
const PLUGIN_REGISTRY: Record<string, any> = {
    "./plugins/autoAccept.ts": AutoAccept,
    "./plugins/hideTft.ts": HideTft,
};

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
    return AstranteData.get(key, false) && areAllParentsEnabled(key);
}

const AstranteData = {
    /**
     * Gets a value from the datastore.
     * @param key The key to retrieve.
     * @param fallback The fallback value if the key doesn't exist.
     * @returns The value associated with the key or the fallback.
     */
    get (key: string, fallback = null) {
        const data = window.DataStore.get("AstranteTheme", defaultSettings) as Record<string, any>;
        return key in data ? data[key] : (defaultSettings[key] ?? fallback);
    },

    /**
     * Sets a value in the datastore.
     * @param key The key to set.
     * @param value The value to associate with the key.
     * @returns True if the key was set successfully, false otherwise.
     */
    set (key: string, value: any) {
        const data = window.DataStore.get("AstranteTheme", defaultSettings) as Record<string, any>;
        data[key] = value;
        window.DataStore.set("AstranteTheme", data);
        return true;
    },

    /**
     * Checks if a key exists in the datastore.
     * @param key The key to check for existence.
     * @returns True if the key exists, false otherwise.
     */
    has (key: string) {
        const data = window.DataStore.get("AstranteTheme", defaultSettings) as Record<string, any>;
        return key in data;
    },

    /**
     * Removes a key from the datastore and restores its default value.
     * @param key The key to remove.
     * @returns True if the key was removed, false otherwise.
     */
    remove (key: string) {
        const data = window.DataStore.get("AstranteTheme", defaultSettings) as Record<string, any>;
        if (key in data) {
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
 * Normalize path to handle both forward and backward slashes (Windows compatibility)
 * @param path - Path to normalize
 * @returns Normalized path with forward slashes
 */
function normalizePath(path: string): string {
    return path.replace(/\\/g, '/');
}

/**
 * Load a plugin if not already loaded
 * @param path - Path to plugin file (used as key in loadedPlugins map)
 * @param method - Method to call (default: "main")
 * @param args - Arguments to pass to method
 */
async function loadPlugin(path: string, method: string = "main", args: any[] = []): Promise<void> {
    // Normalize path for cross-platform compatibility
    const normalizedPath = normalizePath(path);

    // Check if already loaded
    if (loadedPlugins.has(normalizedPath)) {
        return;
    }

    try {
        // Get plugin class from registry instead of dynamic import
        const PluginClass = PLUGIN_REGISTRY[normalizedPath];
        if (!PluginClass) {
            console.error(`[AstranteTheme] Plugin not found in registry: ${normalizedPath}`);
            return;
        }

        const plugin = new PluginClass();

        if (typeof plugin[method] === "function") {
            // Dependency Injection: pass utils as first argument, then original args
            await plugin[method](utils, ...args);
        }

        loadedPlugins.set(normalizedPath, plugin);
    } catch (error) {
        console.error(`[AstranteTheme] Failed to load plugin ${normalizedPath}:`, error);
    }
}

/**
 * Initialize all enabled plugins from SETTINGS_TREE
 * Scans tree, loads plugins for enabled settings
 */
export async function initializePlugins(): Promise<void> {
    for (const [key, node] of Object.entries(SETTINGS_TREE)) {
        const isEnabled = AstranteData.isSettingTreeEnabled(key);

        // Check if setting and all parents are enabled
        if (isEnabled) {
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
