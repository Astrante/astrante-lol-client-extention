/**
 * @author Teisseire117
 * @modifier Simple
 * @version 1.0.0
 * @description Utility functions for League of Legends client customization
 */

// State variables
let pvp_net_id: any,
    summoner_id: any,
    phase: any;

/**
 * Pauses execution for a specified time
 * @param {number} time - The time to pause in milliseconds
 * @returns {Promise<void>} A promise that resolves after the specified time
 */
async function stop(time: number): Promise<void> {
    return await new Promise(resolve => setTimeout(resolve, time));
}

/**
 * Adds a CSS style to the document body
 * @param {string} style - The CSS style to add
 */
function addStyle(style: string) {
    const styleElement = document.createElement('style');
    styleElement.appendChild(document.createTextNode(style));
    document.body.appendChild(styleElement);
}

/**
 * Adds a CSS style to the document body with a specific ID
 * @param Id The ID for the style element
 * @param style The CSS style to add
 */
function addStyleWithID(Id: string, style: string) {
    const styleElement = document.createElement('style');
    styleElement.id = Id
    styleElement.appendChild(document.createTextNode(style));
    document.body.appendChild(styleElement);
}

/**
 * Fetches the current summoner's ID
 * @returns {Promise<number>} The summoner ID
 */
async function getSummonerID(): Promise<number> {
    const response = await fetch("/lol-summoner/v1/current-summoner");
    const data = await response.json();
    return JSON.parse(data.summonerId);
}

/**
 * Subscribes to a specific endpoint and triggers a callback when that endpoint is called
 * @param {string} endpoint - The endpoint to monitor (use "" to subscribe to all)
 * @param {function} callback - The callback function
 */
async function subscribe_endpoint(endpoint: string, callback: any) {
    const getUri: HTMLAnchorElement | null= document.querySelector('link[rel="riot:plugins:websocket"]')
    const uri: any = getUri?.href;
    const ws = new WebSocket(uri, 'wamp');

    ws.onopen = () => ws.send(JSON.stringify([5, 'OnJsonApiEvent' + endpoint.replace(/\//g, '_')]));
    ws.onmessage = callback;
}

/**
 * Updates user PvP.net info
 * @param {MessageEvent} message - The WebSocket message event
 */
const updateUserPvpNetInfos = async (message: MessageEvent) => {
    const data = JSON.parse(message.data)[2].data;
    if (data) {
        pvp_net_id = data.id;
        summoner_id = data.summonerId;
    }
};

/**
 * Updates the gameflow phase
 * @param {MessageEvent} message - The WebSocket message event
 */
const updatePhaseCallback = async (message: MessageEvent) => {
    phase = JSON.parse(message.data)[2].data;
};

// Initialize event listeners
window.addEventListener('load', () => {
    subscribe_endpoint("/lol-gameflow/v1/gameflow-phase", updatePhaseCallback);
    subscribe_endpoint("/lol-chat/v1/me", updateUserPvpNetInfos);
});

// Export utility functions
const utils = {
    phase,
    summoner_id,
    pvp_net_id,
    subscribe_endpoint,
    addStyle,
    addStyleWithID,
    getSummonerID,
    stop,
};

export default utils;
