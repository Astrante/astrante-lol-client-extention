/**
 * @name Simple Theme
 * @author Simple
 * @description Simple theme with AutoAccept for Pengu Loader
 */

// Log that the plugin is loading
console.log('[SimpleTheme] Plugin file loaded!');

// Import theme DataStore
import "./utils/themeDataStore.ts";

// Import languages
import "./languages.ts";

// Import settings
import { Settings } from "./plugins/settings.ts";

// Export Init
export function init(context: any) {
    console.log('[SimpleTheme] INIT FUNCTION CALLED!', context);
    Settings(context);
}

class SimpleTheme {
    async main() {
        // Only run plugins if theme is enabled
        if (!ElainaData.get("theme_enabled", true)) {
            return;
        }

        // Auto Accept
        const { AutoAccept } = await import("./plugins/autoAccept.ts");
        const autoAccept = new AutoAccept();
        autoAccept.main(true);

        // Hide TFT tab and/or mode
        const hideTft = ElainaData.get("hide_tft", false);
        const hideTftMode = ElainaData.get("hide_tft_mode", false);
        const hideTftTab = ElainaData.get("hide_tft_tab", false);

        // Only load plugin if master is enabled AND at least one sub-option is active
        if (hideTft && (hideTftMode || hideTftTab)) {
            const { HideTft } = await import("./plugins/hideTft.ts");
            const hideTftPlugin = new HideTft();
            hideTftPlugin.main();
        }
    }
}

const simpleTheme = new SimpleTheme();
window.addEventListener("load", async () => {
    await simpleTheme.main();
});
