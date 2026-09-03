TSB Tech Group — Fondation i18n internationale V1

But
---
Cette fondation permet de migrer progressivement l'application vers un vrai système
international sans casser immédiatement les composants historiques FR/NL/EN.

Principe de compatibilité
-------------------------
1. La nouvelle locale internationale utilise des codes ISO courts :
   fr, en, nl, de, es, it, pt, ar, tr, zh.
2. Les anciens composants continuent temporairement à recevoir :
   FR, NL ou EN.
3. Pendant la migration :
   - les composants migrés utilisent locale + translate(...)
   - les composants non migrés utilisent encore language = FR/NL/EN.
4. Une langue comme DE ou AR peut donc être sélectionnée sans imposer de réécrire
   tout le site dans la même étape. Les anciens composants tombent temporairement
   sur EN jusqu'à leur migration.
5. L'arabe est déclaré RTL dès la configuration.

Ordre recommandé
----------------
1. Adapter LanguageContext.tsx pour exposer :
   locale, setLocale, language (compatibilité), direction, intlLocale.
2. Adapter Navbar.tsx pour afficher toutes les langues.
3. Migrer le site public.
4. Migrer Auth.
5. Migrer Store.
6. Migrer Client.
7. Migrer Admin.
8. Migrer notifications / emails / PDF.
9. Remplacer les champs produits name_fr/name_nl/name_en par une table de traductions.

Important
---------
Ne pas élargir directement l'ancien type Language à toutes les langues.
Cela ferait échouer TypeScript dans les nombreux composants qui font encore :
translations[language]
avec seulement FR/NL/EN.
