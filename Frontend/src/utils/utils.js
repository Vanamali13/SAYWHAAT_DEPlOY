export const APP_NAME = "Say Whatt";

export function cn(...inputs) {
  return inputs.filter(Boolean).join(' ');
}

export function createPageUrl(pageName) {
  if (!pageName) return "/";
  return `/${pageName.toLowerCase().replace(/\s+/g, '-')}`;
}