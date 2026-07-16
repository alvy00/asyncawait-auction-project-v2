/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { FaBullhorn, FaGavel } from "react-icons/fa";
import { Button } from "../../../components/ui/button";
import { AuctionCardProps } from "../../../lib/interfaces";
import {
    cardBase,
    cardContent,
    cardCountdown,
    cardFavoriteBadge,
    cardFooter,
    cardImage,
    cardImageContainer,
    cardLabel,
    cardPrice,
    cardStatusBadge,
    cardTitle,
} from "../auction-detail/CardStyleSystem";
import AuctionDetailsModal from "../auctions-cards/AuctionDetailsModal";
import { Countdown } from "../misc/Countdown";
import PayNowModal from "../misc/PayNowModal";
import FavoriteBadge from "./FavouriteBadge";
import StatusBadge from "./StatusBadge";

const FALLBACK_IMAGE = "/fallback.jpg";

const AuctionCard: React.FC<AuctionCardProps> = ({
    auction,
    auctionCreator,
    isFavourited,
    user,
    loggedIn,
    onPaymentSuccess,
}) => {
    const { token } = useAuth();
    const [winner, setWinner] = useState<string | null>(null);
    const [userMoney, setUserMoney] = useState(user?.money);
    const [participants, setParticipants] = useState(auction.participants);
    const [isEnded, setIsEnded] = useState(false);
    const [isStarted, setIsStarted] = useState(false);
    const [isBidding, setIsBidding] = useState(false);
    const [submittingBid, setSubmittingBid] = useState(false);
    const [bidAmount, setBidAmount] = useState(0);
    const [highestBid, setHighestBid] = useState(auction.highest_bid);
    const [isHovered, setIsHovered] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<
        "upcoming" | "live" | "ended"
    >(() => {
        const now = new Date();
        if (now < new Date(auction.start_time)) return "upcoming";
        if (now <= new Date(auction.end_time)) return "live";
        return "ended";
    });
    const [favourited, setFavourited] = useState(isFavourited);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [showPayNowModal, setShowPayNowModal] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [shake, setShake] = useState(false);

    const imageSrc = auction.images?.[0]?.trim()
        ? auction.images[0]
        : FALLBACK_IMAGE;

    useEffect(() => {
        if (user?.money) {
            setUserMoney(user.money);
        }
    }, [user?.money]);

    // Serverless integration for fetching users
    useEffect(() => {
        const getHighestBidder = async () => {
            const userId = auction?.highest_bidder_id;
            if (!userId) return;

            try {
                const res = await fetch("/api/users", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: userId }),
                });

                if (!res.ok) return;

                const data = await res.json();
                setWinner(data.name);
            } catch (err) {
                console.error("Fetch exception:", err);
            }
        };

        getHighestBidder();
    }, [auction?.highest_bidder_id, refresh]);

    // Submit Bid via serverless auction dynamic updates
    const handleBidSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmittingBid(true);

        try {
            const formData = new FormData(e.currentTarget);
            const amountStr = formData.get("amount");
            const targetBidAmount = amountStr
                ? parseFloat(amountStr.toString())
                : 0;

            if (targetBidAmount > userMoney) {
                toast.error("Insufficient balance, please deposit more money!");
                setSubmittingBid(false);
                return;
            }

            const body = {
                auction_id: auction.auction_id,
                amount: targetBidAmount,
            };

            const auctionMode = "regular";

            // Append the mode as a URL search parameter so the Route Handler catches it
            const res = await fetch(`/api/auctions/bid?mode=${auctionMode}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                const error = await res.json();
                toast.error(error?.message || "Failed to place bid.");
                setSubmittingBid(false);
                return;
            }

            const responseData = await res.json();
            toast.success(
                responseData.message ||
                    `Bid of $${targetBidAmount.toFixed(2)} placed successfully!`,
            );

            setHighestBid(targetBidAmount);
            if (user) setWinner(user.name);
            setIsBidding(false);
            setSubmittingBid(false);
            setRefresh((prev) => !prev);
        } catch (err) {
            console.error("Bid submission error:", err);
            toast.error("Something went wrong. Please try again.");
            setSubmittingBid(false);
        }
    };

    const handleMouseLeave = () => {
        setIsBidding(false);
        setIsHovered(false);
    };

    useEffect(() => {
        setIsStarted(new Date(auction.start_time) <= new Date());
    }, [auction.start_time]);

    useEffect(() => {
        setIsEnded(new Date(auction.end_time) <= new Date());
    }, [auction.end_time]);

    useEffect(() => {
        const updateStatus = () => {
            const now = new Date();
            if (now < new Date(auction.start_time)) {
                setCurrentStatus("upcoming");
            } else if (now <= new Date(auction.end_time)) {
                setCurrentStatus("live");
            } else {
                setCurrentStatus("ended");
            }
        };

        updateStatus();
        const interval = setInterval(updateStatus, 60000);
        return () => clearInterval(interval);
    }, [auction.start_time, auction.end_time, refresh, auction.auction_id]);

    useEffect(() => {
        if (shake) {
            const timer = setTimeout(() => setShake(false), 600);
            return () => clearTimeout(timer);
        }
    }, [shake]);

    // Serverless action endpoint to update status
    const updateAuctionStatus = async () => {
        try {
            const res = await fetch("/api/auctions/state?action=updatestatus", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    auction_id: auction.auction_id,
                    status: "ended",
                }),
            });

            if (!res.ok) {
                const error = await res.json();
                console.error("Failed to update status:", error.message);
            } else {
                setIsEnded(true);
                setCurrentStatus("ended");
            }
        } catch (error) {
            console.error("Error updating auction status:", error);
        }
    };

    // Serverless action endpoint to pay via wallet
    const handleWalletPayment = async () => {
        try {
            const res = await fetch("/api/auctions/state?action=paywallet", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    user_id: user.user_id,
                    auction_id: auction.auction_id,
                    amount: auction.highest_bid,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Payment failed");
                throw new Error(data.message || "Payment failed");
            }

            toast.success("Payment successful!");
            setShowPayNowModal(false);
            setRefresh((prev) => !prev);

            if (onPaymentSuccess) {
                onPaymentSuccess();
            }
        } catch (error) {
            console.error("Error during wallet payment:", error);
            throw error;
        }
    };

    // Centralized payment api route endpoint tracking action wrappers
    const handleSSLCOMMERZPayment = async () => {
        try {
            const res = await fetch("/api/admin/payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "initiate",
                    auction_id: auction.auction_id,
                    item_name: auction.item_name,
                    name: user.name,
                    email: user.email,
                    category: auction.category,
                    payment: auction.highest_bid,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                console.error(
                    "Payment initiation failed:",
                    data.message || data,
                );
                alert("Failed to initiate payment. Please try again.");
                return;
            }

            if (data?.GatewayPageURL) {
                window.location.href = data.GatewayPageURL;
            } else {
                console.error("GatewayPageURL not found in response:", data);
                alert("Payment URL missing. Please contact support.");
            }
        } catch (error) {
            console.error("Error initiating payment:", error);
            alert("Something went wrong while initiating payment.");
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
                y: -5,
                boxShadow:
                    "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 0 12px 2px rgba(52, 211, 153, 0.4)",
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`${cardBase} bg-linear-to-br from-blue-500 to-red-700 backdrop-blur-xl border-2 border-green-300 rounded-2xl shadow-inner shadow-emerald-900/20 ${shake ? "animate-shake" : ""}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={handleMouseLeave}
        >
            {/* Image Container */}
            <div
                className={`${cardImageContainer} overflow-hidden rounded-t-2xl`}
            >
                <motion.div
                    animate={{ scale: isHovered ? 1.05 : 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="relative w-full h-full cursor-pointer"
                    onClick={() => setDetailsOpen(true)}
                >
                    <Image
                        src={imageSrc}
                        alt={auction.item_name}
                        fill
                        className={`${cardImage} object-cover`}
                    />
                </motion.div>
                <div className={cardStatusBadge}>
                    <StatusBadge
                        type="classic"
                        status={currentStatus}
                        auctionId={auction.auction_id}
                        participantCount={participants}
                    />
                </div>
                <div className={cardFavoriteBadge}>
                    <FavoriteBadge
                        userId={user?.user_id}
                        auctionId={auction.auction_id}
                        initialFavorited={isFavourited}
                        isHovered={isHovered}
                    />
                </div>
            </div>

            {/* Card Details Content */}
            <div className={cardContent}>
                <div
                    onClick={() => setDetailsOpen(true)}
                    className="cursor-pointer"
                >
                    <h3 className={`${cardTitle} text-emerald-300`}>
                        #{auction.item_name}
                    </h3>
                    <div className={cardLabel}>
                        {!highestBid ? (
                            <span className="flex items-center gap-1 text-emerald-400">
                                <FaBullhorn /> Bidding starts at:
                            </span>
                        ) : (
                            <span className="flex items-center gap-1 text-green-300">
                                <FaGavel /> Current bid:
                            </span>
                        )}
                    </div>
                    <div
                        className={`${cardPrice} inline-block text-white text-lg font-bold px-3 py-1 rounded shadow-inner ring-1 ring-green-500/20`}
                    >
                        {highestBid
                            ? `$${highestBid.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                            : `$${auction.starting_price.toFixed(2)}`}
                    </div>
                </div>

                <div
                    onClick={() => setDetailsOpen(true)}
                    className={`${cardFooter} mt-[-0.03rem] flex items-center justify-between text-green-300 cursor-pointer`}
                >
                    <div className={cardCountdown}>
                        <Countdown
                            endTime={auction.end_time}
                            onComplete={updateAuctionStatus}
                        />
                    </div>
                    {auctionCreator && (
                        <div className="text-emerald-400 text-xs md:text-sm">
                            👤 {auctionCreator}
                        </div>
                    )}
                </div>

                {/* Dynamic Bid Input / Payment Management View Control */}
                <div className="w-full mt-2 relative">
                    {!loggedIn ? (
                        <Button
                            disabled
                            className="w-full flex items-center justify-center gap-2 rounded-full bg-gray-800 border border-gray-700 text-gray-400 opacity-60 cursor-not-allowed shadow-inner ring-1 ring-inset ring-gray-600/30"
                        >
                            <svg
                                className="w-4 h-4 text-gray-500"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M18.364 5.636L5.636 18.364M5.636 5.636l12.728 12.728"
                                />
                            </svg>
                            <span className="text-sm">Login to bid</span>
                        </Button>
                    ) : !isEnded ? (
                        <div className="w-full">
                            {auction?.user_id !== user?.user_id ? (
                                <>
                                    <motion.button
                                        onClick={() => setIsBidding(true)}
                                        disabled={auction.status === "upcoming"}
                                        className={`w-full py-2 px-4 font-semibold rounded-full text-white transition-all duration-500 ease-in-out bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 shadow-md cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${isBidding ? "opacity-0 scale-95 pointer-events-none" : "opacity-100 scale-100 pointer-events-auto"}`}
                                    >
                                        {auction.status === "upcoming"
                                            ? "Coming soon"
                                            : "Place Bid"}
                                    </motion.button>

                                    <form
                                        onSubmit={handleBidSubmit}
                                        className={`absolute left-0 right-0 top-0 w-full flex items-center justify-center gap-2 transition-all duration-500 ease-in-out z-10 ${isBidding ? "opacity-100 translate-x-0 scale-100 blur-none pointer-events-auto" : "opacity-0 -translate-x-4 scale-95 blur-sm pointer-events-none"}`}
                                        style={{ minHeight: "44px" }}
                                    >
                                        <input
                                            type="number"
                                            name="amount"
                                            value={bidAmount || ""}
                                            onChange={(e) =>
                                                setBidAmount(
                                                    Number(e.target.value),
                                                )
                                            }
                                            min={
                                                auction.starting_price ===
                                                highestBid
                                                    ? auction.starting_price
                                                    : Math.max(
                                                          auction.starting_price,
                                                          highestBid,
                                                      ) + 1
                                            }
                                            placeholder="Your bid"
                                            className="w-2/3 max-w-[100px] p-2 rounded-lg border bg-emerald-950 text-white border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 placeholder-gray-400 transition"
                                        />
                                        <button
                                            type="submit"
                                            disabled={submittingBid}
                                            className={`px-3 py-2 bg-emerald-700 text-white font-semibold rounded-lg border border-emerald-600 shadow hover:bg-emerald-600 hover:border-emerald-500 transition-all duration-300 ease-in-out cursor-pointer ${submittingBid ? "opacity-50 cursor-not-allowed" : ""}`}
                                        >
                                            Bid
                                        </button>
                                    </form>
                                </>
                            ) : (
                                <div className="w-full py-2 px-4 font-semibold text-white border border-gray-500 bg-gray-800 text-gray-300 font-medium cursor-not-allowed shadow-inner text-xs md:text-sm flex items-center justify-center rounded-full">
                                    You created this auction
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-full">
                            <motion.button
                                onClick={() => setShowPayNowModal(true)}
                                className="w-full py-2 px-4 font-semibold rounded-full text-white transition-all duration-500 ease-in-out bg-emerald-700 hover:bg-emerald-600 border border-emerald-500 shadow-md cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                Pay Now
                            </motion.button>
                        </div>
                    )}
                </div>
            </div>

            {/* Interaction Modals */}
            <AuctionDetailsModal
                open={detailsOpen}
                onClose={() => setDetailsOpen(false)}
                auction={auction}
            />
            <PayNowModal
                open={showPayNowModal}
                onClose={() => setShowPayNowModal(false)}
                onWalletPay={handleWalletPayment}
                onSSLCOMMERZPay={handleSSLCOMMERZPayment}
                userBalance={user?.money}
                amount={auction?.highest_bid}
            />

            <style jsx global>{`
                @keyframes gentle-shake {
                    0%,
                    100% {
                        transform: translateX(0);
                    }
                    30% {
                        transform: translateX(-1px);
                    }
                    50% {
                        transform: translateX(1px);
                    }
                    70% {
                        transform: translateX(-0.5px);
                    }
                }
                .animate-shake {
                    animation: gentle-shake 0.4s ease-in-out;
                }
            `}</style>
        </motion.div>
    );
};

export default AuctionCard;
