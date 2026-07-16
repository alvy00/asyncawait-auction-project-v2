"use client";

import { useState, useEffect } from "react";
import { Minus, Plus, Loader2 } from "lucide-react";
import { BiddingSectionProps } from "@/lib/interfaces";

const BiddingSection = ({ currentBid, onBid }: BiddingSectionProps) => {
    const minIncrement = 5;
    const minimumBid = currentBid + 1;

    const [bidAmount, setBidAmount] = useState(currentBid + minIncrement);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Critical: Sync local bid amount state if another client updates the current bid in real-time
    useEffect(() => {
        setBidAmount((prev) =>
            prev <= currentBid ? currentBid + minIncrement : prev,
        );
    }, [currentBid]);

    const handleIncreaseBid = () => {
        setBidAmount((prev) => prev + minIncrement);
    };

    const handleDecreaseBid = () => {
        setBidAmount((prev) => {
            if (prev - minIncrement >= minimumBid) {
                return prev - minIncrement;
            }
            return minimumBid;
        });
    };

    const handleInputChange = (val: string) => {
        const parsed = parseFloat(val);
        if (isNaN(parsed)) {
            setBidAmount(0);
        } else {
            setBidAmount(parsed);
        }
    };

    const handleInputBlur = () => {
        // If the user leaves the input invalid or too low, auto-reset to the safe minimum
        if (bidAmount < minimumBid) {
            setBidAmount(minimumBid);
        }
    };

    const handleBidSubmit = async () => {
        if (bidAmount < minimumBid) return;

        setIsSubmitting(true);
        try {
            await onBid(bidAmount);
        } catch (err) {
            console.error("Bid submission failed:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isBidInvalid = bidAmount < minimumBid;

    return (
        <div className="text-white space-y-4 max-w-md">
            {/* Bid Interaction Control */}
            <div className="flex items-center gap-2">
                {/* Decrease Button */}
                <button
                    type="button"
                    disabled={bidAmount <= minimumBid || isSubmitting}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 rounded-lg p-3 transition-colors cursor-pointer"
                    onClick={handleDecreaseBid}
                >
                    <Minus className="h-5 w-5" />
                </button>

                {/* Dynamic Number Input */}
                <div className="flex-1 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-semibold select-none">
                        $
                    </span>
                    <input
                        type="number"
                        step="1"
                        min={minimumBid}
                        disabled={isSubmitting}
                        value={bidAmount === 0 ? "" : bidAmount}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onBlur={handleInputBlur}
                        className="w-full bg-[#010915] border border-white/10 focus:border-[#ef863f] rounded-lg pl-8 pr-4 py-3 text-center text-lg font-bold text-white tracking-wide focus:outline-none focus:ring-1 focus:ring-[#ef863f] transition-all"
                    />
                </div>

                {/* Increase Button */}
                <button
                    type="button"
                    disabled={isSubmitting}
                    className="bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-40 disabled:hover:bg-white/5 rounded-lg p-3 transition-colors cursor-pointer"
                    onClick={handleIncreaseBid}
                >
                    <Plus className="h-5 w-5" />
                </button>

                {/* Place Bid CTA Button */}
                <button
                    type="button"
                    disabled={isBidInvalid || isSubmitting}
                    className="bg-[#ef863f] hover:bg-[#e27933] disabled:bg-white/10 disabled:text-white/40 text-white font-bold rounded-lg px-6 py-3.5 transition-all duration-200 shadow-lg shadow-[#ef863f]/10 cursor-pointer flex items-center justify-center min-w-[100px]"
                    onClick={handleBidSubmit}
                >
                    {isSubmitting ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        "Bid"
                    )}
                </button>
            </div>

            {/* Validation Warnings */}
            {isBidInvalid && bidAmount > 0 && (
                <p className="text-xs text-red-400 font-medium">
                    ⚠️ Bid must be at least ${minimumBid.toFixed(2)} (Current
                    Bid + $1.00)
                </p>
            )}

            {/* Trust & Safe Checkout Badges */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-md">
                <div className="text-[10px] uppercase tracking-wider text-center text-white/40 font-semibold mb-3">
                    Guaranteed Safe & Encrypted Checkout
                </div>

                {/* Optimized responsive vector flexbox */}
                <div className="flex items-center justify-center gap-6 opacity-60 hover:opacity-80 transition-opacity duration-300">
                    <span className="text-xs font-black tracking-widest text-white/70 italic">
                        STRIPE
                    </span>
                    <span className="text-xs font-black tracking-widest text-white/70 italic">
                        PAYPAL
                    </span>
                    <span className="text-xs font-black tracking-widest text-white/70 italic">
                        VISA
                    </span>
                    <span className="text-xs font-black tracking-widest text-white/70 italic">
                        MC
                    </span>
                </div>
            </div>
        </div>
    );
};

export default BiddingSection;
