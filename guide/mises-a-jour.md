# Mises à jour et redémarrages

## Mettre à jour le panel
Avec Coolify (build depuis GitHub) :
1. Une nouvelle version est publiée sur GitHub (voir le [changelog](/changelog)).
2. Dans Coolify, cliquez sur **Redeploy**.
3. Vérifiez que le **numéro de version dans le pied de page** du panel est celui de la dernière release (aussi visible dans **À propos**).

Le schéma de la base est mis à jour automatiquement au démarrage : aucune migration à lancer.

## Redémarrage du serveur
Quand le serveur (ou Docker) redémarre, le panel peut repartir **avant PostgreSQL**. Depuis la **v2.4.77**, le panel **attend que la base réponde** (jusqu'à 10 minutes) avant de charger quoi que ce soit : réglages, thème, clé API, addons activés et moteur proxy sont donc relus normalement.

::: warning Avant la v2.4.77
Un redémarrage pendant lequel la base n'était pas prête pouvait afficher le thème par défaut, **régénérer la clé API** et laisser les addons éteints. Mettez à jour si vous voyez encore ce comportement.
:::

### Si vos réglages semblent remis à zéro
1. **Ne cliquez pas sur « Enregistrer »** dans les Paramètres : s'ils affichent des valeurs par défaut, vous écraseriez les vraies valeurs.
2. Faites un **Redeploy** (ou redémarrez le conteneur) : les réglages sont relus depuis la base.
3. S'ils sont réellement perdus : [importez-les depuis une sauvegarde](/guide/sauvegardes#_3-importer-seulement-les-reglages).

## Addons après un redémarrage
Les addons officiels embarqués (Wallet, Orders, Analytics) **sont relancés automatiquement** au démarrage s'ils étaient activés. Si l'un d'eux reste éteint, réactivez-le dans **Extensions** et vérifiez les journaux.

## Bonnes pratiques avant une mise à jour du serveur
- Faites une **sauvegarde manuelle** ([Sauvegardes](/guide/sauvegardes)).
- Vérifiez que le volume de données PostgreSQL et le volume `/app/data` sont bien **persistants**.
- Vérifiez la politique de redémarrage des conteneurs (`restart: unless-stopped`).
