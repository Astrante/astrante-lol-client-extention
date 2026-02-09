/**
 * @name Astrante Theme
 * @author Astrante
 * @description Astrante theme with AutoAccept for Pengu Loader
 */
import "./utils/themeDataStore.ts";
import "./languages.ts";
import { Settings } from "./plugins/settings.ts";
import { initializePlugins } from "./utils/themeDataStore.js";

export function init(context: any) {
    Settings(context);
}

class AstranteTheme {
    async main() {
        // Automatically load all enabled plugins from SETTINGS_TREE
        await initializePlugins();
    }
}

const astranteTheme = new AstranteTheme();
window.addEventListener("load", async () => {
    await astranteTheme.main();
});
