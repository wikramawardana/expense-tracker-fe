# Expense Tracker

**Personal Finance Tracking with Smart Analytics**

> Track expenses, manage bills, monitor payment methods, and gain insights into your spending habits with interactive charts and powerful filtering.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=flat-square&logo=postgresql)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

<!-- Add screenshot here -->

---

## Overview

Expense Tracker is a full-featured personal finance application designed to give you complete visibility over your spending. From daily expenses to recurring bills, it brings everything together in a clean, data-rich dashboard with charts, tables, and date range filtering.

## Features

- **Expense Management** -- Create, edit, and delete expenses with categories and dates
- **Bill Statement Tracking** -- Track recurring bills and their payment status
- **Payment Methods** -- Manage credit cards, bank accounts, and other payment sources
- **Category Management** -- Organize spending with custom categories
- **Dashboard Analytics** -- Visual breakdown of expenses with Recharts-powered charts
- **Date Range Filtering** -- Analyze spending across custom time periods
- **Paginated Data Tables** -- Browse large datasets efficiently with TanStack Table
- **Form Validation** -- Robust input validation with Zod schemas
- **SSO Authentication** -- Secure login via centralized auth server (OIDC)

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4, Radix UI, shadcn/ui |
| Charts | Recharts |
| Tables | TanStack Table |
| Forms | React Hook Form + Zod |
| Auth | better-auth (OIDC client) |
| Database | PostgreSQL with pg |
| Deployment | Docker (multi-stage build) |

## Getting Started

### Prerequisites

- Node.js 22+
- pnpm
- PostgreSQL 15+
- Running instance of [wikramawardana/auth](https://github.com/wikramawardana/auth)

### Installation

```bash
git clone https://github.com/wikramawardana/expense-tracker-fe.git
cd expense-tracker-fe
pnpm install
```

### Environment Variables

Create a `.env` file:

```env
# App
NEXT_PUBLIC_APP_URL=http://localhost:3002

# BetterAuth
BETTER_AUTH_SECRET=your-secret-here

# Database (PostgreSQL)
DATABASE_URL=postgresql://user:password@localhost:5432/expense-tracker

# Auth service (OIDC provider)
NEXT_PUBLIC_AUTH_URL=http://localhost:3001
AUTH_CLIENT_ID=expense-tracker
AUTH_CLIENT_SECRET=your-client-secret-from-auth-dashboard
```

### Development

```bash
pnpm dev
```

The app starts at `http://localhost:3002` with Turbopack for fast refresh.

## Production Deployment

Production image tags use immutable version-build tags. After you push to
`main`, GitHub Actions builds and pushes a tag such as
`ghcr.io/wikramawardana/expense-tracker-fe:v0.1.0-build.123`.
If the build succeeds and `GITOPS_TOKEN` is configured, the workflow updates
GitOps automatically:

`wikra-gitops/manifests/expense-tracker-fe/overlays/prod/kustomization.yaml`

So the normal flow is:

1. Edit this repo.
2. Commit and push to `main`.
3. Wait for the GitHub Actions build to succeed.
4. Confirm the workflow committed the new GitOps `newTag`.
5. Wait for Argo CD to show `expense-tracker-fe` as `Synced` and `Healthy`.

## Docker Deployment

### Build

```bash
docker build \
  --build-arg NEXT_PUBLIC_APP_URL=https://expenses.yourdomain.com \
  --build-arg NEXT_PUBLIC_AUTH_URL=https://auth.yourdomain.com \
  -t expense-tracker-fe .
```

### Run

```bash
docker run -p 3002:3002 \
  -e DATABASE_URL=postgresql://user:pass@host:5432/expense-tracker \
  -e BETTER_AUTH_SECRET=your-production-secret \
  -e AUTH_CLIENT_ID=expense-tracker \
  -e AUTH_CLIENT_SECRET=your-secret \
  expense-tracker-fe
```

## Architecture

```
src/
├── app/
│   ├── (auth)/             # Auth-related routes (login, callback)
│   ├── (dashboard)/        # Protected dashboard routes
│   │   ├── expenses/       # Expense CRUD pages
│   │   ├── bills/          # Bill statement pages
│   │   ├── payment-methods/# Payment method management
│   │   └── categories/     # Category management
│   └── api/                # API routes
├── components/
│   ├── ui/                 # shadcn/ui primitives
│   └── ...                 # Feature-specific components
├── hooks/                  # Custom React hooks
├── lib/
│   ├── auth-client.ts      # better-auth client setup
│   └── services/           # Service layer (DB queries)
└── middleware.ts           # Auth guard middleware
```

**Key Patterns:**
- Route groups to separate auth and dashboard layouts
- Service layer pattern for clean data access
- Custom hooks for reusable data fetching logic
- Middleware-based authentication with redirect

## Authentication

This app authenticates users via the centralized [Auth Server](https://github.com/wikramawardana/auth) using OpenID Connect. Users log in once and gain access to all ecosystem apps.

## Related Projects

| Project | Description |
|---------|-------------|
| [auth](https://github.com/wikramawardana/auth) | Central SSO/OIDC identity provider |
| [dapur-buwikra-fe](https://github.com/wikramawardana/dapur-buwikra-fe) | Restaurant order management |
| [starport](https://github.com/wikramawardana/starport) | Docker container dashboard |
| [roamly](https://github.com/wikramawardana/roamly) | Travel trip planner |

## License

[MIT](LICENSE)
