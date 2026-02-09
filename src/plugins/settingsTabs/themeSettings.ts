/**
 * @author Astrante
 * @description Theme Settings tab for Astrante Theme
 *           Generic tree-based settings system - supports unlimited depth
 */

import { SETTINGS_TREE } from "../../utils/themeDataStore.js";

// Settings keys that we track for changes
const TRACKED_SETTINGS = Object.keys(SETTINGS_TREE);

// Store for checkbox elements by key
const checkboxElements: { [key: string]: HTMLInputElement } = {};
// Store for row elements by key
const rowElements: { [key: string]: HTMLElement } = {};

/**
 * Update the visual state (disabled/enabled) of a single setting row
 * @param key - The setting key to update
 * @param restartButton - The restart button element
 */
function updateSettingRowState(key: string, restartButton: any): void {
    const input = checkboxElements[key];
    const row = rowElements[key];

    if (!input || !row) return;

    const shouldBeEnabled = AstranteData.areAllParentsEnabled(key);
    input.disabled = !shouldBeEnabled;

    if (shouldBeEnabled) {
        row.style.opacity = "1";
        row.style.pointerEvents = "auto";
    } else {
        row.style.opacity = "0.5";
        row.style.pointerEvents = "none";
    }

    // Check for changes and update restart button
    const hasChanges = checkForChanges();
    updateRestartButtonState(restartButton, hasChanges);
}

/**
 * Recursively update all children of a setting
 * @param parentKey - The parent setting key
 * @param restartButton - The restart button element
 */
function updateChildrenState(parentKey: string, restartButton: any): void {
    for (const [key, node] of Object.entries(SETTINGS_TREE)) {
        if (node.parent === parentKey) {
            updateSettingRowState(key, restartButton);
            // Recursively update children
            updateChildrenState(key, restartButton);
        }
    }
}

/**
 * Update all settings state based on tree hierarchy
 * @param restartButton - The restart button element
 */
function updateAllSettingsState(restartButton: any): void {
    // Update each setting's state
    for (const key of TRACKED_SETTINGS) {
        updateSettingRowState(key, restartButton);
    }
}

