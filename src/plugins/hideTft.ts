/**
 * Hide TFT tab and/or game card from LoL client using CSS
 */

export class HideTft {
    private styleElement?: HTMLStyleElement;

    async main() {
        // Get master toggle
        const masterEnabled = AstranteData.get("hide_tft", false);

        // Get individual settings
        const hideMode = AstranteData.get("hide_tft_mode", false);
        const hideTab = AstranteData.get("hide_tft_tab", false);
        const hideMission = AstranteData.get("hide_tft_mission", false);

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

        if (masterEnabled && hideMission) {
            cssContent += `
                /* Hide TFT tab from Objectives window */
                .tab-container[aria-label="Select Teamfight Tactics"] {
                    display: none !important;
                }

                /* Style for spacer element */
                .tft-spacer-tab {
                    border-bottom: 2px solid #c89b3c;
                    align-items: flex-end;
                    display: flex;
                    height: 32px;
                    justify-content: center;
                    padding-bottom: 5px;
                    width: 95px;
                }
            `;

            // Add spacer element via JavaScript
            const addSpacer = () => {
                const gameTabsContainer = document.querySelector('.objectives-game-tabs');
                if (gameTabsContainer && !gameTabsContainer.querySelector('.tft-spacer-tab')) {
                    const lolTab = gameTabsContainer.querySelector('.tab-container[aria-label="Select League of Legends"]');
                    if (lolTab && lolTab.classList.contains('active')) {
                        const spacer = document.createElement('div');
                        spacer.className = 'tft-spacer-tab';
                        lolTab.after(spacer);
                    }
                }
            };

            // Try immediately and also observe for changes
            addSpacer();
            const observer = new MutationObserver(() => addSpacer());
            observer.observe(document.body, { childList: true, subtree: true });
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
