/**
 * Hide TFT tab and/or game card from LoL client using CSS
 */

export class HideTft {
    private styleElement?: HTMLStyleElement;
    private spacerObserver?: MutationObserver;
    private unsubscribeMissions?: () => void;

    /**
     * Mark TFT missions as read to clear the notification badge
     */
    private async markTftMissionsAsRead(): Promise<void> {
        try {
            // Fetch all missions from the LCU API
            const response = await fetch('/lol-missions/v1/missions');
            if (!response.ok) {
                console.error('[HideTft] Failed to fetch missions:', response.statusText);
                return;
            }

            const missions = await response.json();

            // Iterate through missions and mark TFT missions as read
            for (const mission of missions) {
                // Check if this is a TFT mission (TFT missions typically have 'TFT' in their description or category)
                const isTftMission = mission.gameType === 'TFT' ||
                                    mission.category === 'TFT' ||
                                    (mission.description && mission.description.includes('TFT')) ||
                                    (mission.title && mission.title.includes('TFT'));

                if (isTftMission && mission.id) {
                    try {
                        // Mark the mission as viewed/read
                        await fetch(`/lol-missions/v1/player/${mission.id}`, {
                            method: 'PUT',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                viewed: true,
                                completed: mission.completed || false
                            })
                        });
                    } catch (err) {
                        console.error(`[HideTft] Failed to mark mission ${mission.id} as read:`, err);
                    }
                }
            }

            console.log('[HideTft] TFT missions marked as read');
        } catch (error) {
            console.error('[HideTft] Error marking TFT missions as read:', error);
        }
    }

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
            // Mark TFT missions as read to clear the notification badge
            await this.markTftMissionsAsRead();

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

            // Subscribe to mission updates to automatically mark new TFT missions as read
            this.unsubscribeMissions = utils.subscribe_endpoint('/lol-missions/v1/missions', async () => {
                await this.markTftMissionsAsRead();
            });
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
        if (this.unsubscribeMissions) {
            this.unsubscribeMissions();
            this.unsubscribeMissions = undefined;
        }
        if (this.styleElement && this.styleElement.parentNode) {
            this.styleElement.parentNode.removeChild(this.styleElement);
        }
    }
}
