import { defineConfig, type DefaultTheme } from 'vitepress';
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

/**
 * Deux langues : français à la racine (URLs inchangées), anglais sous /en/ avec les MÊMES noms de fichiers
 * (en/guide/installation.md ↔ guide/installation.md). Ajouter une page = l'ajouter dans les deux arbres et les deux barres latérales.
 */
type Labels = {
  install: string; hosts: string; chooseHost: string; guide: string; start: string; startInstall: string; installation: string; install5: string;
  configuration: string; tour: string; golive: string; monitoring: string; emails: string; backups: string; customers: string; errors: string;
  traffic: string; updates: string; autoupdate: string; pools: string; vpn: string; addonSystem: string; overview: string; quickstart: string;
  manifest: string; fullRef: string; pages: string; widgets: string; slots: string; translations: string; integrations: string; auth: string;
  backup: string; addonUpdates: string; deploy: string; env: string; official: string; free: string; promocodes: string; referral: string;
  status: string; security: string; apiRef: string; zones: string; icons: string;
};

function nav(p: string, l: Labels): DefaultTheme.NavItem[] {
  return [
    { text: `🚀 ${l.install}`, link: `${p}/guide/commencer` },
    {
      text: `🌍 ${l.hosts}`,
      items: [
        { text: l.chooseHost, link: `${p}/guide/hebergeurs/` },
        { text: 'Coolify (Docker Compose)', link: `${p}/guide/hebergeurs/coolify` },
        { text: 'Dokploy', link: `${p}/guide/hebergeurs/dokploy` },
        { text: 'VPS + Docker Compose', link: `${p}/guide/hebergeurs/vps` },
        { text: 'Vercel, Netlify, Heroku…', link: `${p}/guide/hebergeurs/serverless` },
      ],
    },
    { text: l.guide, link: `${p}/guide/introduction` },
    { text: 'Addons', link: `${p}/addons/overview` },
    { text: 'API', link: `${p}/api/manifest` },
    {
      text: latestVersion,
      items: [
        { text: 'Changelog', link: `${p}/changelog` },
        { text: 'GitHub', link: 'https://github.com/BloumeSAS/UHQ-Panel-OS' },
      ],
    },
  ];
}

