/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LoadingSpinner = () => {
    const [bidAmount, setBidAmount] = useState(1000);
    const [showSold, setShowSold] = useState(false);

    useEffect(() => {
        const bidInterval = setInterval(() => {
            setBidAmount((prev) => prev + Math.floor(Math.random() * 50) + 10);
        }, 400); // Slightly slower to make numbers readable

        const soldInterval = setInterval(() => {
            setShowSold(true);
            setTimeout(() => setShowSold(false), 800);
        }, 3500);

        return () => {
            clearInterval(bidInterval);
            clearInterval(soldInterval);
        };
    }, []);

    // Shared transition for the gavel components
    const gavelTransition = {
        duration: 1.2,
        repeat: Infinity,
        ease: [0.45, 0, 0.55, 1] as any,
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 overflow-hidden relative">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {Array.from({ length: 15 }).map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute rounded-full bg-amber-500/10"
                        initial={{ y: 0, opacity: 0 }}
                        animate={{ y: -200, opacity: [0, 0.3, 0] }}
                        transition={{
                            duration: Math.random() * 4 + 4,
                            repeat: Infinity,
                            delay: Math.random() * 2,
                        }}
                        style={{
                            width: Math.random() * 8 + 2,
                            height: Math.random() * 8 + 2,
                            left: `${Math.random() * 100}%`,
                            bottom: "-20px",
                        }}
                    />
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center z-10"
            >
                <div className="relative w-32 h-32 mb-6">
                    <motion.div
                        className="absolute w-8 h-24 bg-amber-700 rounded-md left-12 bottom-6 origin-bottom"
                        animate={{ rotateZ: [-25, 25] }}
                        transition={gavelTransition}
                    >
                        <div className="absolute w-12 h-8 bg-amber-500 rounded-sm -left-2 top-0" />
                    </motion.div>

                    <motion.div
                        className="absolute w-24 h-4 bg-amber-900 rounded-full left-4 bottom-0"
                        animate={{ scaleX: [1, 0.95, 1] }}
                        transition={gavelTransition}
                    />
                </div>

                <motion.div className="text-4xl font-black text-white tabular-nums tracking-tighter">
                    ${bidAmount.toLocaleString()}
                </motion.div>

                <AnimatePresence mode="wait">
                    {showSold && (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.8 }}
                            animate={{ opacity: 1, y: 0, scale: 1.1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 15,
                            }}
                            className="absolute -top-12 text-5xl font-black text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.5)]"
                        >
                            SOLD!
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="mt-8 flex gap-2">
                    {[0, 1, 2].map((i) => (
                        <motion.div
                            key={i}
                            className="w-2 h-2 bg-amber-500 rounded-full"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.3, 1, 0.3],
                            }}
                            transition={{
                                duration: 0.8,
                                repeat: Infinity,
                                delay: i * 0.2,
                            }}
                        />
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

export default LoadingSpinner;
