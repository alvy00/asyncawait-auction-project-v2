/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../../components/ui/dialog";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Auction } from "../../lib/interfaces";
import Image from "next/image";
import {
    FaTag,
    FaBoxes,
    FaDollarSign,
    FaGavel,
    FaCalendarAlt,
    FaArrowRight,
    FaArrowLeft,
    FaShareAlt,
} from "react-icons/fa";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "../../components/ui/avatar";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface AuctionDetailsModalProps {
    open: boolean;
    onClose: () => void;
    auction: Auction | null;
}

interface TopBid {
    amount: number;
    name: string;
    created_at: string;
    avatar?: string;
}

// Countdown Clock Component
const Countdown = ({ endTime }: { endTime: string }) => {
    const [timeLeft, setTimeLeft] = useState("");

    useEffect(() => {
        const interval = setInterval(() => {
            const distance = new Date(endTime).getTime() - Date.now();
            if (distance <= 0) {
                setTimeLeft("Ended");
                clearInterval(interval);
                return;
            }
            const h = Math.floor(distance / (1000 * 60 * 60));
            const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const s = Math.floor((distance % (1000 * 60)) / 1000);

            setTimeLeft(`${h}h ${m}m ${s}s`);
        }, 1000);

        return () => clearInterval(interval);
    }, [endTime]);

    return (
        <span className="text-white font-mono font-semibold text-md">
            {timeLeft}
        </span>
    );
};

// Glassmorphic / Premium Custom Badges
const getAuctionTypeGradient = (type?: string) => {
    switch (type?.toLowerCase()) {
        case "classic":
            return "from-green-400 via-green-600 to-green-700 ring-green-500";
        case "blitz":
            return "from-orange-400 via-red-500 to-orange-600 ring-orange-500";
        case "dutch":
            return "from-cyan-400 via-cyan-600 to-cyan-700 ring-cyan-500";
        case "reverse":
            return "from-purple-700 via-purple-900 to-purple-800 ring-purple-700";
        case "phantom":
            return "from-yellow-600 via-yellow-700 to-yellow-800 ring-yellow-600";
        default:
            return "from-cyan-400 via-blue-400 to-purple-500 ring-blue-400";
    }
};

