// Use these exported constants and helpers in all card components for pixel-perfect consistency

export const cardBase =
    "group relative w-full h-[420px] md:h-[500px] flex flex-col rounded-2xl overflow-hidden select-none border border-white/15 shadow-xl bg-gradient-to-br backdrop-blur-xl transition-all duration-300";

export const cardImageContainer =
    "relative w-full aspect-[4/3] min-h-[180px] max-h-[230px] overflow-hidden";

export const cardImage =
    "object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105";

export const cardOverlay =
    "absolute inset-0 bg-gradient-to-t from-[#010915]/50 to-transparent pointer-events-none z-[1]";

export const cardStatusBadge = "absolute top-3 left-3 z-10";

export const cardFavoriteBadge = "absolute top-3 right-3 z-10";

export const cardContent =
    "flex-1 flex flex-col justify-between px-5 py-4 md:px-6 md:py-5 gap-2 bg-gradient-to-b from-white/5 via-white/0 to-white/5 z-[2]";

export const cardTitle =
    "text-lg md:text-xl font-bold tracking-wide uppercase mb-1 text-white/90 leading-tight truncate";

export const cardLabel =
    "text-xs md:text-sm font-medium text-white/70 mb-1 flex items-center gap-1";

// Fixed: Added gradient direction to ensure transparent clip works perfectly
export const cardPrice =
    "text-2xl md:text-3xl font-extrabold bg-gradient-to-r bg-clip-text text-transparent leading-tight";

export const cardCountdown =
    "text-xs md:text-sm font-mono font-semibold text-white/90 px-2 py-1 rounded bg-white/10 backdrop-blur-sm border border-white/10 shadow-sm";

export const cardFooter = "flex items-center justify-between mt-2 gap-2";

export const cardCreatorBadge =
    "flex items-center text-xs md:text-sm bg-white/10 text-white/80 px-2 py-1 rounded-lg gap-1 border border-white/5";

export const cardBidButton =
    "w-full h-10 md:h-12 flex items-center justify-center rounded-full border font-semibold text-white backdrop-blur-sm transition-all duration-300 ease-in-out cursor-pointer text-base md:text-lg shadow-lg hover:shadow-xl active:scale-[0.98]";

// Accent color maps for each card type
export const cardAccent = {
    classic: {
        bg: "from-[#18332a] via-[#1b4332] to-[#2d6a4f]",
        price: "from-green-300 to-green-500",
        status: "from-green-700 to-green-500",
        border: "border-emerald-600/30 bg-emerald-800 hover:bg-emerald-700 hover:border-emerald-500/50",
    },
    blitz: {
        bg: "from-[#4a0d0d] via-[#801111] to-[#a42c2c]",
        price: "from-orange-300 to-red-500",
        status: "from-orange-700 to-orange-500",
        border: "border-orange-600/30 bg-orange-800 hover:bg-orange-700 hover:border-orange-500/50",
    },
    dutch: {
        bg: "from-[#0c1e3e] via-[#122e60] to-[#1e4e8c]",
        price: "from-blue-300 to-blue-500",
        status: "from-cyan-700 to-cyan-500",
        border: "border-cyan-500/30 bg-cyan-600 hover:bg-cyan-500 hover:border-cyan-400/50",
    },
    phantom: {
        bg: "from-[#3f3700] via-[#7a6d00] to-[#d4b400]",
        price: "from-yellow-300 to-yellow-500",
        status: "from-yellow-700 to-yellow-500",
        border: "border-yellow-600/30 bg-yellow-800 hover:bg-yellow-700 hover:border-yellow-500/50",
    },
    reverse: {
        bg: "from-[#2e1065] via-[#3b0764] to-[#581c87]",
        price: "from-purple-300 to-purple-500",
        status: "from-purple-700 to-purple-500",
        border: "border-purple-600/30 bg-purple-800 hover:bg-purple-700 hover:border-purple-500/50",
    },
};

// Helper to get accent classes by type safely (handles standard API strings dynamically)
export function getCardAccent(type: string) {
    return cardAccent[type as keyof typeof cardAccent] || cardAccent.classic;
}
