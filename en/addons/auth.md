# JWT authentication

UHQ Panel OS automatically passes the user's JWT to your pages and widgets.

---

## Enable JWT passthrough

```json
"auth": {
  "passJwt":      true,
  "passUserInfo": true
}
```

| Field | Description |
|---|---|
| `passJwt` | Adds `?token=<jwt>` to every add-on URL |
| `passUserInfo` | Adds `?email=<email>&role=<ADMIN\|USER>` |

---

## Read the token

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

### NestJS (add-on backend)

```typescript
function decodeJwt(token: string) {
  const [, payload] = token.split('.');
  return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
}

// In a controller:
@Get('mydata')
getData(@Headers('authorization') auth: string) {
  const token = auth?.replace('Bearer ', '');
  const payload = decodeJwt(token);
  // payload.sub   → user ID
  // payload.email → email
  // payload.role  → 'ADMIN' | 'USER'
}
```

---

## Call the panel API

With the JWT, your add-on can call the panel endpoints:

```typescript
const me = await fetch(`${process.env.PANEL_URL}/api/panel/me`, {
  headers: { Authorization: `Bearer ${userToken}` },
}).then(r => r.json());
```

### Useful endpoints

| Endpoint | Description |
|---|---|
| `GET /api/panel/me` | Signed-in user information |
| `GET /api/panel/subusers` | Proxy accounts assigned to the user |
| `GET /api/panel/monitoring/live` | Real-time proxy stats |

---

## Security in production

::: warning Production
Decoding the JWT is **never enough** to trust it: the add-on cannot check its signature. Every request must be verified by the panel (`/api/panel/security/me`), as all official add-ons do (cached 30 s per token fingerprint).
:::

```typescript
// Recommended production validation
async function validateToken(token: string, panelUrl: string) {
  const res = await fetch(`${panelUrl}/api/panel/security/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Invalid token');
  return res.json(); // { id, email, role, ... }
}
```
