# GEMINI.md - us4ever.com Project Context

This document provides foundational context and instructions for AI agents working on the `us4ever.com` project.

## Project Overview

`us4ever.com` (also known as `api.us4ever`) is a modernized personal tool collection application built with **Next.js 15 (App Router)** and **React 19**. It follows enterprise-grade architectural patterns, prioritizing type safety, performance, and maintainability.

### Main Modules
- **📝 Notebook (Keep)**: Markdown-based notes with full-text and semantic search.
- **🧠 Mind Map**: Interactive mind mapping using `simple-mind-map`.
- **✅ Todo**: Task management with priorities and categories.
- **📸 Moments**: Social-like feed for personal updates, supporting images and videos.
- **📦 Asset Management**: S3-compatible file/image/video storage (R2/COS/OSS) with automatic thumbnail generation and metadata extraction.
- **🛠️ Tools**: Utility tools like image processing and TTS (Edge TTS).
- **🤖 AI Integration**: Semantic search and content analysis powered by Google Gemini and pgvector.

### Core Technology Stack
- **Framework**: Next.js 15 (App Router), React 19, TypeScript.
- **APIs**: 
  - **tRPC 11**: End-to-end type-safe internal APIs.
  - **Hono**: High-performance middleware-rich API routes for external/specialized endpoints.
- **Database**: Prisma ORM with PostgreSQL (leveraging `pgvector` for AI features).
- **State Management**: Zustand (Client), TanStack Query (Server state via tRPC).
- **Styling**: Tailwind CSS, Framer Motion (Animations), Lucide React (Icons).
- **Validation**: Zod (Schema validation), `@t3-oss/env-nextjs` (Environment variables).
- **Package Manager**: pnpm.

## Directory Structure

```text
src/
├── app/                    # Next.js App Router (Pages & API Routes)
│   ├── (full-layout)/     # Pages using the primary navigation layout
│   ├── (no-layout)/       # Pages without the primary layout
│   ├── api/               # API endpoints (Hono catch-all & tRPC)
│   └── actions/           # Next.js Server Actions
├── components/             # React Components
│   ├── ui/                # Base UI components (Radix-based, Shadcn-style)
│   ├── hoc/               # High-Order Components (e.g., Error Boundaries)
│   └── layout/            # Layout-specific components
├── dto/                    # Data Transfer Objects (Zod schemas)
├── hooks/                 # Custom React Hooks
├── lib/                   # Core shared libraries (S3, FFmpeg, etc.)
├── server/                # Backend logic
│   ├── api/               # tRPC routers and configuration
│   ├── hono/              # Hono application and sub-routers
│   └── db.ts              # Prisma client initialization
├── service/               # Business logic layer (Service pattern)
├── store/                 # Zustand state stores
├── types/                 # Global TypeScript type definitions
└── utils/                 # Utility functions (cn, formatters, etc.)
prisma/                    # Prisma schema and migrations
tests/                     # E2E and unit tests (Vitest)
```

## Building and Running

### Development
```bash
pnpm install
# Ensure .env is configured (see .env.example)
pnpm dev              # Starts dev server on port 12345
```

### Database Management
```bash
pnpm db:migrate:dev   # Run migrations in dev
pnpm db:seed          # Seed the database
pnpm db:studio        # Open Prisma Studio GUI
```

### Production
```bash
pnpm build            # Build the Next.js application
pnpm start            # Start the production server
```

### Quality Assurance
```bash
pnpm lint             # Run ESLint with auto-fix
pnpm type-check       # Run TypeScript compiler check
pnpm test             # Run tests via Vitest
```

## Development Conventions & Standards

### 1. Component Development
- **Naming**: Use `PascalCase` for component names and file names (e.g., `Button.tsx`).
- **Props**: Define an interface named `ComponentNameProps`.
- **Style**: Prefer functional components and hooks.
- **Conditional Classes**: Always use the `cn` utility from `@/utils/cn` with object syntax for readability.
  ```tsx
  // ✅ DO
  <div className={cn('base-class', { 'active-class': isActive, 'disabled-class': isDisabled })} />
  ```

### 2. Service Pattern
Business logic should be encapsulated in service files within `src/service/`.
- Export services as singleton objects (e.g., `export const keepService = { ... }`).
- Use the `after()` function from `next/server` for non-blocking side effects (e.g., logging, vector updates).

### 3. API Design
- **Internal UI**: Use **tRPC** for all component-to-server communication to ensure type safety.
- **External/Specialized**: Use **Hono** for webhooks, file uploads, or public API endpoints.
- **Validation**: Every API input MUST be validated using **Zod**.

### 4. Error Handling
- Use the unified error handling mechanism described in `src/lib/error-handler.ts`.
- In Hono/tRPC, use appropriate HTTP exception classes (e.g., `HTTPException` from `hono/http-exception`).

### 5. SSR Considerations
- Be cautious when using browser-only APIs (`window`, `document`, `localStorage`).
- Use `useEffect` or check `typeof window !== 'undefined'` to ensure code runs only on the client.

### 6. AI & Search
- When updating content in `Keep` or `Moment`, ensure vector embeddings are updated (usually handled via `after()` in the service layer).
- Follow the Hybrid Search pattern (Postgres Full-Text + Semantic Vector Search) for search features.

## Critical Instructions for AI Agents
- **Environment Variables**: Always use `src/env.js` to access environment variables.
- **Imports**: Use absolute path aliases starting with `@/` (e.g., `@/components/ui/button`).
- **Prisma**: When modifying `schema.prisma`, remember that some fields use `Unsupported("vector(3072)")` and require raw SQL for certain operations.
- **Context**: This project uses Next.js 15 and React 19; ensure you use the latest patterns (e.g., `use`, `server-only`, `after`).

---
*This file is managed by Gemini CLI. If you make significant architectural changes, please update this document.*
