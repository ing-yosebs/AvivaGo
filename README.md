# AvivaGo MVP: Setup Guide

This project is a Next.js 14 application with Supabase Auth and Tailwind CSS.

> [!WARNING]
> Node.js was not detected in the current environment. You must install it to run this project.

## 1. Prerequisites
- **Node.js**: Install the latest LTS version (v20+) from [nodejs.org](https://nodejs.org/).
- **Supabase Project**: You need a project at [supabase.com](https://supabase.com).

## 2. Installation
Open your terminal in this folder and run:
```bash
npm install
```

## 3. Configuration
1.  Copy `.env.example` to `.env.local`:
    ```bash
    cp .env.example .env.local
    ```
2.  Edit `.env.local` and add your keys from Supabase Dashboard (Project Settings -> API):
    ```env
    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
    # (Note: The server client uses standard names too if needed, but for now we reuse these)
    SUPABASE_URL=https://your-project.supabase.co
    SUPABASE_ANON_KEY=your-anon-key
    ```
    *Note: The implementation expects both `NEXT_PUBLIC_*` (for client) and `SUPABASE_*` (for server/middleware) names. Make sure consistency.*

## 4. Running the App
```bash
npm run dev
```
Visit `http://localhost:3000`.

- **Public Driver Profiles**: Accessible via dynamic routes with optimized SEO.
- **Driver Dashboard**: Internal panel for profile management and status.
- **Onboarding System**: Multi-step process for new drivers.
- **UI**: Premium dark-mode design with Tailwind CSS and Next.js 16.


## 6. Development & Deployment
### Deploying to Vercel (Recommended)
This project is optimized for [Vercel](https://vercel.com).

1.  **Push to GitHub**: Make sure your project is on GitHub (done).
2.  **Create Vercel Account**: Go to [vercel.com](https://vercel.com) and sign up/login with GitHub.
3.  **New Project**: Click "Add New..." -> "Project".
4.  **Import Repository**: Select your `AvivaGo` repository.
5.  **Environment Variables**:
    - Expand the "Environment Variables" section.
    - Add the keys from your `.env.local`:
        - `NEXT_PUBLIC_SUPABASE_URL`
        - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
        - `SUPABASE_URL`
        - `SUPABASE_ANON_KEY`
6.  **Deploy**: Click "Deploy".

Vercel will build the app and give you a live URL (e.g., `https://avivago.vercel.app`) that you can share with anyone.

