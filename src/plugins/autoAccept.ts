/**
 * @author Lyfhael
 * @modifier Astrante
 */

import * as upl from "pengu-upl";
import getString from "../languages.js";

export class AutoAccept {
    private utils: any;  // Store utils reference
    private queue_accepted: boolean = false;
    private player_declined: boolean = false;

    autoAcceptQueueButtonSelect() {
        const element = document.getElementById("autoAcceptQueueButton") as HTMLElement | null;
        if (element?.attributes.getNamedItem("selected") !== undefined) {
            AstranteData.set("auto_accept", false);
            element.removeAttribute("selected");
        }
        else {
            element?.setAttribute("selected", "true");
            AstranteData.set("auto_accept", true);
        }
    }

    fetch_or_create_champselect_buttons_container(): HTMLElement | null {
        try {
            document.querySelector(".cs-buttons-container")?.remove();
        }
        catch {}

        const div = document.createElement("div");
        div.className = "cs-buttons-container";

        const nor = document.querySelector(".v2-footer-notifications.ember-view") as HTMLElement | null;
        const tft = document.querySelector(".parties-footer-notifications.ember-view") as HTMLElement | null;

        if (nor) {
            nor.append(div);
            return div;
        }
        else if (tft) {
            tft?.append(div);
            return div;
        }
        return null;
    }

    acceptMatchmaking = async (): Promise<void> => {
        if (this.player_declined) return;
        await this.utils.postToLolApi('/lol-matchmaking/v1/ready-check/accept');
    }

    autoAcceptCallback = async (message: MessageEvent) => {
        try {
            const data = JSON.parse(message.data);
            this.utils.phase = data?.[2]?.data;

            if (this.utils.phase == "ReadyCheck" && AstranteData.get("auto_accept") && !this.queue_accepted) {
                await this.acceptMatchmaking();
                this.queue_accepted = true;
            }
            else if (this.utils.phase != "ReadyCheck") {
                this.queue_accepted = false;
            }
        } catch (e) {
            console.error('[AutoAccept] Failed to parse message:', e);
        }
    }

    createButton = async (element: HTMLElement) => {
        const newOption = document.createElement("lol-uikit-radio-input-option");
        const container = this.fetch_or_create_champselect_buttons_container();
        const Option2 = document.createElement("div");

        newOption.setAttribute("id", "autoAcceptQueueButton");

        Option2.classList.add("auto-accept-button-text");
        Option2.innerHTML = await getString("auto_accept");

        if (AstranteData.get("auto_accept")){
            newOption.setAttribute("selected", "");
        }

        if (element && !document.getElementById("autoAcceptQueueButton")) {
            container?.append(newOption);
            newOption.append(Option2);
            // Use addEventListener instead of inline onclick
            newOption.addEventListener("click", () => this.autoAcceptQueueButtonSelect());
        }
    }

    main = (utils: any, auto_accept_button: boolean = true) => {
        this.utils = utils;  // Store utils reference

        window.autoAcceptQueueButtonSelect = this.autoAcceptQueueButtonSelect;

        upl.observer.subscribeToElementCreation(".v2-lobby-root-component.ember-view .v2-footer-notifications.ember-view", async (element: HTMLElement) => {
            await this.createButton(element);
        });

        upl.observer.subscribeToElementCreation(".tft-footer-container.ember-view .parties-footer-notifications.ember-view", async (element: HTMLElement) => {
            await this.createButton(element);
        });

        if (auto_accept_button) {
            utils.subscribe_endpoint('/lol-gameflow/v1/gameflow-phase', this.autoAcceptCallback);
        }
    }
}
