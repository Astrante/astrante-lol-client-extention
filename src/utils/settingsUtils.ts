/**
 * @author Simple
 * @description Settings utilities for Simple Theme
 */

export function settingsUtils(context: any, structure: any[]) {
    context.setSettings(
        structure.map((group: any) => ({
            ...group,
            isVisible: () => ElainaData.get("theme_enabled", true)
        }))
    );
}
