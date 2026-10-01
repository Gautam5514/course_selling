# helloS

helloS is a course discovery and learning platform focused on practical, career-oriented programs. The site brings together course tracks in full-stack development, AI and data science, UI/UX design, and cloud and DevOps.

The project is built with the Next.js App Router and presents course catalogs, track details, pricing, and supporting company content in one responsive web experience.

## Features

- Course catalog with categories, featured courses, and detailed career tracks
- Dedicated pages for the company, pricing, careers, and blog
- Privacy, refund, and terms pages
- Shared navigation, footer, and reusable page components
- Local course and landing-page content managed in JavaScript data files

## Tech Stack

- [Next.js 16](https://nextjs.org/) with the App Router
- [React 19](https://react.dev/)
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Lucide React](https://lucide.dev/) for icons

## Getting Started

### Prerequisites

- Node.js 20.9 or newer
- npm

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app. The development server reloads as you edit files.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run lint` | Run ESLint |
| `npm run build` | Create a production build |
| `npm run start` | Serve the production build locally |

## Pages

| Route | Page |
| --- | --- |
| `/` | Home |
| `/courses` | Course catalog |
| `/courses/[slug]` | Career track details |
| `/about` | About helloS |
| `/pricing` | Plans and pricing |
| `/career` | Careers |
| `/blog` | Blog |
| `/privacy` and `/privacy-policy` | Privacy policy |
| `/refunds` and `/refund-policy` | Refund policy |
| `/terms` and `/terms-and-conditions` | Terms and conditions |

## Project Structure

```text
app/          Routes, layouts, and global styles
components/   Shared UI and page-specific components
data/         Course tracks and landing-page content
public/       Static assets, including images and icons
```

## Quality Checks

Run linting and a production build before shipping changes:

```bash
npm run lint
npm run build
```

## Deployment

The app can be deployed to any platform that supports Next.js. For Vercel, connect the repository and use the default Next.js build settings. For other platforms, see the [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying).
