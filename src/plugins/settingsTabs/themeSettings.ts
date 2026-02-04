/**
 * @author Simple
 * @description Theme Settings tab for Simple Theme
 */

export async function themeSettings(container: any) {
    const settingsContainer = document.createElement("div");
    settingsContainer.style.cssText = "padding: 20px;";

    // Theme Enable Toggle
    const enableRow = createToggleRow(
        "theme_enable",
        "theme_enable_desc",
        "theme_enabled",
        true
    );
    settingsContainer.appendChild(enableRow);

    // Auto Accept Toggle
    const autoAcceptRow = createToggleRow(
        "auto_accept",
        "auto_accept_desc",
        "auto_accept",
        false
    );
    settingsContainer.appendChild(autoAcceptRow);

    container.appendChild(settingsContainer);
}

function createToggleRow(titleKey: string, descKey: string, dataKey: string, defaultValue: boolean): HTMLElement {
    const row = document.createElement("div");
    row.style.cssText = "display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 10px; background: rgba(0,0,0,0.2); border-radius: 8px;";

    const labelContainer = document.createElement("div");
    labelContainer.style.cssText = "flex: 1;";

    const title = document.createElement("div");
    title.style.cssText = "font-size: 14px; font-weight: bold; color: #f0f0f0;";
    title.textContent = getStringSync(titleKey);

    const desc = document.createElement("div");
    desc.style.cssText = "font-size: 12px; color: #a0a0a0; margin-top: 4px;";
    desc.textContent = getStringSync(descKey);

    labelContainer.appendChild(title);
    labelContainer.appendChild(desc);

    const toggle = document.createElement("lol-uikit-flat-button");
    toggle.style.cssText = "width: 60px; height: 30px;";

    const isEnabled = ElainaData.get(dataKey, defaultValue);
    toggle.textContent = isEnabled ? "ON" : "OFF";
    toggle.style.background = isEnabled ? "#46a827" : "#c84545";

    toggle.addEventListener("click", () => {
        const currentValue = ElainaData.get(dataKey, defaultValue);
        ElainaData.set(dataKey, !currentValue);
        toggle.textContent = !currentValue ? "ON" : "OFF";
        toggle.style.background = !currentValue ? "#46a827" : "#c84545";

        // If theme was toggled, show restart message
        if (dataKey === "theme_enabled") {
            alert("Please restart the client for changes to take effect.");
        }
    });

    row.appendChild(labelContainer);
    row.appendChild(toggle);

    return row;
}

function getStringSync(key: string): string {
    // Simple synchronous fallback for strings
    const strings: { [key: string]: string } = {
        "theme_enable": "Enable Theme",
        "theme_enable_desc": "Enable or disable the Simple Theme",
        "auto_accept": "Auto Accept",
        "auto_accept_desc": "Automatically accept match making queue",
    };
    return strings[key] || key;
}
