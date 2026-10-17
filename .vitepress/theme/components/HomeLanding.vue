<script setup lang="ts">
import { withBase } from 'vitepress';

const hosts = [
  { ic: '🧊', t: 'Coolify', d: 'Docker Compose, HTTPS auto, mises à jour en un clic.', tag: 'Recommandé', cls: '', href: '/guide/hebergeurs/coolify' },
  { ic: '🚢', t: 'Dokploy', d: 'Même principe que Coolify, interface plus légère.', tag: 'Compatible', cls: '', href: '/guide/hebergeurs/dokploy' },
  { ic: '🖥️', t: 'VPS + Docker Compose', d: 'Trois commandes et Caddy pour le HTTPS.', tag: 'Compatible', cls: '', href: '/guide/hebergeurs/vps' },
  { ic: '🐳', t: 'Portainer', d: 'Une stack Git, un reverse proxy devant.', tag: 'Compatible', cls: '', href: '/guide/hebergeurs/portainer' },
  { ic: '🧢', t: 'CapRover', d: 'Possible, mais PostgreSQL et port TCP à gérer.', tag: 'Manuel', cls: 'mid', href: '/guide/hebergeurs/caprover' },
  { ic: '🚂', t: 'Railway', d: 'Via le TCP Proxy, avec des limites de ports.', tag: 'Limité', cls: 'mid', href: '/guide/hebergeurs/railway' },
  { ic: '▲', t: 'Vercel · Netlify', d: 'Serverless : pas de TCP ni de processus permanent.', tag: 'Impossible', cls: 'no', href: '/guide/hebergeurs/serverless' },
  { ic: '🟣', t: 'Heroku · Render', d: 'HTTP seulement : le proxy ne serait pas joignable.', tag: 'Impossible', cls: 'no', href: '/guide/hebergeurs/serverless' },
];

const features = [
  { ic: '🌐', t: 'Moteur proxy TCP', d: 'Proxy HTTP/CONNECT sur le port 990, rotation, sticky sessions, catégories (pools), ports dédiés.' },
  { ic: '📊', t: 'Trafic facturé au réel', d: 'Comptage côté amont, quotas en Go décimaux, multiplicateur par catégorie, limites de débit.' },
  { ic: '🧩', t: 'Addons officiels', d: 'Wallet, Orders, Codes promo, Analytics, Reseller : boutique complète en quelques clics.' },
  { ic: '🔒', t: 'Sécurité intégrée', d: '2FA, sessions actives, clés API à portée, journal d’audit, détection VPN, IP bannies.' },
  { ic: '📬', t: 'E-mails & alertes', d: 'Modèles personnalisables, aperçu, Discord / Slack, alertes de santé et de quota.' },
  { ic: '💾', t: 'Sauvegardes & restauration', d: 'Planifiées en local ou S3, restauration depuis /setup, mise à jour automatique du panel.' },
];
</script>

<template>
  <div class="uhq-home">
    <section class="uhq-hero uhq-wrap">
      <a class="uhq-badge" :href="withBase('/changelog')"><span class="dot"></span> Nouveautés · voir le changelog</a>
      <h1>Le panel proxy <span class="uhq-grad">tout-en-un</span> pour vendre et gérer vos proxies</h1>
      <p class="lead">
        Une seule image Docker : panel, moteur proxy, base PostgreSQL et addons de vente.
        Installé en quelques minutes avec Docker Compose.
      </p>
      <div class="uhq-cta">
        <a class="uhq-btn primary" :href="withBase('/guide/commencer')">🚀 Commencer l’installation</a>
        <a class="uhq-btn" :href="withBase('/guide/hebergeurs/')">🌍 Choisir son hébergeur</a>
        <a class="uhq-btn" :href="withBase('/guide/introduction')">📖 Lire le guide</a>
      </div>

      <div class="uhq-term" aria-label="Installation en trois commandes">
        <div class="bar"><i></i><i></i><i></i></div>
