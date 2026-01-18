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

## 5. Features Implemented
- **Route Protection**: The home page redirects logged-in users to `/driver/onboarding`.
- **Middleware**: Blocks unauthenticated access to `/driver/*`.
- **Auth**: Fully functional Email/Password Login and Register pages.
- **UI**: Clean Tailwind design.
