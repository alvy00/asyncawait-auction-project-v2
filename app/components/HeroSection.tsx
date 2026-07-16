"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { Auction } from "../../lib/interfaces";
import { ChevronLeft, ChevronRight, Clock, Zap } from "lucide-react";
import clsx from "clsx";
import { useRouter } from "next/navigation";

// ---- Tunable constants ------------------------------------------------
const AUTOPLAY_INTERVAL_MS = 4500;
const SPACING_DESKTOP = 200;
const SPACING_MOBILE = 100;
const MAX_VISIBLE_DESKTOP = 2; // cards on either side of active
const MAX_VISIBLE_MOBILE = 1;
const SPRING_CARD = { type: "spring" as const, stiffness: 220, damping: 35 };
const SPRING_DOT = { type: "spring" as const, stiffness: 300, damping: 30 };
const SWIPE_OFFSET_THRESHOLD = 80;
const SWIPE_VELOCITY_THRESHOLD = 500;
const CARD_IMAGE_SIZES =
    "(max-width: 640px) 300px, (max-width: 768px) 360px, 400px";

const AuctionCard = ({
    auction,
    isActive,
    reduceMotion,
}: {
    auction: Auction;
    isActive: boolean;
    reduceMotion: boolean;
}) => {
    return (
        <div className="relative h-full w-full rounded-[2.5rem] p-[2px] overflow-hidden">
            <div
                className={clsx(
                    "absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-orange-500/80 via-purple-600/50 to-blue-500/80 transition-opacity duration-500",
                    { "opacity-100": isActive, "opacity-0": !isActive },
                )}
            />
            <div
                className="relative h-full w-full rounded-[calc(2.5rem-2px)] bg-gray-900/40 shadow-[0_12px_48px_0_rgba(255,140,0,0.10),0_8px_32px_0_rgba(31,38,135,0.25)] border border-white/10 overflow-hidden"
                style={{ backdropFilter: "blur(24px)" }}
            >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-80 pointer-events-none rounded-[calc(2.5rem-2px)]" />
                <div
                    className={clsx(
                        "absolute inset-0 pointer-events-none transition-opacity duration-500 bg-black/10",
                        isActive ? "opacity-0" : "opacity-100",
                    )}
                />

                {/* Content: animates in once on mount, then stays visible
                    regardless of active state. Dimming for inactive cards
                    is handled by the wrapping motion.div's opacity/scale
                    (see getCardProps) and the bg-black/10 overlay above -
                    NOT by hiding this content, which previously made
                    inactive cards render as solid black. */}
                <motion.div
                    className="relative z-10 flex flex-col h-full px-5 sm:px-6 pt-5 sm:pt-6 pb-4 sm:pb-5"
                    initial={reduceMotion ? "visible" : "hidden"}
                    animate="visible"
                    variants={{
                        hidden: {},
                        visible: {
                            transition: {
                                staggerChildren: reduceMotion ? 0 : 0.08,
                            },
                        },
                    }}
                >
                    <motion.div
                        className="flex-shrink-0"
                        variants={{
                            hidden: reduceMotion
                                ? { opacity: 1, y: 0 }
                                : { opacity: 0, y: 8 },
                            visible: { opacity: 1, y: 0 },
                        }}
                    >
                        <h3 className="text-white text-base sm:text-lg font-bold tracking-tight line-clamp-1">
                            {auction.item_name}
                        </h3>
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                            <span className="bg-orange-500/80 text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-bold uppercase">
                                {auction.auction_type}
                            </span>
                            <span className="bg-blue-500/70 text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-bold uppercase">
                                {auction.category}
                            </span>
                            <span
                                className={clsx(
                                    "text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-bold uppercase",
                                    auction.condition === "new"
                                        ? "bg-green-600/80"
                                        : "bg-gray-500/80",
                                )}
                            >
                                {auction.condition}
                            </span>
                            <span
                                className={clsx(
                                    "text-white text-[10px] sm:text-xs px-2.5 py-1 rounded-full font-bold uppercase",
                                    {
                                        "bg-red-600/80":
                                            auction.status === "live",
                                        "bg-yellow-500/80":
                                            auction.status === "upcoming",
                                        "bg-gray-600/80": ![
                                            "live",
                                            "upcoming",
                                            "closed",
                                            "pending",
                                        ].includes(auction.status),
                                    },
                                )}
                            >
                                {auction.status}
                            </span>
                        </div>
                    </motion.div>

                    <motion.div
                        className="relative flex-grow flex items-center justify-center w-full my-3"
                        variants={{
                            hidden: reduceMotion
                                ? { opacity: 1, scale: 1 }
                                : { opacity: 0, scale: 0.96 },
                            visible: { opacity: 1, scale: 1 },
                        }}
                    >
                        {auction.images?.[0] ? (
                            <>
                                <div
                                    className={clsx(
                                        "absolute inset-4 rounded-2xl bg-gradient-to-br from-orange-500/50 via-purple-700/30 to-blue-600/30 blur-3xl transition-opacity duration-500",
                                        {
                                            "opacity-100": isActive,
                                            "opacity-0": !isActive,
                                        },
                                    )}
                                />
                                <Image
                                    src={auction.images[0]}
                                    alt={auction.item_name}
                                    fill
                                    className="object-contain rounded-2xl shadow-xl p-4"
                                    sizes={CARD_IMAGE_SIZES}
                                    priority={isActive}
                                    draggable={false}
                                />
                            </>
                        ) : (
                            <div className="flex items-center justify-center w-full h-full bg-gray-800/60 rounded-2xl border-2 border-dashed border-white/10">
                                <span className="text-gray-400 text-xs">
                                    No Image
                                </span>
                            </div>
                        )}
                    </motion.div>

                    <motion.div
                        className="flex-shrink-0"
                        variants={{
                            hidden: reduceMotion
                                ? { opacity: 1, y: 0 }
                                : { opacity: 0, y: 8 },
                            visible: { opacity: 1, y: 0 },
                        }}
                    >
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-gray-200 text-xs sm:text-sm font-semibold mb-3">
                            <div className="text-left">
                                <span className="text-gray-400 block text-xs">
                                    Starting Bid
                                </span>
                                <span className="text-orange-300 font-bold text-sm sm:text-base">
                                    ${auction.starting_price}
                                </span>
                            </div>
                            <div className="text-right">
                                <span className="text-gray-400 block text-xs">
                                    Highest Bid
                                </span>
                                <span className="text-green-400 font-bold text-sm sm:text-base">
                                    ${auction.highest_bid}
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                                <Clock size={14} /> {auction.participants}{" "}
                                participants
                            </div>
                            <div className="flex items-center justify-end gap-1.5 text-gray-400 text-xs">
                                <Zap size={14} /> {auction.total_bids} bids
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

function getAuctionRoute(status: string) {
    switch (status) {
        case "live":
            return "/auctions/live";
        case "upcoming":
            return "/auctions/upcoming";
        case "closed":
            return "/auctions/closed";
        default:
            return "/auctions";
    }
}

function useIsDesktop(breakpoint = 768) {
    // Seed synchronously from window when available so desktop users don't
    // get a flash of mobile spacing before the first effect runs.
    const [isDesktop, setIsDesktop] = useState(() =>
        typeof window !== "undefined" ? window.innerWidth >= breakpoint : false,
    );

    useEffect(() => {
        const check = () => setIsDesktop(window.innerWidth >= breakpoint);
        check();
        window.addEventListener("resize", check);
        return () => window.removeEventListener("resize", check);
    }, [breakpoint]);

    return isDesktop;
}

function AuctionCardDeck({
    auctions,
    startAnimation,
}: {
    auctions: Auction[];
    startAnimation: boolean;
}) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const router = useRouter();
    const cardCount = auctions.length;
    const isDesktop = useIsDesktop();
    const prefersReducedMotion = useReducedMotion();
    const autoplayRef = useRef<ReturnType<typeof setInterval> | null>(null);
    // Tracks whether a drag just ended, so the click handler fired right
    // after release doesn't also trigger navigation on the active card.
    const wasDraggingRef = useRef(false);

    const handlePrev = useCallback(() => {
        if (cardCount === 0) return;
        setActiveIndex((i) => (i - 1 + cardCount) % cardCount);
    }, [cardCount]);

    const handleNext = useCallback(() => {
        if (cardCount === 0) return;
        setActiveIndex((i) => (i + 1) % cardCount);
    }, [cardCount]);

    useEffect(() => {
        if (
            !startAnimation ||
            cardCount <= 1 ||
            isPaused ||
            prefersReducedMotion
        )
            return;
        autoplayRef.current = setInterval(() => {
            handleNext();
        }, AUTOPLAY_INTERVAL_MS);
        return () => {
            if (autoplayRef.current) clearInterval(autoplayRef.current);
        };
    }, [startAnimation, cardCount, isPaused, prefersReducedMotion, handleNext]);

    useEffect(() => {
        // Only respond to arrow keys while the carousel is actually
        // hovered or focused (isPaused doubles as that signal), so we
        // don't hijack arrow-key navigation elsewhere on the page.
        if (!isPaused) return;

        function onKeyDown(e: KeyboardEvent) {
            if (e.key === "ArrowLeft") handlePrev();
            if (e.key === "ArrowRight") handleNext();
        }
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isPaused, handlePrev, handleNext]);

    function getCardProps(idx: number) {
        if (cardCount === 0) {
            return {
                opacity: 0,
                scale: 0,
                x: 0,
                rotateY: 0,
                zIndex: 0,
            };
        }

        const pos = (idx - activeIndex + cardCount) % cardCount;
        let rel = pos;
        if (rel > Math.floor(cardCount / 2)) rel -= cardCount;

        const spacing = isDesktop ? SPACING_DESKTOP : SPACING_MOBILE;
        const maxVisible = isDesktop ? MAX_VISIBLE_DESKTOP : MAX_VISIBLE_MOBILE;

        if (Math.abs(rel) > maxVisible) {
            return {
                opacity: 0,
                scale: 0,
                x: 0,
                rotateY: 0,
                zIndex: 0,
            };
        }

        let x = 0,
            scale = 1,
            zIndex = 10,
            rotateY = 0,
            opacity = 1;

        if (rel === 0) {
            x = 0;
            scale = 1;
            zIndex = 30;
            rotateY = 0;
            opacity = 1;
        } else {
            x = rel * spacing;
            scale = 0.9 - Math.abs(rel) * 0.08;
            zIndex = 20 - Math.abs(rel) * 5;
            rotateY = prefersReducedMotion ? 0 : rel * -35;
            opacity = Math.max(1 - Math.abs(rel) * 0.3, 0.4);
        }

        return { x, scale, zIndex, rotateY, opacity };
    }

    function handleCardClick(idx: number, status: string) {
        if (wasDraggingRef.current) {
            // Swallow the click that follows a drag release.
            wasDraggingRef.current = false;
            return;
        }
        if (idx !== activeIndex) {
            setActiveIndex(idx);
            return;
        }
        router.push(getAuctionRoute(status));
    }

    function handleDragEnd(
        _e: MouseEvent | TouchEvent | PointerEvent,
        info: { offset: { x: number }; velocity: { x: number } },
    ) {
        const didSwipe =
            info.offset.x < -SWIPE_OFFSET_THRESHOLD ||
            info.velocity.x < -SWIPE_VELOCITY_THRESHOLD ||
            info.offset.x > SWIPE_OFFSET_THRESHOLD ||
            info.velocity.x > SWIPE_VELOCITY_THRESHOLD;

        if (didSwipe) {
            wasDraggingRef.current = true;
            if (
                info.offset.x < -SWIPE_OFFSET_THRESHOLD ||
                info.velocity.x < -SWIPE_VELOCITY_THRESHOLD
            ) {
                handleNext();
            } else {
                handlePrev();
            }
            // Clear the flag on the next tick, after the click event
            // (fired synchronously on release) has had a chance to check it.
            setTimeout(() => {
                wasDraggingRef.current = false;
            }, 0);
        }
    }

    const cardTransition = prefersReducedMotion ? { duration: 0 } : SPRING_CARD;
    const dotTransition = prefersReducedMotion ? { duration: 0 } : SPRING_DOT;

    return (
        <div
            className={clsx(
                "w-full flex flex-col items-center transition-all duration-1000 ease-out transform",
                {
                    "opacity-100 translate-y-0": startAnimation,
                    "opacity-0 translate-y-8": !startAnimation,
                },
            )}
        >
            <div
                className="relative w-full max-w-[300px] h-[480px] sm:max-w-[360px] sm:h-[580px] md:max-w-[400px] md:h-[640px] flex items-center justify-center select-none"
                style={{ perspective: "2000px" }}
                role="region"
                aria-roledescription="carousel"
                aria-label="Featured auctions"
                tabIndex={0}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
            >
                <AnimatePresence initial={false}>
                    {auctions.map((auction, idx) => {
                        const { x, scale, zIndex, rotateY, opacity } =
                            getCardProps(idx);
                        if (opacity === 0 && idx !== activeIndex) return null;

                        const isActive = idx === activeIndex;

                        return (
                            <motion.div
                                key={auction.auction_id ?? idx}
                                initial={false}
                                animate={{
                                    x,
                                    scale,
                                    zIndex,
                                    rotateY,
                                    opacity,
                                }}
                                exit={{
                                    opacity: 0,
                                    scale: 0.8,
                                    zIndex: Math.max(zIndex - 2, 0),
                                }}
                                transition={cardTransition}
                                className={clsx("absolute w-full h-full", {
                                    "cursor-pointer": isActive,
                                })}
                                style={{
                                    zIndex,
                                    transformStyle: "preserve-3d",
                                }}
                                drag={isActive ? "x" : false}
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.15}
                                onDragStart={() => setIsPaused(true)}
                                onDragEnd={(e, info) => {
                                    handleDragEnd(e, info);
                                    setIsPaused(false);
                                }}
                                onClick={() =>
                                    handleCardClick(idx, auction.status)
                                }
                                role="group"
                                aria-roledescription="slide"
                                aria-label={`${idx + 1} of ${cardCount}: ${auction.item_name}`}
                                aria-hidden={!isActive}
                            >
                                <AuctionCard
                                    auction={auction}
                                    isActive={isActive}
                                    reduceMotion={!!prefersReducedMotion}
                                />
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {cardCount > 1 && (
                    <>
                        <motion.button
                            className="absolute left-[-40px] md:left-[-60px] top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white p-2 rounded-full z-40 border border-white/20 hover:bg-white/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                            onClick={handlePrev}
                            aria-label="Previous card"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <ChevronLeft size={24} />
                        </motion.button>
                        <motion.button
                            className="absolute right-[-40px] md:right-[-60px] top-1/2 -translate-y-1/2 bg-white/10 backdrop-blur-sm text-white p-2 rounded-full z-40 border border-white/20 hover:bg-white/20 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                            onClick={handleNext}
                            aria-label="Next card"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <ChevronRight size={24} />
                        </motion.button>
                    </>
                )}
            </div>

            <div className="flex justify-center gap-2 mt-8">
                {auctions.map((_, idx) => {
                    const isActive = idx === activeIndex;
                    return (
                        <button
                            key={idx}
                            className="relative h-2 rounded-full overflow-hidden bg-white/20 hover:bg-white/40 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:ring-offset-2 focus-visible:ring-offset-black"
                            style={{ width: isActive ? 32 : 8 }}
                            onClick={() => setActiveIndex(idx)}
                            aria-label={`Go to card ${idx + 1}`}
                            aria-current={isActive}
                        >
                            {isActive && (
                                <motion.span
                                    layoutId="active-dot"
                                    className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500 to-orange-600"
                                    transition={dotTransition}
                                />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

const INTRO_SESSION_KEY = "hero-intro-played";

export function HeroSection() {
    const [featuredAuctions, setFeaturedAuctions] = useState<Auction[]>([]);
    const [loading, setLoading] = useState(true);
    const [fetchError, setFetchError] = useState(false);

    const [hasAnimated, setHasAnimated] = useState(true);
    const [checkedStorage, setCheckedStorage] = useState(false);
    const [headingDone, setHeadingDone] = useState(false);
    const [showCards, setShowCards] = useState(false);

    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        const alreadyPlayed =
            sessionStorage.getItem(INTRO_SESSION_KEY) === "true";
        setHasAnimated(alreadyPlayed || !!prefersReducedMotion);
        if (alreadyPlayed || prefersReducedMotion) {
            setHeadingDone(true);
            setShowCards(true);
        }
        setCheckedStorage(true);
        // Only run once on mount - intentionally excludes prefersReducedMotion
        // from deps so a mid-session OS setting change doesn't replay the intro.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        let cancelled = false;

        async function fetchFeatured() {
            try {
                setFetchError(false);
                const res = await fetch("/api/auctions/filter?type=featured", {
                    method: "POST",
                });
                const data = await res.json();
                if (!cancelled && res.ok && Array.isArray(data)) {
                    setFeaturedAuctions(data);
                } else if (!cancelled) {
                    setFetchError(true);
                }
            } catch (error) {
                console.error("Failed to fetch featured auctions:", error);
                if (!cancelled) setFetchError(true);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }
        fetchFeatured();

        return () => {
            cancelled = true;
        };
    }, []);

    useEffect(() => {
        if (headingDone && !showCards) {
            const timer = setTimeout(
                () => {
                    setShowCards(true);
                },
                prefersReducedMotion ? 0 : 800,
            );
            return () => clearTimeout(timer);
        }
    }, [headingDone, showCards, prefersReducedMotion]);

    useEffect(() => {
        if (headingDone && showCards && !hasAnimated) {
            sessionStorage.setItem(INTRO_SESSION_KEY, "true");
            setHasAnimated(true);
        }
    }, [headingDone, showCards, hasAnimated]);

    const words = [
        { text: "Bid.", style: "" },
        { text: "Win.", style: "" },
        {
            text: "Collect.",
            style: "text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600",
        },
    ];

    const containerVariants = {
        hidden: { opacity: 1 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: hasAnimated ? 0 : 0.4 },
        },
    };

    const wordVariants = {
        hidden: {
            opacity: hasAnimated ? 1 : 0,
            y: hasAnimated ? 0 : 20,
        },
        visible: {
            opacity: 1,
            y: 0,
            transition: hasAnimated
                ? { duration: 0 }
                : { type: "spring", stiffness: 300, damping: 20 },
        },
    } as const;

    if (!checkedStorage) {
        return (
            <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16 sm:pt-24 md:pt-28" />
        );
    }

    return (
        <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-16 sm:pt-24 md:pt-28">
            <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center px-6 md:px-10 pt-0">
                <motion.h1
                    variants={containerVariants}
                    initial={hasAnimated ? "visible" : "hidden"}
                    animate="visible"
                    onAnimationComplete={() => setHeadingDone(true)}
                    className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-center mb-1 tracking-tight leading-tight flex justify-center gap-2"
                >
                    {words.map(({ text, style }, idx) => (
                        <motion.span
                            key={idx}
                            variants={wordVariants}
                            className={style}
                        >
                            {text}
                        </motion.span>
                    ))}
                </motion.h1>

                <motion.p
                    initial={
                        hasAnimated
                            ? { opacity: 1, y: 0 }
                            : { opacity: 0, y: 20 }
                    }
                    animate={
                        headingDone
                            ? { opacity: 1, y: 0 }
                            : { opacity: hasAnimated ? 1 : 0 }
                    }
                    transition={
                        hasAnimated
                            ? { duration: 0 }
                            : { duration: 0.6, ease: "easeOut", delay: 0.2 }
                    }
                    className="text-sm sm:text-lg md:text-xl text-gray-400 text-center max-w-2xl mx-auto mb-6"
                >
                    Join the next generation auction platform—discover rare
                    finds, place real-time bids, and win exclusive items from
                    anywhere.
                </motion.p>

                <div className="w-full flex flex-col items-center overflow-visible">
                    {loading ? (
                        <motion.div
                            initial={
                                hasAnimated
                                    ? { opacity: 1, y: 0 }
                                    : { opacity: 0, y: 20 }
                            }
                            animate={
                                headingDone
                                    ? { opacity: 1, y: 0 }
                                    : { opacity: hasAnimated ? 1 : 0 }
                            }
                            transition={{
                                duration: hasAnimated ? 0 : 0.6,
                                delay: hasAnimated ? 0 : 0.8,
                            }}
                            className="relative w-full max-w-[300px] h-[480px] sm:max-w-[360px] sm:h-[580px] md:max-w-[400px] md:h-[640px] rounded-[2.5rem] border border-white/10 shadow-2xl bg-white/5 overflow-hidden"
                        >
                            {!prefersReducedMotion && (
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{
                                        duration: 1.6,
                                        repeat: Infinity,
                                        ease: "linear",
                                    }}
                                />
                            )}
                        </motion.div>
                    ) : fetchError ? (
                        <motion.div
                            initial={
                                hasAnimated
                                    ? { opacity: 1, y: 0 }
                                    : { opacity: 0, y: 20 }
                            }
                            animate={
                                showCards
                                    ? { opacity: 1, y: 0 }
                                    : { opacity: hasAnimated ? 1 : 0 }
                            }
                            transition={{ duration: hasAnimated ? 0 : 0.6 }}
                            className="text-white/80 text-center py-8"
                        >
                            <p>
                                Couldn&apos;t load featured auctions right now.
                            </p>
                            <button
                                onClick={() => {
                                    setLoading(true);
                                    setFetchError(false);
                                    fetch(
                                        "/api/auctions/filter?type=featured",
                                        {
                                            method: "POST",
                                        },
                                    )
                                        .then((res) => res.json())
                                        .then((data) => {
                                            if (Array.isArray(data)) {
                                                setFeaturedAuctions(data);
                                            } else {
                                                setFetchError(true);
                                            }
                                        })
                                        .catch(() => setFetchError(true))
                                        .finally(() => setLoading(false));
                                }}
                                className="mt-3 text-sm font-semibold text-orange-400 hover:text-orange-300 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded"
                            >
                                Try again
                            </button>
                        </motion.div>
                    ) : featuredAuctions.length > 0 ? (
                        <AuctionCardDeck
                            auctions={featuredAuctions}
                            startAnimation={showCards}
                        />
                    ) : (
                        <motion.div
                            initial={
                                hasAnimated
                                    ? { opacity: 1, y: 0 }
                                    : { opacity: 0, y: 20 }
                            }
                            animate={
                                showCards
                                    ? { opacity: 1, y: 0 }
                                    : { opacity: hasAnimated ? 1 : 0 }
                            }
                            transition={{ duration: hasAnimated ? 0 : 0.6 }}
                            className="text-white/80 text-center py-8"
                        >
                            No featured auctions available at the moment.
                        </motion.div>
                    )}
                </div>
            </div>
        </section>
    );
}

export default HeroSection;
