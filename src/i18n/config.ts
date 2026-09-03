export const SUPPORTED_LOCALES = [
  {
    code: "fr",
    legacyCode: "FR",
    label: "Français",
    shortLabel: "FR",
    nativeLabel: "Français",
    direction: "ltr",
    intlLocale: "fr-BE",
    enabled: true,
  },
  {
    code: "en",
    legacyCode: "EN",
    label: "English",
    shortLabel: "EN",
    nativeLabel: "English",
    direction: "ltr",
    intlLocale: "en-GB",
    enabled: true,
  },
  {
    code: "nl",
    legacyCode: "NL",
    label: "Nederlands",
    shortLabel: "NL",
    nativeLabel: "Nederlands",
    direction: "ltr",
    intlLocale: "nl-BE",
    enabled: true,
  },
  {
    code: "de",
    legacyCode: "EN",
    label: "Deutsch",
    shortLabel: "DE",
    nativeLabel: "Deutsch",
    direction: "ltr",
    intlLocale: "de-DE",
    enabled: true,
  },
  {
    code: "es",
    legacyCode: "EN",
    label: "Español",
    shortLabel: "ES",
    nativeLabel: "Español",
    direction: "ltr",
    intlLocale: "es-ES",
    enabled: true,
  },
  {
    code: "it",
    legacyCode: "EN",
    label: "Italiano",
    shortLabel: "IT",
    nativeLabel: "Italiano",
    direction: "ltr",
    intlLocale: "it-IT",
    enabled: true,
  },
  {
    code: "pt",
    legacyCode: "EN",
    label: "Português",
    shortLabel: "PT",
    nativeLabel: "Português",
    direction: "ltr",
    intlLocale: "pt-PT",
    enabled: true,
  },
  {
    code: "ar",
    legacyCode: "EN",
    label: "العربية",
    shortLabel: "AR",
    nativeLabel: "العربية",
    direction: "rtl",
    intlLocale: "ar",
    enabled: true,
  },
  {
    code: "tr",
    legacyCode: "EN",
    label: "Türkçe",
    shortLabel: "TR",
    nativeLabel: "Türkçe",
    direction: "ltr",
    intlLocale: "tr-TR",
    enabled: true,
  },
  {
    code: "zh",
    legacyCode: "EN",
    label: "中文",
    shortLabel: "ZH",
    nativeLabel: "中文",
    direction: "ltr",
    intlLocale: "zh-CN",
    enabled: true,
  },
] as const;

export type LocaleCode =
  (typeof SUPPORTED_LOCALES)[number]["code"];

export type LegacyLanguage =
  (typeof SUPPORTED_LOCALES)[number]["legacyCode"];

export type TextDirection = "ltr" | "rtl";

export const DEFAULT_LOCALE: LocaleCode = "fr";
export const FALLBACK_LOCALE: LocaleCode = "en";
export const LOCALE_STORAGE_KEY = "tsb_locale";

export function isSupportedLocale(
  value: string | null | undefined
): value is LocaleCode {
  if (!value) {
    return false;
  }

  return SUPPORTED_LOCALES.some(
    (locale) => locale.code === value
  );
}

export function getLocaleConfig(
  locale: LocaleCode
) {
  return (
    SUPPORTED_LOCALES.find(
      (item) => item.code === locale
    ) ?? SUPPORTED_LOCALES[0]
  );
}

export function getLegacyLanguage(
  locale: LocaleCode
): LegacyLanguage {
  return getLocaleConfig(locale).legacyCode;
}

export function detectBrowserLocale(): LocaleCode {
  if (typeof navigator === "undefined") {
    return DEFAULT_LOCALE;
  }

  const browserLocales = [
    ...(navigator.languages ?? []),
    navigator.language,
  ]
    .filter(Boolean)
    .map((value) =>
      value.toLowerCase().split("-")[0]
    );

  for (const browserLocale of browserLocales) {
    if (isSupportedLocale(browserLocale)) {
      return browserLocale;
    }
  }

  return DEFAULT_LOCALE;
}
