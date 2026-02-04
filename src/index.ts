/**
 * @name Simple Theme
 * @author Simple
 * @description Simple theme with AutoAccept for Pengu Loader
 */

// Import theme DataStore
import "./utils/themeDataStore.ts";

// Import languages
import "./languages.ts";

// Import settings
import { Settings } from "./plugins/settings.ts";

// Export Init
export function init(context: any) {
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
    }
}

const simpleTheme = new SimpleTheme();
window.addEventListener("load", async () => {
    await simpleTheme.main();
});
