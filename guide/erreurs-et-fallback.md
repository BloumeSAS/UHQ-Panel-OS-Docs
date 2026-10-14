# Erreurs renvoyées aux clients & fallback par catégorie

## Les erreurs sont toujours les vôtres

Le client ne voit **jamais** l'erreur réelle d'un proxy amont (fournisseur, proxy gratuit, fallback). Quand quelque chose échoue, le moteur répond par une erreur **JSON** du panel, avec l'en-tête `X-UHQ-Error` :

```http
HTTP/1.1 502 Bad Gateway
X-UHQ-Error: UHQ_NO_UPSTREAM
Content-Type: application/json

{"error":{"code":"UHQ_NO_UPSTREAM","status":502,"message":"No proxy available to handle the request. Please retry shortly."}}
```

Le détail réel (ex. « le fournisseur a répondu 407 ») n'apparaît que dans les **logs du panel** (« Erreur amont ») et dans le journal « Pourquoi ça ne marche pas ? ».

| Code | HTTP | Signification |
| --- | --- | --- |
| `UHQ_AUTH_FAILED` | 407 | Identifiants refusés : absents, faux, compte bloqué/expiré, quota atteint, IP non autorisée (volontairement indistinguables). |
| `UHQ_WRONG_PORT` | 407 | Le compte ou sa catégorie a un port dédié ; le bon port est indiqué (`detail.expected_port`). |
| `UHQ_IP_BANNED` | 403 | IP bannie (échecs d'authentification répétés ou VPN). |
| `UHQ_DOMAIN_BLOCKED` | 403 | Domaine bloqué pour ce compte. |
| `UHQ_VPN_BLOCKED` | 403 | VPN/hébergeur refusé (catégorie Anti-VPN). |
| `UHQ_THREAD_LIMIT` | 429 | Trop de connexions simultanées. |
| `UHQ_NO_UPSTREAM` | 502 | Aucun proxy disponible (pool vide/en panne, fallback absent, désactivé ou en échec). |
| `UHQ_UPSTREAM_FAILED` | 502 | Le proxy amont a répondu par une erreur : masquée au client. |
| `UHQ_GATEWAY_ERROR` | 504 | Erreur interne ou délai dépassé. |

::: tip Fiche dans le panel
Menu **Codes d'erreur** (admin et support) : pour chaque code, ce qu'il veut dire, quoi vérifier, et une **réponse prête à copier** pour le client.
:::

::: warning Requêtes avec corps
L'erreur du proxy amont est masquée pour les requêtes HTTP sans corps (GET, HEAD…) et pour tout le HTTPS (CONNECT). Pour une requête HTTP en clair avec corps (POST/PUT), la réponse est relayée telle quelle.
:::

## Fallback par catégorie

Chaque catégorie (**Catégories**) peut avoir son propre fallback, ou n'en avoir aucun :

- **Fallback de secours (interrupteur)** : désactivé = cette catégorie n'utilise **jamais** de fallback, même si un fallback global existe. Le client reçoit alors `UHQ_NO_UPSTREAM`.
- **Fallback propre** : URL du proxy de secours de la catégorie (`http://user:pass@hôte:port`, `socks5://…`). Vide = utilise le **fallback global** (Paramètres → Scraper).
- Le gabarit de pays (`{user}__country__{country}`…) reste réglable par catégorie.

Ordre de décision : interrupteur désactivé → aucun ; sinon fallback propre ; sinon fallback global ; sinon aucun.
L'URL contient des identifiants : elle est **masquée** dans le panel et l'API (••••••••) ; laisser le masque inchangé conserve la valeur.
