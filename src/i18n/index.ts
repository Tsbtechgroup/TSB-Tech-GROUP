export {
  DEFAULT_LOCALE,
  FALLBACK_LOCALE,
  LOCALE_STORAGE_KEY,
  SUPPORTED_LOCALES,
  detectBrowserLocale,
  getLegacyLanguage,
  getLocaleConfig,
  isSupportedLocale,
  type LegacyLanguage,
  type LocaleCode,
  type TextDirection,
} from "./config";

export {
  translate,
} from "./translator";

export {
  coreTranslations,
} from "./locales/core";

export type {
  TranslationDictionary,
  TranslationParams,
  TranslationPrimitive,
  TranslationResources,
} from "./types";