<pre><span class="c"># Sur n'importe quel VPS avec Docker</span>
<span class="k">git clone</span> https://github.com/BloumeSAS/UHQ-Panel-OS.git
<span class="k">cd</span> UHQ-Panel-OS
<span class="k">docker compose up</span> -d --build
<span class="g">✔ Panel     https://panel.exemple.fr   (port 8000)</span>
<span class="g">✔ Proxy     panel.exemple.fr:990       (TCP)</span></pre>
      </div>

      <div class="uhq-stats">
        <div class="uhq-stat"><b>1</b><span>image Docker unique</span></div>
        <div class="uhq-stat"><b>990</b><span>port proxy TCP</span></div>
        <div class="uhq-stat"><b>5</b><span>addons officiels gratuits</span></div>
        <div class="uhq-stat"><b>FR · EN</b><span>panel et documentation</span></div>
      </div>
    </section>

    <section class="uhq-sec uhq-wrap">
      <h2>Installé en 4 étapes</h2>
      <p class="sub">De la machine vierge au premier proxy fonctionnel.</p>
      <div class="uhq-steps">
        <div class="uhq-step"><h3>Un serveur</h3><p>VPS Linux 2 Go de RAM, un domaine, les ports 80, 443, 990 ouverts.</p></div>
        <div class="uhq-step"><h3>Docker Compose</h3><p>Coolify, Dokploy ou simple <code>docker compose up</code> : tout est dans le compose.</p></div>
        <div class="uhq-step"><h3>Assistant /setup</h3><p>Jeton d’installation dans les logs, vérifications DNS et ports, création de l’admin.</p></div>
        <div class="uhq-step"><h3>Premier compte</h3><p>Checklist « Premiers pas », test en un clic et visite guidée par catégorie.</p></div>
      </div>
    </section>

    <section class="uhq-sec uhq-wrap">
      <h2>Où l’installer ?</h2>
      <p class="sub">Le panel a besoin d’un processus permanent, d’un port TCP public et de PostgreSQL. Voici ce qui fonctionne — et ce qui ne peut pas.</p>
      <div class="uhq-grid four">
        <a v-for="h in hosts" :key="h.t" class="uhq-card" :href="withBase(h.href)">
          <span class="tag" :class="h.cls">{{ h.tag }}</span>
          <div class="ic">{{ h.ic }}</div>
          <h3>{{ h.t }}</h3>
          <p>{{ h.d }}</p>
        </a>
      </div>
    </section>

    <section class="uhq-sec uhq-wrap">
      <h2>Tout ce qu’il faut, de série</h2>
      <p class="sub">Pensé pour les revendeurs : de l’installation à la facturation.</p>
      <div class="uhq-grid">
        <div v-for="f in features" :key="f.t" class="uhq-card">
          <div class="ic">{{ f.ic }}</div>
          <h3>{{ f.t }}</h3>
          <p>{{ f.d }}</p>
        </div>
      </div>
    </section>

    <section class="uhq-sec uhq-wrap">
      <h2>Explorer la documentation</h2>
      <div class="uhq-grid">
        <a class="uhq-card" :href="withBase('/guide/mise-en-service')"><div class="ic">✅</div><h3>Mise en service</h3><p>Checklist, diagnostics, DNS, Cloudflare et test d’un compte.</p></a>
        <a class="uhq-card" :href="withBase('/guide/visite-guidee')"><div class="ic">🧭</div><h3>Visite guidée</h3><p>Relisez une catégorie : pool, comptes, paramètres, sécurité…</p></a>
        <a class="uhq-card" :href="withBase('/addons/overview')"><div class="ic">🧩</div><h3>Addons</h3><p>Installer les addons officiels ou créer le vôtre avec un manifest.</p></a>
        <a class="uhq-card" :href="withBase('/guide/sauvegardes')"><div class="ic">💾</div><h3>Sauvegardes</h3><p>Planification, S3, restauration depuis l’écran d’installation.</p></a>
        <a class="uhq-card" :href="withBase('/guide/mise-a-jour-automatique')"><div class="ic">🔄</div><h3>Mise à jour auto</h3><p>Webhook Coolify, Dokploy, Portainer… en un clic depuis le panel.</p></a>
        <a class="uhq-card" :href="withBase('/api/manifest')"><div class="ic">📋</div><h3>Référence API</h3><p>Manifest, zones d’injection, icônes et authentification.</p></a>
      </div>
    </section>

    <section class="uhq-wrap">
      <div class="uhq-final">
        <h2>Prêt à lancer votre panel ?</h2>
        <p>L’assistant vous guide pas à pas — automatique ou manuel.</p>
        <div class="uhq-cta">
          <a class="uhq-btn primary" :href="withBase('/guide/commencer')">🚀 Commencer l’installation</a>
          <a class="uhq-btn" href="https://github.com/BloumeSAS/UHQ-Panel-OS" target="_blank" rel="noopener">GitHub</a>
        </div>
      </div>
    </section>
  </div>
</template>
