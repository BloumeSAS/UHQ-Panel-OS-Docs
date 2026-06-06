# UHQ Panel OS - Documentation

Ce dépôt contient la documentation officielle de **UHQ Panel OS**, propulsée par [VitePress](https://vitepress.dev/).

## 🔗 Liens et dépôts

- **Site de documentation en ligne** : [https://uhq-panel-os-docs.bloume.fr](https://uhq-panel-os-docs.bloume.fr)
- **Dépôt officiel principal** : [https://github.com/BloumeSAS/UHQ-Panel-OS](https://github.com/BloumeSAS/UHQ-Panel-OS)
- **Dépôt de la documentation** : [https://github.com/BloumeSAS/UHQ-Panel-OS-Docs](https://github.com/BloumeSAS/UHQ-Panel-OS-Docs)
- **Site officiel Bloume SAS** : [https://bloume.fr](https://bloume.fr)

---

## 🛠️ Développement local

Pour exécuter et modifier la documentation en local, suivez ces étapes :

### 1. Installation des dépendances

Assurez-vous d'avoir Node.js installé, puis lancez :

```bash
npm install
```

### 2. Démarrer le serveur de développement

Lancez le serveur local pour visualiser les modifications en temps réel :

```bash
npm run dev
```

La documentation sera accessible sur `http://localhost:5173` (ou le port indiqué dans la console).

### 3. Builder la documentation

Pour générer la version statique de production :

```bash
npm run build
```

Les fichiers générés se trouveront dans le dossier `.vitepress/dist/`.

### 4. Prévisualiser le build

Pour tester localement le build de production généré :

```bash
npm run preview
```
