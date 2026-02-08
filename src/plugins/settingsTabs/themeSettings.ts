/**
 * @author Astrante
 * @description Theme Settings tab for Astrante Theme
 */

export async function themeSettings(container: any) {

    // General settings section
    const generalSection = document.createElement("div");
    generalSection.className = "lol-settings-general-section";

    // Restart notice with button
    const notice = document.createElement("div");
    notice.className = "lol-settings-generic-notice";
    notice.style.cssText = "display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 24px;";

    // Notice text (gold color)
    const noticeText = document.createElement("p");
    noticeText.style.cssText = "margin: 0; color: #cdbe91; font-size: 13px; flex: 1;";
    noticeText.textContent = "Some changes require a client restart to take effect.";
    notice.appendChild(noticeText);

    // Restart button (gold, positioned to the right)
    const restartButton = document.createElement("lol-uikit-flat-button");
    restartButton.setAttribute("primary", "true");
    restartButton.textContent = "Restart Client";

    restartButton.addEventListener("click", async () => {
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
    });

    notice.appendChild(restartButton);
    generalSection.appendChild(notice);

    // CLIENT section
    const clientSection = document.createElement("div");

    const clientTitle = document.createElement("div");
    clientTitle.className = "lol-settings-client-section-title";
    clientTitle.style.cssText = "font-size: 14px; font-weight: 700; color: #f0e6d2; letter-spacing: 1px; margin-bottom: 12px;";
    clientTitle.textContent = "CLIENT";
    clientSection.appendChild(clientTitle);

    // Theme Enable Toggle
    const enableRow = createCheckboxRow(
        "theme_enable",
        "theme_enabled",
        true
    );
    clientSection.appendChild(enableRow);

    // Auto Accept Toggle
    const autoAcceptRow = createCheckboxRow(
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
        "hide_tft_mode",
        "hide_tft_mode",
        true
    );
    tftSubSection.appendChild(hideTftModeRow);

    // Hide TFT Tab Toggle
    const hideTftTabRow = createCheckboxRow(
        "hide_tft_tab",
        "hide_tft_tab",
        true
    );
    tftSubSection.appendChild(hideTftTabRow);

    tftSection.appendChild(tftSubSection);
    generalSection.appendChild(tftSection);

    // Handle master toggle logic
    const hideTftInput = hideTftRow.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const hideTftModeInput = hideTftModeRow.querySelector('input[type="checkbox"]') as HTMLInputElement;
    const hideTftTabInput = hideTftTabRow.querySelector('input[type="checkbox"]') as HTMLInputElement;

    // Initialize state based on master toggle
    updateTftSubSettings();

    hideTftInput.addEventListener("change", () => {
        updateTftSubSettings();
    });

    function updateTftSubSettings() {
        const isMasterEnabled = hideTftInput.checked;

        // Enable/disable sub-options visually (don't change their actual values)
        hideTftModeInput.disabled = !isMasterEnabled;
        hideTftTabInput.disabled = !isMasterEnabled;

        // Update visual state
        [hideTftModeRow, hideTftTabRow].forEach(row => {
            const checkbox = row as HTMLElement;
            if (!isMasterEnabled) {
                checkbox.style.opacity = "0.5";
                checkbox.style.pointerEvents = "none";
            } else {
                checkbox.style.opacity = "1";
                checkbox.style.pointerEvents = "auto";
            }
        });
    }

    container.appendChild(generalSection);
}

function createCheckboxRow(
    titleKey: string,
    dataKey: string,
    defaultValue: boolean
): HTMLElement {
    // Create checkbox component using Riot's standard structure
    const checkbox = document.createElement("lol-uikit-flat-checkbox");
    checkbox.className = "lol-settings-general-row";
    checkbox.setAttribute("for", dataKey);

    const isEnabled = ElainaData.get(dataKey, defaultValue);
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
        ElainaData.set(dataKey, newValue);

        // Update checkbox class
        if (newValue) {
            checkbox.classList.add("checked");
        } else {
            checkbox.classList.remove("checked");
        }

        // Trigger settings change notification
        const changeNumber = ElainaData.get("settingsChangenumber", 0);
        ElainaData.set("settingsChangenumber", changeNumber + 1);
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
    };
    return strings[key] || key;
}
