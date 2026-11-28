# Quick start

Create your first UHQ Panel OS add-on in a few minutes.

---

## 1. Initialise the project

```bash
mkdir my-addon && cd my-addon
mkdir api web
```

---

## 2. NestJS backend

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
  console.log(`Add-on started on http://localhost:${process.env.PORT ?? 3001}`);
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

## 3. React frontend

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

function MyPage() {
  const [params] = useSearchParams();
  return <div>Hello, token: {params.get('token') ? '✓' : '✗'}</div>;
}

export default function App() {
  const [params] = useSearchParams();
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', params.get('theme') ?? 'dark');
  });

  return (
    <Routes>
      <Route path="/" element={<MyPage />} />
    </Routes>
  );
}
```

---

## 4. The manifest

Create `uhq-manifest.json` at the project root:

```json
{
  "name": "My Add-on",
  "version": "1.0.0",
  "description": "My first UHQ add-on",
  "icon": "Star",
  "pages": [
    {
      "path": "/",
      "label": "My Add-on",
      "icon": "Star",
      "showInNavbar": true
    }
  ],
  "auth": { "passJwt": true }
}
```

---

## 5. Start and connect

```bash
# Terminal 1
cd api && npm run start:dev

# Terminal 2
cd web && npm run dev
```

In UHQ Panel OS → **Extensions** → enter `http://localhost:3001` → **Preview** → **Connect**.

::: tip Result
Your "My Add-on" page shows up in the panel sidebar automatically!
:::

---

## Next steps

- [Full manifest](/en/addons/manifest) — every available option
- [Widgets](/en/addons/widgets) — inject mini-iframes into panel pages
- [Topbar slots](/en/addons/slots) — add shortcuts to the header
- [JWT authentication](/en/addons/auth) — identify the signed-in user
