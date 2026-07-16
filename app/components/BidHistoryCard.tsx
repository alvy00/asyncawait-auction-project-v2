"use client";

import React from "react";
import { motion } from "framer-motion";
import { FaGavel, FaCalendarAlt } from "react-icons/fa";

interface BidHistoryCardProps {
    item_name: string;
    bid_amount: number;
    created_at: string; // The formatted string returned from your API
    isLeading?: boolean; // Dynamically computed value based on current auction state
}

export default function BidHistoryCard({
    item_name,
    bid_amount,
    created_at,
    isLeading = false,
}: BidHistoryCardProps) {
    return (
        <motion.div
            whileHover={{ y: -2, scale: 1.01 }}
            className="relative bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-2xl shadow-xl flex flex-col gap-3 transition-colors duration-200 hover:border-indigo-500/30 text-white"
        >
            {/* Upper Meta Section */}
            <div className="flex justify-between items-start gap-4">
                <div className="flex flex-col gap-0.5 min-w-0">
                    <span className="text-[11px] uppercase tracking-widest text-zinc-400 font-bold">
                        Auction Item
                    </span>
                    <h4 className="font-semibold text-base text-zinc-100 truncate max-w-[220px]">
                        {item_name}
                    </h4>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-zinc-400 font-mono bg-black/20 px-2.5 py-1 rounded-md border border-white/5">
                    <FaCalendarAlt className="text-zinc-500" />
                    <span>{created_at}</span>
                </div>
            </div>

            {/* Main Stats Block */}
            <div className="flex items-center justify-between mt-1 pt-3 border-t border-white/5">
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
                        Your Offer
                    </span>
                    <div className="text-xl font-black text-indigo-400 font-mono flex items-center gap-1">
                        <FaGavel className="text-indigo-400/70 w-4 h-4" />
                        <span>
                            $
                            {bid_amount.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                            })}
                        </span>
                    </div>
                </div>

                {/* Dynamic Status Badge */}
                <div className="flex flex-col items-end">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium mb-1">
                        Position
                    </span>
                    <span
                        className={`text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border shadow-sm ${
                            isLeading
                                ? "bg-green-500/10 text-green-400 border-green-500/20 ring-1 ring-green-500/30"
                                : "bg-zinc-800/50 text-zinc-400 border-white/5"
                        }`}
                    >
                        {isLeading ? "Leading" : "Outbid / Historical"}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}
