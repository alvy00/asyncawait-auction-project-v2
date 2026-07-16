/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { PastAuctionCardProps } from "../../lib/interfaces";

const PastAuctionCard: React.FC<PastAuctionCardProps> = ({ auction }) => {
    const firstImage = auction.images?.[0] || "/fallback.jpg";
    const [winner, setWinner] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true; // Prevents state updates on unmounted components
        const getHighestBidder = async () => {
            const userId = auction?.highest_bidder_id;
            if (!userId) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch("/api/users/public", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: userId }),
                });

                const data = await res.json();
                if (isMounted) {
                    setWinner(data.name || "Unknown User");
                    setLoading(false);
                }
            } catch (err) {
                if (isMounted) setLoading(false);
            }
        };

        getHighestBidder();
        return () => {
            isMounted = false;
        };
    }, [auction?.highest_bidder_id]);

    return (
        <motion.div
            whileHover={{ y: -8 }}
            className="bg-slate-900/50 backdrop-blur-md border border-white/10 rounded-2xl shadow-xl overflow-hidden"
        >
            <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                    src={firstImage}
                    alt={auction.item_name}
                    fill
                    className="object-cover transition-transform duration-500 hover:scale-110"
                />
            </div>

            <div className="p-5 space-y-2">
                <h2 className="text-xl font-bold text-white truncate">
                    {auction.item_name}
                </h2>
                <p className="text-xs text-slate-400">
                    Ended:{" "}
                    {auction.end_time
                        ? new Date(auction.end_time).toLocaleDateString()
                        : "N/A"}
                </p>

                <div className="pt-2 border-t border-white/5">
                    <p className="text-sm text-slate-400 flex justify-between">
                        Winner:
                        {loading ? (
                            <span className="animate-pulse text-slate-600">
                                Loading...
                            </span>
                        ) : (
                            <span
                                className={`font-semibold ${winner ? "text-emerald-400" : "text-rose-400"}`}
                            >
                                {winner || "No bids placed"}
                            </span>
                        )}
                    </p>
                    <p className="text-sm text-slate-400 flex justify-between mt-1">
                        Price:
                        <span className="font-bold text-amber-500">
                            {auction.highest_bid &&
                            Number(auction.highest_bid) > 0
                                ? `$${Number(auction.highest_bid).toLocaleString()}`
                                : "N/A"}
                        </span>
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default PastAuctionCard;
