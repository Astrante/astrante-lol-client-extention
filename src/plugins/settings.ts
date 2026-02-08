/**
 * @author Astrante
 * @description Settings system for Astrante Theme (based on ElainaV4 approach)
 */

import structure from "./settingsStructure.ts"
import { themeSettings } from "./settingsTabs/themeSettings.ts"

// Initialize settings change number
ElainaData.set("settingsChangenumber", 0)

/**
 * Settings utility function to register settings with LoL's RCP API
 * Based on ElainaV4's implementation
 */
function settingsUtils(context: any, groupDataArray: any[]) {
    // Hook into rcp-fe-lol-settings to register settings categories
    context.rcp.postInit('rcp-fe-lol-settings', async (api: any) => {
        (window as any).__RCP_SETTINGS_API = api;

        const emberApi = (window as any).__RCP_EMBER_API;
        if (!emberApi) {
            return;
        }

        const ember = await emberApi.getEmber();

        groupDataArray.forEach((groupData) => {
            const newGroup = {
                name: groupData.groupName,
                titleKey: groupData.titleKey,
                capitalTitleKey: groupData.capitalTitleKey,
                categories: []
            };

            const addCategoryToGroup = (name: string, title: string) => {
                newGroup.categories.push({
                    name,
                    titleKey: title,
                    routeName: name,
                    group: newGroup,
                    loginStatus: true,
                    requireLogin: false,
                    forceDisabled: false,
                    computeds: ember.Object.create({
                        disabled: false
                    }),
                    isEnabled: () => true
                });
            };

            groupData.element.forEach((element: any) => {
                addCategoryToGroup(element.name, element.title);
            });

            // Insert after the first group (index 1)
            api._modalManager._registeredCategoryGroups.splice(1, 0, newGroup);
            api._modalManager._refreshCategoryGroups();
        });
    });

    // Hook into rcp-fe-ember-libs to add routes for settings pages
    context.rcp.postInit('rcp-fe-ember-libs', async (api: any) => {
        (window as any).__RCP_EMBER_API = api;

        const ember = await api.getEmber();

        // Extend the Router to add routes for our settings
        const originalExtend = ember.Router.extend;
        ember.Router.extend = function(this: any) {
            const result = originalExtend.apply(this, arguments as any);

            result.map(function(this: any) {
                groupDataArray.forEach((groupData) => {
                    groupData.element.forEach((element: any) => {
                        this.route(element.name);
                    });
                });
            });

            return result;
        };
    });

    // Hook into rcp-fe-lol-l10n to provide translations
    context.rcp.postInit('rcp-fe-lol-l10n', async (api: any) => {

        const tra = api.tra();
        const originalGet = tra.__proto__.get;

        tra.__proto__.get = function(this: any, key: string) {
            if (key.startsWith('el_')) {
                for (const groupData of groupDataArray) {
                    if (key === groupData.titleKey) {
                        return groupData.titleName;
                    } else if (key === groupData.capitalTitleKey) {
                        return groupData.capitalTitleName;
                    }

                    for (const element of groupData.element) {
                        if (key === element.title) {
                            return element.titleName;
                        }
                    }
                }
            }

            return originalGet.apply(this, [key]);
        };
    });

    // Hook into rcp-fe-ember-libs again to create templates
    context.rcp.postInit('rcp-fe-ember-libs', async (api: any) => {

        const ember = await api.getEmber();
        const factory = await api.getEmberApplicationFactory();

        const originalBuilder = factory.factoryDefinitionBuilder;
        factory.factoryDefinitionBuilder = function(this: any) {
            const builder = originalBuilder.apply(this, arguments as any);

            const originalBuild = builder.build;
            builder.build = function(this: any) {
                const name = this.getName();

                if (name === 'rcp-fe-lol-settings') {
                    (window as any).__SETTINGS_OBJECT = this;

                    const addTab = (name2: string, id: string, tab: any) => {
                        this.addTemplate(
                            name2,
                            ember.HTMLBars.template({
                                id,
                                block: JSON.stringify(tab),
                                meta: {}
                            })
                        );
                    };

                    const createSettingsTab = (className: string) => ({
                        statements: [
                            ['open-element', 'lol-uikit-scrollable', []],
                            ['static-attr', 'class', className],
                            ['flush-element'],
                            ['close-element']
                        ],
                        locals: [],
                        named: [],
                        yields: [],
                        blocks: [],
                        hasPartials: false
                    });

                    groupDataArray.forEach((groupData) => {
                        groupData.element.forEach((element: any) => {
                            addTab(
                                element.name,
                                element.id,
                                createSettingsTab(element.class)
                            );
                        });
                    });
                }

                return originalBuild.apply(this, arguments as any);
            };

            return builder;
        };
    });
}

// Set up mutation observer to inject settings UI when tabs are opened
window.addEventListener('load', async () => {
    // Wait for the document to be ready
    const interval = setInterval(() => {
        const manager = document.getElementById('lol-uikit-layer-manager-wrapper');
        if (manager) {
            clearInterval(interval);

            new MutationObserver(() => {
                for (const elementClass of ['theme_settings', 'astrante-theme-settings']) {
                    const theme = document.querySelector(`lol-uikit-scrollable.${elementClass}`);
                    if (theme && !theme.hasChildNodes()) {
                        themeSettings(theme);
                    }
                }
            }).observe(manager, {
                childList: true,
                subtree: true
            });
        }
    }, 500);
});

// Export the Settings function
export function Settings(context: any) {
    settingsUtils(context, structure);
}
