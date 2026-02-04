/**
 * @author Simple
 * @description Settings system for Simple Theme
 */

import * as upl from "pengu-upl"
import structure from "./settingsStructure.ts"
import { settingsUtils } from "../utils/settingsUtils.ts"
import { themeSettings } from "./settingsTabs/themeSettings.ts"

ElainaData.set("settingsChangenumber", 0)

window.addEventListener('load', async () => {
    const interval = setInterval(() => {
        const manager = document.getElementById('lol-uikit-layer-manager-wrapper')
        if (manager) {
            clearInterval(interval)
            new MutationObserver((mutations) => {
                const theme = document.querySelector('lol-uikit-scrollable.theme_settings')

                if (theme && mutations.some((record) => Array.from(record.addedNodes).includes(theme))) {
                    themeSettings(theme)
                }
            }).observe(manager, {
                childList: true,
                subtree: true
            })
        }
    }, 500)
})

export function Settings(context: any) {
    settingsUtils(context, structure)
}
