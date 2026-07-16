<div align="center">

# 🏛️ AuctaSync v2

### Premium Real-Time Auction Platform

**High-performance, secure auction management for luxury goods, art, and exclusive collectibles.**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?logo=vercel)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

[Live Demo](#) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

> **⚠️ v2 Notice**
> This repository is the **next-generation rebuild** of AuctaSync — a decoupled, scalable architecture built for high-concurrency, real-time bidding. For the original monorepo, see the [legacy repository](https://github.com/alvy00/asyncawait-auction-project).

---

## 📋 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
    - [Prerequisites](#prerequisites)
    - [Installation](#installation)
    - [Environment Variables](#environment-variables)
    - [Running Locally](#running-locally)
- [Available Scripts](#-available-scripts)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
    - [Branching & PR Workflow](#branching--pr-workflow)
- [Troubleshooting](#-troubleshooting)
- [Roadmap](#-roadmap)
- [License](#-license)
- [Contact](#-contact)

---

## 🎯 About

AuctaSync is a full-stack auction ecosystem built to handle **live, high-stakes bidding** with the reliability and speed that luxury marketplaces demand. v2 introduces a decoupled architecture, real-time bid synchronization over WebSockets, and integrated local payment processing — all engineered for scale.

## ✨ Features

- 🔴 **Real-time bidding** — live bid updates pushed via WebSockets, no page refresh required
- 🔐 **Secure authentication** — powered by Supabase Auth (SSR-aware sessions) with row-level security
- 💳 **Integrated payments** — checkout and settlement via SSLCommerz
- 🖼️ **Rich listing management** — image/file uploads via drag-and-drop (`react-dropzone`), bid history per lot
- 📊 **Auction analytics** — real-time charts on active lots and bid activity via Chart.js
- 🎬 **Polished motion design** — Framer Motion, GSAP, and Lottie animations throughout the UI
- 🧩 **Accessible UI primitives** — built on Radix UI and shadcn components
- 📱 **Responsive, modern styling** — Tailwind CSS 4 with animation utilities
- ⚡ **Fast local dev** — Next.js 15 with Turbopack
- 📈 **Usage insights** — Vercel Analytics baked in

## 🛠 Tech Stack

| Layer               | Technology                                                                                                                                                                            |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework**       | [Next.js 15](https://nextjs.org/) (App Router, Turbopack)                                                                                                                             |
| **Language**        | TypeScript 5, React 19                                                                                                                                                                |
| **Styling**         | [Tailwind CSS 4](https://tailwindcss.com/), `tailwind-merge`, `tailwind-variants`, `tailwindcss-animate`                                                                              |
| **UI Components**   | [Radix UI](https://www.radix-ui.com/) primitives (avatar, dialog, dropdown, popover, select, tooltip, etc.), [shadcn](https://ui.shadcn.com/), [Headless UI](https://headlessui.com/) |
| **Icons**           | [Lucide React](https://lucide.dev/), [Heroicons](https://heroicons.com/), [React Icons](https://react-icons.github.io/react-icons/)                                                   |
| **Animation**       | [Framer Motion](https://www.framer.com/motion/), [GSAP](https://gsap.com/), [Lottie](https://airbnb.io/lottie/) (`lottie-react`, `@lottiefiles/react-lottie-player`)                  |
| **Data Viz**        | [Chart.js](https://www.chartjs.org/) via `react-chartjs-2`                                                                                                                            |
| **Auth / Database** | [Supabase](https://supabase.com/) (PostgreSQL) via `@supabase/supabase-js`, `@supabase/ssr`, `@supabase/auth-helpers-nextjs`                                                          |
| **Payments**        | [SSLCommerz](https://www.sslcommerz.com/) via `sslcommerz-lts`                                                                                                                        |
| **Utilities**       | `dayjs`, `uuid`, `clsx`, `class-variance-authority`, `react-dropzone`, `react-hot-toast`, `react-intersection-observer`                                                               |
| **Analytics**       | [Vercel Analytics](https://vercel.com/analytics)                                                                                                                                      |
| **Deployment**      | [Vercel](https://vercel.com/)                                                                                                                                                         |

## 🏗 Architecture

AuctaSync v2 is decoupled by design:

- **Frontend** — a Next.js App Router application handling UI, SSR/ISR pages, and client-side bid state
- **Backend** — API route handlers and server actions exposing auction, bidding, and payment logic
- **Real-time layer** — a WebSocket service that broadcasts bid events to all connected clients in a lot
- **Data layer** — Supabase (PostgreSQL) for persistent storage, auth, and row-level security policies

```
Client (Next.js) ⇄ WebSocket Server ⇄ API Layer ⇄ Supabase (PostgreSQL)
                                          ⇄ SSLCommerz (Payments)
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18.18+ (v20+ recommended for Next.js 15 / Tailwind CSS 4)
- **npm**, **pnpm**, or **yarn**
- **Git**
- A [Supabase](https://supabase.com/) project (URL + API keys)
- A [SSLCommerz](https://www.sslcommerz.com/) sandbox/merchant account for payment testing

### Installation

Clone the repository:

```bash
git clone https://github.com/alvy00/asyncawait-auction-project-v2.git
cd asyncawait-auction-project-v2
```

Install dependencies for the whole workspace:

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root with the following:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# SSLCommerz
SSLCOMMERZ_STORE_ID=your-store-id
SSLCOMMERZ_STORE_PASSWORD=your-store-password
SSLCOMMERZ_IS_SANDBOX=true

# WebSocket
NEXT_PUBLIC_WS_URL=ws://localhost:4000
```

### Running Locally

Start the frontend dev server (Turbopack-powered):

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

## ⚡ Available Scripts

Scripts below are defined in `frontend/package.json`:

| Command         | Purpose                                     |
| --------------- | ------------------------------------------- |
| `npm install`   | Install all project dependencies            |
| `npm run dev`   | Start the Next.js dev server with Turbopack |
| `npm run build` | Create an optimized production build        |
| `npm run start` | Start the production build                  |
| `npm run lint`  | Run ESLint across the frontend              |

## 📁 Project Structure

```
asyncawait-auction-project/
├── app/
│   ├── root/          # Next.js frontend
│   └── api/        # API routes / WebSocket server
│   ├── components/            # Shared UI components
├── .env.local          # Local environment variables (not committed)
└── package.json         # Workspace root
```

## 🤝 Contributing

Contributions are welcome! Please read the guidelines below before opening a PR, and check existing [issues](../../issues) for good first tasks.

### Branching & PR Workflow

> **🚫 You cannot push directly to `main`.**

1. Pull the latest `development` branch before starting:

    ```bash
    git checkout development
    git pull origin development
    ```

2. Create a new branch for your feature or fix:

    ```bash
    git checkout -b feature/your-feature-name
    ```

    Example: `git checkout -b feature/add-login-page`

3. Make your changes, then stage and commit:

    ```bash
    git add .
    git commit -m "Add login page"
    ```

4. Push your branch:

    ```bash
    git push origin feature/your-feature-name
    ```

5. Open a **Pull Request** on GitHub:
    - **Base branch:** `development`
    - **Compare branch:** your feature branch
    - Include a clear description of what changed and why

6. Once approved, the PR can be merged.

**Guidelines:**

- Keep commits and PRs small and focused
- Write clear, descriptive commit messages
- Ask questions early — don't stay stuck
- Run `npm run lint` before pushing

## 🩺 Troubleshooting

| Problem                  | Solution                                                                |
| ------------------------ | ----------------------------------------------------------------------- |
| `npm install` fails      | Confirm Node.js (v18+) and npm are installed and up to date             |
| Ports already in use     | Stop other running servers or change the port in `.env.local`           |
| Project won't start      | Check for missing/incorrect environment variables                       |
| WebSocket not connecting | Verify `NEXT_PUBLIC_WS_URL` matches your running server                 |
| Payment flow fails       | Confirm SSLCommerz sandbox credentials and `SSLCOMMERZ_IS_SANDBOX=true` |
| Can't push to `main`     | Expected — open a Pull Request instead                                  |

## 🗺 Roadmap

- [ ] Multi-currency bidding support
- [ ] Automated fraud/anomaly detection on bid patterns
- [ ] Mobile app (React Native)
- [ ] Seller verification & KYC flow
- [ ] Public API for third-party integrations

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

## 📬 Contact

Maintained by [@alvy00](https://github.com/alvy00). For questions or support, please open an [issue](../../issues).