export async function themeSettings(container: any) {

    /**
     * Restart the LoL client
     */
    async function restartClient(): Promise<void> {
        try {
            await fetch('/lol-login/v1/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            await fetch('/riotclient/kill-and-restart-ux', { method: 'POST' });
        } catch (error) {
            console.error('[AstranteTheme] Failed to restart client:', error);
        }
    }

    // General settings section
    const generalSection = document.createElement("div");
    generalSection.className = "lol-settings-general-section";

    // Container for notice + button (inline layout)
    const noticeContainer = document.createElement("div");
    noticeContainer.style.cssText = "display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 16px;";

    // Subtitle text with tooltip wrapper
    const infoTextWrapper = document.createElement("div");
    infoTextWrapper.style.cssText = "display: flex; align-items: center; gap: 4px; flex: 1;";

    // Subtitle text
    const infoText = document.createElement("p");
    infoText.className = "lol-settings-general-subtitle";
    infoText.style.cssText = "font-size: 12px; margin: 0;";
    infoText.textContent = "Changes in this tab require client restart";

    // Tooltip component
    const tooltip = document.createElement("div");
    tooltip.className = "lol-tooltip-component ember-view";
    tooltip.setAttribute("data-tooltip-dest", "general");
    tooltip.setAttribute("data-tooltip-tooltip", "Changes are saved automatically. You can modify settings and close - they will take effect on the next launch.");

    infoTextWrapper.appendChild(infoText);
    infoTextWrapper.appendChild(tooltip);

    // Restart button (normal by default, gold when there are changes)
    const restartButton = document.createElement("lol-uikit-flat-button");
    restartButton.textContent = "Restart";

    restartButton.addEventListener("click", async () => {
        // Save current state as new baseline before restart
        saveCurrentStateAsBaseline();
        updateRestartButtonState(restartButton, false);
        await restartClient();
    });

    noticeContainer.appendChild(infoTextWrapper);
    noticeContainer.appendChild(restartButton);
    generalSection.appendChild(noticeContainer);

    // CLIENT section
    const clientSection = document.createElement("div");

    const clientTitle = document.createElement("div");
    clientTitle.className = "lol-settings-client-section-title";
    clientTitle.style.cssText = "font-size: 14px; font-weight: 700; color: #f0e6d2; letter-spacing: 1px; margin-bottom: 12px;";
    clientTitle.textContent = "CLIENT";
    clientSection.appendChild(clientTitle);

    // Theme Enable Toggle (root)
    const enableRow = createCheckboxRow(
        restartButton,
        "theme_enable",
        "theme_enabled",
        true
    );
    clientSection.appendChild(enableRow);

    // Auto Accept Toggle
    const autoAcceptRow = createCheckboxRow(
        restartButton,
        "auto_accept",
        "auto_accept",
        false
    );
    clientSection.appendChild(autoAcceptRow);

    generalSection.appendChild(clientSection);

    // TFT section
    const tftSection = document.createElement("div");

    const tftTitle = document.createElement("div");
    tftTitle.className = "lol-settings-tft-section-title";
    tftTitle.style.cssText = "font-size: 14px; font-weight: 700; color: #f0e6d2; letter-spacing: 1px; margin: 24px 0 12px 0;";
    tftTitle.textContent = "TFT";
    tftSection.appendChild(tftTitle);

    // Hide TFT Master Toggle
    const hideTftRow = createCheckboxRow(
        restartButton,
        "hide_tft",
        "hide_tft",
        false
    );
    tftSection.appendChild(hideTftRow);

    // Indented sub-options container
    const tftSubSection = document.createElement("div");
    tftSubSection.className = "tft-sub-settings";
    tftSubSection.style.cssText = "margin-left: 32px;";

    // Hide TFT Mode Toggle
    const hideTftModeRow = createCheckboxRow(
        restartButton,
        "hide_tft_mode",
        "hide_tft_mode",
        true
    );
    tftSubSection.appendChild(hideTftModeRow);

    // Hide TFT Tab Toggle
    const hideTftTabRow = createCheckboxRow(
        restartButton,
        "hide_tft_tab",
        "hide_tft_tab",
        true
    );
    tftSubSection.appendChild(hideTftTabRow);

    // Hide TFT Mission Toggle
    const hideTftMissionRow = createCheckboxRow(
        restartButton,
        "hide_tft_mission",
        "hide_tft_mission",
        true
    );
    tftSubSection.appendChild(hideTftMissionRow);

    tftSection.appendChild(tftSubSection);
    generalSection.appendChild(tftSection);

    // Store references to inputs and rows
    const themeEnableInput = enableRow.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const autoAcceptInput = autoAcceptRow.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const hideTftInput = hideTftRow.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const hideTftModeInput = hideTftModeRow.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const hideTftTabInput = hideTftTabRow.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const hideTftMissionInput = hideTftMissionRow.querySelector('input[type="checkbox"]') as HTMLInputElement;

    checkboxElements["theme_enabled"] = themeEnableInput;
    checkboxElements["auto_accept"] = autoAcceptInput;
    checkboxElements["hide_tft"] = hideTftInput;
    checkboxElements["hide_tft_mode"] = hideTftModeInput;
    checkboxElements["hide_tft_tab"] = hideTftTabInput;
    checkboxElements["hide_tft_mission"] = hideTftMissionInput;

    rowElements["theme_enabled"] = enableRow;
    rowElements["auto_accept"] = autoAcceptRow;
    rowElements["hide_tft"] = hideTftRow;
    rowElements["hide_tft_mode"] = hideTftModeRow;
    rowElements["hide_tft_tab"] = hideTftTabRow;
    rowElements["hide_tft_mission"] = hideTftMissionRow;

    // Initialize baseline on first load (if not exists)
    initializeBaseline();

    // Initialize all settings state based on tree hierarchy
    updateAllSettingsState(restartButton);

    // Add listeners for all settings
    for (const key of TRACKED_SETTINGS) {
        const input = checkboxElements[key];
        if (input) {
            input.addEventListener("change", () => {
                // When any setting changes, update all its descendants
                updateChildrenState(key, restartButton);
            });
        }
    }

    container.appendChild(generalSection);
}

function createCheckboxRow(
    restartButton: any,
    titleKey: string,
    dataKey: string,
    defaultValue: boolean
): HTMLElement {
    // Create checkbox component using Riot's standard structure
    const checkbox = document.createElement("lol-uikit-flat-checkbox");
    checkbox.className = "lol-settings-general-row";
    checkbox.setAttribute("for", dataKey);

    const isEnabled = AstranteData.get(dataKey, defaultValue);
    if (isEnabled) {
        checkbox.classList.add("checked");
    }

    // Create input element
    const input = document.createElement("input");
    input.slot = "input";
    input.name = dataKey;
    input.type = "checkbox";
    input.id = dataKey;
    input.checked = isEnabled;
    input.classList.add("ember-checkbox", "ember-view");

    // Create label element
    const label = document.createElement("label");
    label.slot = "label";
    label.className = "lol-settings-checkbox-label";
    label.textContent = getStringSync(titleKey);

    // Add change listener
    input.addEventListener("change", () => {
        const newValue = input.checked;
        AstranteData.set(dataKey, newValue);

        // Update checkbox class
        if (newValue) {
            checkbox.classList.add("checked");
        } else {
            checkbox.classList.remove("checked");
        }

        // Check for changes and update restart button
        const hasChanges = checkForChanges();
        updateRestartButtonState(restartButton, hasChanges);

        // Trigger settings change notification
        const changeNumber = AstranteData.get("settingsChangenumber", 0);
        AstranteData.set("settingsChangenumber", changeNumber + 1);
    });

    // Assemble checkbox component
    checkbox.appendChild(input);
    checkbox.appendChild(label);

    return checkbox;
}

function getStringSync(key: string): string {
    // Localized strings following Riot's naming conventions
    const strings: { [key: string]: string } = {
        "theme_enable": "Enable Astrante Theme",
        "theme_enable_desc": "Enable or disable the Astrante Theme customization",
        "auto_accept": "Auto Accept Match",
        "auto_accept_desc": "Automatically accept when a match is found",
        "hide_tft": "Hide TFT",
        "hide_tft_desc": "Enable TFT hiding options (unlocks sub-options below)",
        "hide_tft_mode": "Hide TFT Mode",
        "hide_tft_mode_desc": "Hide TFT game card from Play mode selection",
        "hide_tft_tab": "Hide TFT Tab",
        "hide_tft_tab_desc": "Hide TFT navigation tab",
        "hide_tft_mission": "TFT Mission",
        "hide_tft_mission_desc": "Hide TFT tab from Objectives window",
    };
    return strings[key] || key;
}

/**
 * Get current settings values as an object
 */
function getCurrentSettings(): { [key: string]: boolean } {
    const settings: { [key: string]: boolean } = {};
    TRACKED_SETTINGS.forEach(key => {
        settings[key] = AstranteData.get(key, false);
    });
    return settings;
}

/**
 * Initialize baseline if it doesn't exist
 */
function initializeBaseline() {
    const baseline = AstranteData.get("settings_baseline", null);
    if (!baseline) {
        saveCurrentStateAsBaseline();
    }
}

/**
 * Save current settings as baseline
 */
function saveCurrentStateAsBaseline() {
    const currentSettings = getCurrentSettings();
    AstranteData.set("settings_baseline", JSON.stringify(currentSettings));
}

/**
 * Check if current settings differ from baseline
 */
function checkForChanges(): boolean {
    const baselineStr = AstranteData.get("settings_baseline", null);
    if (!baselineStr) return false;

    try {
        const baseline = JSON.parse(baselineStr) as { [key: string]: boolean };
        const current = getCurrentSettings();

        // Compare each setting
        for (const key of TRACKED_SETTINGS) {
            if (baseline[key] !== current[key]) {
                return true; // Found a difference
            }
        }
        return false; // No differences
    } catch (error) {
        console.error('[AstranteTheme] Error parsing baseline:', error);
        return false;
    }
}

/**
 * Update restart button visual state
 * @param button - The restart button element
 * @param hasChanges - true to make button gold (primary), false for normal
 */
function updateRestartButtonState(button: any, hasChanges: boolean) {
    if (button) {
        if (hasChanges) {
            button.setAttribute("primary", "true");
        } else {
            button.removeAttribute("primary");
        }
    }
}
