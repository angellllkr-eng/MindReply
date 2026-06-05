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
  setLanguage: (language: LanguageCode) => void;
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
  const language = navigator.language.toLowerCase();
  if (language.startsWith("fr")) return "FR";
  if (language.startsWith("de")) return "DE";
  if (language.startsWith("es")) return "ES";
  if (language.startsWith("bg")) return "BG";
  if (language.startsWith("it")) return "IT";
  if (language.startsWith("pt")) return "PT";
  return "EN";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("EN");

  useEffect(() => {
    const saved = window.localStorage.getItem("mindreply.language");
    if (isLanguageCode(saved)) {
      setLanguageState(saved);
      applyDocumentLanguage(saved);
      return;
    }
    const detected = detectBrowserLanguage();
    setLanguageState(detected);
    applyDocumentLanguage(detected);
  }, []);

  const setLanguage = (nextLanguage: LanguageCode) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem("mindreply.language", nextLanguage);
    applyDocumentLanguage(nextLanguage);
  };

  const value = useMemo<LanguageContextValue>(() => ({
    language,
    setLanguage,
    t: (key) => dictionary[language][key] ?? dictionary.EN[key],
  }), [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider");
  }
  return context;
}
