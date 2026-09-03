import {
  FALLBACK_LOCALE,
  type LocaleCode,
} from "./config";

import type {
  TranslationDictionary,
  TranslationParams,
  TranslationResources,
} from "./types";

function getNestedValue(
  dictionary: TranslationDictionary | undefined,
  key: string
): unknown {
  if (!dictionary) {
    return undefined;
  }

  return key
    .split(".")
    .reduce<unknown>((current, segment) => {
      if (
        !current ||
        typeof current !== "object"
      ) {
        return undefined;
      }

      return (
        current as Record<string, unknown>
      )[segment];
    }, dictionary);
}

function interpolate(
  value: string,
  params?: TranslationParams
) {
  if (!params) {
    return value;
  }

  return value.replace(
    /\{\{(\w+)\}\}/g,
    (match, key: string) => {
      const replacement = params[key];

      return replacement === undefined
        ? match
        : String(replacement);
    }
  );
}

export function translate(
  resources: TranslationResources,
  locale: LocaleCode,
  key: string,
  params?: TranslationParams
): string {
  const localizedValue = getNestedValue(
    resources[locale],
    key
  );

  if (typeof localizedValue === "string") {
    return interpolate(localizedValue, params);
  }

  const fallbackValue = getNestedValue(
    resources[FALLBACK_LOCALE],
    key
  );

  if (typeof fallbackValue === "string") {
    return interpolate(fallbackValue, params);
  }

  const frenchValue = getNestedValue(
    resources.fr,
    key
  );

  if (typeof frenchValue === "string") {
    return interpolate(frenchValue, params);
  }

  return key;
}
