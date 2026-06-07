export const LANG_OPTIONS = [
  { code: "EN", name: "English" },
  { code: "FR", name: "Francais" },
  { code: "DE", name: "Deutsch" },
  { code: "ES", name: "Espanol" },
  { code: "BG", name: "Bulgarian" },
  { code: "IT", name: "Italiano" },
  { code: "PT", name: "Portugues" },
] as const;

export type LanguageCode = (typeof LANG_OPTIONS)[number]["code"];
export type LanguageSource = "url" | "cookie" | "country" | "accept-language" | "browser" | "manual" | "fallback";

export const languageNames: Record<LanguageCode, string> = {
  EN: "English",
  FR: "French",
  DE: "German",
  ES: "Spanish",
  BG: "Bulgarian",
  IT: "Italian",
  PT: "Portuguese",
};

const supportedLanguages = new Set<LanguageCode>(LANG_OPTIONS.map((option) => option.code));

const countryLanguageMap: Record<string, LanguageCode> = {
  AE: "EN",
  AR: "ES",
  AU: "EN",
  BE: "FR",
  BG: "BG",
  BO: "ES",
  BR: "PT",
  CA: "EN",
  CH: "DE",
  CL: "ES",
  CO: "ES",
  CR: "ES",
  CU: "ES",
  DE: "DE",
  DO: "ES",
  EC: "ES",
  ES: "ES",
  FR: "FR",
  GB: "EN",
  GT: "ES",
  HN: "ES",
  IE: "EN",
  IN: "EN",
  IT: "IT",
  MX: "ES",
  NL: "EN",
  NZ: "EN",
  PA: "ES",
  PE: "ES",
  PT: "PT",
  PY: "ES",
  SG: "EN",
  SV: "ES",
  US: "EN",
  UY: "ES",
  VE: "ES",
};

export function normalizeLanguage(value: string | null | undefined): LanguageCode | null {
  const language = value?.toUpperCase() as LanguageCode | undefined;
  return language && supportedLanguages.has(language) ? language : null;
}

export function detectLanguageFromCountry(country: string | null | undefined): LanguageCode | null {
  const code = country?.trim().toUpperCase();
  return code ? countryLanguageMap[code] ?? null : null;
}

export function detectLanguageFromAcceptLanguage(value: string | null | undefined): LanguageCode | null {
  const acceptLanguage = value?.toLowerCase() ?? "";
  if (/\bfr\b|fr-/.test(acceptLanguage)) return "FR";
  if (/\bde\b|de-/.test(acceptLanguage)) return "DE";
  if (/\bes\b|es-/.test(acceptLanguage)) return "ES";
  if (/\bbg\b|bg-/.test(acceptLanguage)) return "BG";
  if (/\bit\b|it-/.test(acceptLanguage)) return "IT";
  if (/\bpt\b|pt-/.test(acceptLanguage)) return "PT";
  if (/\ben\b|en-/.test(acceptLanguage)) return "EN";
  return null;
}
