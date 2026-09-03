import type { LocaleCode } from "./config";

export type TranslationPrimitive =
  | string
  | number
  | boolean
  | null;

export type TranslationDictionary = {
  [key: string]:
    | TranslationPrimitive
    | TranslationDictionary;
};

export type TranslationResources = Partial<
  Record<LocaleCode, TranslationDictionary>
>;

export type TranslationParams = Record<
  string,
  string | number
>;
