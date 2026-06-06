# Traductions (i18n)

Les addons peuvent fournir leurs propres traductions, **fusionnées au runtime** dans le système i18n du panel.

---

## Déclaration

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

## Convention de nommage

Préfixez **toutes** vos clés avec `addon.<identifiant>.` pour éviter les collisions :

```
addon.wallet.nav          ✅
addon.shop.productTitle   ✅
nav                       ❌  risque de collision avec les clés du panel
```

---

## Utilisation dans `pages`, `slots` et `widgets`

Les champs `label` acceptent directement une clé i18n :

```json
{
  "path":  "/",
  "label": "addon.myapp.nav"
}
```

Le panel résout automatiquement la clé dans la langue courante de l'utilisateur.

**Ordre de résolution :**
1. Traductions du panel (fr.ts / en.ts)
2. Traductions de l'addon (fusionnées au runtime depuis `manifest.translations`)
3. Clé brute (fallback)

---

## Ajouter une langue

Ajoutez simplement une nouvelle entrée dans `translations` :

```json
"translations": {
  "fr": { "addon.myapp.nav": "Mon Application" },
  "en": { "addon.myapp.nav": "My Application" },
  "de": { "addon.myapp.nav": "Meine Anwendung" },
  "es": { "addon.myapp.nav": "Mi Aplicación" }
}
```

Le panel utilisera automatiquement la langue correspondante si l'utilisateur l'a sélectionnée.  
Si la langue n'existe pas dans votre manifest, il retombe sur `"fr"` puis `"en"`.

---

## Dans votre React (côté addon)

Vos pages/widgets React reçoivent `?lang=fr` (ou `en`, etc.) via les query params.  
Gérez vos propres traductions indépendamment du panel :

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
