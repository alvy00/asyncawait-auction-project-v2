import type { Metadata } from "next";
import { Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import dynamic from "next/dynamic";
import { AuthProvider } from "../lib/auth-context";
import { UserProvider } from "../lib/user-context";
import SupabaseProvider from "../lib/supabaseProvider";
import { Analytics } from "@vercel/analytics/next";
import { ChatbotWrapper } from "./components/ChatbotWrapper";

// Lazy load non-critical components to reduce initial bundle size
const AnimatedBackground = dynamic(() =>
    import("./components/AnimatedBackground").then((m) => m.AnimatedBackground),
);

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: "--font-playfair",
    display: "swap",
});

const montserrat = Montserrat({
    subsets: ["latin"],
    variable: "--font-montserrat",
    display: "swap",
});

export const metadata: Metadata = {
    title: "AuctaSync - Premium Auction Platform",
    description:
        "Discover exclusive items and bid with confidence on our secure auction platform.",
    keywords:
        "auction, bidding, collectibles, art auction, luxury auction, online bidding",
    icons: {
        icon: "/logo_favicon.svg",
        apple: "/logo_favicon.svg",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="scroll-smooth">
            <body
                className={`${playfair.variable} ${montserrat.variable} font-sans antialiased bg-[#0a0a18] text-white`}
            >
                {/* Decorative background lazy-loaded */}
                <AnimatedBackground />

                <SupabaseProvider>
                    <AuthProvider>
                        <UserProvider>
                            <Toaster position="top-center" />
                            {children}
                            {/* Chatbot is heavy, loaded only on client-side to keep FCP fast */}
                            <ChatbotWrapper />
                        </UserProvider>
                    </AuthProvider>
                </SupabaseProvider>

                <Analytics />
            </body>
        </html>
    );
}
