"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";

// Keep critical components imported normally for instant LCP (Largest Contentful Paint)
import { HeroSection } from "../components/homepage/HeroSection";
import LiveAuctionsSection from "../components/homepage/LiveAuctionsSection";

const AuctionTypesSection = dynamic(() =>
    import("../components/auction-types/AuctionTypesSection").then(
        (m) => m.AuctionTypesSection,
    ),
);
const WhyChooseUsSection = dynamic(
    () => import("@/app/components/homepage/WhyChooseUsSection"),
);
const MarketingShowcase = dynamic(
    () => import("../components/homepage/MarketingShowcase"),
);
//const CategorySection = dynamic(() => import("../components/CategorySection"));
const TestimonialsSection = dynamic(
    () => import("../components/homepage/TestimonialsSection"),
);
const NewsletterSection = dynamic(
    () => import("../components/homepage/NewsletterSection"),
);

export default function Home() {
    // webapp start-up server warmup
    useEffect(() => {
        const hasPinged = sessionStorage.getItem("hasPingedServer");

        // Cold-start ping
        if (!hasPinged) {
            fetch("/api").catch(console.error);
            fetch("/api/auctions/maintenance").catch(console.error);
            sessionStorage.setItem("hasPingedServer", "true");
        }
    }, []);

    return (
        <main className="relative overflow-hidden text-white">
            <HeroSection />
            <LiveAuctionsSection />

            {/* Lazy-loaded sections */}
            <AuctionTypesSection />
            <WhyChooseUsSection />
            <MarketingShowcase />
            {/* <CategorySection /> */}
            <TestimonialsSection />
            <NewsletterSection />
        </main>
    );
}
