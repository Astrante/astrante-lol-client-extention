/**
 * Global type definitions for Simple Theme
 */

interface DataStore {
    get(key: string, fallback?: any): any;
    set(key: string, value: any): void;
    has(key: string): boolean;
    remove(key: string): void;
}

interface ElainaDataStore {
    get(key: string, fallback?: any): any;
    set(key: string, value: any): boolean;
    has(key: string): boolean;
    remove(key: string): boolean;
    restoreDefaults(): void;
}

// Pengu Context interface (basic definition)
interface PenguContext {
    rcp: any;
    [key: string]: any;
}

declare global {
    interface Window {
        DataStore: DataStore;
        ElainaData: ElainaDataStore;
        reloadClient(): void;
        restartClient(): void;
        getString(key: string): Promise<string>;
        autoAcceptQueueButtonSelect(): void;
        getThemeName(): string | null;
        pengu?: PenguContext;
    }

    const ElainaData: ElainaDataStore;
}

export {};
