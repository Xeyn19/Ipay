export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "ipay-theme-v2";
export const THEME_COOKIE_KEY = "ipay-theme-v2";
export const DEFAULT_THEME: Theme = "dark";

export function isTheme(value: string | undefined | null): value is Theme {
  return value === "light" || value === "dark";
}
