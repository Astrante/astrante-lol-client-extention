/**
 * Global type definitions for Astrante Theme
 */

interface DataStore {
    get(key: string, fallback?: any): any;
    set(key: string, value: any): void;
    has(key: string): boolean;
    remove(key: string): void;
}

interface AstranteDataStore {
    get(key: string, fallback?: any): any;
    set(key: string, value: any): boolean;
    has(key: string): boolean;
    remove(key: string): boolean;
    restoreDefaults(): void;
    areAllParentsEnabled(key: string): boolean;
    isSettingTreeEnabled(key: string): boolean;
}

// Pengu Context interface (basic definition)
interface PenguContext {
    rcp: any;
    [key: string]: any;
}

declare global {
    interface Window {
        DataStore: DataStore;
        AstranteData: AstranteDataStore;
        reloadClient(): void;
        restartClient(): void;
        getString(key: string): Promise<string>;
        autoAcceptQueueButtonSelect(): void;
        getThemeName(): string | null;
        pengu?: PenguContext;
    }

    const AstranteData: AstranteDataStore;
}

export {};
