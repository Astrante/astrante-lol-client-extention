/**
 * Hide TFT tab from LoL client navigation using CSS
 */

export class HideTft {
    private styleElement?: HTMLStyleElement;

    async main() {
        // Add CSS to hide TFT navigation tab
        this.styleElement = document.createElement('style');
        this.styleElement.textContent = `
            /* Hide TFT tab from main navigation */
            lol-uikit-navigation-item.menu_item_navbar_tft,
            .menu_item_navbar_tft {
                display: none !important;
            }
        `;

        document.head.appendChild(this.styleElement);
    }

    destroy() {
        if (this.styleElement && this.styleElement.parentNode) {
            this.styleElement.parentNode.removeChild(this.styleElement);
        }
    }
}
