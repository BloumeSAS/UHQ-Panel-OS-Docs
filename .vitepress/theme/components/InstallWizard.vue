<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';

type Block =
  | { t: 'p'; text: string }
  | { t: 'code'; lang?: string; text: string; title?: string }
  | { t: 'tip' | 'warn' | 'info'; text: string }
  | { t: 'list'; items: string[] }
  | { t: 'table'; head: string[]; rows: string[][] }
  | { t: 'links'; items: { text: string; href: string }[] };

interface Step {
  id: string;
  title: string;
  time: string;
  icon: string;
  blocks: Block[];
  check?: string[];
}

type Path = 'auto' | 'manual' | 'local';

const STORE = 'uhq-install-wizard-v1';
const path = ref<Path | null>(null);
const current = ref(0);
const done = reactive<Record<string, boolean>>({});
const checked = reactive<Record<string, boolean>>({});
const f = reactive({ domain: 'panel.exemple.fr', proxyDomain: '', ip: '203.0.113.10', port: '990' });
const copied = ref('');

onMounted(() => {
  try {
    const s = JSON.parse(localStorage.getItem(STORE) || '{}');
    if (s.path) path.value = s.path;
    if (typeof s.current === 'number') current.value = s.current;
    Object.assign(done, s.done || {});
    Object.assign(checked, s.checked || {});
    Object.assign(f, s.f || {});
  } catch { /* stockage indisponible : l'assistant fonctionne sans mémoire */ }
});
watch([path, current, f, done, checked], () => {
  try { localStorage.setItem(STORE, JSON.stringify({ path: path.value, current: current.value, done, checked, f })); } catch { /* ignore */ }
}, { deep: true });

const proxyHost = computed(() => (f.proxyDomain.trim() || f.domain.trim() || 'panel.exemple.fr'));
const sameDomain = computed(() => !f.proxyDomain.trim() || f.proxyDomain.trim() === f.domain.trim());
const fill = (s: string) =>
  s.replaceAll('{domain}', f.domain.trim() || 'panel.exemple.fr')
    .replaceAll('{proxyHost}', proxyHost.value)
    .replaceAll('{ip}', f.ip.trim() || '203.0.113.10')
    .replaceAll('{port}', f.port.trim() || '990');

const PATHS: { id: Path; icon: string; title: string; time: string; text: string; for: string }[] = [
  { id: 'auto', icon: '⚡', title: 'Automatique', time: '≈ 15 min', text: 'Coolify installe, relance et met à jour le panel pour vous : HTTPS, redéploiement en un clic, mises à jour depuis le panel.', for: 'Recommandé pour la production' },
  { id: 'manual', icon: '🛠️', title: 'Manuelle', time: '≈ 25 min', text: 'Docker Compose sur n’importe quel VPS, avec votre propre reverse proxy HTTPS (Caddy). Vous gardez la main sur chaque étape.', for: 'Pour les habitués de Docker' },
  { id: 'local', icon: '💻', title: 'Test en local', time: '≈ 3 min', text: 'Essayez le panel sur votre ordinateur avec Docker Desktop, sans domaine ni serveur.', for: 'Pour découvrir' },
];

const commonSetup: Step = {
  id: 'setup',
  title: 'Assistant d’installation (/setup)',
  time: '3 min',
  icon: '🧭',
  blocks: [
    { t: 'p', text: 'Ouvrez **https://{domain}/setup** (ou **http://localhost:8000/setup** en local). L’assistant se déroule en trois temps :' },
    { t: 'list', items: [
      '**Base de données** : cliquez sur « Continuer avec la base intégrée » (PostgreSQL du `docker-compose.yml`).',
      '**Jeton d’installation** : collez la valeur trouvée à l’étape précédente.',
      '**Votre panel** : nom du site, **hôte public du proxy** `{proxyHost}` et port `{port}`, puis votre compte administrateur (e-mail + mot de passe fort).',
    ] },
    { t: 'tip', text: 'Le bloc « Vérification de l’installation » contrôle votre domaine, le port {port} et Cloudflare avant de terminer. Corrigez ce qu’il signale, puis relancez-le.' },
    { t: 'info', text: 'Vous avez déjà une sauvegarde ? Utilisez l’onglet « Restaurer une sauvegarde » : toutes vos données reviennent.' },
  ],
  check: ['Le panel s’affiche et je suis connecté en administrateur', 'La visite guidée s’est lancée'],
};

