# Doubt Assistant

A student learning dashboard built with Next.js, Better Auth, Neon Postgres, Vercel Blob, and Tailwind CSS.

## Features

- Email and password authentication
- Student dashboard with courses, progress, streaks, and daily study time
- YouTube lesson playback tracking
- Course PDF notes with course filtering
- Student profile picture uploads
- Admin dashboard for managing courses, lessons, PDFs, students, and administrators
- IST-based date and streak tracking

## Tech stack

- Next.js 16 App Router
- React 19 and TypeScript
- Better Auth
- Neon Postgres with Drizzle ORM
- Vercel Blob for profile images
- Tailwind CSS
- SWR

## Getting started

Install dependencies:

```bash
pnpm install
```

Start the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment variables

Configure these variables in the project environment:

```env
DATABASE_URL=
BETTER_AUTH_SECRET=
BLOB_READ_WRITE_TOKEN=
```

`DATABASE_URL` connects to Neon, `BETTER_AUTH_SECRET` signs authentication sessions, and `BLOB_READ_WRITE_TOKEN` enables profile image uploads.

## Available scripts

```bash
pnpm dev       # Start development server
pnpm build     # Create a production build
pnpm start     # Start the production server
```

## Main routes

- `/` — Student dashboard
- `/sign-in` — Login page
- `/register` — Student registration
- `/admin` — Administrator dashboard

## Deployment

Deploy the project to Vercel and configure the required environment variables in the project settings. The database schema must include the application tables used for study time, app activity, admin profiles, courses, lessons, and course notes.

## Repository

[github.com/tvamshi0965-ux/Doubt-assisstant](https://github.com/tvamshi0965-ux/Doubt-assisstant)
