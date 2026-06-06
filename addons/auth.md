# Authentification JWT

UHQ Panel OS passe automatiquement le JWT de l'utilisateur à vos pages et widgets.

---

## Activer le passthrough JWT

```json
"auth": {
  "passJwt":      true,
  "passUserInfo": true
}
```

| Champ | Description |
|---|---|
| `passJwt` | Ajoute `?token=<jwt>` à toutes les URLs de l'addon |
| `passUserInfo` | Ajoute `?email=<email>&role=<ADMIN\|USER>` |

---

## Lire le token

### React

```tsx
import { useSearchParams } from 'react-router-dom';

function MyPage() {
  const [params] = useSearchParams();
  const token = params.get('token') ?? '';

  useEffect(() => {
    if (!token) return;
    fetch('/api/mydata', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(r => r.json()).then(console.log);
  }, [token]);
}
```

### NestJS (backend de l'addon)

```typescript
function decodeJwt(token: string) {
  const [, payload] = token.split('.');
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
}

// Dans un controller :
@Get('mydata')
getData(@Headers('authorization') auth: string) {
  const token = auth?.replace('Bearer ', '');
  const payload = decodeJwt(token);
  // payload.sub   → ID utilisateur
  // payload.email → email
  // payload.role  → 'ADMIN' | 'USER'
}
```

---

## Appeler l'API du panel

Avec le JWT, votre addon peut appeler les endpoints panel :

```typescript
const me = await fetch(`${process.env.PANEL_URL}/api/panel/me`, {
  headers: { Authorization: `Bearer ${userToken}` },
}).then(r => r.json());
```

### Endpoints utiles

| Endpoint | Description |
|---|---|
| `GET /api/panel/me` | Informations de l'utilisateur connecté |
| `GET /api/panel/subusers` | Comptes proxy assignés à l'utilisateur |
| `GET /api/panel/monitoring/live` | Stats proxy en temps réel |

---

## Sécurité en production

::: warning Production
En développement, décoder le JWT sans vérifier la signature est acceptable.  
En production, validez le token via `/api/panel/me` ou configurez la clé publique JWT du panel.
:::

```typescript
// Validation production recommandée
async function validateToken(token: string, panelUrl: string) {
  const res = await fetch(`${panelUrl}/api/panel/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Token invalide');
  return res.json(); // { id, email, role, ... }
}
```
