import { defineConfig } from 'vitepress';
import { readFileSync } from 'node:fs';

// Dernière version publiée = première entrée "### vX.Y.Z" du changelog (mise à jour à chaque release).
const latestVersion = (() => {
  try {
    const m = readFileSync(new URL('../changelog.md', import.meta.url), 'utf8').match(/^### (v\d+\.\d+\.\d+)/m);
    return m ? m[1] : 'Changelog';
  } catch {
    return 'Changelog';
  }
})();

export default defineConfig({
  vite: {
    server: {
      allowedHosts: true,
    },
  },
  ignoreDeadLinks: true,
  title: 'UHQ Panel OS',
  description: 'Documentation officielle — Panel proxy & système d\'addons',
  lang: 'fr-FR',

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#e8632a' }],
  ],

  themeConfig: {
    logo: '/logo.png',
    siteTitle: 'UHQ Panel OS',

    nav: [
      { text: '🚀 Installer', link: '/guide/commencer' },
      {
        text: '🌍 Hébergeurs',
        items: [
          { text: 'Choisir son hébergeur', link: '/guide/hebergeurs/' },
          { text: 'Coolify (Docker Compose)', link: '/guide/hebergeurs/coolify' },
          { text: 'Dokploy', link: '/guide/hebergeurs/dokploy' },
          { text: 'VPS + Docker Compose', link: '/guide/hebergeurs/vps' },
          { text: 'Vercel, Netlify, Heroku…', link: '/guide/hebergeurs/serverless' },
        ],
      },
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'Addons', link: '/addons/overview' },
      { text: 'API', link: '/api/manifest' },
      {
        text: latestVersion,
        items: [
          { text: 'Changelog', link: '/changelog' },
          { text: 'GitHub', link: 'https://github.com/bloumesas/uhq-panel-os' },
        ],
      },
    ],

    sidebar: {
      '/guide/': [
        {
          text: '🌍 Hébergeurs',
          items: [
            { text: 'Choisir son hébergeur', link: '/guide/hebergeurs/' },
            { text: 'Coolify (Docker Compose) ⭐', link: '/guide/hebergeurs/coolify' },
            { text: 'Dokploy', link: '/guide/hebergeurs/dokploy' },
            { text: 'VPS + Docker Compose', link: '/guide/hebergeurs/vps' },
            { text: 'Portainer', link: '/guide/hebergeurs/portainer' },
            { text: 'CapRover', link: '/guide/hebergeurs/caprover' },
            { text: 'Railway', link: '/guide/hebergeurs/railway' },
            { text: 'Vercel, Netlify, Render, Heroku', link: '/guide/hebergeurs/serverless' },
          ],
        },
        {
          text: '🚀 Démarrage',
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: '🚀 Commencer l’installation', link: '/guide/commencer' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Installer en 5 minutes', link: '/guide/installer-en-5-minutes' },
            { text: 'Configuration', link: '/guide/configuration' },
            { text: 'Visite guidée', link: '/guide/visite-guidee' },
            { text: 'Mise en service', link: '/guide/mise-en-service' },
            { text: 'Surveillance & alertes', link: '/guide/surveillance' },
            { text: 'E-mails & modèles', link: '/guide/emails' },
            { text: 'Sauvegardes & restauration', link: '/guide/sauvegardes' },
            { text: 'Clients & support', link: '/guide/clients-et-support' },
            { text: 'Erreurs & fallback', link: '/guide/erreurs-et-fallback' },
            { text: 'Trafic, quotas & multiplicateur', link: '/guide/trafic' },
            { text: 'Mises à jour & redémarrages', link: '/guide/mises-a-jour' },
            { text: 'Mise à jour automatique', link: '/guide/mise-a-jour-automatique' },
            { text: 'Docker & Coolify', link: '/guide/docker' },
            { text: 'Proxy Pools (catégories)', link: '/guide/proxy-pools' },
          ],
        },
      ],
      '/addons/': [
        {
          text: '🧩 Système d\'addons',
          items: [
            { text: 'Vue d\'ensemble', link: '/addons/overview' },
            { text: 'Démarrage rapide', link: '/addons/getting-started' },
          ],
        },
        {
          text: '📄 Manifest',
          items: [
            { text: 'Référence complète', link: '/addons/manifest' },
            { text: 'Pages (nav)', link: '/addons/pages' },
            { text: 'Widgets (iframes)', link: '/addons/widgets' },
            { text: 'Slots (topbar)', link: '/addons/slots' },
            { text: 'Traductions (i18n)', link: '/addons/translations' },
          ],
        },
        {
          text: '🔧 Intégrations',
          items: [
            { text: 'Authentification JWT', link: '/addons/auth' },
            { text: 'Backup automatique', link: '/addons/backup' },
            { text: 'Mises à jour', link: '/addons/updates' },
          ],
        },
        {
          text: '🐳 Déploiement',
          items: [
            { text: 'Docker & Coolify', link: '/addons/docker' },
            { text: 'Variables d\'env', link: '/addons/env' },
          ],
        },
        {
          text: '📦 Addons officiels',
          items: [
            { text: 'Wallet (gratuit)', link: '/addons/official/wallet' },
            { text: 'Orders (gratuit)', link: '/addons/official/orders' },
            { text: 'Codes promo (gratuit)', link: '/addons/official/promocodes' },
            { text: 'Analytics (gratuit)', link: '/addons/official/analytics' },
            { text: 'UHQ.Monster Reseller (gratuit)', link: '/addons/official/reseller' },
          ],
        },
      ],
      '/api/': [
        {
          text: '📋 Référence API',
          items: [
            { text: 'uhq-manifest.json', link: '/api/manifest' },
            { text: 'Zones disponibles', link: '/api/zones' },
            { text: 'Icônes Lucide', link: '/api/icons' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/bloumesas/uhq-panel-os' },
    ],

    footer: {
      message: 'Publié sous licence MIT',
      copyright: '© 2026 Bloume SAS',
    },

    search: { provider: 'local' },

    editLink: {
      pattern: 'https://github.com/bloumesas/uhq-panel-os/edit/main/docs/:path',
      text: 'Modifier cette page',
    },

    lastUpdated: { text: 'Dernière mise à jour' },

    docFooter: {
      prev: 'Page précédente',
      next: 'Page suivante',
    },

    outline: {
      label: 'Sur cette page',
      level: [2, 3],
    },
  },
});
