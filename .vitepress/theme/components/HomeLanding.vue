<script setup lang="ts">
import { computed } from 'vue';
import { useData, withBase } from 'vitepress';

const { lang } = useData();
const en = computed(() => lang.value.startsWith('en'));
/** Lien vers la page dans la langue courante (la version anglaise vit sous /en/). */
const L = (p: string) => withBase(en.value ? `/en${p}` : p);

// Nombre d'addons officiels gratuits : à tenir à jour avec addons/addons.json du panel.
const ADDON_COUNT = 10;

const T = {
  fr: {
    badge: 'Nouveautés · voir le changelog',
    h1a: 'Le panel proxy', h1b: 'tout-en-un', h1c: 'pour vendre et gérer vos proxies',
    lead: 'Une seule image Docker : panel, moteur proxy, base PostgreSQL et addons officiels. Installé en quelques minutes avec Docker Compose.',
    start: '🚀 Commencer l’installation', hosts: '🌍 Choisir son hébergeur', guide: '📖 Lire le guide',
    termAria: 'Installation en trois commandes', termCmt: "# Sur n'importe quel VPS avec Docker", host: 'panel.exemple.fr',
    s1: 'image Docker unique', s2: 'port proxy TCP', s3: 'addons officiels gratuits', s4: 'panel et documentation',
    stepsT: 'Installé en 4 étapes', stepsS: 'De la machine vierge au premier proxy fonctionnel.',
    steps: [
      ['Un serveur', 'VPS Linux 2 Go de RAM, un domaine, les ports 80, 443, 990 ouverts.'],
      ['Docker Compose', 'Coolify, Dokploy, l’image Docker Hub ou simple <code>docker compose up</code> : tout est dans le compose.'],
      ['Assistant /setup', 'Jeton d’installation dans les logs, vérifications DNS et ports, création de l’admin.'],
      ['Premier compte', 'Checklist « Premiers pas », test en un clic et visite guidée par catégorie.'],
    ],
    whereT: 'Où l’installer ?', whereS: 'Le panel a besoin d’un processus permanent, d’un port TCP public et de PostgreSQL. Voici ce qui fonctionne — et ce qui ne peut pas.',
    hostsList: [
      ['🧊', 'Coolify', 'Docker Compose, HTTPS auto, mises à jour en un clic.', 'Recommandé', '', '/guide/hebergeurs/coolify'],
      ['🚢', 'Dokploy', 'Même principe que Coolify, interface plus légère.', 'Compatible', '', '/guide/hebergeurs/dokploy'],
      ['🖥️', 'VPS + Docker Compose', 'Trois commandes et Caddy pour le HTTPS.', 'Compatible', '', '/guide/hebergeurs/vps'],
      ['🐳', 'Portainer', 'Une stack Git, un reverse proxy devant.', 'Compatible', '', '/guide/hebergeurs/portainer'],
      ['🧢', 'CapRover', 'Possible, mais PostgreSQL et port TCP à gérer.', 'Manuel', 'mid', '/guide/hebergeurs/caprover'],
      ['🚂', 'Railway', 'Via le TCP Proxy, avec des limites de ports.', 'Limité', 'mid', '/guide/hebergeurs/railway'],
      ['▲', 'Vercel · Netlify', 'Serverless : pas de TCP ni de processus permanent.', 'Impossible', 'no', '/guide/hebergeurs/serverless'],
      ['🟣', 'Heroku · Render', 'HTTP seulement : le proxy ne serait pas joignable.', 'Impossible', 'no', '/guide/hebergeurs/serverless'],
    ],
    featT: 'Tout ce qu’il faut, de série', featS: 'Pensé pour les revendeurs : de l’installation à la facturation.',
    feats: [
      ['🌐', 'Moteur proxy TCP', 'Proxy HTTP/CONNECT sur le port 990, rotation, sticky sessions, catégories (pools), ports dédiés, VPN.'],
      ['📊', 'Trafic facturé au réel', 'Comptage côté amont, quotas en Go décimaux, multiplicateur par catégorie, limites de débit.'],
      ['🧩', `${ADDON_COUNT} addons officiels gratuits`, 'Wallet, Orders, Codes promo, Analytics, Reseller, Vitrine, Tickets, Parrainage, Statut et Sécurité (BloumeID).'],
      ['🔒', 'Sécurité intégrée', '2FA, sessions actives, clés API à portée, journal d’audit, IP bannies et liste blanche, empreinte d’appareil.'],
      ['📬', 'E-mails & alertes', 'Modèles personnalisables, aperçu, Discord / Slack, alertes de santé et de quota, page de statut.'],
      ['💾', 'Sauvegardes & restauration', 'Planifiées en local ou S3, restauration depuis /setup, mise à jour automatique du panel.'],
    ],
    exploreT: 'Explorer la documentation',
    explore: [
      ['/guide/mise-en-service', '✅', 'Mise en service', 'Checklist, diagnostics, DNS, Cloudflare et test d’un compte.'],
      ['/guide/visite-guidee', '🧭', 'Visite guidée', 'Relisez une catégorie : pool, comptes, paramètres, sécurité…'],
      ['/addons/overview', '🧩', 'Addons', 'Installer les addons officiels ou créer le vôtre avec un manifest.'],
      ['/guide/sauvegardes', '💾', 'Sauvegardes', 'Planification, S3, restauration depuis l’écran d’installation.'],
      ['/guide/mise-a-jour-automatique', '🔄', 'Mise à jour auto', 'Webhook Coolify, Dokploy, Portainer… en un clic depuis le panel.'],
      ['/api/manifest', '📋', 'Référence API', 'Manifest, zones d’injection, icônes et authentification.'],
    ],
    finalT: 'Prêt à lancer votre panel ?', finalS: 'L’assistant vous guide pas à pas — automatique ou manuel.',
  },
  en: {
    badge: 'What’s new · see the changelog',
    h1a: 'The', h1b: 'all-in-one', h1c: 'proxy panel to sell and manage your proxies',
    lead: 'A single Docker image: panel, proxy engine, PostgreSQL and official add-ons. Installed in minutes with Docker Compose.',
    start: '🚀 Start the installation', hosts: '🌍 Choose a host', guide: '📖 Read the guide',
    termAria: 'Installation in three commands', termCmt: '# On any VPS with Docker', host: 'panel.example.com',
    s1: 'single Docker image', s2: 'TCP proxy port', s3: 'free official add-ons', s4: 'panel and documentation',
    stepsT: 'Installed in 4 steps', stepsS: 'From a blank machine to the first working proxy.',
    steps: [
      ['A server', 'Linux VPS with 2 GB of RAM, a domain, ports 80, 443 and 990 open.'],
      ['Docker Compose', 'Coolify, Dokploy, the Docker Hub image or a plain <code>docker compose up</code>: everything is in the compose file.'],
      ['/setup wizard', 'Installation token in the logs, DNS and port checks, admin account creation.'],
      ['First account', '“Getting started” checklist, one-click test and a guided tour by category.'],
    ],
    whereT: 'Where to install it?', whereS: 'The panel needs a long-running process, a public TCP port and PostgreSQL. Here is what works — and what cannot.',
    hostsList: [
      ['🧊', 'Coolify', 'Docker Compose, automatic HTTPS, one-click updates.', 'Recommended', '', '/guide/hebergeurs/coolify'],
      ['🚢', 'Dokploy', 'Same idea as Coolify, lighter interface.', 'Compatible', '', '/guide/hebergeurs/dokploy'],
      ['🖥️', 'VPS + Docker Compose', 'Three commands and Caddy for HTTPS.', 'Compatible', '', '/guide/hebergeurs/vps'],
      ['🐳', 'Portainer', 'A Git stack with a reverse proxy in front.', 'Compatible', '', '/guide/hebergeurs/portainer'],
      ['🧢', 'CapRover', 'Possible, but PostgreSQL and the TCP port are up to you.', 'Manual', 'mid', '/guide/hebergeurs/caprover'],
      ['🚂', 'Railway', 'Through the TCP Proxy, with port limits.', 'Limited', 'mid', '/guide/hebergeurs/railway'],
      ['▲', 'Vercel · Netlify', 'Serverless: no TCP and no long-running process.', 'Impossible', 'no', '/guide/hebergeurs/serverless'],
      ['🟣', 'Heroku · Render', 'HTTP only: the proxy would not be reachable.', 'Impossible', 'no', '/guide/hebergeurs/serverless'],
    ],
    featT: 'Everything you need, built in', featS: 'Designed for resellers: from installation to billing.',
    feats: [
      ['🌐', 'TCP proxy engine', 'HTTP/CONNECT proxy on port 990, rotation, sticky sessions, categories (pools), dedicated ports, VPN.'],
      ['📊', 'Traffic billed for real', 'Upstream-side metering, quotas in decimal GB, per-category multiplier, rate limits.'],
      ['🧩', `${ADDON_COUNT} free official add-ons`, 'Wallet, Orders, Promo Codes, Analytics, Reseller, Vitrine, Tickets, Referral, Status and Security (BloumeID).'],
      ['🔒', 'Built-in security', '2FA, active sessions, scoped API keys, audit log, IP bans and allow-list, device fingerprinting.'],
      ['📬', 'E-mails & alerts', 'Customisable templates, preview, Discord / Slack, health and quota alerts, status page.'],
      ['💾', 'Backups & restore', 'Scheduled locally or on S3, restore from /setup, automatic panel updates.'],
    ],
    exploreT: 'Explore the documentation',
    explore: [
      ['/guide/mise-en-service', '✅', 'Go-live', 'Checklist, diagnostics, DNS, Cloudflare and account test.'],
      ['/guide/visite-guidee', '🧭', 'Guided tour', 'Review a category: pool, accounts, settings, security…'],
      ['/addons/overview', '🧩', 'Add-ons', 'Install the official add-ons or build your own with a manifest.'],
      ['/guide/sauvegardes', '💾', 'Backups', 'Scheduling, S3, restore from the installation screen.'],
      ['/guide/mise-a-jour-automatique', '🔄', 'Automatic updates', 'Coolify, Dokploy, Portainer webhooks… in one click from the panel.'],
      ['/api/manifest', '📋', 'API reference', 'Manifest, injection zones, icons and authentication.'],
    ],
    finalT: 'Ready to launch your panel?', finalS: 'The wizard guides you step by step — automatic or manual.',
  },
};
const t = computed(() => (en.value ? T.en : T.fr));
</script>

