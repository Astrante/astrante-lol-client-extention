/**
 * @author Teisseire117
 * @modifier Astrante
 * @version 1.0.0
 * @description Utility functions for League of Legends client customization
 */

// State variables
let pvp_net_id: any,
    summoner_id: any,
    phase: any;

// Track active WebSocket connections for cleanup
const activeWebSockets: Set<WebSocket> = new Set();

/**
 * Pauses execution for a specified time
 * @param {number} time - The time to pause in milliseconds
 * @returns {Promise<void>} A promise that resolves after the specified time
 */
async function stop(time: number): Promise<void> {
    return await new Promise(resolve => setTimeout(resolve, time));
}

/**
 * Adds a CSS style to the document head with a specific ID
 * @param Id The ID for the style element
 * @param style The CSS style to add
 * @returns {HTMLStyleElement} The created style element
 */
function addStyleWithID(Id: string, style: string): HTMLStyleElement {
    const styleElement = document.createElement('style');
    styleElement.id = Id;
    styleElement.textContent = style;
    document.head.appendChild(styleElement);
    return styleElement;
}

/**
 * Adds a CSS style to the document head (generates unique ID)
 * @param style - The CSS style to add
 * @returns {HTMLStyleElement} The created style element
 */
function addStyle(style: string): HTMLStyleElement {
    const id = 'style-' + Math.random().toString(36).slice(2, 11);
    return addStyleWithID(id, style);
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
 * Sends a POST request to a LoL client API endpoint
 * @param endpoint - The API endpoint to call
 * @returns Promise that resolves when the request completes
 */
async function postToLolApi(endpoint: string): Promise<void> {
    await fetch(endpoint, { method: 'POST' });
}

/**
 * Subscribes to a specific endpoint and triggers a callback when that endpoint is called
 * @param endpoint - The endpoint to monitor (use "" to subscribe to all)
 * @param callback - The callback function
 * @returns Function to unsubscribe and cleanup the WebSocket
 */
function subscribe_endpoint(endpoint: string, callback: (message: MessageEvent) => void): () => void {
    const getUri: HTMLAnchorElement | null = document.querySelector('link[rel="riot:plugins:websocket"]');
    const uri: string | undefined = getUri?.href;

    if (!uri) {
        console.error('[utils] WebSocket URI not found');
        return () => {};
    }

    const ws = new WebSocket(uri, 'wamp');
    activeWebSockets.add(ws);

    ws.onopen = () => ws.send(JSON.stringify([5, 'OnJsonApiEvent' + endpoint.replace(/\//g, '_')]));
    ws.onmessage = callback;

    // Return cleanup function
    return () => {
        ws.onopen = null;
        ws.onmessage = null;
        ws.onerror = null;
        ws.close();
        activeWebSockets.delete(ws);
    };
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

// Export utility functions with getters for reactive state
const utils = {
    get phase() { return phase; },
    get summoner_id() { return summoner_id; },
    get pvp_net_id() { return pvp_net_id; },
    subscribe_endpoint,
    addStyle,
    addStyleWithID,
    getSummonerID,
    postToLolApi,
    stop,
    cleanup: () => {
        // Close all active WebSocket connections
        for (const ws of activeWebSockets) {
            ws.close();
        }
        activeWebSockets.clear();
    }
};

export default utils;
