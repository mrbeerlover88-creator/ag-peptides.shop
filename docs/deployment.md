# Деплой ag-peptides.shop

Домен: `ag-peptides.shop`.

## Рекомендуемый путь

Для PostgreSQL на Hostinger лучше использовать Hostinger VPS. Обычный web/cloud hosting может подойти для Node.js-приложения, но PostgreSQL обычно проще и надежнее держать на VPS или во внешней managed базе вроде Supabase/Neon.

## Production env

На сервере нужны переменные:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/ag_peptides?schema=public"
JWT_SECRET="long-random-production-secret"
API_PORT=4000
WEB_ORIGIN="https://ag-peptides.shop"
VITE_API_URL="https://ag-peptides.shop/api"
```

## VPS-чеклист

1. Создать VPS на Ubuntu 22.04/24.04.
2. Установить Node.js LTS, npm, PostgreSQL или Docker.
3. Склонировать/загрузить проект.
4. Создать `apps/api/.env` и `apps/web/.env` по соответствующим `.env.example` с production-значениями.
5. Выполнить:

```bash
npm ci
npm run db:generate
npm --workspace apps/api run db:deploy
NODE_ENV=production npm run db:seed
npm run build
```

Создайте администратора через защищённые переменные окружения `ADMIN_EMAIL`, `ADMIN_NAME` и `ADMIN_PASSWORD` (пароль не короче 12 символов), затем выполните `npm --workspace apps/api exec tsx prisma/create-admin.ts`. Демонстрационные учётные записи в production не создаются.

6. Запустить API через PM2/systemd/Docker.
7. Раздавать `apps/web/dist` через Nginx.
8. Настроить Nginx reverse proxy:

```nginx
server {
  server_name ag-peptides.shop www.ag-peptides.shop;

  root /var/www/ag-peptides/apps/web/dist;
  index index.html;

  location /api/ {
    proxy_pass http://127.0.0.1:4000/api/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  location / {
    try_files $uri /index.html;
  }
}
```

9. Включить SSL:

```bash
sudo certbot --nginx -d ag-peptides.shop -d www.ag-peptides.shop
```

## DNS в Hostinger

В hPanel/DNS зоне:

- `A` запись `@` -> IP сервера.
- `A` запись `www` -> IP сервера, либо `CNAME www -> ag-peptides.shop`.
- Дождаться распространения DNS.
- После этого выпускать SSL.

## Ограничение текущей среды

Из этой среды нет доступа к аккаунту Hostinger, поэтому я могу подготовить код, конфиги и инструкции, но не могу сам изменить DNS-записи, создать VPS или выпустить production SSL в hPanel.