function sidebar(p: string, l: Labels): DefaultTheme.Sidebar {
  const f = (s: string) => `${s} (${l.free})`;
  return {
    [`${p}/guide/`]: [
      {
        text: `🌍 ${l.hosts}`,
        items: [
          { text: l.chooseHost, link: `${p}/guide/hebergeurs/` },
          { text: 'Coolify (Docker Compose) ⭐', link: `${p}/guide/hebergeurs/coolify` },
          { text: 'Dokploy', link: `${p}/guide/hebergeurs/dokploy` },
          { text: 'VPS + Docker Compose', link: `${p}/guide/hebergeurs/vps` },
          { text: 'Portainer', link: `${p}/guide/hebergeurs/portainer` },
          { text: 'CapRover', link: `${p}/guide/hebergeurs/caprover` },
          { text: 'Railway', link: `${p}/guide/hebergeurs/railway` },
          { text: 'Vercel, Netlify, Render, Heroku', link: `${p}/guide/hebergeurs/serverless` },
        ],
      },
      {
        text: `🚀 ${l.start}`,
        items: [
          { text: 'Introduction', link: `${p}/guide/introduction` },
          { text: `🚀 ${l.startInstall}`, link: `${p}/guide/commencer` },
          { text: l.installation, link: `${p}/guide/installation` },
          { text: l.install5, link: `${p}/guide/installer-en-5-minutes` },
          { text: l.configuration, link: `${p}/guide/configuration` },
          { text: l.tour, link: `${p}/guide/visite-guidee` },
          { text: l.golive, link: `${p}/guide/mise-en-service` },
          { text: l.monitoring, link: `${p}/guide/surveillance` },
          { text: l.emails, link: `${p}/guide/emails` },
          { text: l.backups, link: `${p}/guide/sauvegardes` },
          { text: l.customers, link: `${p}/guide/clients-et-support` },
          { text: l.errors, link: `${p}/guide/erreurs-et-fallback` },
          { text: l.traffic, link: `${p}/guide/trafic` },
          { text: l.updates, link: `${p}/guide/mises-a-jour` },
          { text: l.autoupdate, link: `${p}/guide/mise-a-jour-automatique` },
          { text: 'Docker & Coolify', link: `${p}/guide/docker` },
          { text: l.pools, link: `${p}/guide/proxy-pools` },
          { text: l.vpn, link: `${p}/guide/vpn` },
        ],
      },
    ],
    [`${p}/addons/`]: [
      { text: `🧩 ${l.addonSystem}`, items: [{ text: l.overview, link: `${p}/addons/overview` }, { text: l.quickstart, link: `${p}/addons/getting-started` }] },
      {
        text: `📄 ${l.manifest}`,
        items: [
          { text: l.fullRef, link: `${p}/addons/manifest` },
          { text: l.pages, link: `${p}/addons/pages` },
          { text: l.widgets, link: `${p}/addons/widgets` },
          { text: l.slots, link: `${p}/addons/slots` },
          { text: l.translations, link: `${p}/addons/translations` },
        ],
      },
      {
        text: `🔧 ${l.integrations}`,
        items: [
          { text: l.auth, link: `${p}/addons/auth` },
          { text: l.backup, link: `${p}/addons/backup` },
          { text: l.addonUpdates, link: `${p}/addons/updates` },
        ],
      },
      { text: `🐳 ${l.deploy}`, items: [{ text: 'Docker & Coolify', link: `${p}/addons/docker` }, { text: l.env, link: `${p}/addons/env` }] },
      {
        text: `📦 ${l.official}`,
        items: [
          { text: f('Wallet'), link: `${p}/addons/official/wallet` },
          { text: f('Orders'), link: `${p}/addons/official/orders` },
          { text: f(l.promocodes), link: `${p}/addons/official/promocodes` },
          { text: f('Vitrine'), link: `${p}/addons/official/vitrine` },
          { text: f('Analytics'), link: `${p}/addons/official/analytics` },
          { text: f('UHQ.Monster Reseller'), link: `${p}/addons/official/reseller` },
          { text: f('Tickets'), link: `${p}/addons/official/tickets` },
          { text: f(l.referral), link: `${p}/addons/official/referral` },
          { text: f(l.status), link: `${p}/addons/official/status` },
          { text: f(l.security), link: `${p}/addons/official/security` },
        ],
      },
    ],
    [`${p}/api/`]: [
      {
        text: `📋 ${l.apiRef}`,
        items: [
          { text: 'uhq-manifest.json', link: `${p}/api/manifest` },
          { text: l.zones, link: `${p}/api/zones` },
          { text: l.icons, link: `${p}/api/icons` },
        ],
      },
    ],
  };
}

