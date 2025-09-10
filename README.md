## Smart‑Shop

Full‑featured, production‑ready e‑commerce built with Next.js App Router, MongoDB/Mongoose, Stripe & PayPal, internationalization, rich admin, and realtime user‑interaction tracking. It integrates a standalone ML Recommendation microservice for personalized product suggestions and is evolving toward agentic and generative AI experiences (chat/voice order filtering and store assistance).

- ML recommendation service: see `recom-ml-Server` on GitHub ([link](https://github.com/Sandeepreddyr12/recom-ml-Server)).

## Features

- **Storefront**: product browsing, categories, search with interaction tracking, responsive UI, light/dark themes
- **Product details**: image gallery/zoom, attributes & variants, reviews, similar/recommended products
- **Cart & Checkout**: cart sidebar, shipping steps, Stripe and PayPal payments, receipts via email
- **Accounts**: authentication (NextAuth), profile, orders history, saved preferences
- **Admin Console**: overview dashboards, products CRUD, orders, users, settings, static web pages
- **Internationalization**: locale‑aware routing and messages
- **Media**: image upload via UploadThing
- **Emails**: order receipts and review requests
- **Realtime Interaction Tracking**: browsing/search/purchase events used to improve recommendations
- **Recommendations**: server endpoint orchestrating calls to the external ML service
- **Agentic/Gen‑AI (in progress)**: chat/voice commands to filter orders and assist operations

## Tech Stack

- Frontend/SSR: Next.js 15 (App Router), React 19, TypeScript, TailwindCSS, shadcn/ui (Radix UI)
- Auth: NextAuth with MongoDB adapter
- Data: MongoDB, Mongoose
- Payments: Stripe, PayPal
- Uploads: UploadThing
- Emails: React Email, Resend
- i18n: next‑intl
- State/UX: Zustand, React Hook Form, Embla Carousel, Recharts

## Monorepo/Structure Overview

Key directories:

- `app/` – App Router routes (storefront, admin, checkout, API routes under `app/api`)
- `components/` – shared and UI components
- `lib/` – server actions, db client, models, utilities, payment integrations
- `hooks/` – client state and tracking hooks
- `messages/` – localized message json files
- `types/` – shared TypeScript types

ML service (external): `recom-ml-Server` ([link](https://github.com/Sandeepreddyr12/recom-ml-Server)) provides recommendation APIs consumed by `app/api/recommendations/[userId]`.

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Configure environment
   Create a `.env.local` file in project root (see Example below).

3. Seed database (optional but recommended)

```bash
npm run seed
```

4. Run the development server

```bash
npm run dev
```

Open http://localhost:3000

## Example .env.local

Copy and adjust as needed. Not all keys are strictly required to boot; missing providers disable related features.

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-long-random-secret

# Database
MONGODB_URI=mongodb://localhost:27017/smart-shop

# Auth providers (examples; configure the ones you use)
# GITHUB_ID=...
# GITHUB_SECRET=...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# PayPal
PAYPAL_CLIENT_ID=your-paypal-client-id
PAYPAL_CLIENT_SECRET=your-paypal-client-secret
PAYPAL_MODE=sandbox

# Resend (email)
RESEND_API_KEY=re_...
EMAIL_FROM=no-reply@yourdomain.com

# UploadThing
UPLOADTHING_SECRET=ut_...
UPLOADTHING_APP_ID=your-app-id

# Recommendation ML Service
RECOM_API_BASE_URL=http://localhost:8000
RECOM_API_KEY=optional-or-token-if-configured
```

## Seed Data

The project ships with product and demo data.

```bash
npm run seed
```

This connects to `MONGODB_URI` and inserts initial documents (users, products, settings, etc.) defined in `lib/db/seed.ts` and JSON assets under `lib/`.

## Scripts

```bash
npm run dev      # start Next.js in development
npm run build    # build for production
npm run start    # start production server
npm run seed     # seed MongoDB with demo data
npm run lint     # run eslint
```

## Architecture Highlights

- **App Router** delivers SSR/SSG and route groups for `auth`, `home`, `checkout`, `admin`.
- **API Routes** under `app/api` power auth, recommendations, uploads, and webhooks.
- **Database Layer** in `lib/db` with Mongoose models per domain (Product, Order, User, Settings, etc.).
- **Server Actions** in `lib/actions` encapsulate business logic for orders, products, settings, reviews, and recommendations.
- **Payments** via Stripe (webhooks under `app/api/webhooks/stripe`) and PayPal helpers in `lib/paypal.ts`.
- **Emails** in `emails/` (purchase receipts, review requests) via Resend.
- **Uploads** via UploadThing (`app/api/uploadthing`).
- **i18n** via next‑intl (`i18n/` and `messages/`).
- **UI/UX** via tailwind, shadcn/ui components inside `components/ui` and feature components in `components/shared`.

## Recommendations & Realtime Interaction Tracking

- The app tracks user interactions (browsing, search, purchases) under `app/api/products/browsing-history` and `app/api/userInteractions`. Hooks like `use-user-interactions` and components such as `components/shared/search/search-interaction-tracker.tsx` record events.
- Recommendation endpoint `app/api/recommendations/[userId]/route.ts` aggregates signals and calls the ML service at `RECOM_API_BASE_URL`.
- External ML service repo: `recom-ml-Server` ([link](https://github.com/Sandeepreddyr12/recom-ml-Server)). Run it locally (e.g., uvicorn/Docker) and set `RECOM_API_BASE_URL`.

## Agentic & Generative AI (under development)

- Chat/voice command interface to filter orders and assist with store operations.
- Planned capabilities: smart order search (status/date/range/customer), analytics Q&A, and guided administration.
- When enabled, these features will use tracked events and catalog data to ground responses.

## Development Notes

- Type‑safe, explicit exports and clear naming across `lib/actions` and `types/`.
- Avoid deep nesting; prefer early returns and minimal try/catch scopes.
- Run `npm run lint` before commits; fix all errors.

## Deployment

- Any Node/Next compatible host (Vercel, Render, Docker). Ensure environment variables are set and Stripe/PayPal webhooks are configured.
- Run the ML service separately and point `RECOM_API_BASE_URL` to its public/internal URL.

## Security & Compliance

- Do not commit `.env*` files or secrets.
- Rotate Stripe/PayPal keys in production and protect webhook secrets.
- Validate uploads and sanitize user input (already leveraged by schema validation and server actions).

## Contributing

Issues and PRs are welcome. Please:

1. Fork and create a feature branch
2. Keep changes focused and well‑tested
3. Run linting and build before opening a PR

## License

This project is provided as‑is without warranty. See repository license if added.
