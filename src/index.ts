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

        // Hide TFT tab
        if (ElainaData.get("hide_tft", false)) {
            const { HideTft } = await import("./plugins/hideTft.ts");
            const hideTft = new HideTft();
            hideTft.main();
        }
    }
}

const simpleTheme = new SimpleTheme();
window.addEventListener("load", async () => {
    await simpleTheme.main();
});
