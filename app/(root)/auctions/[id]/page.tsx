"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Auction } from "../../../../lib/interfaces";
import ImageGallery from "../../../components/auction-detail/ImageGallery";
import AuctionDetails from "../../../components/auction-detail/AuctionDetails";
import BiddingSection from "../../../components/auction-detail/BiddingSection";
import AuctionTabs from "../../../components/auction-detail/AuctionTabs";
import RelatedProducts from "../../../components/auction-detail/RelatedProducts";
import toast from "react-hot-toast";

export default function AuctionDetailPage() {
    const params = useParams();
    const auctionId = params.id as string;

    const [auction, setAuction] = useState<Auction | null>(null);
    const [bidsHistory, setBidsHistory] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    const [endTime, setEndTime] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
    });

    const calculateCountdown = (endDateInput: string | number) => {
        let endDateMs: number;

        if (typeof endDateInput === "number") {
            endDateMs =
                endDateInput < 1e12 ? endDateInput * 1000 : endDateInput;
        } else {
            endDateMs = new Date(endDateInput).getTime();
        }

        const now = Date.now();
        const diff = endDateMs - now;

        if (diff <= 0) {
            return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        return { days, hours, minutes, seconds };
    };

    // 1. Fetch Auction Details from dynamic internal route: /api/auctions/[id]
    useEffect(() => {
        const fetchAuctionDetails = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/auctions/${auctionId}`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });

                if (!res.ok) {
                    console.error("Failed to fetch auction details");
                    return;
                }

                const data = await res.json();
                setAuction(data);
            } catch (e) {
                console.error("Error fetching auction details:", e);
            } finally {
                setIsLoading(false);
            }
        };

        if (auctionId) {
            fetchAuctionDetails();
        }
    }, [auctionId]);

    // 2. Fetch Top Bids History using the updated endpoint with type query param
    useEffect(() => {
        const fetchTopBids = async () => {
            try {
                // Appended ?type=top parameter as requested by your POST endpoint handler
                const res = await fetch("/api/auctions/history?type=top", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ auction_id: auction?.auction_id }),
                });

                if (!res.ok) {
                    console.error(
                        "Failed to fetch top bids status:",
                        res.status,
                    );
                    return;
                }

                const data = await res.json();
                setBidsHistory(data);
            } catch (e) {
                console.error("Error fetching top bids history records:", e);
            }
        };

        if (auction?.auction_id) {
            fetchTopBids();
        }
    }, [auction?.auction_id]);

    // Countdown timer clock cycle hook execution
    useEffect(() => {
        if (!auction?.end_time) return;
        if (isNaN(new Date(auction.end_time).getTime())) return;

        setEndTime(calculateCountdown(auction.end_time));

        const interval = setInterval(() => {
            setEndTime(calculateCountdown(auction.end_time));
        }, 1000);

        return () => clearInterval(interval);
    }, [auction]);

    const handleBid = (amount: number) => {
        toast.success(`Bid of $${amount.toFixed(2)} placed successfully!`);
    };

    const auctionDetails = {
        seller: {
            name: auction?.creator ?? "Unknown Seller",
            image: "/fallback_user_avatar.png",
        },
        title: auction?.item_name ?? "No Title",
        description: auction?.description ?? "No description available",
        currentBid: auction?.highest_bid ?? 0,
        startingBid: auction?.starting_price ?? 0,
        condition: auction?.condition?.toUpperCase() ?? "N/A",
        categories: auction?.category?.toUpperCase() ?? "N/A",
        endTime,
    };

    const reviews = [
        {
            reviewer: {
                name: "Isabella Nguyen",
                image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=48&auto=format&fit=crop",
            },
            date: "July 19, 2025",
            rating: 4.8,
            comment:
                "Great auction! The seller was very responsive and the item arrived exactly as described.",
        },
        {
            reviewer: {
                name: "Liam Patel",
                image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=48&auto=format&fit=crop",
            },
            date: "July 14, 2025",
            rating: 5.0,
            comment:
                "One of the smoothest bidding experiences I've had. Definitely coming back!",
        },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0a1a2b] to-[#001021] text-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#ef863f]"></div>
            </div>
        );
    }

    if (!auction) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-[#0a1a2b] to-[#001021] text-white flex items-center justify-center">
                <p className="text-lg">Auction not found.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a1a2b] to-[#001021] text-white pt-20 pb-20">
            <main className="container mx-auto px-6 max-w-6xl">
                {/* Gallery Section */}
                <div className="rounded-3xl overflow-hidden border border-white/30 shadow-lg backdrop-blur-lg bg-black/20 mb-10 relative aspect-[16/9]">
                    <ImageGallery
                        images={auction.images}
                        productName={auctionDetails.title}
                    />
                </div>

                {/* Info & Action Deck */}
                <div className="backdrop-blur-lg bg-black/20 border border-white/30 rounded-3xl shadow-lg p-8 flex flex-col gap-8">
                    <div>
                        <AuctionDetails {...auctionDetails} />
                    </div>
                    <div>
                        <BiddingSection
                            currentBid={auctionDetails.currentBid}
                            onBid={handleBid}
                        />
                    </div>
                </div>

                {/* Interactive Tabs History Panel */}
                <div className="backdrop-blur-lg bg-black/20 border border-white/30 rounded-3xl shadow-lg p-6 mt-10">
                    <AuctionTabs
                        auctionHistory={bidsHistory}
                        reviews={reviews}
                    />
                </div>

                {/* Carousel / Related Grid Block */}
                <div className="backdrop-blur-lg bg-black/20 border border-white/30 rounded-3xl shadow-lg p-6 mt-8 mb-10">
                    <RelatedProducts
                        currentAuctionId={auctionId}
                        category={auction?.category}
                    />
                </div>
            </main>
        </div>
    );
}