const FR: Labels = {
  install: 'Installer', hosts: 'Hébergeurs', chooseHost: 'Choisir son hébergeur', guide: 'Guide', start: 'Démarrage', startInstall: 'Commencer l’installation',
  installation: 'Installation', install5: 'Installer en 5 minutes', configuration: 'Configuration', tour: 'Visite guidée', golive: 'Mise en service',
  monitoring: 'Surveillance & alertes', emails: 'E-mails & modèles', backups: 'Sauvegardes & restauration', customers: 'Clients & support',
  errors: 'Erreurs & fallback', traffic: 'Trafic, quotas & multiplicateur', updates: 'Mises à jour & redémarrages', autoupdate: 'Mise à jour automatique',
  pools: 'Proxy Pools (catégories)', vpn: 'VPN dans les catégories', addonSystem: 'Système d\'addons', overview: 'Vue d\'ensemble', quickstart: 'Démarrage rapide',
  manifest: 'Manifest', fullRef: 'Référence complète', pages: 'Pages (nav)', widgets: 'Widgets (iframes)', slots: 'Slots (topbar)', translations: 'Traductions (i18n)',
  integrations: 'Intégrations', auth: 'Authentification JWT', backup: 'Backup automatique', addonUpdates: 'Mises à jour', deploy: 'Déploiement', env: 'Variables d\'env',
  official: 'Addons officiels', free: 'gratuit', promocodes: 'Codes promo', referral: 'Parrainage', status: 'Statut & incidents', security: 'Sécurité — BloumeID',
  apiRef: 'Référence API', zones: 'Zones disponibles', icons: 'Icônes Lucide',
};
const EN: Labels = {
  install: 'Install', hosts: 'Hosting', chooseHost: 'Choose a host', guide: 'Guide', start: 'Getting started', startInstall: 'Start the installation',
  installation: 'Installation', install5: 'Install in 5 minutes', configuration: 'Configuration', tour: 'Guided tour', golive: 'Go-live',
  monitoring: 'Monitoring & alerts', emails: 'E-mails & templates', backups: 'Backups & restore', customers: 'Customers & support',
  errors: 'Errors & fallback', traffic: 'Traffic, quotas & multiplier', updates: 'Updates & restarts', autoupdate: 'Automatic updates',
  pools: 'Proxy pools (categories)', vpn: 'VPN in categories', addonSystem: 'Add-on system', overview: 'Overview', quickstart: 'Quick start',
  manifest: 'Manifest', fullRef: 'Full reference', pages: 'Pages (nav)', widgets: 'Widgets (iframes)', slots: 'Slots (top bar)', translations: 'Translations (i18n)',
  integrations: 'Integrations', auth: 'JWT authentication', backup: 'Automatic backup', addonUpdates: 'Updates', deploy: 'Deployment', env: 'Environment variables',
  official: 'Official add-ons', free: 'free', promocodes: 'Promo Codes', referral: 'Referral', status: 'Status & incidents', security: 'Security — BloumeID',
  apiRef: 'API reference', zones: 'Available zones', icons: 'Lucide icons',
};

export default defineConfig({
  vite: { server: { allowedHosts: true } },
  ignoreDeadLinks: true,
  title: 'UHQ Panel OS',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }],
    ['meta', { name: 'theme-color', content: '#e8632a' }],
  ],

  locales: {
    root: {
      label: 'Français',
      lang: 'fr-FR',
      description: 'Documentation officielle — Panel proxy & système d\'addons',
      themeConfig: {
        nav: nav('', FR),
        sidebar: sidebar('', FR),
        footer: { message: 'Publié sous licence MIT', copyright: '© 2026 Bloume SAS' },
        lastUpdated: { text: 'Dernière mise à jour' },
        docFooter: { prev: 'Page précédente', next: 'Page suivante' },
        outline: { label: 'Sur cette page', level: [2, 3] },
        langMenuLabel: 'Langue',
        returnToTopLabel: 'Retour en haut',
        sidebarMenuLabel: 'Menu',
        darkModeSwitchLabel: 'Thème',
      },
    },
    en: {
      label: 'English',
      lang: 'en-US',
      link: '/en/',
      description: 'Official documentation — proxy panel & add-on system',
      themeConfig: {
        nav: nav('/en', EN),
        sidebar: sidebar('/en', EN),
        footer: { message: 'Released under the MIT License', copyright: '© 2026 Bloume SAS' },
        lastUpdated: { text: 'Last updated' },
        docFooter: { prev: 'Previous page', next: 'Next page' },
        outline: { label: 'On this page', level: [2, 3] },
      },
    },
  },

  themeConfig: {
    logo: '/logo.png',
    siteTitle: 'UHQ Panel OS',
    socialLinks: [{ icon: 'github', link: 'https://github.com/BloumeSAS/UHQ-Panel-OS' }],
    search: { provider: 'local' },
    editLink: { pattern: 'https://github.com/BloumeSAS/UHQ-Panel-OS-Docs/edit/main/:path', text: 'GitHub' },
  },
});
