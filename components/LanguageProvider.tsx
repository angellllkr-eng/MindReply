"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

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

type TranslationKey =
  | "professionals"
  | "tools"
  | "membership"
  | "lexicons"
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
  setLanguage: (language: LanguageCode) => void;
  resetLanguage: () => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

function isLanguageCode(value: string | null): value is LanguageCode {
  return LANG_OPTIONS.some((option) => option.code === value);
}

function applyDocumentLanguage(language: LanguageCode) {
  document.documentElement.lang = language.toLowerCase();
  document.documentElement.dataset.mrLanguage = language;
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
};

export function LanguageProvider({ children, initialLanguage = "EN", initialLanguageMode = "auto" }: LanguageProviderProps) {
  const [language, setLanguageState] = useState<LanguageCode>(initialLanguage);
  const [languageMode, setLanguageMode] = useState<"auto" | "manual">(initialLanguageMode);

  useEffect(() => {
    const urlLanguage = new URLSearchParams(window.location.search).get("lang")?.toUpperCase() ?? null;
    if (isLanguageCode(urlLanguage)) {
      setLanguageState(urlLanguage);
      setLanguageMode("auto");
      applyDocumentLanguage(urlLanguage);
      window.localStorage.setItem("mindreply.language", urlLanguage);
      window.localStorage.setItem("mindreply.languageMode", "auto");
      return;
    }

    const mode = window.localStorage.getItem("mindreply.languageMode");
    const saved = window.localStorage.getItem("mindreply.language");
    if (mode === "manual" && isLanguageCode(saved)) {
      setLanguageState(saved);
      setLanguageMode("manual");
      applyDocumentLanguage(saved);
      return;
    }
    const detected = detectBrowserLanguage();
    setLanguageState(detected);
    setLanguageMode("auto");
    applyDocumentLanguage(detected);
    window.localStorage.setItem("mindreply.language", detected);
    window.localStorage.setItem("mindreply.languageMode", "auto");
  }, []);

  const setLanguage = (nextLanguage: LanguageCode) => {
    setLanguageState(nextLanguage);
    setLanguageMode("manual");
    window.localStorage.setItem("mindreply.language", nextLanguage);
    window.localStorage.setItem("mindreply.languageMode", "manual");
    applyDocumentLanguage(nextLanguage);
  };

  const resetLanguage = () => {
    const detected = detectBrowserLanguage();
    setLanguageState(detected);
    setLanguageMode("auto");
    window.localStorage.setItem("mindreply.language", detected);
    window.localStorage.setItem("mindreply.languageMode", "auto");
    applyDocumentLanguage(detected);
  };

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    languageMode,
    setLanguage,
    resetLanguage,
    t: (key) => dictionary[language][key] ?? dictionary.EN[key],
  }), [language, languageMode]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
