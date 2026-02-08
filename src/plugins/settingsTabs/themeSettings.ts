/**
 * @author Simple
 * @description Theme Settings tab for Simple Theme
 */

export async function themeSettings(container: any) {
    console.log('[SimpleTheme] themeSettings called!', container);

    const settingsContainer = document.createElement("div");
    settingsContainer.className = "lol-settings-options";

    // Create scrollable wrapper
    const scrollable = document.createElement("lol-uikit-scrollable");
    scrollable.style.height = "100%";
    scrollable.style.overflowY = "auto";

    // Add section title
    const sectionTitle = document.createElement("div");
    sectionTitle.className = "lol-settings-general-section-title";
    sectionTitle.textContent = "ASTRANTE THEME";
    scrollable.appendChild(sectionTitle);

    // Add restart notice
    const restartNotice = document.createElement("p");
    restartNotice.className = "lol-settings-general-subtitle";
    restartNotice.textContent = "Requires client restart";
    scrollable.appendChild(restartNotice);

    // Theme Enable Toggle
    const enableRow = createCheckboxRow(
        "theme_enable",
        "theme_enabled",
        true
    );
    scrollable.appendChild(enableRow);

    // Hide TFT Toggle
    const hideTftRow = createCheckboxRow(
        "hide_tft",
        "hide_tft",
        true
    );
    scrollable.appendChild(hideTftRow);

    // Auto Accept Toggle
    const autoAcceptRow = createCheckboxRow(
        "auto_accept",
        "auto_accept",
        false
    );
    scrollable.appendChild(autoAcceptRow);

    settingsContainer.appendChild(scrollable);
    container.appendChild(settingsContainer);
}

function createCheckboxRow(
    titleKey: string,
    dataKey: string,
    defaultValue: boolean
): HTMLElement {
    // Create row container
    const row = document.createElement("div");
    row.className = "lol-settings-general-row";

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
    });

    // Assemble checkbox component
    checkbox.appendChild(input);
    checkbox.appendChild(label);
    row.appendChild(checkbox);

    return row;
}

function getStringSync(key: string): string {
    // Simple synchronous fallback for strings
    const strings: { [key: string]: string } = {
        "theme_enable": "Enable Theme",
        "theme_enable_desc": "Enable or disable the Astrante Theme",
        "auto_accept": "Auto Accept",
        "auto_accept_desc": "Automatically accept match making queue",
        "hide_tft": "Hide TFT Tab",
        "hide_tft_desc": "Hide the Teamfight Tactics tab from the navigation",
    };
    return strings[key] || key;
}
