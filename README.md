<h1 align="center">
  Mediguard
</h1>

## Technologies
Project was bootstrapped using [sidebase](https://sidebase.io).
- TypeScript
- Frontend:
  - Nuxt 3/Vue 3
  - Tailwind CSS
  - [NuxtUI](https://ui.nuxt.com/)
- Backend:
  - Data fetching: tRPC + Tanstack vue-query
  - Database: SQLite (development) / PostgreSQL (production)
  - ORM: Prisma
  - Authentication: Nuxt Auth

## Setup

- Make sure to install the dependencies:

```bash
pnpm install
```

- Development Server

Start the development server on http://localhost:3000

```bash
pnpm dev
```

- Production

Build the application for production:

```bash
pnpm build
```

## Starting the project on GitHub Codespaces
First, wait for the set-up commands to finish for `postCreateCommand` and `postStartCommand`. Once they do, you can start the project by running the following command in a Terminal:

```bash
pnpm dev
```
