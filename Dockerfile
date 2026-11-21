# Documentation UHQ Panel OS — image minimale : le site est STATIQUE, le runtime n'est qu'un nginx.
# (Bien plus sûr que l'image de build Node/Nix : aucune dépendance de build ni runtime Node dans l'image finale.)
FROM node:22-alpine AS build
WORKDIR /site
RUN apk add --no-cache git
COPY package*.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /site/.vitepress/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://127.0.0.1/ >/dev/null || exit 1
