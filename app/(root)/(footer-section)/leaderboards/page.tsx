/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Trophy, Gavel, DollarSign, Percent, Clock } from "lucide-react";
import { User } from "../../../../lib/interfaces";

type TabType = "wins" | "bids" | "spending" | "winrate" | "active";
const medals = ["🥇", "🥈", "🥉"];

const LeaderboardsPage = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>("wins");
    const [isLoading, setIsLoading] = useState(true);

    const tabs = [
        {
            id: "wins",
            label: "Most Wins",
            icon: <Trophy className="h-5 w-5" />,
        },
        { id: "bids", label: "Most Bids", icon: <Gavel className="h-5 w-5" /> },
        {
            id: "spending",
            label: "Highest Spender",
            icon: <DollarSign className="h-5 w-5" />,
        },
        {
            id: "winrate",
            label: "Best Win Rate",
            icon: <Percent className="h-5 w-5" />,
        },
        {
            id: "active",
            label: "Most Active",
            icon: <Clock className="h-5 w-5" />,
        },
    ] as const;

    useEffect(() => {
        const fetchAllUsers = async () => {
            setIsLoading(true);
            try {
                const res = await fetch("/api/admin?target=users");
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                setUsers(data);
            } catch (error) {
                console.error("Error:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAllUsers();
    }, []);

    const sortedUsers = useMemo(() => {
        return [...users]
            .sort((a, b) => {
                const getVal = (u: User) => {
                    switch (activeTab) {
                        case "wins":
                            return u.auctions_won ?? 0;
                        case "bids":
                            return u.total_bids ?? 0;
                        case "spending":
                            return u.spent_on_bids ?? 0;
                        case "winrate":
                            return u.win_rate ?? 0;
                        case "active":
                            return u.total_auctions ?? 0;
                        default:
                            return 0;
                    }
                };
                return getVal(b) - getVal(a);
            })
            .slice(0, 50);
    }, [users, activeTab]);

    return (
        <div className="min-h-screen py-12 px-4 pt-30">
            <h1 className="text-3xl font-bold text-white text-center mb-8">
                🏆 Leaderboards
            </h1>

            {/* Tabs */}
            <div className="flex flex-wrap justify-center gap-2 mb-8 border-b border-white/10 pb-4">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as TabType)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                            activeTab === tab.id
                                ? "bg-orange-500 text-white shadow-lg"
                                : "bg-white/10 text-gray-300"
                        }`}
                    >
                        {tab.icon} {tab.label}
                    </button>
                ))}
            </div>

            {/* List */}
            <div className="max-w-3xl mx-auto">
                <LayoutGroup>
                    <motion.ul layout className="space-y-2">
                        <AnimatePresence mode="popLayout">
                            {sortedUsers.map((user, index) => (
                                <motion.li
                                    layout
                                    key={user.user_id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex items-center justify-between px-4 py-3 bg-white/5 rounded-lg border border-white/5 hover:bg-white/10"
                                >
                                    <div className="flex items-center gap-4">
                                        <span className="text-orange-400 font-bold w-6">
                                            {medals[index] || index + 1}
                                        </span>
                                        <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-sm font-bold">
                                            {(user.username || "?").charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-white font-medium">
                                                {user.username}
                                            </p>
                                            <p className="text-gray-400 text-xs">
                                                {user.email}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="text-orange-300 font-mono">
                                        {activeTab === "wins" &&
                                            `${user.auctions_won} wins`}
                                        {activeTab === "bids" &&
                                            `${user.total_bids} bids`}
                                        {activeTab === "spending" &&
                                            `$${user.spent_on_bids}`}
                                        {activeTab === "winrate" &&
                                            `${user.win_rate}%`}
                                        {activeTab === "active" &&
                                            `${user.total_auctions} active`}
                                    </span>
                                </motion.li>
                            ))}
                        </AnimatePresence>
                    </motion.ul>
                </LayoutGroup>
            </div>
        </div>
    );
};

export default LeaderboardsPage;
