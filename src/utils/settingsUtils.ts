/**
 * @author Simple
 * @description Settings utilities for Simple Theme
 */

export function settingsUtils(context: any, structure: any[]) {
    console.log('[SimpleTheme] settingsUtils called with context:', context);
    console.log('[SimpleTheme] settingsUtils called with structure:', structure);

    const result = context.setSettings(
        structure.map((group: any) => ({
            ...group,
            isVisible: () => true  // Always show settings
        }))
    );

    console.log('[SimpleTheme] setSettings result:', result);
}
