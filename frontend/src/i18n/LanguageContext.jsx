import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { translations } from "./translations";

const LanguageContext = createContext({
  lang: "en",
  setLang: () => {},
  t: (key) => key,
});

const STORAGE_KEY = "sonatrach.lang";
const SUPPORTED = ["en", "fr"];

function detectInitialLang() {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && SUPPORTED.includes(stored)) return stored;
  const browser = (navigator.language || "en").slice(0, 2).toLowerCase();
  return SUPPORTED.includes(browser) ? browser : "en";
}

/**
 * Look up a dotted-key in the dictionary, with optional {placeholder} interpolation.
 * Falls back to English, then to the key itself.
 */
function lookup(dict, lang, key, vars) {
  const parts = key.split(".");
  let node = dict[lang];
  for (const p of parts) {
    if (node && typeof node === "object" && p in node) {
      node = node[p];
    } else {
      node = undefined;
      break;
    }
  }
  if (node === undefined && lang !== "en") {
    return lookup(dict, "en", key, vars);
  }
  if (typeof node !== "string") return key;
  if (!vars) return node;
  return node.replace(/\{(\w+)\}/g, (_, name) =>
    vars[name] !== undefined ? String(vars[name]) : `{${name}}`
  );
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => detectInitialLang());

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.lang = lang;
    }
  }, [lang]);

  const value = useMemo(() => {
    const setLang = (newLang) => {
      if (!SUPPORTED.includes(newLang)) return;
      setLangState(newLang);
      try {
        localStorage.setItem(STORAGE_KEY, newLang);
      } catch {
        /* ignore */
      }
    };

    const t = (key, vars) => lookup(translations, lang, key, vars);

    return { lang, setLang, t, supportedLanguages: SUPPORTED };
  }, [lang]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

/** Shortcut hook for the translation function. */
export function useT() {
  return useContext(LanguageContext).t;
}
