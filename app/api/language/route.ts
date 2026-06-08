import { NextRequest, NextResponse } from "next/server";
import { detectLanguageFromAcceptLanguage, detectLanguageFromCountry, LANG_OPTIONS, normalizeLanguage, type LanguageSource } from "@/lib/language";

function detectCountry(req: NextRequest) {
  return (
    req.headers.get("x-mr-country") ||
    req.headers.get("x-vercel-ip-country") ||
    req.headers.get("x-country-code") ||
    req.headers.get("cf-ipcountry") ||
    req.headers.get("x-appengine-country") ||
    null
  );
}

export async function GET(req: NextRequest) {
  const headerLanguage = normalizeLanguage(req.headers.get("x-mr-language"));
  const headerSource = (req.headers.get("x-mr-language-source") ?? null) as LanguageSource | null;
  const cookieLanguage = normalizeLanguage(req.cookies.get("mindreply.language")?.value ?? null);
  const cookieMode = req.cookies.get("mindreply.languageMode")?.value === "manual" ? "manual" : "auto";
  const country = detectCountry(req)?.toUpperCase() ?? null;
  const countryLanguage = detectLanguageFromCountry(country);
  const acceptLanguage = detectLanguageFromAcceptLanguage(req.headers.get("accept-language"));
  const language = headerLanguage ?? (cookieMode === "manual" ? cookieLanguage : null) ?? countryLanguage ?? acceptLanguage ?? cookieLanguage ?? "EN";
  const source = headerLanguage ? headerSource ?? "middleware" : cookieMode === "manual" && cookieLanguage ? "manual" : countryLanguage ? "country" : acceptLanguage ? "accept-language" : cookieLanguage ? "cookie" : "fallback";

  return NextResponse.json({
    language,
    mode: cookieMode,
    source,
    country,
    supported: LANG_OPTIONS.map((option) => option.code),
    note: "Language is detected automatically from visitor context, with manual override available from the language selector.",
  });
}
