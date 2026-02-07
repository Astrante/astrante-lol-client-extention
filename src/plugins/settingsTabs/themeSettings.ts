/**
 * @author Simple
 * @description Theme Settings tab for Simple Theme
 */

export async function themeSettings(container: any) {
    console.log('[SimpleTheme] themeSettings called!', container);

    const settingsContainer = document.createElement("div");
    settingsContainer.className = "lol-settings-options";

    // Theme Enable Toggle (top row)
    const enableRow = createCheckboxRow(
        "theme_enable",
        "theme_enable_desc",
        "theme_enabled",
        true,
        true
    );
    settingsContainer.appendChild(enableRow);

    // Auto Accept Toggle
    const autoAcceptRow = createCheckboxRow(
        "auto_accept",
        "auto_accept_desc",
        "auto_accept",
        false,
        false
    );
    settingsContainer.appendChild(autoAcceptRow);

    // Hide TFT Toggle
    const hideTftRow = createCheckboxRow(
        "hide_tft",
        "hide_tft_desc",
        "hide_tft",
        true,
        false
    );
    settingsContainer.appendChild(hideTftRow);

    container.appendChild(settingsContainer);
}

function createCheckboxRow(
    titleKey: string,
    descKey: string,
    dataKey: string,
    defaultValue: boolean,
    isTop: boolean
): HTMLElement {
    // Create row container
    const row = document.createElement("div");
    row.className = isTop ? "lol-settings-chat-row-top" : "lol-settings-chat-row";

    // Create checkbox component
    const checkbox = document.createElement("lol-uikit-flat-checkbox");
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
    label.className = "lol-settings-chat-label";
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

        // Show restart message for settings that require reload
        if (dataKey === "theme_enabled" || dataKey === "hide_tft") {
            alert("Please restart the client for changes to take effect.");
        }
    });

    // Assemble component
    checkbox.appendChild(input);
    checkbox.appendChild(label);
    row.appendChild(checkbox);

    return row;
}

function getStringSync(key: string): string {
    // Simple synchronous fallback for strings
    const strings: { [key: string]: string } = {
        "theme_enable": "Enable Theme",
        "theme_enable_desc": "Enable or disable the Simple Theme",
        "auto_accept": "Auto Accept",
        "auto_accept_desc": "Automatically accept match making queue",
        "hide_tft": "Hide TFT Tab",
        "hide_tft_desc": "Hide the Teamfight Tactics tab from the navigation",
    };
    return strings[key] || key;
}
