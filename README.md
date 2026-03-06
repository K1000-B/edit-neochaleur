# EDIT-NEOCHALEUR

A modern, serverless web application built with **React + TypeScript + TailwindCSS**.

## Description

EDIT-NEOCHALEUR is a frontend-only application designed for fast, reliable deployment on serverless platforms. It emphasizes performance, accessibility, and maintainability through a minimal dependency approach and TypeScript type safety.

## Tech Stack

- **React** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing

## Project Philosophy

The project follows these core principles:

- **Frontend-only architecture** - No backend server required
- **Serverless deployment** - Deploy directly to edge networks
- **Minimal dependencies** - Lean, maintainable codebase
- **Fast loading performance** - Optimized for speed
- **SEO-friendly structure** - Proper HTML semantics
- **Accessible and responsive UI** - Works on all devices

## Project Structure

```
src/
├── components/     # Reusable React components
├── pages/         # Page-level components
├── App.tsx        # Main application component
└── index.css      # Global styles

dist/             # Production build output
```

## Installation

Install dependencies:

```bash
npm install
```

## Development

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Building

Build for production:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

## Deployment

This project can be deployed directly to:

- **Cloudflare Pages**
- **Netlify**
- **Vercel**
- **GitHub Pages**

**Build settings:**
- Build command: `npm run build`
- Output directory: `dist`

## License

See the LICENSE file for details.