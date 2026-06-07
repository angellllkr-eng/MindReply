"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { LANG_OPTIONS, normalizeLanguage, type LanguageCode, type LanguageSource } from "@/lib/language";

export { LANG_OPTIONS, type LanguageCode };

type TranslationKey =
  | "professionals"
  | "tools"
  | "membership"
  | "lexicons"
  | "integrations"
  | "intelligence"
  | "language"
  | "myBookings"
  | "memberLogin"
  | "createAccount"
  | "bookSession"
  | "openMenu"
  | "closeMenu"
  | "behavioralIntelligence";

const dictionary: Record<LanguageCode, Record<TranslationKey, string>> = {
  EN: {
    professionals: "Professionals",
    tools: "Tools",
    membership: "Membership",
    lexicons: "Lexicons",
    integrations: "Integrations",
    intelligence: "Intelligence",
    language: "Language",
    myBookings: "My Bookings",
    memberLogin: "Member Login",
    createAccount: "Create Account",
    bookSession: "Book a Session",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    behavioralIntelligence: "Behavioral Intelligence",
  },
  FR: {
    professionals: "Professionnels",
    tools: "Outils",
    membership: "Adhesion",
    lexicons: "Lexiques",
    integrations: "Integrations",
    intelligence: "Intelligence",
    language: "Langue",
    myBookings: "Mes reservations",
    memberLogin: "Connexion",
    createAccount: "Creer un compte",
    bookSession: "Reserver",
    openMenu: "Ouvrir le menu",
    closeMenu: "Fermer le menu",
    behavioralIntelligence: "Intelligence comportementale",
  },
  DE: {
    professionals: "Experten",
    tools: "Werkzeuge",
    membership: "Mitgliedschaft",
    lexicons: "Lexika",
    integrations: "Integrationen",
    intelligence: "Intelligenz",
    language: "Sprache",
    myBookings: "Meine Buchungen",
    memberLogin: "Login",
    createAccount: "Konto erstellen",
    bookSession: "Termin buchen",
    openMenu: "Menu offnen",
    closeMenu: "Menu schliessen",
    behavioralIntelligence: "Verhaltensintelligenz",
  },
  ES: {
    professionals: "Profesionales",
    tools: "Herramientas",
    membership: "Membresia",
    lexicons: "Lexicos",
    integrations: "Integraciones",
    intelligence: "Inteligencia",
    language: "Idioma",
    myBookings: "Mis reservas",
    memberLogin: "Acceso",
    createAccount: "Crear cuenta",
    bookSession: "Reservar",
    openMenu: "Abrir menu",
    closeMenu: "Cerrar menu",
    behavioralIntelligence: "Inteligencia conductual",
  },
  BG: {
    professionals: "Profesionalisti",
    tools: "Instrumenti",
    membership: "Chlenstvo",
    lexicons: "Leksikoni",
    integrations: "Integracii",
    intelligence: "Inteligentnost",
    language: "Ezik",
    myBookings: "Moite rezervacii",
    memberLogin: "Vhod",
    createAccount: "Nov profil",
    bookSession: "Rezervirai",
    openMenu: "Otvori menu",
    closeMenu: "Zatvori menu",
    behavioralIntelligence: "Povedencheska inteligentnost",
  },
  IT: {
    professionals: "Professionisti",
    tools: "Strumenti",
    membership: "Membership",
    lexicons: "Lessici",
    integrations: "Integrazioni",
    intelligence: "Intelligenza",
    language: "Lingua",
    myBookings: "Prenotazioni",
    memberLogin: "Accesso",
    createAccount: "Crea account",
    bookSession: "Prenota",
    openMenu: "Apri menu",
    closeMenu: "Chiudi menu",
    behavioralIntelligence: "Intelligenza comportamentale",
  },
  PT: {
    professionals: "Profissionais",
    tools: "Ferramentas",
    membership: "Assinatura",
    lexicons: "Lexicos",
    integrations: "Integracoes",
    intelligence: "Inteligencia",
    language: "Idioma",
    myBookings: "Reservas",
    memberLogin: "Entrar",
    createAccount: "Criar conta",
    bookSession: "Reservar",
    openMenu: "Abrir menu",
    closeMenu: "Fechar menu",
    behavioralIntelligence: "Inteligencia comportamental",
  },
};