const tokenStep = (cmd: string, where: string): Step => ({
  id: 'token',
  title: 'Récupérer le jeton d’installation',
  time: '1 min',
  icon: '🔑',
  blocks: [
    { t: 'p', text: 'Pour empêcher qu’un inconnu installe votre panel à votre place, l’écran `/setup` demande un **jeton généré automatiquement au premier démarrage**. Il n’est écrit dans aucun fichier `.env` : il apparaît dans les **logs** du conteneur.' },
    ...(where ? [{ t: 'p', text: where } as Block] : []),
    ...(cmd ? [{ t: 'code', lang: 'bash', text: cmd } as Block] : []),
    { t: 'p', text: 'Cherchez le bloc suivant et copiez la valeur après `TOKEN D’INSTALLATION :`' },
    { t: 'code', lang: 'text', text: '════════════════════════════════════════\n  INSTALLATION À FAIRE — l’écran /setup est protégé.\n  TOKEN D’INSTALLATION : 7f3c…a91d\n════════════════════════════════════════' },
    { t: 'tip', text: 'Vous préférez choisir le jeton ? Définissez la variable `SETUP_TOKEN=votre-valeur`. `SETUP_TOKEN=off` désactive la protection (déconseillé sur Internet). Le jeton est effacé une fois l’installation terminée.' },
  ],
  check: ['J’ai copié le jeton'],
});

const testStep: Step = {
  id: 'test',
  title: 'Créer un premier compte et tester',
  time: '4 min',
  icon: '🧪',
  blocks: [
    { t: 'list', items: [
      '**Pool de proxies** : ajoutez une source dans **Scraper** (ou importez une liste dans **Pool de proxies**), puis lancez un cycle du **Checker**.',
      '**Catégorie** : créez-en une dans **Catégories proxies** (optionnel : domaine et port dédiés).',
      '**Compte proxy** : créez un compte dans **Comptes proxy**, puis cliquez sur **Tester** : le panel fait une vraie requête via le moteur.',
    ] },
    { t: 'p', text: 'Test depuis votre ordinateur (remplacez identifiant et mot de passe) :' },
    { t: 'code', lang: 'bash', text: 'curl -x http://IDENTIFIANT:MOT_DE_PASSE@{proxyHost}:{port} https://api.ipify.org' },
    { t: 'tip', text: 'Si ça échoue, ouvrez **Diagnostic** dans le panel : il indique l’enregistrement DNS à créer, détecte Cloudflare (nuage orange) et teste le port.' },
  ],
  check: ['Un compte proxy répond avec une IP différente de la mienne'],
};

