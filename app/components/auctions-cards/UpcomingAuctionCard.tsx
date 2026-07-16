"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Countdown } from "./../misc/Countdown";
import { UpcomingAuctionCardProps } from "../../../lib/interfaces";
import { FaClock, FaUser } from "react-icons/fa";

const FALLBACK_IMAGE = "/fallback.jpg";

const UpcomingAuctionCard = ({
    auction,
    auctionCreator,
}: UpcomingAuctionCardProps) => {
    const imageSrc = auction.images?.[0]?.trim() || FALLBACK_IMAGE;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            className="group relative overflow-hidden rounded-2xl bg-slate-900/40 backdrop-blur-md border border-white/10 shadow-2xl transition-all duration-300"
        >
            {/* Image Section */}
            <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                    src={imageSrc}
                    alt={auction.item_name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />

                {/* Pulsing Status Badge */}
                <motion.div
                    animate={{ opacity: [1, 0.7, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute top-4 left-4 bg-blue-500/90 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-sm"
                >
                    <FaClock className="text-[10px]" />
                    Upcoming
                </motion.div>
            </div>

            {/* Content Section */}
            <div className="p-6">
                <h3 className="text-2xl font-bold text-white mb-1 truncate">
                    {auction.item_name}
                </h3>

                <div className="flex items-center gap-2 text-sm text-slate-400 mb-4">
                    <FaUser className="h-3 w-3" />
                    <span className="truncate">{auctionCreator}</span>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-400">Starting at:</span>
                        <span className="font-bold text-amber-500">
                            $
                            {auction.starting_price.toLocaleString("en-US", {
                                minimumFractionDigits: 2,
                            })}
                        </span>
                    </div>

                    <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                        <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                            Starts in
                        </p>
                        <div className="text-white font-mono text-lg">
                            <Countdown endTime={auction.start_time} />
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="bg-orange-600 hover:bg-orange-500 text-white py-2 rounded-lg text-sm font-semibold transition"
                    >
                        Notify Me
                    </motion.button>
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        className="border border-white/20 hover:bg-white/10 text-white py-2 rounded-lg text-sm transition"
                    >
                        Preview
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

export default UpcomingAuctionCard;
