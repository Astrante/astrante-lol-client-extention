/**
 * @author Simple
 * @description Theme Settings tab for Simple Theme
 */

// Store initial values to track changes
let initialSettings: { [key: string]: boolean } = {};
let hasChanges = false;

export async function themeSettings(container: any) {
    console.log('[SimpleTheme] themeSettings called!', container);

    // Store initial values
    initialSettings = {
        theme_enabled: ElainaData.get("theme_enabled", true),
        hide_tft: ElainaData.get("hide_tft", true),
        auto_accept: ElainaData.get("auto_accept", false)
    };
    hasChanges = false;

    // Add section title
    const sectionTitle = document.createElement("div");
    sectionTitle.className = "lol-settings-general-section-title";
    sectionTitle.textContent = "ASTRANTE THEME";
    container.appendChild(sectionTitle);

    // Add restart notice
    const restartNotice = document.createElement("p");
    restartNotice.className = "lol-settings-general-subtitle";
    restartNotice.textContent = "Requires client restart";
    container.appendChild(restartNotice);

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

    // Set up Done button listener
    setupDoneButtonListener();
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

        // Track changes
        checkForChanges();

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

function checkForChanges() {
    hasChanges = (
        initialSettings.theme_enabled !== ElainaData.get("theme_enabled", true) ||
        initialSettings.hide_tft !== ElainaData.get("hide_tft", true) ||
        initialSettings.auto_accept !== ElainaData.get("auto_accept", false)
    );
    console.log('[SimpleTheme] Settings changed:', hasChanges);
}

function setupDoneButtonListener() {
    // Wait for the Done button to appear
    const checkInterval = setInterval(() => {
        const doneButton = document.querySelector("lol-uikit-flat-button.button-accept");
        if (doneButton && !doneButton.hasAttribute('data-astrante-listener')) {
            clearInterval(checkInterval);
            doneButton.setAttribute('data-astrante-listener', 'true');

            doneButton.addEventListener("click", (e) => {
                if (hasChanges) {
                    e.preventDefault();
                    e.stopPropagation();
                    showRestartDialog();
                }
            });

            console.log('[SimpleTheme] Done button listener attached');
        }
    }, 500);
}

function showRestartDialog() {
    // Remove existing dialog if any
    const existingDialog = document.querySelector('.dialog-confirm.astrante-restart-dialog');
    if (existingDialog) {
        existingDialog.remove();
    }

    // Create dialog container
    const dialogContainer = document.createElement("div");
    dialogContainer.className = "dialog-confirm astrante-restart-dialog";
    dialogContainer.style.cssText = "display: flex; align-items: center; justify-content: center; position: absolute; inset: 0px; z-index: 10000;";

    // Create dialog frame
    const dialogFrame = document.createElement("lol-uikit-dialog-frame");
    dialogFrame.className = "dialog-frame";
    dialogFrame.setAttribute("orientation", "bottom");

    // Create content
    const dialogContent = document.createElement("div");
    dialogContent.className = "dialog-content";

    const contentBlock = document.createElement("lol-uikit-content-block");
    contentBlock.setAttribute("type", "dialog-small");

    const title = document.createElement("h6");
    title.textContent = "RESTART REQUIRED";

    const message = document.createElement("p");
    message.textContent = "The client needs to be restarted for changes to take effect.";

    contentBlock.appendChild(title);
    contentBlock.appendChild(message);
    dialogContent.appendChild(contentBlock);

    // Create button group
    const buttonGroup = document.createElement("lol-uikit-flat-button-group");
    buttonGroup.setAttribute("type", "dialog-frame");

    // Restart button
    const restartButton = document.createElement("lol-uikit-flat-button");
    restartButton.className = "button-accept";
    restartButton.textContent = "RESTART";
    restartButton.addEventListener("click", () => {
        // Restart the client
        window.location.reload();
    });

    // Close button
    const closeButton = document.createElement("lol-uikit-flat-button");
    closeButton.className = "button-decline";
    closeButton.textContent = "CLOSE";
    closeButton.addEventListener("click", () => {
        dialogContainer.remove();
    });

    buttonGroup.appendChild(restartButton);
    buttonGroup.appendChild(closeButton);

    // Assemble dialog
    dialogFrame.appendChild(dialogContent);
    dialogFrame.appendChild(buttonGroup);
    dialogContainer.appendChild(dialogFrame);

    // Add to document
    document.body.appendChild(dialogContainer);
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
