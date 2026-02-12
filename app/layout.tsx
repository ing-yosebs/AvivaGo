import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: '--font-inter',
});

const outfit = Outfit({
    subsets: ["latin"],
    variable: '--font-outfit',
});

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://avivago.mx'),
    title: "AvivaGo",
    description: "Directorio de Conductores Privados",
    other: {
        "facebook-domain-verification": "qmho2t2vko6y48v3jpi6fjmrnj81l3",
    },
};

import { createClient } from '@/lib/supabase/server'
import BanGuard from '@/app/components/BanGuard'
import CookieConsent from '@/app/components/CookieConsent'
import { GoogleAnalytics } from '@next/third-parties/google'
import FacebookPixel from '@/app/components/FacebookPixel'
import TikTokPixel from '@/app/components/TikTokPixel'
import { Suspense } from 'react'

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    // 1. Check Global Ban Status Server-Side (Best effort)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let isBanned = false
    if (user) {
        const { data: profile } = await supabase
            .from('users')
            .select('is_banned')
            .eq('id', user.id)
            .single()
        isBanned = !!profile?.is_banned
    }

    const gaId = process.env.NEXT_PUBLIC_GA_ID;

    return (
        <html lang="es" className={`${inter.variable} ${outfit.variable}`} suppressHydrationWarning>
            <body className="font-sans antialiased" suppressHydrationWarning>
                {gaId && <GoogleAnalytics gaId={gaId} />}
                <Suspense fallback={null}>
                    <FacebookPixel />
                    <TikTokPixel />
                </Suspense>
                <BanGuard isBanned={isBanned} />
                <CookieConsent />
                {children}
            </body>
        </html>
    );
}
