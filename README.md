# Drive Service Network

**Built by Operators. Designed for Operators.**

Drive Service Network is the trusted nationwide platform for vehicle operators seeking reliable repair, maintenance, commercial pricing, and fleet management resources — powered by Openbay (Partner #116).

A **Global Drive Holdings Inc.** company.

---

## Platform Overview

Drive Service Network connects Turo hosts, rental operators, and commercial fleet managers with certified service providers across the United States. The platform delivers:

- **Commercial pricing** on 515+ auto repair and maintenance services
- **Simplified 3-step booking** (vs. the industry's typical 6-step process)
- **Nationwide coverage** across 50 states
- **Fleet management tools** for multi-vehicle operators
- **GDH ecosystem integration** with Drive Protection, Drive Parts Network, Drive KeZ, Drive Cloud, Drive Connect, and Drive Growth Partners Network

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) + React 19 |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| ORM | Prisma 5 + MySQL 8 |
| Cache | Redis 7 |
| API | Next.js Route Handlers (server-side proxy) |
| Containerization | Docker + Docker Compose |
| CI/CD | GitHub Actions |

---

## Architecture

### Security Model

All Openbay API calls are **proxied server-side** through Next.js API routes. The Openbay API key is **never exposed to the client**. This is enforced by:

1. API key stored only in server-side environment variables
2. All Openbay calls made from `/src/app/api/openbay/*` route handlers
3. Client components call `/api/openbay/*` endpoints, never Openbay directly

### Openbay Integration

- **Partner ID:** 116
- **Staging API Base:** `https://openbay.driveservicenetwork.com`
- **Production API Base:** `https://api.openbay.com`
- **Proxy Layer:** `/src/lib/openbay/client.ts`

### @gdh/ui-kit

Shared component library located at `/src/components/ui/`. Provides:

- `Button` — 6 variants, 5 sizes, loading state
- `Card` — 5 variants with hover effects
- `Input`, `Textarea`, `Select` — with validation states
- `Badge` — 8 variants
- `Modal` — Radix UI Dialog wrapper
- `Toast` — Radix UI Toast wrapper

---

## Project Structure

```
drive-service-network/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Homepage
│   │   ├── about/              # About / Our Story
│   │   ├── services/           # Services catalog
│   │   ├── how-it-works/       # 3-step booking flow
│   │   ├── membership/         # Membership plans
│   │   ├── fleet-operators/    # Fleet operator landing page
│   │   ├── contact/            # Contact form
│   │   └── api/
│   │       ├── openbay/        # Openbay proxy routes
│   │       └── contact/        # Contact form handler
│   ├── components/
│   │   ├── ui/                 # @gdh/ui-kit components
│   │   ├── layout/             # Navigation, Footer
│   │   └── sections/           # Page section components
│   ├── lib/
│   │   ├── openbay/            # Openbay API client
│   │   └── utils.ts            # Utility functions
│   ├── styles/
│   │   └── globals.css         # Global styles + Tailwind
│   └── types/                  # TypeScript type definitions
├── prisma/
│   └── schema.prisma           # Database schema
├── docker/
│   └── mysql/init.sql          # MySQL initialization
├── .github/
│   └── workflows/              # GitHub Actions CI/CD
├── .env.development            # Development environment
├── .env.staging                # Staging environment
├── .env.production             # Production environment template
├── .env.example                # Environment variable template
├── Dockerfile                  # Multi-stage Docker build
└── docker-compose.yml          # Local development stack
```

---

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm 11+
- Docker Desktop (for local database)

### Local Development

```bash
# 1. Clone the repository
git clone https://github.com/daviderichammer/drive-service-network.git
cd drive-service-network

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env.local
# Edit .env.local with your values

# 4. Start local services (MySQL + Redis)
docker-compose up -d mysql redis

# 5. Generate Prisma client
pnpm db:generate

# 6. Push database schema
pnpm db:push

# 7. Start development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Full Docker Stack

```bash
# Start all services including the app
docker-compose up

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down
```

---

## Environment Configuration

| File | Purpose |
|------|---------|
| `.env.development` | Local development defaults |
| `.env.staging` | Openbay staging environment (Partner #116) |
| `.env.production` | Production template (fill via CI/CD secrets) |
| `.env.example` | Developer onboarding template |

**Critical:** Never commit `.env.local` or any file containing real API keys.

---

## Pages

| Route | Page | Status |
|-------|------|--------|
| `/` | Homepage | ✅ Phase 1 |
| `/about` | About / Our Story | ✅ Phase 1 |
| `/services` | Services Catalog | ✅ Phase 1 |
| `/how-it-works` | How It Works | ✅ Phase 1 |
| `/membership` | Membership Plans | ✅ Phase 1 |
| `/fleet-operators` | For Fleet Operators | ✅ Phase 1 |
| `/contact` | Contact | ✅ Phase 1 |
| `/dashboard` | Member Dashboard | 🔄 Phase 2 |
| `/book` | Service Booking | 🔄 Phase 2 |

---

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/openbay/services` | GET | Fetch service catalog |
| `/api/openbay/locations` | GET | Search shops by ZIP |
| `/api/contact` | POST | Submit contact form |

---

## Database Schema

Core models (Phase 1):

- **User** — Members with Openbay integration
- **Vehicle** — Fleet vehicles with VIN tracking
- **Fleet** — Multi-vehicle operator groups
- **Appointment** — Service bookings with Openbay sync
- **ContactForm** — Lead management
- **Service / ServiceCategory** — Cached Openbay service catalog

---

## CI/CD Pipeline

| Branch | Trigger | Actions |
|--------|---------|---------|
| `develop` | Push | Lint, Type Check, Build |
| `staging` | Push | Lint, Type Check, Build, Docker, Deploy Staging |
| `main` | Push | Lint, Type Check, Build, Docker, Deploy Production (manual approval) |
| Any PR | PR Open/Sync | Lint, Type Check, Build |

---

## GDH Ecosystem

Drive Service Network is part of the Global Drive Holdings Inc. ecosystem:

| Product | Description |
|---------|-------------|
| Drive Protection | Vehicle protection plans |
| Drive Parts Network | OEM & aftermarket parts |
| Drive KeZ | Key management solutions |
| Drive Cloud | Fleet data & analytics |
| Drive Connect | Telematics & connectivity |
| Drive Growth Partners Network | Business growth resources |

---

## Phase Roadmap

| Phase | Focus | Status |
|-------|-------|--------|
| Phase 1 | Website, UI Kit, Foundation | ✅ Complete |
| Phase 2 | Openbay Integration, Booking Flow | 🔄 Planned |
| Phase 3 | Membership & Payments | 🔄 Planned |
| Phase 4 | Financing Integration | 🔄 Planned |
| Phase 5 | Commercial Fleet Accounts | 🔄 Planned |
| Phase 6 | AI, Predictive Maintenance, Analytics | 🔄 Future |

---

## Brand Standards

| Element | Value |
|---------|-------|
| Navy | `#1B2B4D` |
| Teal | `#2A9D8F` |
| Gold | `#E8B931` |
| Heading Font | Montserrat |
| Body Font | Open Sans |
| Philosophy | Built by Operators. Designed for Operators. |

---

## License

Proprietary — Global Drive Holdings Inc. All rights reserved.

&copy; 2024 Drive Service Network Inc. A Global Drive Holdings Inc. company.
