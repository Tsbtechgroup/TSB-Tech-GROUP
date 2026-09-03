import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  coreTranslations,
  detectBrowserLocale,
  getLegacyLanguage,
  getLocaleConfig,
  isSupportedLocale,
  translate,
  type LegacyLanguage,
  type LocaleCode,
  type TextDirection,
  type TranslationParams,
} from "../i18n";

export type Language = "FR" | "NL" | "EN";

type LanguageContextType = {
  /**
   * Ancienne langue FR/NL/EN.
   *
   * Elle reste disponible temporairement afin de ne pas casser
   * les composants existants qui utilisent encore
   * translations[language].
   */
  language: Language;

  /**
   * Ancienne API conservée pour compatibilité.
   *
   * FR -> fr
   * NL -> nl
   * EN -> en
   */
  setLanguage: (language: Language) => void;

  /**
   * Nouvelle locale internationale.
   *
   * Exemples :
   * fr, en, nl, de, es, it, pt, ar, tr, zh
   */
  locale: LocaleCode;

  /**
   * Nouvelle API internationale.
   */
  setLocale: (locale: LocaleCode) => void;

  /**
   * Direction d'écriture de la langue active.
   *
   * Exemple :
   * ltr pour le français
   * rtl pour l'arabe
   */
  direction: TextDirection;

  /**
   * Locale à utiliser avec Intl.NumberFormat,
   * Intl.DateTimeFormat, etc.
   *
   * Exemple :
   * fr-BE, de-DE, ar, zh-CN...
   */
  intlLocale: string;

  /**
   * Liste centrale des langues disponibles.
   */
  availableLocales: typeof SUPPORTED_LOCALES;

  /**
   * Traducteur central.
   *
   * Exemple :
   * t("auth.login")
   */
  t: (
    key: string,
    params?: TranslationParams
  ) => string;
};

const LanguageContext = createContext<
  LanguageContextType | undefined
>(undefined);

const LEGACY_LANGUAGE_STORAGE_KEY =
  "tsb-language";

function legacyLanguageToLocale(
  language: Language
): LocaleCode {
  switch (language) {
    case "NL":
      return "nl";

    case "EN":
      return "en";

    default:
      return "fr";
  }
}

function readInitialLocale(): LocaleCode {
  if (typeof window === "undefined") {
    return DEFAULT_LOCALE;
  }

  /**
   * 1. Nouvelle préférence internationale.
   */
  const savedLocale =
    window.localStorage.getItem(
      LOCALE_STORAGE_KEY
    );

  if (isSupportedLocale(savedLocale)) {
    return savedLocale;
  }

  /**
   * 2. Compatibilité avec l'ancien système.
   *
   * Un utilisateur qui avait déjà choisi FR/NL/EN
   * conserve son choix après la migration.
   */
  const savedLegacyLanguage =
    window.localStorage.getItem(
      LEGACY_LANGUAGE_STORAGE_KEY
    );

  if (
    savedLegacyLanguage === "FR" ||
    savedLegacyLanguage === "NL" ||
    savedLegacyLanguage === "EN"
  ) {
    return legacyLanguageToLocale(
      savedLegacyLanguage
    );
  }

  /**
   * 3. Pour un nouvel utilisateur :
   * détection automatique de la langue du navigateur.
   */
  return detectBrowserLocale();
}

export function LanguageProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [locale, setLocaleState] =
    useState<LocaleCode>(
      readInitialLocale
    );

  /**
   * Compatibilité temporaire avec tout le code
   * historique FR/NL/EN.
   *
   * Tant qu'un composant n'est pas migré :
   * - fr -> FR
   * - nl -> NL
   * - en -> EN
   * - de/es/it/pt/ar/tr/zh -> EN
   *
   * Les composants migrés utiliseront directement
   * locale + t(...).
   */
  const language = useMemo<Language>(
    () =>
      getLegacyLanguage(
        locale
      ) as LegacyLanguage as Language,
    [locale]
  );

  const localeConfig = useMemo(
    () => getLocaleConfig(locale),
    [locale]
  );

  const setLocale = (
    newLocale: LocaleCode
  ) => {
    setLocaleState(newLocale);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        LOCALE_STORAGE_KEY,
        newLocale
      );

      /**
       * On garde l'ancienne clé synchronisée
       * pendant toute la période de migration.
       */
      window.localStorage.setItem(
        LEGACY_LANGUAGE_STORAGE_KEY,
        getLegacyLanguage(newLocale)
      );
    }
  };

  const setLanguage = (
    newLanguage: Language
  ) => {
    setLocale(
      legacyLanguageToLocale(
        newLanguage
      )
    );
  };

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    /**
     * Important pour :
     * - accessibilité
     * - SEO
     * - lecteurs d'écran
     * - typographie navigateur
     */
    document.documentElement.lang =
      locale;

    /**
     * Support automatique RTL/LTR.
     *
     * L'arabe passera donc le document en RTL
     * sans logique dispersée dans les pages.
     */
    document.documentElement.dir =
      localeConfig.direction;

    document.documentElement.dataset.locale =
      locale;

    document.documentElement.dataset.direction =
      localeConfig.direction;
  }, [
    locale,
    localeConfig.direction,
  ]);

  const t = (
    key: string,
    params?: TranslationParams
  ) =>
    translate(
      coreTranslations,
      locale,
      key,
      params
    );

  const value = useMemo<
    LanguageContextType
  >(
    () => ({
      language,
      setLanguage,
      locale,
      setLocale,
      direction:
        localeConfig.direction,
      intlLocale:
        localeConfig.intlLocale,
      availableLocales:
        SUPPORTED_LOCALES,
      t,
    }),
    [
      language,
      locale,
      localeConfig.direction,
      localeConfig.intlLocale,
    ]
  );

  return (
    <LanguageContext.Provider
      value={value}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context =
    useContext(LanguageContext);

  if (!context) {
    throw new Error(
      "useLanguage doit être utilisé dans LanguageProvider"
    );
  }

  return context;
}
