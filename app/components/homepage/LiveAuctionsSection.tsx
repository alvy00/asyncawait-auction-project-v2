/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import AuctionCard from "../auctions-cards/AuctionCard";
import { Auction } from "../../../lib/interfaces";
import AuctionCardBlitz from "../auctions-cards/AuctionCardBlitz";
import AuctionCardDutch from "../auctions-cards/AuctionCardDutch";
import AuctionCardReverse from "../auctions-cards/AuctionCardReverse";
import AuctionCardPhantom from "../auctions-cards/AuctionCardPhantom";
import { useUser } from "../../../lib/user-context";
import { useAuth } from "../../../lib/auth-context";

const maxVisibleItems = 3;

const LiveAuctionsSection = () => {
    const { user } = useUser();
    const { loggedIn } = useAuth();
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchFeaturedAuctions = async () => {
            try {
                const res = await fetch("/api/auctions/filter?type=featured", {
                    method: "POST",
                    headers: { "Content-type": "application/json" },
                });
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                setAuctions(data);
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchFeaturedAuctions();
    }, []);

    // Carousel Logic
    const totalSlides = Math.ceil(auctions.length / maxVisibleItems);
    const startIndex = currentSlide * maxVisibleItems;
    const visibleAuctions = auctions.slice(
        startIndex,
        startIndex + maxVisibleItems,
    );

    const goToPrevSlide = () =>
        setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
    const goToNextSlide = () =>
        setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));

    return (
        <section className="py-12 md:py-16 relative overflow-hidden">
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-10">
                    <div>
                        <h2 className="text-2xl md:text-3xl font-bold text-white">
                            Featured <span className="ml-2">Auctions</span>
                        </h2>
                        <p className="text-gray-400 text-sm md:text-base mt-1">
                            Handpicked deals from trusted sellers
                        </p>
                    </div>
                </div>

                <div className="min-h-[300px]">
                    <AnimatePresence mode="wait">
                        {isLoading ? (
                            <motion.div
                                key="loading"
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                                exit={{ opacity: 0 }}
                            >
                                {Array.from({ length: maxVisibleItems }).map(
                                    (_, i) => (
                                        <div
                                            key={i}
                                            className="rounded-xl border border-white/10 bg-white/5 p-4 animate-pulse space-y-4"
                                        >
                                            <div className="h-48 bg-gray-700/30 rounded-md"></div>
                                        </div>
                                    ),
                                )}
                            </motion.div>
                        ) : auctions.length > 0 ? (
                            <motion.div
                                key={currentSlide}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.3 }}
                                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                            >
                                {visibleAuctions.map((auction) => (
                                    <div key={auction.auction_id}>
                                        {auction.auction_type === "classic" && (
                                            <AuctionCard
                                                auction={auction}
                                                auctionCreator={auction.creator}
                                                isFavourited={
                                                    auction.isFavorite
                                                }
                                                user={user}
                                                loggedIn={loggedIn}
                                            />
                                        )}
                                        {auction.auction_type === "blitz" && (
                                            <AuctionCardBlitz
                                                auction={auction}
                                                auctionCreator={auction.creator}
                                                user={user}
                                                loggedIn={loggedIn}
                                                isFavourited={false}
                                            />
                                        )}
                                        {auction.auction_type === "dutch" && (
                                            <AuctionCardDutch
                                                auction={auction}
                                                auctionCreator={auction.creator}
                                                user={user}
                                                loggedIn={loggedIn}
                                                isFavourited={false}
                                            />
                                        )}
                                        {auction.auction_type === "reverse" && (
                                            <AuctionCardReverse
                                                auction={auction}
                                                auctionCreator={auction.creator}
                                                user={user}
                                                loggedIn={loggedIn}
                                                isFavourited={false}
                                            />
                                        )}
                                        {auction.auction_type === "phantom" && (
                                            <AuctionCardPhantom
                                                auction={auction}
                                                auctionCreator={auction.creator}
                                                user={user}
                                                loggedIn={loggedIn}
                                                isFavourited={false}
                                            />
                                        )}
                                    </div>
                                ))}
                            </motion.div>
                        ) : (
                            <div className="text-center text-white py-10">
                                No Featured Auctions
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Navigation Controls */}
                {totalSlides > 1 && (
                    <div className="flex justify-center md:justify-end gap-4 mt-8">
                        <button
                            onClick={goToPrevSlide}
                            className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center text-white hover:bg-gray-800 transition-colors"
                        >
                            ←
                        </button>
                        <button
                            onClick={goToNextSlide}
                            className="w-10 h-10 rounded-full border border-gray-600 flex items-center justify-center text-white hover:bg-gray-800 transition-colors"
                        >
                            →
                        </button>
                    </div>
                )}
            </div>
        </section>
    );
};

export default LiveAuctionsSection;
