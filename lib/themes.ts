export const APP_THEMES = [
  { id: "nova", name: "Nova", description: "Navy & amber", colorScheme: "dark", chrome: "#0a0e18" },
  { id: "white", name: "White", description: "Simple & clean", colorScheme: "light", chrome: "#ffffff" },
  { id: "slate", name: "Slate", description: "Charcoal & lavender", colorScheme: "dark", chrome: "#191a20" },
  { id: "sand", name: "Sand", description: "Warm & quiet", colorScheme: "light", chrome: "#faf7f0" },
] as const;

export const DEFAULT_THEME = "nova";

export function getAppTheme(theme: string | undefined) {
  return APP_THEMES.find((item) => item.id === theme) ?? APP_THEMES[0];
}