<template>
  <div class="uhq-home">
    <section class="uhq-hero uhq-wrap">
      <a class="uhq-badge" :href="L('/changelog')"><span class="dot"></span> {{ t.badge }}</a>
      <h1>{{ t.h1a }} <span class="uhq-grad">{{ t.h1b }}</span> {{ t.h1c }}</h1>
      <p class="lead">{{ t.lead }}</p>
      <div class="uhq-cta">
        <a class="uhq-btn primary" :href="L('/guide/commencer')">{{ t.start }}</a>
        <a class="uhq-btn" :href="L('/guide/hebergeurs/')">{{ t.hosts }}</a>
        <a class="uhq-btn" :href="L('/guide/introduction')">{{ t.guide }}</a>
      </div>

      <div class="uhq-term" :aria-label="t.termAria">
        <div class="bar"><i></i><i></i><i></i></div>
<pre><span class="c">{{ t.termCmt }}</span>
<span class="k">git clone</span> https://github.com/BloumeSAS/UHQ-Panel-OS.git
<span class="k">cd</span> UHQ-Panel-OS
<span class="k">docker compose up</span> -d --build
<span class="g">✔ Panel     https://{{ t.host }}   (port 8000)</span>
<span class="g">✔ Proxy     {{ t.host }}:990       (TCP)</span></pre>
      </div>

      <div class="uhq-stats">
        <div class="uhq-stat"><b>1</b><span>{{ t.s1 }}</span></div>
        <div class="uhq-stat"><b>990</b><span>{{ t.s2 }}</span></div>
        <div class="uhq-stat"><b>{{ ADDON_COUNT }}</b><span>{{ t.s3 }}</span></div>
        <div class="uhq-stat"><b>FR · EN</b><span>{{ t.s4 }}</span></div>
      </div>
    </section>

    <section class="uhq-sec uhq-wrap">
      <h2>{{ t.stepsT }}</h2>
      <p class="sub">{{ t.stepsS }}</p>
      <div class="uhq-steps">
        <div v-for="s in t.steps" :key="s[0]" class="uhq-step"><h3>{{ s[0] }}</h3><p v-html="s[1]"></p></div>
      </div>
    </section>

    <section class="uhq-sec uhq-wrap">
      <h2>{{ t.whereT }}</h2>
      <p class="sub">{{ t.whereS }}</p>
      <div class="uhq-grid four">
        <a v-for="h in t.hostsList" :key="h[1]" class="uhq-card" :href="L(h[5])">
          <span class="tag" :class="h[4]">{{ h[3] }}</span>
          <div class="ic">{{ h[0] }}</div>
          <h3>{{ h[1] }}</h3>
          <p>{{ h[2] }}</p>
        </a>
      </div>
    </section>

    <section class="uhq-sec uhq-wrap">
      <h2>{{ t.featT }}</h2>
      <p class="sub">{{ t.featS }}</p>
      <div class="uhq-grid">
        <div v-for="f in t.feats" :key="f[1]" class="uhq-card">
          <div class="ic">{{ f[0] }}</div>
          <h3>{{ f[1] }}</h3>
          <p>{{ f[2] }}</p>
        </div>
      </div>
    </section>

    <section class="uhq-sec uhq-wrap">
      <h2>{{ t.exploreT }}</h2>
      <div class="uhq-grid">
        <a v-for="x in t.explore" :key="x[0]" class="uhq-card" :href="L(x[0])"><div class="ic">{{ x[1] }}</div><h3>{{ x[2] }}</h3><p>{{ x[3] }}</p></a>
      </div>
    </section>

    <section class="uhq-wrap">
      <div class="uhq-final">
        <h2>{{ t.finalT }}</h2>
        <p>{{ t.finalS }}</p>
        <div class="uhq-cta">
          <a class="uhq-btn primary" :href="L('/guide/commencer')">{{ t.start }}</a>
          <a class="uhq-btn" href="https://github.com/BloumeSAS/UHQ-Panel-OS" target="_blank" rel="noopener">GitHub</a>
        </div>
      </div>
    </section>
  </div>
</template>