export default function AuctionDetailsModal({
    open,
    onClose,
    auction,
}: AuctionDetailsModalProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [topBids, setTopBids] = useState<TopBid[]>([]);
    const router = useRouter();

    const images = auction?.images || [];

    // Reset Carousel Index on Item Swaps
    useEffect(() => {
        if (open) setCurrentImageIndex(0);
    }, [open, auction?.auction_id]);

    // Integrated Route Fetcher matching api/auctions/history?type=top
    useEffect(() => {
        const getTopBids = async () => {
            try {
                const res = await fetch("/api/auctions/history?type=top", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ auction_id: auction?.auction_id }),
                });

                if (!res.ok)
                    throw new Error(
                        "Network issue reading current bid history",
                    );
                const data = await res.json();
                setTopBids(data || []);
            } catch (e) {
                console.error("Failed to fetch top bids:", e);
            }
        };

        if (auction?.auction_id && open) {
            getTopBids();
        }
    }, [auction?.auction_id, open]);

    if (!auction) return null;

    const handleShare = async () => {
        const url = `${window.location.origin}/auctions/${auction.auction_id}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: auction.item_name,
                    text: `Check out this auction: ${auction.item_name}`,
                    url,
                });
                toast.success("Shared successfully!");
            } catch (error) {
                toast.error("Sharing failed or canceled.");
            }
        } else {
            try {
                await navigator.clipboard.writeText(url);
                toast.success("Auction URL copied to clipboard!");
            } catch {
                toast.error("Failed to copy URL.");
            }
        }
    };

    const handleViewFullDetails = () => {
        onClose();
        router.push(`/auctions/${auction.auction_id}`);
    };

    const details = [
        {
            icon: <FaTag />,
            label: "Category",
            value: auction.category || "N/A",
        },
        {
            icon: <FaBoxes />,
            label: "Condition",
            value: auction.condition || "N/A",
        },
        {
            icon: <FaDollarSign />,
            label: "Start",
            value: `$${(auction.starting_price || 0).toFixed(2)}`,
        },
    ];

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-[1200px] w-full max-h-[90vh] p-0 bg-transparent border-none shadow-none flex flex-row items-stretch justify-center gap-6 focus-visible:outline-none">
                <DialogTitle className="sr-only">
                    {auction.item_name} Information Modal
                </DialogTitle>

                <AnimatePresence mode="wait">
                    {open && (
                        <motion.div
                            initial={{ opacity: 0, y: 30, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 30, scale: 0.97 }}
                            transition={{
                                duration: 0.4,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            className="flex w-full max-h-[90vh]"
                        >
                            {/* Left Side: Image Gallery Presentation */}
                            <div className="relative w-[60%] rounded-l-3xl overflow-hidden bg-black/40 border border-white/10 border-r-0">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentImageIndex}
                                        initial={{ opacity: 0, scale: 1.03 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.4 }}
                                        className="absolute inset-0"
                                    >
                                        <Image
                                            src={
                                                images[currentImageIndex] ||
                                                "/fallback.jpg"
                                            }
                                            alt="Product Details Preview Image"
                                            fill
                                            className="object-cover w-full h-full rounded-l-3xl"
                                            sizes="(max-width: 768px) 100vw, 900px"
                                            priority
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                                    </motion.div>
                                </AnimatePresence>

                                {/* Floating Layout Overlays */}
                                <div className="absolute top-0 left-0 p-6 flex flex-col gap-2 z-10">
                                    <h2
                                        className="text-2xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-md"
                                        style={{
                                            textShadow:
                                                "0 4px 20px rgba(0,0,0,0.6)",
                                        }}
                                    >
                                        {auction.item_name}
                                    </h2>
                                    <span
                                        className={`inline-block text-xs md:text-sm font-semibold uppercase tracking-wider bg-gradient-to-r text-white px-4 py-1 rounded-full shadow-md border border-white/20 ring-1 animate-pulse w-fit ${getAuctionTypeGradient(
                                            auction.auction_type,
                                        )}`}
                                    >
                                        {auction.auction_type || "Classic"}
                                    </span>
                                </div>

                                {/* Micro-interactive Navigation Actions */}
                                {images.length > 1 && (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentImageIndex(
                                                    (currentImageIndex -
                                                        1 +
                                                        images.length) %
                                                        images.length,
                                                );
                                            }}
                                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-md p-3 rounded-full text-white/90 hover:bg-white/20 shadow-lg border border-white/10 transition active:scale-90"
                                            aria-label="Previous gallery image"
                                        >
                                            <FaArrowLeft className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setCurrentImageIndex(
                                                    (currentImageIndex + 1) %
                                                        images.length,
                                                );
                                            }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 backdrop-blur-md p-3 rounded-full text-white/90 hover:bg-white/20 shadow-lg border border-white/10 transition active:scale-90"
                                            aria-label="Next gallery image"
                                        >
                                            <FaArrowRight className="w-4 h-4" />
                                        </button>

                                        {/* Visual Progress Nodes */}
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                                            {images.map((_, i) => (
                                                <button
                                                    key={i}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setCurrentImageIndex(i);
                                                    }}
                                                    className={`h-1.5 transition-all rounded-full ${
                                                        i === currentImageIndex
                                                            ? "bg-white w-6 shadow-inner"
                                                            : "bg-white/40 w-2 hover:bg-white/60"
                                                    }`}
                                                    aria-label={`Switch indicator panel to item #${i + 1}`}
                                                />
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Right Side: Glassmorphic Details Canvas */}
                            <div className="w-[40%] bg-zinc-900/40 backdrop-blur-3xl px-6 md:px-8 py-8 flex flex-col gap-6 text-white rounded-r-3xl max-h-[90vh] overflow-y-auto custom-scrollbar border border-white/10">
                                {/* Metric Status Panels */}
                                <div className="flex flex-col items-center justify-center bg-white/5 border border-white/5 rounded-2xl py-4 shadow-inner">
                                    {auction.auction_type === "phantom" ? (
                                        <>
                                            <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold mb-1">
                                                Total Bids Placed
                                            </span>
                                            <span className="text-3xl font-black text-green-400 drop-shadow flex items-center gap-2">
                                                <FaGavel className="text-green-400/80 w-6 h-6 animate-bounce" />
                                                {auction.total_bids || "0"}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-xs uppercase tracking-widest text-zinc-400 font-bold mb-1">
                                                Highest Active Bid
                                            </span>
                                            <span className="text-3xl font-black text-green-400 drop-shadow flex items-center gap-2">
                                                <FaGavel className="text-green-400/80 w-6 h-6" />
                                                {auction.highest_bid
                                                    ? `$${auction.highest_bid.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                                                    : "No Bids"}
                                            </span>
                                        </>
                                    )}
                                </div>

                                {/* Description Text block */}
                                <p className="text-sm md:text-base text-zinc-300 leading-relaxed text-center bg-black/20 p-4 rounded-xl border border-white/5 font-normal italic">
                                    &quot;
                                    {auction.description ||
                                        "No descriptions attached to this item catalog listings."}
                                    &quot;
                                </p>

                                {/* Metadata Row Grid items */}
                                <div className="grid grid-cols-3 items-center justify-center gap-2 text-center py-2 border-y border-white/10 bg-white/5 rounded-xl">
                                    {details.map((d, i) => (
                                        <div
                                            key={i}
                                            className="flex flex-col items-center gap-1 justify-center"
                                        >
                                            <span className="text-sm text-indigo-400">
                                                {d.icon}
                                            </span>
                                            <span className="text-[11px] uppercase tracking-wider font-semibold text-zinc-400">
                                                {d.label}
                                            </span>
                                            <span className="text-xs font-bold text-white max-w-full truncate px-1">
                                                {d.value}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Timeline bounds */}
                                <div className="flex flex-col gap-2.5 w-full text-xs bg-black/20 p-4 rounded-xl border border-white/5 font-mono">
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-400 font-sans">
                                            Starts:
                                        </span>
                                        <span className="text-zinc-200">
                                            {new Date(
                                                auction.start_time,
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-zinc-400 font-sans">
                                            Ends:
                                        </span>
                                        <span className="text-zinc-200">
                                            {new Date(
                                                auction.end_time,
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Dynamic Bid Standings using updated state signatures */}
                                {auction.auction_type !== "phantom" &&
                                    auction.auction_type !== "dutch" && (
                                        <div className="w-full relative mt-2">
                                            <h4 className="text-zinc-400 font-bold text-xs uppercase tracking-widest mb-3 text-center">
                                                Leaderboard Standings
                                            </h4>
                                            {topBids.length === 0 ? (
                                                <div className="text-center text-zinc-400/60 text-sm italic py-4 bg-black/10 rounded-xl border border-white/5">
                                                    No bids recorded yet.
                                                </div>
                                            ) : (
                                                <div className="flex flex-col gap-2 max-h-[200px] overflow-y-auto pr-1 custom-scrollbar">
                                                    {topBids.map(
                                                        (bidder, i) => (
                                                            <div
                                                                key={i}
                                                                className="w-full px-4 py-2.5 flex items-center gap-3 bg-white/5 border border-white/5 hover:border-indigo-500/30 rounded-xl transition-all duration-150"
                                                            >
                                                                <Avatar className="w-8 h-8 shadow-md flex-shrink-0 border border-white/10">
                                                                    <AvatarImage
                                                                        src={
                                                                            bidder.avatar
                                                                        }
                                                                        alt={
                                                                            bidder.name
                                                                        }
                                                                    />
                                                                    <AvatarFallback className="bg-indigo-950 text-indigo-200 text-xs font-black">
                                                                        {bidder.name
                                                                            .charAt(
                                                                                0,
                                                                            )
                                                                            .toUpperCase()}
                                                                    </AvatarFallback>
                                                                </Avatar>
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-white text-xs font-bold truncate">
                                                                        {
                                                                            bidder.name
                                                                        }
                                                                    </p>
                                                                    <p className="text-zinc-400 text-[11px] font-mono mt-0.5">
                                                                        {new Date(
                                                                            bidder.created_at,
                                                                        ).toLocaleDateString()}
                                                                    </p>
                                                                </div>
                                                                <span className="text-green-400 font-mono text-xs font-bold">
                                                                    $
                                                                    {bidder.amount.toLocaleString(
                                                                        undefined,
                                                                        {
                                                                            minimumFractionDigits: 2,
                                                                        },
                                                                    )}
                                                                </span>
                                                            </div>
                                                        ),
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Global Controls HUD Overlay */}
                <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-4"
                >
                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleViewFullDetails}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl font-bold text-xs uppercase tracking-wider transition duration-150 cursor-pointer flex items-center justify-center border border-indigo-400/20"
                    >
                        Open Auction Workspace
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.04 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={handleShare}
                        aria-label="Share current item details link"
                        className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full shadow-2xl font-bold text-xs uppercase tracking-wider transition duration-150 cursor-pointer flex items-center gap-2 border border-white/15"
                    >
                        Share
                        <FaShareAlt className="w-3 h-3 text-indigo-400" />
                    </motion.button>
                </motion.div>

                {/* Localized Component Scoped Layout Customizations */}
                <style>{`
          .custom-scrollbar {
            scrollbar-width: thin;
            scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
          }
          .custom-scrollbar::-webkit-scrollbar {
            width: 5px;
            height: 5px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.12);
            border-radius: 999px;
          }
          .custom-scrollbar:hover::-webkit-scrollbar-thumb {
            background-color: rgba(255, 255, 255, 0.25);
          }
        `}</style>
            </DialogContent>
        </Dialog>
    );
}
