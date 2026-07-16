"use client";

import { useState } from "react";
import Image from "next/image";
import { Star, StarHalf } from "lucide-react";
import { AuctionTabsProps } from "@/lib/interfaces";

// Simple, safe utility to format DB timestamps dynamically
const formatDate = (dateString: string) => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    } catch {
        return dateString;
    }
};

const AuctionTabs = ({ bidHistory = [], reviews = [] }: AuctionTabsProps) => {
    const [activeTab, setActiveTab] = useState<"reviews" | "bids-history">(
        "reviews",
    );

    return (
        <div className="mt-12 text-white">
            {/* Tab Navigation */}
            <div className="border-b border-white/10">
                <div className="flex gap-8">
                    <button
                        className={`pb-3 font-semibold text-sm sm:text-base transition-all duration-200 border-b-2 cursor-pointer ${
                            activeTab === "reviews"
                                ? "border-[#ef863f] text-[#ef863f]"
                                : "border-transparent text-white/50 hover:text-white"
                        }`}
                        onClick={() => setActiveTab("reviews")}
                    >
                        Reviews ({reviews?.length || 0})
                    </button>
                    <button
                        className={`pb-3 font-semibold text-sm sm:text-base transition-all duration-200 border-b-2 cursor-pointer ${
                            activeTab === "bids-history"
                                ? "border-[#ef863f] text-[#ef863f]"
                                : "border-transparent text-white/50 hover:text-white"
                        }`}
                        onClick={() => setActiveTab("bids-history")}
                    >
                        Bids History ({bidHistory?.length || 0})
                    </button>
                </div>
            </div>

            {/* Tab Panels */}
            <div className="mt-8">
                {/* Auction History Tab */}
                {activeTab === "bids-history" && (
                    <div className="bg-[#010915]/40 border border-white/10 rounded-xl overflow-hidden backdrop-blur-md">
                        {bidHistory && bidHistory.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-white/5 text-white/60 font-medium">
                                        <tr>
                                            <th className="px-5 py-3.5 text-left">
                                                Bidder
                                            </th>
                                            <th className="px-5 py-3.5 text-left">
                                                Bid Amount
                                            </th>
                                            <th className="px-5 py-3.5 text-left">
                                                Date & Time
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/10">
                                        {bidHistory.map((bid, index) => (
                                            <tr
                                                key={index}
                                                className="hover:bg-white/5 transition-colors duration-150"
                                            >
                                                <td className="px-5 py-3.5">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-white/10 text-xs font-bold text-white/80 border border-white/5 uppercase">
                                                            {bid.user_id
                                                                ? bid.user_id.slice(
                                                                      0,
                                                                      2,
                                                                  )
                                                                : "??"}
                                                        </div>
                                                        <span className="font-medium text-white/90">
                                                            {bid.user_id}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-5 py-3.5 font-bold text-[#ef863f]">
                                                    $
                                                    {(
                                                        bid.bid_amount ?? 0
                                                    ).toFixed(2)}
                                                </td>
                                                <td className="px-5 py-3.5 text-white/50">
                                                    {formatDate(bid.created_at)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center text-white/40 py-12 text-sm flex flex-col items-center justify-center gap-2">
                                <span className="text-2xl">🔨</span>
                                <p>No bids yet. Be the first to place a bid!</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Reviews Tab */}
                {activeTab === "reviews" && (
                    <div className="space-y-6">
                        {reviews && reviews.length > 0 ? (
                            reviews.map((review, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-4 pb-6 border-b border-white/10 last:border-0"
                                >
                                    <div className="relative w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
                                        <Image
                                            src={
                                                review.reviewer?.image ||
                                                "/fallback_user_avatar.png"
                                            }
                                            alt={
                                                review.reviewer?.name ||
                                                "Reviewer"
                                            }
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-semibold text-white truncate pr-2">
                                                {review.reviewer?.name ||
                                                    "Anonymous"}
                                            </h3>
                                            <span className="text-xs text-white/40 flex-shrink-0">
                                                {review.date}
                                            </span>
                                        </div>

                                        {/* Star Rating Layout */}
                                        <div className="flex items-center mb-2">
                                            {[1, 2, 3, 4, 5].map((star) => {
                                                const floorRating = Math.floor(
                                                    review.rating ?? 0,
                                                );
                                                const isHalf =
                                                    star ===
                                                        Math.ceil(
                                                            review.rating ?? 0,
                                                        ) &&
                                                    !Number.isInteger(
                                                        review.rating ?? 0,
                                                    );

                                                if (star <= floorRating) {
                                                    return (
                                                        <Star
                                                            key={star}
                                                            className="h-4 w-4 fill-[#ef863f] text-[#ef863f]"
                                                        />
                                                    );
                                                } else if (isHalf) {
                                                    return (
                                                        <StarHalf
                                                            key={star}
                                                            className="h-4 w-4 fill-[#ef863f] text-[#ef863f]"
                                                        />
                                                    );
                                                } else {
                                                    return (
                                                        <Star
                                                            key={star}
                                                            className="h-4 w-4 text-white/20"
                                                        />
                                                    );
                                                }
                                            })}
                                            <span className="ml-2 text-xs font-semibold text-[#ef863f]">
                                                (
                                                {(review.rating ?? 0).toFixed(
                                                    1,
                                                )}
                                                )
                                            </span>
                                        </div>

                                        <p className="text-white/70 text-sm leading-relaxed whitespace-pre-line">
                                            {review.comment}
                                        </p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-white/40 py-12 text-sm border border-white/10 rounded-xl bg-white/5 flex flex-col items-center justify-center gap-2">
                                <span className="text-2xl">⭐️</span>
                                <p>No reviews posted yet.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default AuctionTabs;
