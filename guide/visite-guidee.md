# Visite guidée

Depuis la **v2.4.79**, UHQ Panel OS inclut une **visite guidée interactive** : un tutoriel de A à Z, directement dans le panel, qui explique comment tout fonctionne et montre chaque endroit de l'interface avec son explication.

---

## Lancer la visite

| Situation | Ce qui se passe |
|---|---|
| **Fin de l'installation** | La visite démarre **toute seule** sur le tableau de bord, juste après la création du compte administrateur. |
| **À tout moment** | Cliquez sur l'icône **?** en haut à droite (barre du haut) pour la relancer. |
| **Panel déjà installé / restauré** | Elle ne se lance pas automatiquement : utilisez l'icône **?**. |

### Navigation

| Action | Bouton | Clavier |
|---|---|---|
| Étape suivante | **Suivant** | `→` |
| Étape précédente | **Précédent** | `←` |
| Quitter | **Passer la visite** ou ✕ | `Échap` |

Une barre de progression et le compteur « Étape X sur N » indiquent où vous en êtes. À chaque étape, la zone expliquée reste éclairée pendant que le reste de l'écran est assombri ; le panel change de page et ouvre le bon onglet des Paramètres tout seul.

::: tip Mobile
Sur téléphone, le menu latéral s'ouvre automatiquement quand la visite le présente, puis se referme pour ne pas cacher la page expliquée.
:::

---

## Selon votre rôle

| Rôle | Étapes vues |
|---|---|
| **Administrateur** | Toutes (45 étapes) : installation, architecture, chaque page, chaque onglet des Paramètres. |
| **Support** | Fonctionnement, interface, supervision (tableau de bord, pool, analytics, journaux, rapports, audit), compte. |
| **Utilisateur** | Son espace : ses proxies, ses clés API, profil, sécurité du compte. |

---

## Ce que couvre la visite

### 1. Installation et fonctionnement
- **Bienvenue** et mode d'emploi de la visite.
- **L'architecture** : le panel web et l'API (port `8000`), le moteur proxy TCP (port `990`) et la base PostgreSQL.
- **Les façons d'installer** : Docker Compose « tout-en-un », Coolify (build depuis GitHub), base externe, et restauration d'une sauvegarde (`.json` du panel ou `.tar.gz` PostgreSQL 16) depuis `/setup`.
- **Ports, domaine et pare-feu** : publier `8000` derrière votre domaine HTTPS, publier et ouvrir `990` (hors Cloudflare), plage `9000–9250` pour les ports dédiés.
- **Le trajet d'une connexion proxy** : authentification du compte, choix d'un proxy amont en course, comptage du trafic côté amont, coupure au quota.
- **Les 6 premières choses à faire** : hôte/port publics, alimenter le pool, créer une catégorie, créer un compte, tester, sécuriser.

### 2. L'interface
Menu latéral, recherche globale, langue, thème clair/sombre, densité des tableaux, notifications.

### 3. Les pages
| Étape | Page | Ce que vous y apprenez |
|---|---|---|
| Tableau de bord | `/` | Threads, sessions, santé du pool, consommation du jour, domaines les plus utilisés. |
| Comptes proxy | `/subusers` | Création d'un compte : quota, threads, bande passante, expiration, filtres, port/domaine dédié, liste privée, listes sticky. |
| Utilisateurs | `/users` | Rôles Admin / Support / Utilisateur, invitations, 2FA, assignation de comptes. |
| Pool de proxies | `/pool` | Import, filtres, test de latence, blacklist, proxy de secours. |
| Catégories | `/proxy-pools` | Port/domaine dédiés, « toujours en ligne », multiplicateur de consommation, anti-VPN. |
| Sources scraper | `/scraper` | URL + regex, détection par IA Groq, boucle automatique. |
| Checker | `/checker` | Vérification en boucle du pool, proxies morts et blacklistés. |
| IP bannies | `/banned-ips` | Blocage avant authentification, bannissements manuels et automatiques. |
| Analytics | `/analytics` | Santé et performance du pool dans le temps. |
| Journaux | `/logs` | Logs en direct, filtre par niveau, pause. |
| Rapports | `/reports` | Usage par période, par compte et par utilisateur. |
| Journal d'audit | `/audit` | Qui a fait quoi, quand. |
| Extensions | `/addons-manage` | Addons officiels en un clic, addons externes par manifest. |
| Guide développeur | `/addon-docs` | Créer sa propre extension. |
| Documentation API | `/docs` | Swagger/Scalar de l'API REST. |

### 4. Les Paramètres, onglet par onglet
La visite ouvre elle-même chaque onglet : **Tableau de bord**, **Général**, **Thème**, **Sécurité**, **Captcha**, **Clé API**, **Moteur proxy**, **Scraper**, **E-mail (SMTP)**, **Webhooks**, **Sauvegardes**, **Extensions**. Voir aussi la page [Configuration](/guide/configuration) pour le détail de chaque réglage.

### 5. Votre compte
Clés API (portée et expiration), Mes proxies, Profil, Sécurité du compte (2FA, sessions) et À propos (version, mise à jour).

---

## Questions fréquentes

**La visite ne s'est pas lancée à la fin de l'installation.**
Cliquez sur l'icône **?** en haut à droite. Le lancement automatique ne se fait que dans le navigateur où l'installation vient d'être terminée.

**Puis-je la désactiver ?**
Oui : quittez avec `Échap` ou « Passer la visite ». Elle ne revient jamais d'elle-même ensuite.

**Elle ne s'affiche pas dans ma langue.**
La visite suit la langue choisie dans le sélecteur en haut à droite (français ou anglais).

---

## Pour les développeurs

Les textes sont dans `web/src/lib/i18n/tour-fr.ts` et `tour-en.ts` (clés `tour.<id>.t` pour le titre et `tour.<id>.b` pour le texte). Les étapes sont déclarées dans `web/src/lib/tour/steps.ts`.

Les éléments mis en lumière sont repérés par l'attribut `data-tour` :

| Attribut | Élément |
|---|---|
| `sidebar` | Menu latéral |
| `nav:<route>` | Lien du menu vers une page (ex. `nav:/subusers`) |
| `topbar-search`, `topbar-lang`, `topbar-theme`, `topbar-density`, `topbar-notifs` | Barre du haut |
| `content` | Zone principale de la page |
| `settings-tab:<clé>` | Onglet des Paramètres |

**Ajouter une page ou un onglet à la visite** : ajoutez une entrée dans `steps.ts` et ses deux clés dans `tour-fr.ts` et `tour-en.ts`. Pour un onglet des Paramètres, la visite l'ouvre via l'événement `uhq-tour-settings-tab` ; pour le menu mobile, via `uhq-tour-sidebar`.
