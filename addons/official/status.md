# Statut & incidents <span class="badge-free">✓ Gratuit</span>

> **Free Addon by [Bloume SAS](https://bloume.fr)**
> Une **page de statut publique** : disponibilité sur 90 jours, incidents, maintenances — avec **détection automatique** des pannes et des redéploiements.

::: tip Aucune dépendance
Statut fonctionne seul. Pour surveiller aussi le **moteur proxy**, le **pool** et les **addons**, activez **« Page d'état publique »** dans **Paramètres → Général** du panel (l'addon lit son état publique `/api/status`).
:::

## 🎬 Vidéo

<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:16px 0">
  <iframe src="https://www.youtube-nocookie.com/embed/nTGtTSsZQOA" title="Addon Statut — installation, test et aperçu" style="position:absolute;top:0;left:0;width:100%;height:100%;border:0" loading="lazy" allow="accelerometer; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>
</div>

Vidéo : installation, test et aperçu — [la regarder sur YouTube](https://youtu.be/nTGtTSsZQOA).

## La page publique

Accessible **sans connexion** à `https://votre-panel/addon-proxy/status/` (et dans le menu du panel). Elle affiche :

- un **bandeau global** (opérationnel, dégradé, panne partielle, panne majeure, maintenance) ;
- la **disponibilité sur 90 jours** de chaque composant (panel et API, service proxy, pool, addons) sous forme de barres journalières ;
- les **incidents en cours**, les **maintenances** à venir ou en cours, et les incidents des **30 derniers jours**, avec leur chronologie ;
- l'**annonce** de votre choix en haut de page ;
- FR / EN et thème clair / sombre selon le navigateur.

Un **widget** (bandeau compact) s'affiche aussi sur le tableau de bord du panel.

## Ce qui est détecté automatiquement

| Événement | Ce qui se passe |
|---|---|
| **Un composant ne répond plus** (3 vérifications consécutives par défaut) | un incident « … indisponible » s'ouvre, puis se **résout seul** quand le service revient |
| **Redéploiement / mise à jour** | au redémarrage, l'interruption est mesurée (de l'arrêt du service à son retour) et publiée : « Mise à jour déployée (2.14.2 → 2.15.0) — interruption : 1 min 12 » |
| **Redémarrage sans changement de version** | « Redémarrage du service », avec sa durée |
| **Redémarrage du panel entre deux vérifications** | détecté grâce au temps de fonctionnement du panel (`uptimeSec` de `/health`, panel ≥ 2.15) |

La durée d'une interruption est comptée comme **indisponibilité** dans les barres de disponibilité. Une simple **désactivation / réactivation** de l'addon (panel resté en ligne) ne crée aucun incident.

## Publier à la main

**Statut et incidents** (administrateur) :

- **Incident** : titre (FR + EN facultatif), impact (information, mineur, majeur, critique), statut (investigation → cause identifiée → surveillance → résolu), composants concernés, message ;
- **Mises à jour** : ajoutez des messages à la chronologie ; passer en « Résolu » clôt l'incident ;
- **Maintenance planifiée** : fenêtre début / fin ; elle passe **seule** de « planifiée » à « en cours » puis « terminée », et pendant la fenêtre les composants concernés sont en **maintenance** (sans compter comme indisponibles) ;
- **Masquer** un incident détecté à tort de la page publique (il reste visible pour vous), le **supprimer**.

## Alertes

- **E-mail aux abonnés** : tout utilisateur connecté s'abonne depuis la page (**« Me prévenir par e-mail »**) ;
- **E-mail aux administrateurs** pour chaque incident détecté automatiquement ;
- **Webhook Discord / Slack / JSON** (Réglages), avec bouton de test.

## Réglages

Page publique activée, titre, annonce, intervalle de vérification (30 s), échecs avant incident (3), coupure minimale détectée (30 s), coupure maximale (48 h), afficher addons / ports, alertes, webhook, durée de conservation (90 jours).

## Limite à connaître

Quand l'addon tourne **dans l'image du panel** (mode embarqué), il s'arrête avec le panel : une panne totale du serveur ne peut pas être « vue » en direct — elle est **constatée au redémarrage** (durée mesurée depuis l'arrêt ou la dernière vérification). Pour une page de statut toujours en ligne pendant les pannes, déployez l'addon **séparément** et pointez `PANEL_URL` vers l'adresse publique du panel : il détecte alors la panne en direct.

## E-mails

Deux modèles (groupe « Statut ») : alerte aux abonnés, incident détecté (administrateurs).

## Activation

**Extensions → Statut → Activer**. Repo : [UHQ-Addon-Status](https://github.com/BloumeSAS/UHQ-Addon-Status).

| Variable | Défaut | Rôle |
|---|---|---|
| `PORT` | `3109` | Port d'écoute |
| `PANEL_URL` / `PANEL_API_KEY` | — | Sondes du panel, vérification des jetons, e-mails |
| `DB_PATH` | `./status-data.json` | Fichier de données |
