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
  - [NordTheme](https://nordtheme.com/) for color scheme inspiration
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
The development environment is preconfigured to run on GitHub Codespaces. You can start the project by clicking the "Code" button and selecting "Open with Codespaces".

Afterwards, just wait while the devcontainer is built and the dependencies are installed. Once this is done, the dev server will automatically start and you can access the application through the link provided in the terminal.

For testing on mobile, a QR code will be generated in the terminal that you can scan with your mobile device to access the application. It will be shown after Nuxt has successfully started.
