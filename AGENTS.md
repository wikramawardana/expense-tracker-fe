# Expense Tracker Frontend - Agent Operational Manual

## 1. Overview & Purpose
- **System**: Modern web UI for the personal expense tracker ecosystem. Provides dashboards, live expense tables, category breakdowns, bill statement tracking, and expense editing.
- **Companion Backend**: `expense-tracker-be` (Rust Axum + SurrealDB on port `8202`).

## 2. Architecture & Tech Stack
- **Framework**: Next.js 16 (Turbopack) with React 19.
- **Styling**: Tailwind CSS v4, Radix UI primitives, Lucide icons, Sonner for notifications.
- **State & Tables**: TanStack Table v8, React Hook Form + Zod.
- **Linting & Formatting**: Biome (`@biomejs/biome`), Husky pre-commit hooks.
- **Dev Port**: `3202` (command: `pnpm dev`).

## 3. Core Guidelines & Conventions
1. **Form Fields & Clear Actions**:
   - When clearing optional fields like `description` or `paid_by` in update dialogs (e.g. `expense-action-dialog.tsx`), pass `""` (empty string) instead of `undefined`.
   - The backend specifically treats empty strings as an instruction to clear the field (`None`), while `undefined` is omitted from the update payload.
2. **Component Conventions**:
   - Modern React 19 idioms, functional components, TypeScript strict typing.
   - Client components must explicitly declare `'use client';`.
3. **Styling Rules**:
   - Follow clean dashboard layout, responsive tables with horizontal scroll support on small viewports.

## 4. Development & Verification Commands
- **Run dev server**:
  ```bash
  pnpm dev
  ```
- **Typecheck & Lint**:
  ```bash
  pnpm typecheck
  pnpm lint
  ```
- **Format with Biome**:
  ```bash
  pnpm format
  ```
- **Build production bundle**:
  ```bash
  pnpm build
  ```
