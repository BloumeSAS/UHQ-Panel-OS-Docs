# Démarrage rapide

Créez votre premier addon UHQ Panel OS en quelques minutes.

---

## 1. Initialiser le projet

```bash
mkdir mon-addon && cd mon-addon
mkdir api web
```

---

## 2. Backend NestJS

```bash
cd api
npm init -y
npm install @nestjs/common @nestjs/core @nestjs/platform-express \
            @nestjs/serve-static reflect-metadata rxjs \
            class-validator class-transformer
npm install -D @nestjs/cli typescript ts-node @types/node
```

### `api/nest-cli.json`
```json
{ "collection": "@nestjs/schematics", "sourceRoot": "src" }
```

### `api/tsconfig.json`
```json
{
  "compilerOptions": {
    "module": "commonjs", "target": "ES2021",
    "emitDecoratorMetadata": true, "experimentalDecorators": true,
    "outDir": "./dist", "skipLibCheck": true
  }
}
```

### `api/src/main.ts`
```typescript
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: { origin: '*' } });
  await app.listen(process.env.PORT ?? 3001);
  console.log(`Addon démarré sur http://localhost:${process.env.PORT ?? 3001}`);
}
bootstrap();
```

### `api/src/app.module.ts`
```typescript
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';
import { ManifestController } from './manifest/manifest.controller';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(__dirname, '..', '..', 'web', 'dist'),
      exclude: ['/api/(.*)'],
    }),
  ],
  controllers: [ManifestController],
})
export class AppModule {}
```

### `api/src/manifest/manifest.controller.ts`
```typescript
import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import * as path from 'path';

@Controller()
export class ManifestController {
  @Get('uhq-manifest.json')
  serve(@Res() res: Response) {
    res.sendFile(path.resolve(__dirname, '..', '..', '..', 'uhq-manifest.json'));
  }
}
```

---

## 3. Frontend React

```bash
cd ../web
npm create vite@latest . -- --template react-ts
npm install react-router-dom
```

### `web/vite.config.ts`
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api':               'http://localhost:3001',
      '/uhq-manifest.json': 'http://localhost:3001',
    },
  },
});
```

### `web/src/main.tsx`
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter><App /></BrowserRouter>
  </React.StrictMode>
);
```

### `web/src/App.tsx`
```tsx
import { Routes, Route, useSearchParams } from 'react-router-dom';
import { useEffect } from 'react';

function MaPage() {
  const [params] = useSearchParams();
  const theme = params.get('theme') ?? 'dark';
  return <div>Bonjour, token: {params.get('token') ? '✓' : '✗'}</div>;
}

export default function App() {
  const [params] = useSearchParams();
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', params.get('theme') ?? 'dark');
  });

  return (
    <Routes>
      <Route path="/" element={<MaPage />} />
    </Routes>
  );
}
```

---

## 4. Le manifest

Créer `uhq-manifest.json` à la racine du projet :

```json
{
  "name": "Mon Addon",
  "version": "1.0.0",
  "description": "Mon premier addon UHQ",
  "icon": "Star",
  "pages": [
    {
      "path": "/",
      "label": "Mon Addon",
      "icon": "Star",
      "showInNavbar": true
    }
  ],
  "auth": { "passJwt": true }
}
```

---

## 5. Démarrer et connecter

```bash
# Terminal 1
cd api && npm run start:dev

# Terminal 2
cd web && npm run dev
```

Dans UHQ Panel OS → **Extensions** → entrer `http://localhost:3001` → **Prévisualiser** → **Connecter**.

::: tip Résultat
Votre page "Mon Addon" apparaît automatiquement dans la sidebar du panel !
:::

---

## Prochaines étapes

- [Manifest complet](/addons/manifest) — toutes les options disponibles
- [Widgets](/addons/widgets) — injecter des mini-iframes dans les pages panel
- [Slots topbar](/addons/slots) — ajouter des raccourcis dans l'en-tête
- [Authentification JWT](/addons/auth) — identifier l'utilisateur connecté
