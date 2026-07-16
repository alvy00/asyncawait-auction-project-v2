"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Heart, HelpCircle } from "lucide-react";
import { AuctionDetailsProps } from "@/lib/interfaces";

// Custom type to parse the remaining time
interface TimeRemaining {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

const AuctionDetails = ({
    seller,
    title,
    description,
    currentBid,
    startingBid,
    condition,
    categories,
    endTime, // Now dynamically supporting Date, ISO string, or an existing helper object
}: Omit<AuctionDetailsProps, "endTime"> & {
    endTime: string | Date | TimeRemaining;
}) => {
    const [timeLeft, setTimeLeft] = useState<TimeRemaining>({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    // Dynamically calculate and decrement remaining time locally
    useEffect(() => {
        // If an object is explicitly passed instead of a date string, fall back to static props
        if (
            typeof endTime === "object" &&
            !("getTime" in endTime) &&
            "days" in endTime
        ) {
            setTimeLeft(endTime as TimeRemaining);
            return;
        }

        const calculateTimeLeft = () => {
            const difference =
                +new Date(endTime as string | Date) - +new Date();
            if (difference <= 0) {
                return { days: 0, hours: 0, minutes: 0, seconds: 0 };
            }

            return {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, [endTime]);

    // Handle Categories gracefully (whether string or array)
    const renderedCategories = Array.isArray(categories) ? (
        <div className="flex flex-wrap gap-1.5 mt-1">
            {categories.map((cat, i) => (
                <span
                    key={i}
                    className="text-xs bg-white/10 text-white/90 px-2.5 py-0.5 rounded-full border border-white/5"
                >
                    {cat}
                </span>
            ))}
        </div>
    ) : (
        <div className="font-medium text-white">{categories || "N/A"}</div>
    );

    return (
        <div className="text-white space-y-6">
            {/* Seller Header */}
            <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-white/10">
                    <Image
                        src={seller?.image || "/fallback_user_avatar.png"}
                        alt={seller?.name || "Seller"}
                        fill
                        className="object-cover"
                    />
                </div>
                <div>
                    <p className="text-xs text-white/50">Listed by</p>
                    <span className="text-sm font-medium hover:underline cursor-pointer">
                        {seller?.name || "Anonymous"}
                    </span>
                </div>
            </div>

            {/* Title & Description */}
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight mb-2 text-white">
                    {title}
                </h1>
                <p className="text-white/70 text-sm md:text-base leading-relaxed whitespace-pre-line">
                    {description}
                </p>
            </div>

            {/* Bidding Grid */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md">
                <div className="text-xs uppercase tracking-wider text-white/50 mb-1">
                    Current Bid
                </div>
                <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-black text-[#ef863f]">
                        ${(currentBid ?? 0).toFixed(2)}
                    </span>
                    <span className="text-xs text-red-400 font-medium bg-red-500/10 px-2 py-0.5 rounded border border-red-500/15">
                        Starting: ${(startingBid ?? 0).toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Condition & Categories Metadata */}
            <div className="grid grid-cols-2 gap-4 border-t border-b border-white/10 py-4">
                <div>
                    <span className="text-xs text-white/40 uppercase tracking-wider block mb-1">
                        Item Condition
                    </span>
                    <div className="font-medium text-white">
                        {condition || "Unknown"}
                    </div>
                </div>
                <div>
                    <span className="text-xs text-white/40 uppercase tracking-wider block mb-1">
                        Categories
                    </span>
                    {renderedCategories}
                </div>
            </div>

            {/* Live Timer Countdown */}
            <div>
                <span className="text-xs uppercase tracking-wider text-white/40 block mb-2">
                    Time Remaining
                </span>
                <div className="flex gap-2">
                    {[
                        { value: timeLeft.days, label: "Days" },
                        { value: timeLeft.hours, label: "Hours" },
                        { value: timeLeft.minutes, label: "Minutes" },
                        { value: timeLeft.seconds, label: "Seconds" },
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="bg-white/5 border border-white/10 rounded-lg p-2.5 text-center min-w-[65px] sm:min-w-[75px]"
                        >
                            <div className="text-xl sm:text-2xl font-black text-white">
                                {String(item.value).padStart(2, "0")}
                            </div>
                            <div className="text-[10px] uppercase text-white/40 font-medium mt-0.5">
                                {item.label}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap gap-4 pt-2 border-t border-white/5">
                <button className="flex items-center gap-2 text-xs font-semibold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-lg transition-all cursor-pointer">
                    <HelpCircle className="h-4 w-4" />
                    <span>Ask Question</span>
                </button>
                <button className="flex items-center gap-2 text-xs font-semibold text-white/80 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2.5 rounded-lg transition-all cursor-pointer">
                    <Heart className="h-4 w-4" />
                    <span>Add to Watchlist</span>
                </button>
            </div>
        </div>
    );
};

export default AuctionDetails;
