/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BsChatDots } from "react-icons/bs";
import { IoClose } from "react-icons/io5";
import { IoMdChatboxes } from "react-icons/io";
import { useUser } from "./../../lib/user-context";

export default function FloatingChatbot() {
    const { user } = useUser();
    const [open, setOpen] = useState(false);
    const [messages, setMessages] = useState<any[]>([]);

    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatWindowRef = useRef<HTMLDivElement>(null);

    // Set up initial message on client mount
    useEffect(() => {
        if (!user) return;

        const initialMessages = [
            {
                role: "assistant",
                content: `Hi ${user.name}! I'm AuctaSyncBot. I can help you understand our auction formats (Classic, Dutch, Reverse, etc.), lookup live top bids, or review your roadmap! What's on your mind? 🚀`,
            },
        ];

        setMessages(initialMessages);
    }, [user]);

    useEffect(() => {
        if (open) {
            // Small timeout to let entry animation settle
            const timer = setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
            }, 50);
            return () => clearTimeout(timer);
        }
    }, [messages, open]);

    // Handle outside click to close chat
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (
                open &&
                chatWindowRef.current &&
                !chatWindowRef.current.contains(e.target as Node)
            ) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [open]);

    const handleSend = async () => {
        if (!input.trim() || !user) return;

        const userMessage = { role: "user", content: input };
        const newMessages = [...messages, userMessage];

        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            // Pointing dynamically to relative Next.js Server Route with flowType signature
            const res = await fetch("/api/admin/bot", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    flowType: "groq",
                    messages: newMessages,
                    user: {
                        name: user.name,
                        money: user.money,
                        auctions_won: user.auctions_won,
                        is_suspended: user.is_suspended,
                    },
                }),
            });

            if (!res.ok) throw new Error("Network response failed");

            const data = await res.json();
            setMessages([
                ...newMessages,
                { role: "assistant", content: data.reply },
            ]);
        } catch {
            setMessages([
                ...newMessages,
                {
                    role: "assistant",
                    content:
                        "Sorry, I lost my connection to the server. Please verify your connection.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // High-performance Fluid Typing Bubble
    const TypingIndicator = () => (
        <div className="flex gap-1.5 items-center bg-[#1e1b2e]/80 border border-white/10 rounded-2xl px-5 py-3 shadow-md max-w-max">
            {[0, 1, 2].map((i) => (
                <motion.span
                    key={i}
                    className="w-2 h-2 bg-fuchsia-400 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        delay: i * 0.15,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );

    return (
        <>
            {/* Floating button */}
            {!open && (
                <button
                    onClick={() => setOpen(true)}
                    className="fixed bottom-6 right-6 z-50 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-700 to-fuchsia-600 border border-white/20 shadow-[0_0_20px_rgba(99,102,241,0.4)] flex items-center justify-center hover:scale-105 active:scale-95 transition-transform focus:outline-none focus:ring-2 focus:ring-fuchsia-400"
                    aria-label="Open chat"
                >
                    <IoMdChatboxes className="text-2xl sm:text-3xl text-white drop-shadow" />
                </button>
            )}

            {/* Animated Chat window */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        key="chat-window"
                        ref={chatWindowRef}
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        transition={{
                            type: "spring",
                            damping: 25,
                            stiffness: 350,
                        }}
                        className="fixed bottom-6 right-6 z-50 w-[clamp(300px,90vw,400px)] h-[clamp(400px,75vh,620px)] flex flex-col rounded-2xl shadow-2xl border border-white/10 bg-gradient-to-br from-[#0c091f]/95 via-[#1a1438]/95 to-[#16122c]/95 backdrop-blur-lg overflow-hidden"
                    >
                        {/* Header */}
                        <div className="relative z-20 flex items-center justify-between px-5 py-4 bg-white/5 border-b border-white/10 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-indigo-500 flex items-center justify-center border border-white/20">
                                    <BsChatDots className="text-white text-lg" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-sm text-white tracking-wide">
                                        AuctaSync Assistant
                                    </span>
                                    <span className="text-[10px] text-green-400 flex items-center gap-1 font-mono">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-ping" />{" "}
                                        Online
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setOpen(false)}
                                aria-label="Close chat"
                                className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white transition-colors border border-white/5"
                            >
                                <IoClose className="text-lg" />
                            </button>
                        </div>

                        {/* Chat Messages Body */}
                        <div className="relative flex-1 flex flex-col z-10 h-0 min-h-0">
                            <main className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-purple-500/40 scrollbar-track-transparent flex flex-col">
                                <div className="mt-auto flex flex-col gap-3.5">
                                    {messages.map((msg, i) => (
                                        <motion.div
                                            key={i}
                                            layout
                                            initial={{ opacity: 0, y: 15 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{
                                                type: "spring",
                                                damping: 20,
                                                stiffness: 300,
                                            }}
                                            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[82%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words shadow-md border ${
                                                    msg.role === "user"
                                                        ? "bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white border-white/10"
                                                        : "bg-white/5 text-zinc-100 border-white/5"
                                                }`}
                                            >
                                                {msg.content}
                                            </div>
                                        </motion.div>
                                    ))}

                                    {loading && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                        >
                                            <TypingIndicator />
                                        </motion.div>
                                    )}
                                    <div ref={messagesEndRef} />
                                </div>
                            </main>

                            {/* Chat Send Form */}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (!loading) handleSend();
                                }}
                                className="flex border-t border-white/10 p-3 bg-black/20 backdrop-blur-md"
                            >
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask me something..."
                                    className="flex-1 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition disabled:opacity-60"
                                    disabled={loading}
                                    autoComplete="off"
                                />
                                <button
                                    type="submit"
                                    disabled={loading || !input.trim()}
                                    className="ml-2 bg-gradient-to-r from-indigo-500 to-fuchsia-500 hover:from-indigo-400 hover:to-fuchsia-400 disabled:from-zinc-800 disabled:to-zinc-800 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg transition-transform active:scale-95 disabled:cursor-not-allowed disabled:text-zinc-500"
                                >
                                    Send
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
