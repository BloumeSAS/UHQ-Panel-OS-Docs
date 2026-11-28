# Translations (i18n)

Add-ons can provide their own translations, **merged at runtime** into the panel's i18n system.

---

## Declaration

```json
"translations": {
  "fr": {
    "addon.myapp.nav":   "Mon Application",
    "addon.myapp.admin": "Administration",
    "addon.myapp.table": "Tableau des données"
  },
  "en": {
    "addon.myapp.nav":   "My Application",
    "addon.myapp.admin": "Administration",
    "addon.myapp.table": "Data table"
  }
}
```

---

## Naming convention

Prefix **all** your keys with `addon.<identifier>.` to avoid collisions:

```
addon.wallet.nav          ✅
addon.shop.productTitle   ✅
nav                       ❌  may collide with the panel's keys
```

---

## Use in `pages`, `slots` and `widgets`

`label` fields accept an i18n key directly:

```json
{
  "path":  "/",
  "label": "addon.myapp.nav"
}
```

The panel resolves the key in the user's current language automatically.

**Resolution order:**
1. Panel translations (fr.ts / en.ts)
2. Add-on translations (merged at runtime from `manifest.translations`)
3. Raw key (fallback)

---

## Add a language

Just add a new entry in `translations`:

```json
"translations": {
  "fr": { "addon.myapp.nav": "Mon Application" },
  "en": { "addon.myapp.nav": "My Application" },
  "de": { "addon.myapp.nav": "Meine Anwendung" },
  "es": { "addon.myapp.nav": "Mi Aplicación" }
}
```

The panel uses the matching language automatically when the user selected it.  
If the language is missing from your manifest, it falls back to `"fr"` then `"en"`.

---

## In your React code (add-on side)

Your React pages/widgets receive `?lang=fr` (or `en`, etc.) in the query params.  
Handle your own translations independently from the panel:

```tsx
const I18N = {
  fr: { title: 'Mon Application', balance: 'Solde' },
  en: { title: 'My Application',  balance: 'Balance' },
};

function useT() {
  const [params] = useSearchParams();
  const lang = params.get('lang') ?? 'fr';
  return (key: string) => I18N[lang]?.[key] ?? I18N['fr'][key] ?? key;
}
```
