# Smart Laundry Web

Frontend application for the **Smart Laundry Platform** — a service connecting customers, laundry businesses, and delivery drivers.

Built with **Next.js 16**, **TypeScript**, **TailwindCSS**, and **React Query**.

---

## Prerequisites

| Tool | Minimum version |
|------|----------------|
| Node.js | >=20.9.0 |
| npm | 10.x |
| Docker & Docker Compose | 24.x *(optional, for containerised run)* |

The frontend communicates with the Smart Laundry backend API (FastAPI). Make sure the backend is running and reachable before starting this app.

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd smart-laundry-web
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in the required values. See the [Environment Variables](#environment-variables) section for details.

### 4. Run the development server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Create a production build |
| `npm run start` | Start the production server (requires a build first) |
| `npm run lint` | Run ESLint |
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |

---

## Running with Docker

A `Dockerfile` and `docker-compose.yml` are included for containerised deployment.

### Build and start

```bash
docker compose up --build
```

The app will be served on port **3000**.

### Pass environment variables

Create a `.env` file (or export variables in your shell) before running Docker Compose. The compose file reads from the environment, so the same variables listed in `.env.example` apply.

```bash
cp .env.example .env
# edit .env with your values
docker compose up --build
```

---

## Makefile

A `Makefile` is provided for common build tasks. Requires `make` and Docker.

| Target | Description |
|--------|-------------|
| `make build-local` | Copy `.env.local` → `.env.production` then build a local Docker image tagged `smart-laundry-web:local` |

### Usage

```bash
# Build a local Docker image using your current .env.local values
make build-local
```

> This is useful for testing the production build locally before pushing to a registry. Make sure `.env.local` is populated before running.

---

## Environment Variables

Copy `.env.example` to `.env.local` for local development. All variables prefixed with `NEXT_PUBLIC_` are embedded into the browser bundle at build time.

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend REST API base URL, including the `/api/v1` prefix |
| `NEXT_PUBLIC_IMAGE_BASE_URL` | Public URL of this for frontend to concate image |
| `NEXT_PUBLIC_DRIVER_WS_URL` | WebSocket URL for real-time driver task notifications |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Google Maps API key (used on map/tracking pages) |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase project API key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | VAPID key for Web Push notifications |

> Firebase credentials are obtained from **Firebase Console → Project Settings → Your Apps**.
> The VAPID key is found under **Project Settings → Cloud Messaging → Web Push certificates**.

---

## Project Structure

```
src/
├── app/                  # Next.js App Router pages
│   ├── admin/            # Admin panel (businesses, drivers, orders, users)
│   ├── auth/             # Login & registration
│   ├── business/         # Business owner dashboard
│   ├── drivers/          # Driver task app
│   └── shops/            # Customer-facing shop browsing & ordering
├── components/           # Reusable UI components
├── contexts/             # React context providers (Toast, Dialog)
├── hooks/                # Custom React hooks
├── lib/                  # Axios instance and shared utilities
├── services/             # API service functions
├── types/                # TypeScript interfaces and types
└── utils/                # Helper functions
```

---

## User Roles

| Role | Access |
|------|--------|
| **Customer** | Browse shops, place and track orders |
| **Business Owner** | Manage business profile, services, and orders |
| **Driver** | Accept pickup/delivery tasks, manage assignments |
| **Admin** | Manage users, drivers, businesses, and order logs |

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** TailwindCSS 4
- **Data Fetching:** React Query (TanStack Query v5)
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios
- **Real-time:** WebSocket (`react-use-websocket`)
- **Push Notifications:** Firebase Cloud Messaging
- **Maps:** Google Maps (`@react-google-maps/api`)
- **Testing:** Jest + React Testing Library
