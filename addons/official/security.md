# Sécurité (BloumeID) <span class="badge-free">✓ Gratuit</span>

> **Free Addon by [Bloume SAS](https://bloume.fr)**
> Protège la **connexion**, l'**inscription** et le **mot de passe oublié** par empreinte d'appareil, grâce à **[BloumeID](https://github.com/BloumeSAS/BloumeID)** — le SDK open source d'anti-fraude de Bloume SAS.

::: tip Aucune dépendance
Fonctionne seul, sans aucun service externe : les moteurs sont inclus dans l'addon. Requiert **UHQ Panel OS 2.16** ou plus récent.
:::

## 🎬 Vidéo

<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:16px 0">
  <iframe src="https://www.youtube-nocookie.com/embed/kQJuCGh7cV8" title="Addon Sécurité (BloumeID) — installation, test et aperçu" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
</div>

Vidéo : installation, test et aperçu — [la regarder sur YouTube](https://youtu.be/kQJuCGh7cV8).

## Les moteurs

| Moteur | Rôle | Où ça tourne |
|---|---|---|
| **BloumeID** ([`@bloume/id`](https://www.npmjs.com/package/@bloume/id)) | 104 signaux (rendu, audio, polices, matériel…) + sondes **anti-spoof** et **anti-bot** : WebDriver, Puppeteer, Playwright, fonctions du navigateur modifiées, bruit anti-empreinte, machine virtuelle, Tor | Navigateur — inclus, open source |
| **ThumbmarkJS** | Empreinte complémentaire | Navigateur — inclus, open source |
| **FingerprintJS** (version open source) | Identifiant de visiteur complémentaire (télémétrie désactivée) | Navigateur — inclus, open source |
| **Serveur BloumeID** (optionnel) | Niveau de danger, VPN, Tor, datacenter, **vérifiés côté serveur** | Votre instance BloumeID auto-hébergée |
| **Fingerprint.com Pro** (optionnel, payant) | Robots, VPN, falsification, **vérifiés côté serveur** (Server API) | Fingerprint.com |

Les tests de « mensonges » du navigateur de BloumeID sont de la même famille que ceux de **[CreepJS](https://github.com/abrahamjuliot/creepjs)** (outil de recherche open source) : la page **Tester mon navigateur** de l'addon propose d'ailleurs de comparer avec CreepJS.

::: warning Ce que l'empreinte peut et ne peut pas faire
Les signaux collectés dans le navigateur peuvent être falsifiés par un attaquant déterminé. Les moteurs locaux rendent les robots, les navigateurs d'automatisation et le multi-comptes **beaucoup plus coûteux** ; pour une garantie forte, activez un moteur **vérifié côté serveur** (serveur BloumeID ou Fingerprint.com Pro).
:::

## Fonctionnement

1. Les pages **Connexion**, **Inscription** et **Mot de passe oublié** du panel chargent `sdk.js` depuis l'addon (même origine, aucun tiers par défaut).
2. Le SDK lance les moteurs et envoie les signaux à l'addon, qui calcule un **score de risque** (0 à 100) et rend un **jeton à usage unique** (10 minutes).
3. Le panel joint le jeton à la requête et demande la décision à l'addon : **autorisé**, **signalé** ou **bloqué**.

La connexion est vérifiée **après** le mot de passe : un mauvais mot de passe ne révèle rien, et le rôle du compte est connu (les administrateurs peuvent être exemptés).

## Ce qui augmente le score

| Signal | Effet par défaut |
|---|---|
| Robot / outil d'automatisation | +80 (bloquant) |
| Navigateur falsifié (anti-détection, fonctions modifiées) | +45 |
| Sans jeton (page contournée, appel direct de l'API) | 100 si « jeton obligatoire » |
| Jeton d'une autre action / expiré | +50 / 100 |
| Trop de comptes sur l'appareil (inscription) | +80 |
| Trop d'inscriptions en 24 h sur l'appareil | +60 |
| Appareil banni | 100 |
| Bruit anti-empreinte, machine virtuelle, fuseau incohérent | +10 chacun |
| VPN / Tor / proxy / datacenter (moteurs serveur) | +40 si pénalisés, sinon +10 |

Au-delà du **seuil de blocage** (70 par défaut) la requête est refusée ; au-delà du **seuil de signalement** (40) elle passe mais est marquée.

## Réglages

Comme pour tous les addons officiels, la configuration se trouve dans le panel : **Paramètres → Extensions → Sécurité (BloumeID)**.

| Réglage | Défaut | Rôle |
|---|---|---|
| Mode | Protection active | **Observation** : rien n'est bloqué, tout est journalisé (idéal pour régler les seuils) |
| Protéger connexion / inscription / mot de passe oublié | Oui | Actions vérifiées |
| Jeton obligatoire | Oui | Une requête sans jeton est suspecte |
| Ne jamais bloquer les administrateurs | Oui | Leurs connexions sont signalées, jamais refusées |
| Laisser passer si l'addon ne répond pas | Oui | Sinon les connexions sont refusées tant que l'addon est indisponible |
| Seuils de blocage / signalement | 70 / 40 | Score de risque |
| Comptes max par appareil / inscriptions max sur 24 h | 3 / 2 | 0 = illimité |
| Bloquer robots / navigateurs falsifiés | Oui / Oui | |
| Pénaliser VPN, Tor, proxys | Non | Vos clients utilisent souvent des proxys : à activer avec prudence |
| Moteurs BloumeID / ThumbmarkJS / FingerprintJS | Oui | Inclus |
| Serveur BloumeID | Non | URL, clé publique `bid_pub_…`, clé secrète `bid_sec_…` |
| Fingerprint.com Pro | Non | Clé publique, clé secrète (Server API), région |
| Badge « Protégé par BloumeID » | Oui | Sous les formulaires |

Les clés secrètes sont masquées et ne se révèlent qu'après votre mot de passe. Quand un moteur externe est activé, le panel autorise automatiquement son domaine dans sa politique de sécurité du contenu (CSP).

## Suivi

Menu **Sécurité (BloumeID)** (administrateurs) :

- **Aperçu** : vérifications des dernières 24 h, bloquées, signalées, graphique sur 14 jours, signaux les plus fréquents, moteurs actifs ;
- **Événements** : chaque connexion / inscription analysée, avec score, signaux et décision (et ce qu'aurait décidé la protection active en mode observation) ;
- **Appareils** : comptes vus sur chaque appareil, **bannissement** d'un appareil ;
- **Tester** : lance les moteurs sur votre navigateur et affiche l'analyse.

Chaque utilisateur dispose de la page **Sécurité du compte** (menu du haut) : ses appareils, ses dernières connexions et le test de son navigateur.

## Pour les autres addons

API interne (clé API du panel, en-tête `X-Panel-Key`) :

- `POST /api/internal/check` `{ action, token, ip, email, user_id, role }` → `{ decision, score, reasons, event_id }` ;
- `POST /api/internal/link` `{ event_id, user_id, email }` rattache un compte créé à l'appareil ;
- `GET /api/internal/panel-config` : actions protégées et origines CSP.

## Activation

**Extensions → Security → Activer**. Repo : [UHQ-Addon-Security](https://github.com/BloumeSAS/UHQ-Addon-Security).

| Variable | Défaut | Rôle |
|---|---|---|
| `PORT` | `3110` | Port d'écoute |
| `PANEL_URL` / `PANEL_API_KEY` | — | Vérification des jetons, appels panel ↔ addon, sauvegarde |
| `DB_PATH` | `./security-data.json` | Fichier de données |
