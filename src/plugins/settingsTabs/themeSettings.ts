/**
 * @author Astrante
 * @description Theme Settings tab for Astrante Theme
 */

export async function themeSettings(container: any) {

    // Add section title (Hextech-styled)
    const sectionTitle = document.createElement("div");
    sectionTitle.className = "lol-settings-general-section-title";
    sectionTitle.style.cssText = "position: relative; margin-bottom: 16px;";
    sectionTitle.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 2px; height: 24px; background: linear-gradient(180deg, #0ac8b9 0%, #00a6a6 100%);"></div>
            <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #f0e6d2; letter-spacing: 2px; text-transform: uppercase;">
                ASTRANTE THEME
            </h1>
        </div>
        <div style="margin-top: 8px; margin-left: 14px; height: 1px; background: linear-gradient(90deg, rgba(10, 200, 185, 0.3) 0%, transparent 100%);"></div>
    `;
    container.appendChild(sectionTitle);

    // Add warning container (Hextech-styled info banner with restart button)
    const warningContainer = document.createElement("div");
    warningContainer.className = "lol-settings-generic-warning";
    warningContainer.style.cssText = "margin: 16px 0; padding: 12px 16px; background: linear-gradient(90deg, rgba(30, 45, 61, 0.9) 0%, rgba(42, 64, 87, 0.9) 100%); border-left: 3px solid #0ac8b9; border-radius: 2px;";

    // Info content
    const infoContent = document.createElement("div");
    infoContent.style.cssText = "display: flex; align-items: center; justify-content: space-between; gap: 16px;";
    infoContent.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
            <div style="width: 20px; height: 20px; border: 2px solid #0ac8b9; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                <div style="width: 8px; height: 8px; background: #0ac8b9; border-radius: 50%;"></div>
            </div>
            <div style="flex: 1;">
                <p style="margin: 0; color: #f0e6d2; font-size: 14px; font-weight: 500; letter-spacing: 0.5px;">
                    RESTART REQUIRED
                </p>
                <p style="margin: 4px 0 0 0; color: #a09b8c; font-size: 13px; line-height: 1.4;">
                    Some changes require a client restart to take effect.
                </p>
            </div>
        </div>
    `;

    // Create Restart button using LoL's native component
    const restartButton = document.createElement("lol-uikit-flat-button");
    restartButton.style.cssText = "flex-shrink: 0;";
    restartButton.setAttribute("type", "button");

    // Add click handler to restart client
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

    // Create inner button structure (Riot's slot architecture)
    const innerButton = document.createElement("lol-uikit-flat-button-inner");
    innerButton.className = "lol-uikit-flat-button-primary";

    const buttonText = document.createElement("span");
    buttonText.className = "button-text";
    buttonText.textContent = "RESTART";

    innerButton.appendChild(buttonText);
    restartButton.appendChild(innerButton);

    infoContent.appendChild(restartButton);
    warningContainer.appendChild(infoContent);
    container.appendChild(warningContainer);

    // Theme Enable Toggle
    const enableRow = createCheckboxRow(
        "theme_enable",
        "theme_enabled",
        true
    );
    container.appendChild(enableRow);

    // Hide TFT Toggle
    const hideTftRow = createCheckboxRow(
        "hide_tft",
        "hide_tft",
        true
    );
    container.appendChild(hideTftRow);

    // Auto Accept Toggle
    const autoAcceptRow = createCheckboxRow(
        "auto_accept",
        "auto_accept",
        false
    );
    container.appendChild(autoAcceptRow);
}

function createCheckboxRow(
    titleKey: string,
    dataKey: string,
    defaultValue: boolean
): HTMLElement {
    // Create row container (Riot's standard settings row)
    const row = document.createElement("div");
    row.className = "lol-settings-general-row";
    row.style.cssText = "display: flex; align-items: center; padding: 12px 0; border-bottom: 1px solid rgba(245, 230, 201, 0.1);";

    // Create checkbox component (Hextech-styled)
    const checkbox = document.createElement("lol-uikit-flat-checkbox");
    checkbox.setAttribute("for", dataKey);
    checkbox.style.cssText = "width: 100%;";

    const isEnabled = ElainaData.get(dataKey, defaultValue);
    if (isEnabled) {
        checkbox.classList.add("checked");
    }

    // Create input element (native checkbox that receives user interaction)
    const input = document.createElement("input");
    input.slot = "input";
    input.name = dataKey;
    input.type = "checkbox";
    input.id = dataKey;
    input.checked = isEnabled;
    input.classList.add("ember-checkbox", "ember-view");

    // Create label element (Hextech-styled label)
    const label = document.createElement("label");
    label.slot = "label";
    label.style.cssText = "color: #f0e6d2; font-size: 14px; font-weight: 500; letter-spacing: 0.3px;";
    label.textContent = getStringSync(titleKey);

    // Add change listener with proper Hextech state management
    input.addEventListener("change", () => {
        const newValue = input.checked;
        ElainaData.set(dataKey, newValue);

        // Update checkbox visual state (Hextech Magic effect)
        if (newValue) {
            checkbox.classList.add("checked");
        } else {
            checkbox.classList.remove("checked");
        }

        // Trigger settings change notification
        const changeNumber = ElainaData.get("settingsChangenumber", 0);
        ElainaData.set("settingsChangenumber", changeNumber + 1);
    });

    // Assemble checkbox component (Riot's slot architecture)
    checkbox.appendChild(input);
    checkbox.appendChild(label);
    row.appendChild(checkbox);

    return row;
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
