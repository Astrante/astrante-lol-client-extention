/**
 * @author Astrante
 * @description Theme Settings tab for Astrante Theme
 */

// Settings keys that we track for changes
const TRACKED_SETTINGS = [
    "theme_enabled",
    "auto_accept",
    "hide_tft",
    "hide_tft_mode",
    "hide_tft_tab",
    "hide_tft_mission"
];

export async function themeSettings(container: any) {

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
        try {
            // Save current state as new baseline before restart
            saveCurrentStateAsBaseline();
            updateRestartButtonState(restartButton, false);

            await fetch('/lol-login/v1/session', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({})
            });
            await fetch('/riotclient/kill-and-restart-ux', { method: 'POST' });
        } catch (error) {
            console.error('[AstranteTheme] Failed to restart client:', error);
        }
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

    // Theme Enable Toggle
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

    // Get checkbox elements for master toggle logic
    const themeEnableInput = enableRow.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const hideTftInput = hideTftRow.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const hideTftModeInput = hideTftModeRow.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const hideTftTabInput = hideTftTabRow.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const hideTftMissionInput = hideTftMissionRow.querySelector('input[type="checkbox"]') as HTMLInputElement;

    // Collect all rows that should be controlled by theme enable toggle
    const controlledRows = [
        autoAcceptRow,
        hideTftRow,
        hideTftModeRow,
        hideTftTabRow,
        hideTftMissionRow
    ];

    // Initialize baseline on first load (if not exists)
    initializeBaseline();

    // Initialize TFT sub-settings state first
    updateTftSubSettings();

    // Then initialize state based on theme enable toggle
    updateAllSettingsState();

    // Check for changes on load
    updateRestartButtonState(restartButton, checkForChanges());

    // Theme enable toggle listener
    themeEnableInput.addEventListener("change", () => {
        updateAllSettingsState();
    });

    // Hide TFT master toggle listener
    hideTftInput.addEventListener("change", () => {
        updateTftSubSettings();
    });

    function updateAllSettingsState() {
        const isThemeEnabled = themeEnableInput.checked;

        // Enable/disable all controlled settings visually
        controlledRows.forEach(row => {
            const input = row.querySelector('input[type="checkbox"]') as HTMLInputElement;
            const rowElement = row as HTMLElement;

            if (!isThemeEnabled) {
                // Theme disabled - disable all controlled settings
                if (input) {
                    input.disabled = true;
                }
                rowElement.style.opacity = "0.5";
                rowElement.style.pointerEvents = "none";
            } else {
                // Theme enabled - enable all controlled settings
                if (input) {
                    input.disabled = false;
                }
                rowElement.style.opacity = "1";
                rowElement.style.pointerEvents = "auto";
            }
        });

        // After theme enable state, let TFT toggle control its sub-settings
        updateTftSubSettings();

        // Check for changes and update restart button
        const hasChanges = checkForChanges();
        updateRestartButtonState(restartButton, hasChanges);
    }

    function updateTftSubSettings() {
        // Check BOTH theme enable AND hide TFT toggle
        const isThemeEnabled = themeEnableInput.checked;
        const isMasterEnabled = hideTftInput.checked;
        const shouldEnable = isThemeEnabled && isMasterEnabled;

        // Enable/disable sub-options based on BOTH conditions
        hideTftModeInput.disabled = !shouldEnable;
        hideTftTabInput.disabled = !shouldEnable;
        hideTftMissionInput.disabled = !shouldEnable;

        // Update visual state
        [hideTftModeRow, hideTftTabRow, hideTftMissionRow].forEach(row => {
            const checkbox = row as HTMLElement;
            if (!shouldEnable) {
                checkbox.style.opacity = "0.5";
                checkbox.style.pointerEvents = "none";
            } else {
                checkbox.style.opacity = "1";
                checkbox.style.pointerEvents = "auto";
            }
        });

        // Check for changes and update restart button
        const hasChanges = checkForChanges();
        updateRestartButtonState(restartButton, hasChanges);
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