type LanguageContextValue = {
  language: LanguageCode;
  languageMode: "auto" | "manual";
  languageSource: LanguageSource;
  country: string | null;
  setLanguage: (language: LanguageCode) => void;
  resetLanguage: () => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLanguageCode(value: string | null): value is LanguageCode {
  return Boolean(normalizeLanguage(value));
}

function applyDocumentLanguage(language: LanguageCode) {
  document.documentElement.lang = language.toLowerCase();
  document.documentElement.dataset.mrLanguage = language;
}

function persistLanguage(language: LanguageCode, mode: "auto" | "manual") {
  window.localStorage.setItem("mindreply.language", language);
  window.localStorage.setItem("mindreply.languageMode", mode);
  document.cookie = `mindreply.language=${language}; path=/; samesite=lax; max-age=31536000`;
  document.cookie = `mindreply.languageMode=${mode}; path=/; samesite=lax; max-age=31536000`;
}

function detectBrowserLanguage(): LanguageCode {
  const urlLanguage = new URLSearchParams(window.location.search).get("lang")?.toUpperCase() ?? null;
  if (isLanguageCode(urlLanguage)) return urlLanguage;

  const candidates = [
    ...navigator.languages,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().locale,
  ].filter(Boolean).map((value) => value.toLowerCase());

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone.toLowerCase();
  if (timezone.includes("sofia")) return "BG";
  if (timezone.includes("berlin")) return "DE";
  if (timezone.includes("paris")) return "FR";
  if (timezone.includes("madrid")) return "ES";
  if (timezone.includes("rome")) return "IT";
  if (timezone.includes("lisbon")) return "PT";

  const language = candidates.join(" ");
  if (/\bfr|fr-/.test(language)) return "FR";
  if (/\bde|de-/.test(language)) return "DE";
  if (/\bes|es-/.test(language)) return "ES";
  if (/\bbg|bg-/.test(language)) return "BG";
  if (/\bit|it-/.test(language)) return "IT";
  if (/\bpt|pt-/.test(language)) return "PT";
  return "EN";
}

type LanguageProviderProps = {
  children: React.ReactNode;
  initialLanguage?: LanguageCode;
  initialLanguageMode?: "auto" | "manual";
  initialLanguageSource?: LanguageSource;
  initialCountry?: string | null;
};

export function LanguageProvider({ children, initialLanguage = "EN", initialLanguageMode = "auto", initialLanguageSource = "fallback", initialCountry = null }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<LanguageCode>(initialLanguage);
  const [languageMode, setLanguageMode] = useState<"auto" | "manual">(initialLanguageMode);
  const [languageSource, setLanguageSource] = useState<LanguageSource>(initialLanguageSource);
  const [country] = useState<string | null>(initialCountry?.toUpperCase() ?? null);

  useEffect(() => {
    const urlLanguage = new URLSearchParams(window.location.search).get("lang")?.toUpperCase() ?? null;
    if (isLanguageCode(urlLanguage)) {
      setLanguageState(urlLanguage);
      setLanguageMode("auto");
      setLanguageSource("url");
      applyDocumentLanguage(urlLanguage);
      persistLanguage(urlLanguage, "auto");
      return;
    }

    const mode = window.localStorage.getItem("mindreply.languageMode");
    const saved = window.localStorage.getItem("mindreply.language");
    if (mode === "manual" && isLanguageCode(saved)) {
      setLanguageState(saved);
      setLanguageMode("manual");
      setLanguageSource("manual");
      applyDocumentLanguage(saved);
      return;
    }
    const detected = initialLanguageSource === "fallback" ? detectBrowserLanguage() : initialLanguage;
    setLanguageState(detected);
    setLanguageMode("auto");
    setLanguageSource(initialLanguageSource === "fallback" ? "browser" : initialLanguageSource);
    applyDocumentLanguage(detected);
    persistLanguage(detected, "auto");
  }, [initialLanguage, initialLanguageSource]);

  const setLanguage = (nextLanguage: LanguageCode) => {
    setLanguageState(nextLanguage);
    setLanguageMode("manual");
    setLanguageSource("manual");
    persistLanguage(nextLanguage, "manual");
    applyDocumentLanguage(nextLanguage);
  };

  const resetLanguage = () => {
    const detected = initialLanguageSource === "fallback" ? detectBrowserLanguage() : initialLanguage;
    setLanguageState(detected);
    setLanguageMode("auto");
    setLanguageSource(initialLanguageSource === "fallback" ? "browser" : initialLanguageSource);
    persistLanguage(detected, "auto");
    applyDocumentLanguage(detected);
  };

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    languageMode,
    languageSource,
    country,
    setLanguage,
    resetLanguage,
    t: (key) => dictionary[language][key] ?? dictionary.EN[key],
  }), [country, language, languageMode, languageSource]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
