/**
 * @author Astrante
 * @description Theme Settings tab for Astrante Theme
 */

export async function themeSettings(container: any) {

    // General settings section
    const generalSection = document.createElement("div");
    generalSection.className = "lol-settings-general-section";

    // Section title
    const sectionTitle = document.createElement("div");
    sectionTitle.className = "lol-settings-general-section-title";
    sectionTitle.textContent = "ASTRANTE THEME";
    generalSection.appendChild(sectionTitle);

    // Restart notice
    const notice = document.createElement("div");
    notice.className = "lol-settings-generic-notice";
    notice.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 12px 0;">
            <p style="margin: 0; color: #f0e6d2; font-size: 13px;">
                Some changes require a client restart to take effect.
            </p>
        </div>
    `;
    generalSection.appendChild(notice);

    // Theme Enable Toggle
    const enableRow = createCheckboxRow(
        "theme_enable",
        "theme_enabled",
        true
    );
    generalSection.appendChild(enableRow);

    // Hide TFT Toggle
    const hideTftRow = createCheckboxRow(
        "hide_tft",
        "hide_tft",
        true
    );
    generalSection.appendChild(hideTftRow);

    // Auto Accept Toggle
    const autoAcceptRow = createCheckboxRow(
        "auto_accept",
        "auto_accept",
        false
    );
    generalSection.appendChild(autoAcceptRow);

    // Action buttons section
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "lol-settings-general-actions";
    actionsDiv.style.cssText = "margin-top: 24px;";

    // Restart button - gold secondary button (with primary attribute)
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

    actionsDiv.appendChild(restartButton);
    generalSection.appendChild(actionsDiv);

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
        "hide_tft": "Hide TFT Tab",
        "hide_tft_desc": "Hide the Teamfight Tactics tab from the navigation bar",
    };
    return strings[key] || key;
}
