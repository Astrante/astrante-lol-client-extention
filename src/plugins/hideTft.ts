/**
 * Hide TFT tab and/or game card from LoL client using CSS
 */

export class HideTft {
    private styleElement?: HTMLStyleElement;
    private spacerObserver?: MutationObserver;

    async main(utils: any) {
        // Build CSS based on settings (recursive tree checking)
        let cssContent = '';

        // Each setting is checked recursively through the entire parent chain
        // hide_tft_tab checks: hide_tft_tab -> hide_tft -> theme_enabled
        if (AstranteData.isSettingTreeEnabled("hide_tft_tab")) {
            cssContent += `
                /* Hide TFT tab from main navigation */
                lol-uikit-navigation-item.menu_item_navbar_tft,
                .menu_item_navbar_tft {
                    display: none !important;
                }
            `;
        }

        // hide_tft_mode checks: hide_tft_mode -> hide_tft -> theme_enabled
        if (AstranteData.isSettingTreeEnabled("hide_tft_mode")) {
            cssContent += `
                /* Hide TFT game card from Play mode selection */
                .game-type-card[data-game-mode="TFT"] {
                    display: none !important;
                }
            `;
        }

        // hide_tft_mission checks: hide_tft_mission -> hide_tft -> theme_enabled
        if (AstranteData.isSettingTreeEnabled("hide_tft_mission")) {
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
            this.spacerObserver = new MutationObserver(() => addSpacer());
            this.spacerObserver.observe(document.body, { childList: true, subtree: true });
        }

        // Only add style element if there's CSS to apply
        if (cssContent) {
            this.styleElement = utils.addStyleWithID('hide-tft-styles', cssContent);
        }
    }

    destroy() {
        if (this.spacerObserver) {
            this.spacerObserver.disconnect();
            this.spacerObserver = undefined;
        }
        if (this.styleElement && this.styleElement.parentNode) {
            this.styleElement.parentNode.removeChild(this.styleElement);
        }
    }
}
