# UHQ.Monster Reseller <span class="badge-free">✓ Gratuit</span>

> **Free Addon by [Bloume SAS](https://bloume.fr)**
> Achetez et gérez vos proxies [UHQ.Monster](https://uhq.monster) **sans quitter le panel** : solde, création, ajout/retrait de Go, et **import automatique** dans vos catégories — plus de copier-coller d'identifiants.

---

## Fonctionnalités

- 💶 **Solde** du portefeuille revendeur, remise revendeur et synthèse (proxies, Go achetés/utilisés)
- 🛒 **Acheter un proxy** : produit, quantité (limites du produit contrôlées), pays, type de session, durée — avec le **coût estimé** et une **confirmation obligatoire** avant tout débit
- 📥 **Import automatique** du proxy acheté dans une **catégorie du panel** (ou le pool global), au format `http://user:pass@hôte:port`
- 📋 **Mes proxies** : usage en direct, identifiants, **+ Go**, **− Go avec remboursement**, import / changement de catégorie, suppression
- 🧾 **Historique** des opérations faites depuis le panel
- ⚡ **Widget « Pool »** : achat rapide directement sur la page **Pool de proxies**

---

## Prérequis

| | |
|---|---|
| UHQ Panel OS | **2.4.94 ou plus** |
| Compte | **revendeur approuvé** sur uhq.monster, avec une clé API (*Revendeur → API*) |

---

## Activation en 1 clic (recommandé)

L'addon est **déjà build dans l'image Docker du panel** : **Extensions → UHQ.Monster Reseller → Activer**.

Puis, dans le panel : **Paramètres → Extensions → UHQ.Monster Reseller** : collez votre **clé API revendeur** (dashboard UHQ.Monster → *Revendeur → API*). Elle est vérifiée auprès d'UHQ.Monster avant d'être enregistrée, puis jamais ré-affichée.

---

## Utilisation

### Acheter un proxy et l'ajouter à une catégorie
1. **Acheter un proxy** (ou le widget en bas de la page **Pool de proxies**).
2. Choisissez le produit, la quantité, éventuellement le pays, et la **catégorie du panel** où importer le proxy.
3. Vérifiez le coût estimé, puis **Confirmer et payer**.
4. Le proxy est créé chez UHQ.Monster **et** ajouté au pool du panel (fournisseur « Manual ») : le checker le teste comme les autres.

::: tip Passerelle résidentielle
Une passerelle résidentielle (un seul hôte:port qui change d'IP) doit être importée dans une catégorie **« Toujours en ligne »**, pour que le checker ne la marque pas morte.
:::

### Ajouter ou reprendre des Go
Dans **Mes proxies** : **+ Go** débite votre portefeuille ; **− Go** reprend **toute** la bande passante restante et la rembourse selon la politique du produit (`full`, `min_1gb` — remboursé seulement s'il reste au moins 1 Go — ou `none`).

### Depuis la page Pool
Sur la page **Pool de proxies**, chaque proxy importé à la main (fournisseur « Manual ») a un bouton **UHQ.Monster** (icône sac) qui ouvre une petite fenêtre : **ajouter des Go**, **reprendre les Go** (avec remboursement) et **réinitialiser le mot de passe**. Le proxy est retrouvé chez UHQ.Monster par hôte + port + identifiant ; s'il n'a pas été acheté avec votre compte revendeur, la fenêtre l'indique et rien n'est modifié.

La réinitialisation du mot de passe est faite par UHQ.Monster (vous ne choisissez pas la valeur) : l'ancien cesse de fonctionner tout de suite, et la ligne du pool est **remplacée** par la nouvelle, dans la même catégorie. Le nouveau mot de passe s'affiche une seule fois dans la fenêtre.

### Supprimer un proxy
La suppression est **définitive et sans remboursement** : il faut retaper le libellé du proxy. Reprenez d'abord la bande passante pour récupérer votre crédit. Le proxy est aussi retiré du panel s'il a été importé dans une catégorie.

---

## Sécurité

Cet addon **dépense de l'argent** : il est durci en conséquence.

- **Administrateurs uniquement** — chaque appel est vérifié **par le panel** (signature et expiration du jeton) ; un SUPPORT, un USER ou un jeton falsifié est refusé.
- La **clé API reste côté serveur** : fichier en mode `0600`, jamais renvoyée au navigateur (seuls 4 caractères de début et de fin), **jamais incluse dans la sauvegarde**, jamais journalisée.
- **Pas de double débit** : l'API UHQ.Monster n'a pas d'idempotence. Chaque achat porte un **libellé unique** ; en cas de réponse ambiguë (coupure, erreur 5xx), l'addon **retrouve le proxy par son libellé** au lieu de réessayer. Une seule opération d'argent à la fois.
- Les mots de passe des proxies ne sont pas stockés par l'addon ; l'historique ne contient aucun secret.

---

## Limites

- La liste d'IP autorisées et le changement de pays d'un proxy existant ne sont pas exposés pour le moment.
- Pour retirer automatiquement du panel un proxy supprimé, il doit avoir été importé dans une **catégorie** (sinon retirez-le dans **Pool**).
- Après une restauration du panel, **ressaisissez la clé API** (elle n'est pas sauvegardée).

---

## Installation manuelle (auto-hébergement séparé)

```bash
git clone https://github.com/BloumeSAS/UHQ-Addon-Reseller
cd UHQ-Addon-Reseller
npm run install:all
cp .env.example .env     # PANEL_URL, PANEL_API_KEY
npm run build && npm start
```

Variables : `PORT`, `PANEL_URL`, `PANEL_API_KEY` (sauvegarde), `DB_PATH` (fichier de données). Code source : [UHQ-Addon-Reseller](https://github.com/BloumeSAS/UHQ-Addon-Reseller).
