# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Development**: `npm run dev` - Start the development server at http://localhost:3000
- **Build**: `npm run build` - Create a production build
- **Lint**: `npm run lint` - Run ESLint
- **Production**: `npm run start` - Run the production server (after build)

## Architecture

This is a Next.js 16 project using the App Router pattern with TypeScript and Tailwind CSS 4.

### Key Technologies
- Next.js 16 with App Router (`app/` directory)
- React 19
- TypeScript with strict mode
- Tailwind CSS 4 (via `@tailwindcss/postcss`)

### Project Structure
- `app/` - App Router pages and layouts
  - `layout.tsx` - Root layout with Geist font configuration
  - `page.tsx` - Home page
  - `globals.css` - Global styles and Tailwind imports
- `@/*` path alias maps to the project root