const stepsFor = (p: Path): Step[] => {
  const prereq: Step = {
    id: 'prereq',
    title: 'Préparer le serveur',
    time: '5 min',
    icon: '📋',
    blocks: p === 'local'
      ? [
        { t: 'list', items: ['**Docker Desktop** (Windows / macOS) ou Docker Engine (Linux) en version 24+', '**Git** installé', 'Les ports **8000** et **990** libres sur votre machine'] },
        { t: 'code', lang: 'bash', text: 'docker --version\ndocker compose version\ngit --version' },
      ]
      : [
        { t: 'table', head: ['Élément', 'Minimum conseillé'], rows: [['Serveur (VPS)', '2 vCPU · 2 Go RAM · 20 Go disque · Ubuntu 22.04+ / Debian 12+'], ['Domaine', 'Un nom de domaine dont vous gérez la zone DNS'], ['Ports ouverts', '22 (SSH), 80 et 443 (HTTPS), {port} (proxy), 9000-9250 (ports dédiés, optionnel)'], ['IP publique', 'Notée : {ip}']] },
        { t: 'warn', text: 'Le proxy TCP (port {port}) **ne passe pas** par Cloudflare orange ni par un reverse proxy HTTP : il doit être joignable directement sur l’IP du serveur.' },
      ],
    check: p === 'local' ? ['Docker fonctionne'] : ['Mon VPS est accessible en SSH', 'J’ai un domaine'],
  };

  const dns: Step = {
    id: 'dns',
    title: 'Configurer le DNS',
    time: '3 min',
    icon: '🌐',
    blocks: [
      { t: 'p', text: 'Dans la zone DNS de votre domaine, créez :' },
      { t: 'table', head: ['Type', 'Nom', 'Valeur', 'Proxy (Cloudflare)'], rows: sameDomain.value
        ? [['A', '{domain}', '{ip}', '**DNS seul** (nuage gris)']]
        : [['A', '{domain}', '{ip}', 'au choix (nuage orange accepté)'], ['A', '{proxyHost}', '{ip}', '**DNS seul** (nuage gris) — obligatoire']] },
      { t: 'tip', text: sameDomain.value ? 'Un seul domaine suffit : gardez-le en **nuage gris**. Vous voulez profiter de Cloudflare pour le panel ? Utilisez un second sous-domaine pour le proxy (champ « Domaine du proxy » en haut de l’assistant).' : 'Le sous-domaine du proxy doit rester en **nuage gris** : Cloudflare ne transmet pas le trafic TCP du proxy.' },
      { t: 'code', lang: 'bash', text: 'nslookup {domain}' },
    ],
    check: ['Le domaine pointe vers l’IP de mon serveur'],
  };

  const backups: Step = {
    id: 'backups',
    title: 'Sauvegardes et mises à jour',
    time: '4 min',
    icon: '💾',
    blocks: [
      { t: 'list', items: [
        '**Paramètres → Sauvegardes** : activez les sauvegardes automatiques (local, ou S3 / Cloudflare R2 / MinIO) et testez-en une.',
        '**Paramètres → Sécurité** : exigez la double authentification (2FA) pour les administrateurs.',
        p === 'auto'
          ? '**Paramètres → Général → Mise à jour automatique** : choisissez « Coolify », collez l’URL du Deploy Webhook et le jeton API : le bouton **Mettre à jour maintenant** de la page À propos fait le reste.'
          : '**Mise à jour** : `git pull && docker compose up -d --build` (ou une plateforme avec webhook : voir la préconfiguration adaptée dans Paramètres → Général).',
      ] },
      { t: 'links', items: [{ text: 'Sauvegardes & restauration', href: '/guide/sauvegardes' }, { text: 'Mise à jour automatique', href: '/guide/mise-a-jour-automatique' }] },
    ],
    check: ['Une sauvegarde de test a réussi'],
  };

  const addons: Step = {
    id: 'addons',
    title: 'E-mails et addons (facultatif)',
    time: '5 min',
    icon: '🧩',
    blocks: [
      { t: 'list', items: [
        '**SMTP & e-mails** : renseignez votre serveur SMTP ; chaque e-mail (bienvenue, mot de passe, commandes…) s’active, se prévisualise et se personnalise.',
        '**Extensions** : activez **Wallet** (solde), **Orders** (boutique, paiement Stripe / PayPal / crypto), **Codes promo** et **Analytics** en un clic.',
        '**Page /status** : publiez l’état de votre service (addons et ports compris).',
      ] },
      { t: 'links', items: [{ text: 'E-mails', href: '/guide/emails' }, { text: 'Addons officiels', href: '/addons/overview' }] },
    ],
  };

  if (p === 'local') {
    return [
      prereq,
      { id: 'run', title: 'Lancer le panel', time: '2 min', icon: '🚀', blocks: [
        { t: 'code', lang: 'bash', text: 'git clone https://github.com/BloumeSAS/UHQ-Panel-OS\ncd UHQ-Panel-OS\ndocker compose up -d --build' },
        { t: 'p', text: 'La première construction prend quelques minutes. Suivez-la avec :' },
        { t: 'code', lang: 'bash', text: 'docker compose logs -f app' },
        { t: 'tip', text: 'Quand vous lisez « Application started », le panel répond sur **http://localhost:8000** et le proxy sur **localhost:{port}**.' },
      ], check: ['http://localhost:8000 répond'] },
      tokenStep('docker compose logs app | grep -A1 "TOKEN"', 'Dans le dossier du projet :'),
      commonSetup,
      testStep,
    ];
  }

  if (p === 'manual') {
    return [
      prereq,
      { id: 'docker', title: 'Installer Docker', time: '3 min', icon: '🐳', blocks: [
        { t: 'p', text: 'Sur le serveur (en SSH) :' },
        { t: 'code', lang: 'bash', text: 'curl -fsSL https://get.docker.com | sudo sh\nsudo usermod -aG docker $USER\n# reconnectez-vous en SSH, puis :\ndocker compose version' },
        { t: 'p', text: 'Ouvrez les ports nécessaires (exemple avec UFW) :' },
        { t: 'code', lang: 'bash', text: 'sudo ufw allow 22/tcp\nsudo ufw allow 80,443/tcp\nsudo ufw allow {port}/tcp\nsudo ufw allow 9000:9250/tcp   # ports dédiés (optionnel)\nsudo ufw enable' },
      ], check: ['`docker compose version` répond'] },
      dns,
      { id: 'run', title: 'Récupérer et lancer le panel', time: '5 min', icon: '🚀', blocks: [
        { t: 'code', lang: 'bash', text: 'git clone https://github.com/BloumeSAS/UHQ-Panel-OS\ncd UHQ-Panel-OS\ndocker compose up -d --build\ndocker compose logs -f app' },
        { t: 'info', text: 'Les données sont conservées dans les volumes `uhq-panel-pgdata` et `uhq-panel-appdata` : elles survivent aux mises à jour.' },
      ], check: ['Le conteneur « app » est démarré'] },
      { id: 'https', title: 'HTTPS avec Caddy', time: '4 min', icon: '🔒', blocks: [
        { t: 'p', text: 'Caddy obtient et renouvelle automatiquement le certificat. Installez-le (voir caddyserver.com/docs/install) puis éditez `/etc/caddy/Caddyfile` :' },
        { t: 'code', lang: 'text', title: 'Caddyfile', text: '{domain} {\n    reverse_proxy localhost:8000\n}' },
        { t: 'code', lang: 'bash', text: 'sudo systemctl reload caddy' },
        { t: 'warn', text: 'Seul le port **8000** (web) passe par Caddy. Le port **{port}** (proxy TCP) reste exposé directement par Docker.' },
      ], check: ['https://{domain} affiche le panel'] },
      tokenStep('cd UHQ-Panel-OS\ndocker compose logs app | grep -A1 "TOKEN"', 'Sur le serveur, dans le dossier du projet :'),
      commonSetup,
      testStep,
      backups,
      addons,
    ];
  }

  return [
    prereq,
    { id: 'coolify', title: 'Installer Coolify', time: '4 min', icon: '🧊', blocks: [
      { t: 'p', text: 'Sur un serveur vierge (en SSH, utilisateur root ou sudo) :' },
      { t: 'code', lang: 'bash', text: 'curl -fsSL https://cdn.coollabs.io/coolify/install.sh | sudo bash' },
      { t: 'p', text: 'À la fin, ouvrez **http://{ip}:8000** et créez votre compte administrateur Coolify.' },
      { t: 'tip', text: 'Coolify possède son propre panneau sur le port 8000 : le panel UHQ, lui, sera servi sur votre domaine via Traefik (HTTPS automatique).' },
    ], check: ['Je suis connecté à Coolify'] },
    dns,
    { id: 'app', title: 'Créer l’application dans Coolify', time: '4 min', icon: '📦', blocks: [
      { t: 'list', items: [
        '**Projects → Add → New Resource → Public Repository**',
        'Dépôt : `https://github.com/BloumeSAS/UHQ-Panel-OS` — branche `main`',
        '**Build Pack : Docker Compose**, fichier `docker-compose.yml`',
        'Domaine du service **app** : `https://{domain}` (port **8000**)',
      ] },
      { t: 'warn', text: 'Ne mettez **aucun domaine** sur le port {port} : c’est du TCP, pas du HTTP. Il est publié directement sur l’hôte par le compose.' },
      { t: 'code', lang: 'bash', text: 'sudo ufw allow {port}/tcp\nsudo ufw allow 9000:9250/tcp   # ports dédiés (optionnel)' },
    ], check: ['L’application est créée avec son domaine'] },
    { id: 'deploy', title: 'Déployer', time: '5 min', icon: '🚀', blocks: [
      { t: 'p', text: 'Cliquez sur **Deploy**. La première construction dure quelques minutes ; suivez-la dans l’onglet **Deployments**.' },
      { t: 'tip', text: 'Quand le statut passe à **Running**, `https://{domain}/health` répond `{"status":"running"…}`.' },
    ], check: ['Le déploiement est en « Running »'] },
    tokenStep('', 'Dans Coolify : votre application → onglet **Logs** (le conteneur « app »). Cherchez « TOKEN D’INSTALLATION ».'),
    commonSetup,
    testStep,
    backups,
    addons,
  ];
};

