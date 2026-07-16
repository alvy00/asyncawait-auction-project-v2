/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    FaChartPie,
    FaExternalLinkAlt,
    FaFileInvoiceDollar,
    FaGavel,
    FaTrophy,
    FaTimesCircle,
    FaPlus,
} from "react-icons/fa";
import { motion } from "framer-motion";
import WinRatioChart from "./_components/WinRatioChart";
import StatCard from "./_components/StatCard";
import ActionButton from "./_components/ActionButton";
import LoadingSpinner from "../components/LoadingSpinner";
import { useUser } from "../../lib/user-context";

const Dashboard = () => {
    const { user, isLoading } = useUser();
    const [error] = useState<string | null>(null);
    const router = useRouter();

    // 1. Handle loading state first safely
    if (isLoading) {
        return <LoadingSpinner />;
    }

    // 2. Handle unauthorized or missing user states safely
    if (error || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4">
                <div className="bg-[#040c16]/50 p-6 md:p-8 rounded-lg shadow-lg text-white w-full max-w-md border border-slate-800">
                    <h2 className="text-2xl font-bold mb-4">
                        Error Loading Dashboard
                    </h2>
                    <p className="text-red-400">
                        {error || "Failed to load user data"}
                    </p>
                    <button
                        onClick={() => router.push("/login")}
                        className="mt-6 bg-[#7b62fb] hover:bg-[#6a52e5] text-white py-2 px-4 rounded-md transition-colors w-full font-medium"
                    >
                        Return to Login
                    </button>
                </div>
            </div>
        );
    }

    // 3. Safe calculations (guaranteed user object exists)
    const totalParticipated = user.auctions_participated || 0;
    const totalWon = user.auctions_won || 0;
    const totalLost = Math.max(0, totalParticipated - totalWon);

    const winRatio =
        totalParticipated > 0
            ? Math.round((totalWon / totalParticipated) * 100)
            : 0;

    return (
        <div className="min-h-screen text-white p-4 sm:p-6 rounded-xl">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-6 sm:mb-8"
            >
                <h1 className="text-2xl sm:text-3xl font-bold">
                    Welcome to{" "}
                    <span className="text-[#ef863f]">Dashboard!</span>
                </h1>
                <h2 className="text-3xl sm:text-4xl font-bold mt-1 sm:mt-2">
                    {user.name}
                </h2>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-6 flex flex-col sm:flex-row flex-wrap gap-3"
            >
                <ActionButton
                    href="/auctions/details"
                    icon={<FaFileInvoiceDollar />}
                    label="View Auctions Details"
                />
                <ActionButton
                    href="/bid/details"
                    icon={<FaExternalLinkAlt />}
                    label="View Bid Details"
                />
                <ActionButton
                    href="/payment/details"
                    icon={<FaChartPie />}
                    label="View Payment Details"
                />
            </motion.div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
                {/* Left Column - Win Ratio Chart */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="lg:col-span-5 flex justify-center items-center bg-[#040c16]/30 p-4 rounded-xl border border-slate-800/50"
                >
                    <WinRatioChart
                        winRatio={winRatio}
                        bidsWon={totalWon}
                        bidsLost={totalLost}
                    />
                </motion.div>

                {/* Right Column - Stats Cards */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="lg:col-span-7"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                        <StatCard
                            title="Balance"
                            value={`$${(user.money || 0).toLocaleString()}`}
                            icon={
                                <FaFileInvoiceDollar className="text-green-400" />
                            }
                        />

                        <StatCard
                            title="Auctions Created"
                            value={`${user.total_auctions || 0}`}
                            icon={
                                <FaExternalLinkAlt className="text-blue-400" />
                            }
                        />

                        <StatCard
                            title="Auctions Participated"
                            value={totalParticipated.toString()}
                            icon={<FaChartPie className="text-slate-400" />}
                        />

                        <StatCard
                            title="Total Bids Placed"
                            value={(user.total_bids || 0).toString()}
                            icon={<FaGavel className="text-purple-400" />}
                        />

                        <StatCard
                            title="Auctions Won"
                            value={totalWon.toString()}
                            icon={<FaTrophy className="text-yellow-400" />}
                        />

                        <StatCard
                            title="Auctions Lost"
                            value={totalLost.toString()}
                            icon={<FaTimesCircle className="text-red-400" />}
                        />

                        {/* Create New Auction Button */}
                        <div className="col-span-full flex justify-center mt-2 sm:mt-4">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.4 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Link
                                    href="/auctions/create"
                                    className="bg-green-500 hover:bg-green-600 text-white font-medium px-5 py-3 rounded-full flex items-center gap-2 transition-all duration-200 shadow-lg cursor-pointer"
                                >
                                    <FaPlus className="w-4 h-4" />
                                    <span>Create New Auction</span>
                                </Link>
                            </motion.div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Dashboard;
