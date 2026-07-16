"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaCar, FaLaptop, FaGem, FaTshirt } from "react-icons/fa";
import { GiGothicCross, GiSofa } from "react-icons/gi";

interface Category {
    id: string;
    name: string;
    icon: React.ReactNode;
    itemCount: number;
    image: string;
}

const categories: Category[] = [
    {
        id: "cars",
        name: "Motors & Cars",
        itemCount: 9,
        image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?q=80&w=600&auto=format&fit=crop",
        icon: <FaCar className="w-5 h-5" />,
    },
    {
        id: "gadget",
        name: "Tech & Gadgets",
        itemCount: 50,
        image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=600&auto=format&fit=crop",
        icon: <FaLaptop className="w-5 h-5" />,
    },
    {
        id: "antiques",
        name: "Rare Antiques",
        itemCount: 61,
        image: "https://images.unsplash.com/photo-1577083552431-6e5fd01aa342?q=80&w=600&auto=format&fit=crop",
        icon: <GiGothicCross className="w-5 h-5" />,
    },
    {
        id: "furniture",
        name: "Luxury Furniture",
        itemCount: 30,
        image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=600&auto=format&fit=crop",
        icon: <GiSofa className="w-5 h-5" />,
    },
    {
        id: "jewellery",
        name: "Fine Jewellery",
        itemCount: 110,
        image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=600&auto=format&fit=crop",
        icon: <FaGem className="w-5 h-5" />,
    },
    {
        id: "fashion",
        name: "High Fashion",
        itemCount: 200,
        image: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?q=80&w=600&auto=format&fit=crop",
        icon: <FaTshirt className="w-5 h-5" />,
    },
];

const CategorySection: React.FC = () => {
    return (
        <section className="py-20 bg-[#06060c] text-white overflow-hidden">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header Block */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                    <div className="flex flex-col gap-1">
                        <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
                            Curated Collections
                        </span>
                        <motion.h2
                            initial={{ opacity: 0, y: 15 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                            viewport={{ once: true }}
                            className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent"
                        >
                            Browse By Category
                        </motion.h2>
                    </div>
                </div>

                {/* Categories Infinite Grid Layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
                    {categories.map((category, index) => (
                        <motion.div
                            key={category.id}
                            initial={{ opacity: 0, y: 25 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.08,
                                ease: [0.16, 1, 0.3, 1],
                            }}
                            viewport={{ once: true }}
                            className="group relative flex flex-col rounded-2xl overflow-hidden border border-white/5 bg-zinc-900/20 backdrop-blur-md transition-all duration-300 hover:border-indigo-500/30 shadow-xl"
                        >
                            <Link
                                href={`/category/${category.id}`}
                                className="flex flex-col h-full z-10"
                            >
                                {/* Visual Image Block */}
                                <div className="relative aspect-[4/3] w-full overflow-hidden">
                                    <Image
                                        src={category.image}
                                        alt={`${category.name} collection showcase`}
                                        fill
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 200px"
                                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110 group-hover:rotate-1"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#06060c] via-[#06060c]/40 to-transparent" />

                                    {/* Absolute Glass Floating Icon */}
                                    <div className="absolute top-3 left-3 w-9 h-9 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center justify-center text-indigo-400 group-hover:text-white transition-colors duration-200 shadow-lg">
                                        {category.icon}
                                    </div>
                                </div>

                                {/* Card Title Content Elements */}
                                <div className="p-4 flex flex-col gap-1 min-h-[84px] bg-[#0d0d1a]/80 backdrop-blur-sm border-t border-white/5 flex-grow">
                                    <h3 className="font-bold text-sm text-zinc-100 group-hover:text-indigo-400 transition-colors duration-200 truncate">
                                        {category.name}
                                    </h3>
                                    <p className="text-[11px] font-mono font-medium text-zinc-400">
                                        {category.itemCount.toLocaleString()}{" "}
                                        Lots Available
                                    </p>
                                </div>
                            </Link>
                        </motion.div>
                    ))}
                </div>

                {/* Global Catalog Redirection Hub */}
                <div className="flex justify-center mt-12">
                    <Link
                        href="/categories"
                        className="group flex items-center gap-2 bg-white/5 border border-white/10 hover:border-white/20 px-5 py-2.5 rounded-full text-zinc-200 hover:text-white text-xs font-bold tracking-wider uppercase transition-all duration-200 shadow-md backdrop-blur-md"
                    >
                        <span>Explore Complete Matrix</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5 transform group-hover:translate-x-1 transition-transform duration-200 text-indigo-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M9 5l7 7-7 7"
                            />
                        </svg>
                    </Link>
                </div>
            </div>
        </section>
    );
};

export default CategorySection;
