import type { Metadata } from "next";
import { Navbar } from "../components/homepage/Navbar";
import Footer from "../components/homepage/Footer";

export const metadata: Metadata = {
    title: "AuctaSync - Premium Auction Platform",
    description:
        "Discover exclusive items and bid with confidence on our secure auction platform. Find art, collectibles, luxury goods and more.",
    keywords:
        "auction, bidding, collectibles, art auction, luxury auction, online bidding",
};

export default function HomeLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="bg-[#0A111B]">
            <Navbar />
            {children}
            <Footer />
        </div>
    );
}
