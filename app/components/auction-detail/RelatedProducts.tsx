/* eslint-disable prefer-const */
"use client";

import { useState, useEffect } from "react";
import AuctionCard from "../AuctionCard";
import { Auction } from "@/lib/interfaces";
import { motion, AnimatePresence } from "framer-motion";

interface RelatedProductsProps {
    currentAuctionId: string;
    category?: string;
}

const RelatedProducts = ({
    currentAuctionId,
    category,
}: RelatedProductsProps) => {
    const [relatedAuctions, setRelatedAuctions] = useState<Auction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [favoritesMap, setFavoritesMap] = useState<Record<string, boolean>>(
        {},
    );

    useEffect(() => {
        const fetchRelatedAuctions = async () => {
            setIsLoading(true);
            try {
                let url = `/api/auctions`;
                if (category) {
                    url += `?category=${encodeURIComponent(category)}`;
                }

                const res = await fetch(url, {
                    method: "GET",
                    headers: {
                        "Content-type": "application/json",
                    },
                });

                if (!res.ok) {
                    throw new Error(
                        "Failed to fetch related category auctions",
                    );
                }

                let data: Auction[] = await res.json();

                // Filter out current active product
                let filtered = data.filter(
                    (auction) => auction.auction_id !== currentAuctionId,
                );

                if (filtered.length < 4) {
                    const fallbackRes = await fetch(`/api/auctions`);
                    if (fallbackRes.ok) {
                        const fallbackData: Auction[] =
                            await fallbackRes.json();
                        const fallbackFiltered = fallbackData.filter(
                            (a) =>
                                a.auction_id !== currentAuctionId &&
                                a.category !== category,
                        );

                        // Merge and de-duplicate array
                        filtered = [...filtered, ...fallbackFiltered].slice(
                            0,
                            4,
                        );
                    }
                } else {
                    filtered = filtered.slice(0, 4);
                }

                setRelatedAuctions(filtered);

                // Initialize state maps safely
                const initialFavs: Record<string, boolean> = {};
                filtered.forEach((auction) => {
                    initialFavs[auction.auction_id] = false;
                });
                setFavoritesMap(initialFavs);
            } catch (e) {
                console.error("Error fetching related auctions:", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRelatedAuctions();
    }, [currentAuctionId, category]);

    const handleToggleFavorite = (auctionId: string) => {
        setFavoritesMap((prev) => ({
            ...prev,
            [auctionId]: !prev[auctionId],
        }));
    };

    // 1. Shimmer/Skeleton Loader layout to prevent sudden design pop-ins
    if (isLoading) {
        return (
            <div className="mt-16">
                <div className="h-8 w-48 bg-white/10 rounded-lg animate-pulse mb-6" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map((id) => (
                        <div
                            key={id}
                            className="w-full h-[420px] md:h-[500px] rounded-2xl border border-white/10 bg-white/5 animate-pulse flex flex-col justify-between p-5"
                        >
                            <div className="w-full h-[200px] bg-white/5 rounded-xl" />
                            <div className="space-y-3">
                                <div className="h-4 bg-white/10 rounded w-3/4" />
                                <div className="h-3 bg-white/10 rounded w-1/2" />
                            </div>
                            <div className="h-10 bg-white/10 rounded-full w-full" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Prevent rendering if completely empty after fetch
    if (relatedAuctions.length === 0) {
        return null;
    }

    return (
        <div className="mt-16 text-white">
            <h2 className="text-xl md:text-2xl font-bold tracking-wide uppercase mb-6 bg-gradient-to-r from-white to-white/50 bg-clip-text text-transparent">
                Related Products
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                    {relatedAuctions.map((auction, index) => (
                        <motion.div
                            key={auction.auction_id}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            transition={{ duration: 0.35, delay: index * 0.05 }}
                        >
                            <AuctionCard
                                auction={auction}
                                auctionCreator={auction.creator || "Anonymous"}
                                isFavourited={
                                    !!favoritesMap[auction.auction_id]
                                }
                                onToggleFavorite={() =>
                                    handleToggleFavorite(auction.auction_id)
                                }
                            />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default RelatedProducts;
