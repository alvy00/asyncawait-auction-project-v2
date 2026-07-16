/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import {
    FaSearch,
    FaFilter,
    FaEye,
    FaGavel,
    FaCheck,
    FaTimes,
    FaExclamationTriangle,
    FaRegCopy,
} from "react-icons/fa";
import LoadingSpinner from "../../components/misc/LoadingSpinner";

interface Bid {
    id: string;
    user_id: string;
    created_at: string;
    item_name: string;
    bid_amount: number;
    status: string;
}

const BidsPage = () => {
    const [loading, setLoading] = useState(true);
    const [bids, setBids] = useState<Bid[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const [sortBy, setSortBy] = useState<"date" | "amount" | null>(null);
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

    // Fetch all bids using the local Next.js API route handler
    const getAllBids = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/admin?target=bids", {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });

            if (!res.ok) {
                console.error("Failed to fetch bids:", res.statusText);
                toast.error("Failed to fetch latest bid metrics");
                setLoading(false);
                return;
            }

            const data = await res.json();
            setBids(data);
            setLoading(false);
        } catch (error) {
            console.error("An error occurred while fetching bids:", error);
            toast.error("Internal connection error");
            setLoading(false);
        }
    };

    useEffect(() => {
        getAllBids();
    }, []);

    // Copy elements to clipboard
    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Bid ID copied to clipboard");
    };

    const copyToClipboardUser = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Bidder ID copied to clipboard");
    };

    const handleSort = (key: "date" | "amount") => {
        if (sortBy === key) {
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(key);
            setSortOrder("asc");
        }
    };

    // Filter bids by search term and status
    const filteredBids = bids.filter((bid) => {
        const matchesSearch =
            (bid?.user_id?.toLowerCase?.() || "").includes(
                searchTerm.toLowerCase(),
            ) ||
            (bid?.item_name?.toLowerCase?.() || "").includes(
                searchTerm.toLowerCase(),
            ) ||
            (bid?.id?.toLowerCase?.() || "").includes(searchTerm.toLowerCase());

        const matchesStatus =
            statusFilter === "all" || bid.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Sort filtered bids
    const sortedBids = [...filteredBids].sort((a, b) => {
        if (!sortBy) return 0;

        if (sortBy === "date") {
            const aTime = new Date(a.created_at).getTime();
            const bTime = new Date(b.created_at).getTime();
            return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
        }

        if (sortBy === "amount") {
            return sortOrder === "asc"
                ? a.bid_amount - b.bid_amount
                : b.bid_amount - a.bid_amount;
        }

        return 0;
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = sortedBids.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(sortedBids.length / itemsPerPage);

    const getStatusBadge = (status: string) => {
        switch (status?.toLowerCase()) {
            case "winning":
                return (
                    <span className="bg-green-500/20 text-green-400 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 w-fit">
                        <FaGavel size={10} /> Winning
                    </span>
                );
            case "outbid":
                return (
                    <span className="bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 w-fit">
                        <FaExclamationTriangle size={10} /> Outbid
                    </span>
                );
            case "won":
                return (
                    <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 w-fit">
                        <FaCheck size={10} /> Won
                    </span>
                );
            case "lost":
                return (
                    <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded-md text-xs font-medium flex items-center gap-1 w-fit">
                        <FaTimes size={10} /> Lost
                    </span>
                );
            default:
                return (
                    <span className="bg-gray-500/20 text-gray-400 px-2 py-1 rounded-md text-xs font-medium w-fit capitalize">
                        {status || "unknown"}
                    </span>
                );
        }
    };

    if (loading) return <LoadingSpinner />;

    return (
        <div className="text-white p-4 md:p-6 rounded-xl">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h1 className="text-2xl md:text-3xl font-bold">Manage Bids</h1>
                <div className="flex gap-2">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all duration-300 cursor-pointer"
                        onClick={() => {
                            getAllBids();
                            toast.success("Bid data refreshed");
                        }}
                    >
                        <FaGavel size={14} />
                        <span>Refresh Bids</span>
                    </motion.button>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="relative col-span-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="bg-[#0d1d33]/60 backdrop-blur-sm border border-white/5 text-white placeholder-gray-400 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 shadow-lg outline-none"
                        placeholder="Search by bidder, item or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaFilter className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                        className="bg-[#0d1d33]/60 backdrop-blur-sm border border-white/5 text-white text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5 shadow-lg appearance-none outline-none cursor-pointer"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all" className="bg-[#0d1d33]">
                            All Statuses
                        </option>
                        <option value="winning" className="bg-[#0d1d33]">
                            Winning
                        </option>
                        <option value="outbid" className="bg-[#0d1d33]">
                            Outbid
                        </option>
                        <option value="won" className="bg-[#0d1d33]">
                            Won
                        </option>
                        <option value="lost" className="bg-[#0d1d33]">
                            Lost
                        </option>
                    </select>
                </div>
            </div>

            {/* Bids Table */}
            <div className="bg-[#0d1d33]/60 backdrop-blur-sm rounded-xl border border-white/5 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-white">
                        <thead className="text-xs text-gray-300 uppercase bg-[#0d1d33]/80 select-none">
                            <tr>
                                <th className="px-6 py-3">Bid ID</th>
                                <th className="px-6 py-3">Bidder ID</th>
                                <th
                                    className="px-6 py-3 cursor-pointer hover:text-blue-400 transition-colors"
                                    onClick={() => handleSort("date")}
                                >
                                    Date & Time{" "}
                                    {sortBy === "date" && (
                                        <span>
                                            {sortOrder === "asc" ? "▲" : "▼"}
                                        </span>
                                    )}
                                </th>
                                <th className="px-6 py-3">Auction Item</th>
                                <th
                                    className="px-6 py-3 cursor-pointer hover:text-blue-400 transition-colors"
                                    onClick={() => handleSort("amount")}
                                >
                                    Amount{" "}
                                    {sortBy === "amount" && (
                                        <span>
                                            {sortOrder === "asc" ? "▲" : "▼"}
                                        </span>
                                    )}
                                </th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.length > 0 ? (
                                currentItems.map((bid) => (
                                    <tr
                                        key={bid.id}
                                        className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-purple-400">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-purple-500/20 px-2 py-1 rounded">
                                                    {bid.id
                                                        ? `${bid.id.slice(0, 6)}...${bid.id.slice(-4)}`
                                                        : "N/A"}
                                                </span>
                                                {bid.id && (
                                                    <button
                                                        onClick={() =>
                                                            copyToClipboard(
                                                                bid.id,
                                                            )
                                                        }
                                                        title="Copy Bid ID"
                                                        type="button"
                                                        className="text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                                                    >
                                                        <FaRegCopy size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-purple-400">
                                            <div className="flex items-center gap-2">
                                                <span className="bg-purple-500/20 px-2 py-1 rounded">
                                                    {bid.user_id
                                                        ? `${bid.user_id.slice(0, 6)}...${bid.user_id.slice(-4)}`
                                                        : "N/A"}
                                                </span>
                                                {bid.user_id && (
                                                    <button
                                                        onClick={() =>
                                                            copyToClipboardUser(
                                                                bid.user_id,
                                                            )
                                                        }
                                                        title="Copy Bidder ID"
                                                        type="button"
                                                        className="text-purple-400 hover:text-purple-300 transition-colors cursor-pointer"
                                                    >
                                                        <FaRegCopy size={12} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                            {dayjs(bid.created_at).format(
                                                "DD MMM YYYY, hh:mm A",
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-gray-100 max-w-[200px] truncate">
                                            {bid.item_name}
                                        </td>
                                        <td className="px-6 py-4 text-green-400 font-semibold">
                                            $
                                            {bid.bid_amount?.toLocaleString() ||
                                                "0"}
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(bid.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="p-1.5 bg-blue-500/10 text-blue-400 rounded-lg hover:bg-blue-500/20 transition-colors cursor-pointer"
                                                onClick={() =>
                                                    toast.success(
                                                        `Viewing details for bid ${bid.id}`,
                                                    )
                                                }
                                            >
                                                <FaEye size={14} />
                                            </motion.button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="text-center text-gray-400 py-8"
                                    >
                                        No bids found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {sortedBids.length > 0 && (
                    <div className="flex justify-between items-center p-4 border-t border-white/5 bg-[#0d1d33]/40 select-none">
                        <div className="text-sm text-gray-400">
                            Showing {indexOfFirstItem + 1} to{" "}
                            {Math.min(indexOfLastItem, sortedBids.length)} of{" "}
                            {sortedBids.length} entries
                        </div>
                        <div className="flex gap-2">
                            <button
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                                    currentPage === 1
                                        ? "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                                        : "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 cursor-pointer"
                                }`}
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.max(prev - 1, 1),
                                    )
                                }
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <button
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                                    currentPage === totalPages
                                        ? "bg-gray-800/50 text-gray-500 cursor-not-allowed"
                                        : "bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 cursor-pointer"
                                }`}
                                onClick={() =>
                                    setCurrentPage((prev) =>
                                        Math.min(prev + 1, totalPages),
                                    )
                                }
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BidsPage;