const steps = computed(() => (path.value ? stepsFor(path.value) : []));
const step = computed(() => steps.value[current.value]);
const progress = computed(() => (steps.value.length ? Math.round((steps.value.filter((s) => done[`${path.value}:${s.id}`]).length / steps.value.length) * 100) : 0));
const finished = computed(() => steps.value.length > 0 && current.value >= steps.value.length);

function choose(p: Path) { path.value = p; current.value = 0; }
function restart() { path.value = null; current.value = 0; for (const k of Object.keys(done)) delete done[k]; for (const k of Object.keys(checked)) delete checked[k]; }
function go(i: number) { current.value = Math.max(0, Math.min(steps.value.length, i)); if (typeof window !== 'undefined') window.scrollTo({ top: (document.querySelector('.iw') as HTMLElement | null)?.offsetTop ?? 0, behavior: 'smooth' }); }
function next() { if (step.value) done[`${path.value}:${step.value.id}`] = true; go(current.value + 1); }
async function copy(text: string, key: string) {
  try { await navigator.clipboard.writeText(fill(text)); copied.value = key; setTimeout(() => (copied.value = ''), 1400); } catch { /* presse-papiers indisponible */ }
}
const md = (s: string) => fill(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  .replace(/`([^`]+)`/g, '<code>$1</code>');
</script>

<template>
  <div class="iw">
    <!-- Choix du parcours -->
    <section v-if="!path" class="iw-choose">
      <div class="iw-hero">
        <h2>Comment voulez-vous installer UHQ Panel OS ?</h2>
        <p>Choisissez un parcours : l’assistant vous guide pas à pas, avec des commandes prêtes à copier et vos propres valeurs.</p>
      </div>
      <div class="iw-cards">
        <button v-for="p in PATHS" :key="p.id" class="iw-card" @click="choose(p.id)">
          <span class="iw-card-icon">{{ p.icon }}</span>
          <span class="iw-card-title">{{ p.title }}</span>
          <span class="iw-card-time">{{ p.time }}</span>
          <span class="iw-card-text">{{ p.text }}</span>
          <span class="iw-card-for">{{ p.for }}</span>
          <span class="iw-card-go">Commencer →</span>
        </button>
      </div>
    </section>

    <!-- Parcours -->
    <section v-else class="iw-run">
      <header class="iw-top">
        <div>
          <span class="iw-badge">{{ PATHS.find((p) => p.id === path)?.icon }} Installation {{ PATHS.find((p) => p.id === path)?.title.toLowerCase() }}</span>
          <div class="iw-progress" role="progressbar" :aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100"><span :style="{ width: progress + '%' }" /></div>
          <small>{{ progress }} % — étape {{ Math.min(current + 1, steps.length) }} sur {{ steps.length }}</small>
        </div>
        <button class="iw-link" @click="restart">Changer de parcours</button>
      </header>

      <details v-if="path !== 'local'" class="iw-values" open>
        <summary>Vos valeurs (injectées dans toutes les commandes)</summary>
        <div class="iw-values-grid">
          <label>Domaine du panel<input v-model="f.domain" placeholder="panel.exemple.fr" spellcheck="false" /></label>
          <label>Domaine du proxy <em>(facultatif)</em><input v-model="f.proxyDomain" placeholder="proxy.exemple.fr" spellcheck="false" /></label>
          <label>IP publique du serveur<input v-model="f.ip" placeholder="203.0.113.10" spellcheck="false" /></label>
          <label>Port du proxy<input v-model="f.port" placeholder="990" inputmode="numeric" /></label>
        </div>
      </details>

      <div class="iw-layout">
        <nav class="iw-steps" aria-label="Étapes">
          <button v-for="(s, i) in steps" :key="s.id" :class="['iw-step', { active: i === current, ok: done[path + ':' + s.id] }]" @click="go(i)">
            <span class="iw-dot">{{ done[path + ':' + s.id] ? '✓' : i + 1 }}</span>
            <span class="iw-step-text"><b>{{ s.title }}</b><small>{{ s.time }}</small></span>
          </button>
        </nav>

        <article class="iw-body">
          <template v-if="!finished && step">
            <div class="iw-body-head">
              <span class="iw-body-icon">{{ step.icon }}</span>
              <div><h3>{{ step.title }}</h3><small>≈ {{ step.time }}</small></div>
            </div>

            <template v-for="(b, bi) in step.blocks" :key="bi">
              <p v-if="b.t === 'p'" v-html="md(b.text)" />
              <ul v-else-if="b.t === 'list'" class="iw-list"><li v-for="(it, ii) in b.items" :key="ii" v-html="md(it)" /></ul>
              <div v-else-if="b.t === 'code'" class="iw-code">
                <div class="iw-code-bar"><span>{{ b.title || b.lang || 'terminal' }}</span>
                  <button @click="copy(b.text, step.id + bi)">{{ copied === step.id + bi ? 'Copié ✓' : 'Copier' }}</button></div>
                <pre><code>{{ fill(b.text) }}</code></pre>
              </div>
              <div v-else-if="b.t === 'table'" class="iw-table-wrap">
                <table><thead><tr><th v-for="h in b.head" :key="h">{{ h }}</th></tr></thead>
                  <tbody><tr v-for="(r, ri) in b.rows" :key="ri"><td v-for="(c, ci) in r" :key="ci" v-html="md(c)" /></tr></tbody></table>
              </div>
              <div v-else-if="b.t === 'links'" class="iw-links"><a v-for="l in b.items" :key="l.href" :href="l.href">{{ l.text }} →</a></div>
              <div v-else :class="['iw-note', b.t]"><span class="iw-note-icon">{{ b.t === 'tip' ? '💡' : b.t === 'warn' ? '⚠️' : 'ℹ️' }}</span><span v-html="md(b.text)" /></div>
            </template>

            <ul v-if="step.check?.length" class="iw-checks">
              <li v-for="c in step.check" :key="c"><label><input type="checkbox" v-model="checked[path + ':' + step.id + ':' + c]" /> <span v-html="md(c)" /></label></li>
            </ul>

            <div class="iw-nav">
              <button class="iw-btn ghost" :disabled="current === 0" @click="go(current - 1)">← Précédent</button>
              <button class="iw-btn" @click="next">{{ current === steps.length - 1 ? 'Terminer ✓' : 'Étape suivante →' }}</button>
            </div>
          </template>

          <div v-else class="iw-finish">
            <div class="iw-finish-icon">🎉</div>
            <h3>Votre panel est installé</h3>
            <p>Bravo ! Voici les prochaines étapes pour bien démarrer :</p>
            <div class="iw-links big">
              <a href="/guide/mise-en-service">Mise en service →</a>
              <a href="/guide/visite-guidee">Visite guidée →</a>
              <a href="/guide/emails">E-mails personnalisés →</a>
              <a href="/addons/overview">Addons officiels →</a>
              <a href="/guide/mise-a-jour-automatique">Mises à jour automatiques →</a>
            </div>
            <button class="iw-btn ghost" @click="go(0)">Revoir les étapes</button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<style scoped>
.iw { margin: 1.5rem 0; --iw-radius: 14px; }
.iw button { font-family: inherit; cursor: pointer; }
.iw-hero h2 { margin: 0 0 .4rem; border: 0; padding: 0; font-size: 1.5rem; }
.iw-hero p { margin: 0 0 1.4rem; color: var(--vp-c-text-2); }
.iw-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1rem; }
.iw-card { display: flex; flex-direction: column; gap: .45rem; text-align: left; padding: 1.2rem; border: 1px solid var(--vp-c-divider); border-radius: var(--iw-radius); background: var(--vp-c-bg-soft); color: var(--vp-c-text-1); transition: transform .15s, border-color .15s, box-shadow .15s; }
.iw-card:hover { transform: translateY(-3px); border-color: var(--vp-c-brand-1); box-shadow: 0 10px 28px -14px var(--vp-c-brand-1); }
.iw-card-icon { font-size: 1.9rem; }
.iw-card-title { font-size: 1.15rem; font-weight: 700; }
.iw-card-time { font-size: .78rem; color: var(--vp-c-brand-1); font-weight: 600; }
.iw-card-text { font-size: .88rem; color: var(--vp-c-text-2); line-height: 1.5; flex: 1; }
.iw-card-for { font-size: .75rem; padding: .15rem .55rem; border-radius: 999px; background: var(--vp-c-brand-soft); color: var(--vp-c-brand-1); align-self: flex-start; font-weight: 600; }
.iw-card-go { margin-top: .4rem; font-weight: 700; color: var(--vp-c-brand-1); }

.iw-top { display: flex; justify-content: space-between; align-items: flex-end; gap: 1rem; flex-wrap: wrap; margin-bottom: 1rem; }
.iw-badge { display: inline-block; font-weight: 700; margin-bottom: .45rem; }
.iw-progress { height: 8px; width: min(420px, 80vw); border-radius: 999px; background: var(--vp-c-bg-soft); overflow: hidden; border: 1px solid var(--vp-c-divider); }
.iw-progress span { display: block; height: 100%; background: linear-gradient(90deg, var(--vp-c-brand-1), var(--vp-c-brand-2)); transition: width .3s; }
.iw-top small { color: var(--vp-c-text-2); }
.iw-link { background: none; border: 0; color: var(--vp-c-text-2); text-decoration: underline; font-size: .85rem; }

.iw-values { border: 1px solid var(--vp-c-divider); border-radius: var(--iw-radius); padding: .7rem 1rem; margin-bottom: 1rem; background: var(--vp-c-bg-soft); }
.iw-values summary { cursor: pointer; font-weight: 600; font-size: .9rem; }
.iw-values-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: .7rem; margin-top: .7rem; }
.iw-values label { display: flex; flex-direction: column; gap: .25rem; font-size: .78rem; color: var(--vp-c-text-2); }
.iw-values input { padding: .45rem .6rem; border: 1px solid var(--vp-c-divider); border-radius: 8px; background: var(--vp-c-bg); color: var(--vp-c-text-1); font-family: var(--vp-font-family-mono); font-size: .85rem; }
.iw-values input:focus { outline: 2px solid var(--vp-c-brand-1); outline-offset: 1px; }

.iw-layout { display: grid; grid-template-columns: 250px minmax(0, 1fr); gap: 1.2rem; align-items: start; }
@media (max-width: 860px) { .iw-layout { grid-template-columns: 1fr; } .iw-steps { flex-direction: row !important; overflow-x: auto; padding-bottom: .3rem; position: static !important; } .iw-step { min-width: 190px; flex: 0 0 auto; } }
.iw-steps { display: flex; flex-direction: column; gap: .35rem; position: sticky; top: calc(var(--vp-nav-height) + 1rem); }
.iw-step { display: flex; align-items: center; gap: .65rem; text-align: left; padding: .55rem .65rem; border-radius: 10px; border: 1px solid transparent; background: transparent; color: var(--vp-c-text-1); }
.iw-step:hover { background: var(--vp-c-bg-soft); }
.iw-step.active { background: var(--vp-c-brand-soft); border-color: var(--vp-c-brand-1); }
.iw-dot { flex: 0 0 auto; width: 26px; height: 26px; border-radius: 50%; display: grid; place-items: center; font-size: .78rem; font-weight: 700; background: var(--vp-c-bg-soft); border: 1px solid var(--vp-c-divider); }
.iw-step.ok .iw-dot { background: #16a34a; border-color: #16a34a; color: #fff; }
.iw-step.active .iw-dot { background: var(--vp-c-brand-1); border-color: var(--vp-c-brand-1); color: #fff; }
.iw-step-text { display: flex; flex-direction: column; line-height: 1.25; min-width: 0; }
.iw-step-text b { font-size: .85rem; font-weight: 600; }
.iw-step-text small { color: var(--vp-c-text-3); font-size: .72rem; }

.iw-body { border: 1px solid var(--vp-c-divider); border-radius: var(--iw-radius); padding: 1.3rem 1.4rem; background: var(--vp-c-bg); min-width: 0; }
.iw-body-head { display: flex; gap: .8rem; align-items: center; margin-bottom: 1rem; }
.iw-body-head h3 { margin: 0; border: 0; padding: 0; font-size: 1.25rem; }
.iw-body-head small { color: var(--vp-c-text-3); }
.iw-body-icon { font-size: 1.7rem; width: 48px; height: 48px; display: grid; place-items: center; background: var(--vp-c-brand-soft); border-radius: 12px; }
.iw-body p { margin: .6rem 0; line-height: 1.6; }
.iw-list { padding-left: 1.2rem; margin: .6rem 0; line-height: 1.65; }
.iw-code { margin: .8rem 0; border-radius: 10px; overflow: hidden; border: 1px solid var(--vp-c-divider); background: var(--vp-code-block-bg); }
.iw-code-bar { display: flex; justify-content: space-between; align-items: center; padding: .3rem .7rem; font-size: .72rem; color: var(--vp-c-text-3); border-bottom: 1px solid var(--vp-c-divider); text-transform: uppercase; letter-spacing: .04em; }
.iw-code-bar button { border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg); color: var(--vp-c-text-1); border-radius: 6px; padding: .12rem .55rem; font-size: .72rem; }
.iw-code-bar button:hover { border-color: var(--vp-c-brand-1); color: var(--vp-c-brand-1); }
.iw-code pre { margin: 0; padding: .8rem 1rem; overflow-x: auto; font-size: .82rem; line-height: 1.55; }
.iw-code code { font-family: var(--vp-font-family-mono); white-space: pre; }
.iw-note { display: flex; gap: .6rem; padding: .7rem .9rem; border-radius: 10px; margin: .8rem 0; font-size: .9rem; line-height: 1.55; border: 1px solid; }
.iw-note.tip { background: rgba(22, 163, 74, .08); border-color: rgba(22, 163, 74, .35); }
.iw-note.warn { background: rgba(234, 88, 12, .09); border-color: rgba(234, 88, 12, .4); }
.iw-note.info { background: rgba(59, 130, 246, .08); border-color: rgba(59, 130, 246, .35); }
.iw-table-wrap { margin: .8rem 0; }
.iw-table-wrap table { margin: 0; font-size: .86rem; }
.iw-checks { list-style: none; padding: .8rem 1rem; margin: 1.1rem 0 0; border-radius: 10px; background: var(--vp-c-bg-soft); display: grid; gap: .45rem; }
.iw-checks label { display: flex; gap: .55rem; align-items: center; cursor: pointer; font-size: .9rem; }
.iw-checks input { width: 17px; height: 17px; accent-color: var(--vp-c-brand-1); }
.iw-links { display: flex; flex-wrap: wrap; gap: .5rem; margin: .8rem 0; }
.iw-links a { padding: .35rem .8rem; border-radius: 999px; border: 1px solid var(--vp-c-divider); font-size: .85rem; text-decoration: none; }
.iw-links a:hover { border-color: var(--vp-c-brand-1); }
.iw-links.big a { padding: .6rem 1rem; font-weight: 600; }
.iw-nav { display: flex; justify-content: space-between; margin-top: 1.4rem; gap: .6rem; }
.iw-btn { padding: .6rem 1.2rem; border-radius: 10px; border: 1px solid var(--vp-c-brand-1); background: var(--vp-c-brand-1); color: #fff; font-weight: 700; font-size: .92rem; }
.iw-btn:hover { background: var(--vp-c-brand-2); }
.iw-btn.ghost { background: transparent; color: var(--vp-c-text-1); border-color: var(--vp-c-divider); }
.iw-btn:disabled { opacity: .4; cursor: not-allowed; }
.iw-finish { text-align: center; padding: 1.5rem 0; }
.iw-finish-icon { font-size: 3rem; }
.iw-finish h3 { border: 0; margin: .3rem 0; }
.iw-finish .iw-links { justify-content: center; }
</style>
