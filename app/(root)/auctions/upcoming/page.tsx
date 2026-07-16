/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState, useMemo } from "react";
import { Auction } from "../../../../lib/interfaces";
import {
    FaSpinner,
    FaSearch,
    FaSortAmountDown,
    FaCalendarAlt,
} from "react-icons/fa";
import { motion } from "framer-motion";
import UpcomingAuctionCard from "../../../components/UpcomingAuctionCard";

const UpcomingAuctionsPage = () => {
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");
    const [sortBy, setSortBy] = useState("date");

    const categories = [
        "all",
        "electronics",
        "art",
        "vehicles",
        "fashion",
        "other",
    ];

    // Fetch upcoming auctions using the local API route handler
    useEffect(() => {
        const fetchUpcomingAuctions = async () => {
            setIsLoading(true);
            try {
                const res = await fetch("/api/auctions", {
                    method: "GET",
                    headers: {
                        "Content-type": "application/json",
                    },
                });

                if (!res.ok) {
                    const error = await res.json();
                    console.error(error.message || error.statusText);
                    return;
                }

                const data = await res.json();
                const now = new Date();

                // Keep only auctions where the current time is before the start time
                const upcomingAuctions = data.filter((auction: Auction) => {
                    const startTime = new Date(auction.start_time);
                    return now < startTime;
                });
                setAuctions(upcomingAuctions);
            } catch (e) {
                console.error("Error fetching upcoming auctions", e);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUpcomingAuctions();
    }, []);

    // Memoize the filtering and sorting pipeline to prevent redundant operations on search keystrokes
    const processedAuctions = useMemo(() => {
        const filtered = auctions.filter((auction) => {
            const matchesSearch = auction.item_name
                .toLowerCase()
                .includes(searchTerm.toLowerCase());
            const matchesFilter =
                activeFilter === "all" ||
                auction.category?.toLowerCase() === activeFilter;
            return matchesSearch && matchesFilter;
        });

        return filtered.sort((a, b) => {
            if (sortBy === "date") {
                return (
                    new Date(a.start_time).getTime() -
                    new Date(b.start_time).getTime()
                );
            } else if (sortBy === "price") {
                return a.starting_price - b.starting_price;
            } else {
                return (b.views || 0) - (a.views || 0);
            }
        });
    }, [auctions, searchTerm, activeFilter, sortBy]);

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    return (
        <>
            <section className="py-16 min-h-screen relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-orange-500/10 rounded-full filter blur-[120px] animate-pulse-slow"></div>
                    <div className="absolute bottom-[20%] left-[5%] w-[300px] h-[300px] bg-purple-500/5 rounded-full filter blur-[80px] animate-float"></div>
                    <div className="absolute top-[30%] left-[10%] w-[200px] h-[200px] bg-blue-500/5 rounded-full filter blur-[60px] animate-float-delayed"></div>
                    <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    {/* Hero section */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <motion.h1
                            className="mt-10 text-4xl md:text-5xl font-bold text-white mb-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2, duration: 0.8 }}
                        >
                            Upcoming{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                                Auctions
                            </span>
                        </motion.h1>
                        <motion.p
                            className="text-gray-300 max-w-2xl mx-auto"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4, duration: 0.8 }}
                        >
                            Discover exclusive items before they go live. Set
                            reminders and be the first to bid on these upcoming
                            treasures.
                        </motion.p>
                    </motion.div>

                    {/* Search and filter controls */}
                    <div className="mb-10">
                        <div className="relative max-w-md mx-auto mb-6">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center z-10">
                                <FaSearch className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="relative z-0 block w-full pl-10 pr-3 py-3 border border-white/10 rounded-xl bg-white/5 backdrop-blur-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                                placeholder="Search upcoming auctions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
                            <div className="flex flex-wrap justify-center gap-2">
                                {categories.map((category, index) => (
                                    <motion.button
                                        key={category}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                            delay: 0.5 + index * 0.1,
                                        }}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                            activeFilter === category
                                                ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/20"
                                                : "bg-white/5 backdrop-blur-sm text-gray-300 hover:bg-white/10 border border-white/10"
                                        }`}
                                        onClick={() =>
                                            setActiveFilter(category)
                                        }
                                    >
                                        {category.charAt(0).toUpperCase() +
                                            category.slice(1)}
                                    </motion.button>
                                ))}
                            </div>

                            <motion.div
                                className="flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                            >
                                <FaSortAmountDown className="text-gray-400" />
                                <select
                                    className="bg-transparent text-gray-300 focus:outline-none cursor-pointer"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                >
                                    <option
                                        value="date"
                                        className="bg-gray-800 text-white"
                                    >
                                        Start Date
                                    </option>
                                    <option
                                        value="price"
                                        className="bg-gray-800 text-white"
                                    >
                                        Starting Price
                                    </option>
                                    <option
                                        value="popularity"
                                        className="bg-gray-800 text-white"
                                    >
                                        Popularity
                                    </option>
                                </select>
                            </motion.div>
                        </div>
                    </div>

                    {/* Content Logic */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                    duration: 0.5,
                                    repeat: Infinity,
                                    repeatType: "reverse",
                                }}
                                className="text-orange-500 mb-4"
                            >
                                <FaSpinner className="animate-spin h-12 w-12" />
                            </motion.div>
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="text-gray-300 text-lg"
                            >
                                Loading upcoming auctions...
                            </motion.p>
                        </div>
                    ) : processedAuctions.length > 0 ? (
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                        >
                            {processedAuctions.map((auction) => {
                                const auctionCreator =
                                    auction.creator || "Anonymous";
                                return (
                                    <motion.div
                                        key={auction.auction_id}
                                        variants={itemVariants}
                                        className="hover:scale-105 transform transition-all duration-300 ease-in-out"
                                    >
                                        <UpcomingAuctionCard
                                            auction={auction}
                                            auctionCreator={auctionCreator}
                                        />
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <div className="text-center py-20 bg-gray-800/30 rounded-xl border border-gray-700">
                            <FaCalendarAlt className="mx-auto text-4xl text-gray-500 mb-4" />
                            <h3 className="text-xl font-bold text-white mb-2">
                                No upcoming auctions found
                            </h3>
                            <p className="text-gray-400">
                                Try adjusting your filters or check back later
                                for new items
                            </p>
                        </div>
                    )}
                </div>
            </section>

            <style jsx global>{`
                @keyframes float {
                    0% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-20px);
                    }
                    100% {
                        transform: translateY(0px);
                    }
                }

                @keyframes float-delayed {
                    0% {
                        transform: translateY(0px);
                    }
                    50% {
                        transform: translateY(-15px);
                    }
                    100% {
                        transform: translateY(0px);
                    }
                }

                @keyframes pulse-slow {
                    0% {
                        opacity: 0.3;
                    }
                    50% {
                        opacity: 0.5;
                    }
                    100% {
                        opacity: 0.3;
                    }
                }

                .animate-float {
                    animation: float 15s ease-in-out infinite;
                }

                .animate-float-delayed {
                    animation: float-delayed 12s ease-in-out infinite;
                    animation-delay: 2s;
                }

                .animate-pulse-slow {
                    animation: pulse-slow 10s ease-in-out infinite;
                }

                .bg-grid-pattern {
                    background-image:
                        linear-gradient(
                            to right,
                            rgba(255, 255, 255, 0.05) 1px,
                            transparent 1px
                        ),
                        linear-gradient(
                            to bottom,
                            rgba(255, 255, 255, 0.05) 1px,
                            transparent 1px
                        );
                    background-size: 40px 40px;
                }
            `}</style>
        </>
    );
};

export default UpcomingAuctionsPage;
