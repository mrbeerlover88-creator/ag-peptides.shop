# AG Peptides Platform

Рабочая миграция исходного прототипа `AG-Peptides.html` в нормальный e-commerce проект:

- `apps/web` - Vite + React frontend.
- `apps/api` - Express API.
- `apps/api/prisma` - PostgreSQL схема и seed из исходного HTML.
- `docker-compose.yml` - локальная PostgreSQL база.

## Локальный запуск

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
npm install
docker compose up -d postgres
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

После запуска:

- Web: `http://127.0.0.1:5173`
- API: `http://localhost:4000/api/health`

## Демо-доступы

- Клиент: `demo@agpeptides.ru / demo`
- Админ: `admin@agpeptides.ru / admin`

Эти пароли нужны только для dev/staging. Перед production заменить через seed или админский интерфейс.

## Что уже сделано

- Каталог, категории, способы доставки, способы оплаты и промокоды извлекаются из `AG-Peptides.html` seed-скриптом.
- Заказы создаются через API и сохраняются в PostgreSQL.
- Остатки товаров списываются в транзакции.
- Пароли хешируются через bcrypt.
- Frontend больше не зависит от монолитного `localStorage` для каталога и заказов.

## Что ещё нужно перед production

- Подключить реальный платежный провайдер и webhook статусов оплаты.
- Разнести строгий склад на отдельные таблицы `inventory` / `stock_movements`, если нужна история движений.
- Добавить полноценную админку CRUD для товаров, заказов, клиентов и CoA.
- Подключить SMTP/Telegram уведомления.
- Проверить юридические тексты, RUO-дисклеймеры, политику обработки данных и оферту.
- Настроить production secrets, резервные копии PostgreSQL и мониторинг.
