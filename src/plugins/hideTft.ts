/**
 * Hide TFT tab and/or game card from LoL client using CSS
 */

export class HideTft {
    private styleElement?: HTMLStyleElement;

    async main() {
        // Get master toggle
        const masterEnabled = ElainaData.get("hide_tft", false);

        // Get individual settings
        const hideMode = ElainaData.get("hide_tft_mode", false);
        const hideTab = ElainaData.get("hide_tft_tab", false);

        // Build CSS based on settings (AND logic)
        let cssContent = '';

        if (masterEnabled && hideTab) {
            cssContent += `
                /* Hide TFT tab from main navigation */
                lol-uikit-navigation-item.menu_item_navbar_tft,
                .menu_item_navbar_tft {
                    display: none !important;
                }
            `;
        }

        if (masterEnabled && hideMode) {
            cssContent += `
                /* Hide TFT game card from Play mode selection */
                .game-type-card[data-game-mode="TFT"] {
                    display: none !important;
                }
            `;
        }

        // Only add style element if there's CSS to apply
        if (cssContent) {
            this.styleElement = document.createElement('style');
            this.styleElement.textContent = cssContent;
            document.head.appendChild(this.styleElement);
        }
    }

    destroy() {
        if (this.styleElement && this.styleElement.parentNode) {
            this.styleElement.parentNode.removeChild(this.styleElement);
        }
    }
}
