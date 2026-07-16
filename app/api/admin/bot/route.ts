/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const BASE_SYSTEM_PROMPT = `
You are AuctaSyncBot, the friendly real-time assistant for AuctaSync – an ultra-fast, real-time auction platform.
Your job is to help users understand how the platform works. Keep answers short, highly professional yet friendly, and use clear markdown formatting.

Platform Mechanics:
- Users start with a virtual balance of $1,000.
- 5 Auction Types supported:
  1. Classic: Standard ascending price auction.
  2. Reverse: Unique lowest bid wins (great for finding unique pricing).
  3. Dutch: Price starts high and ticks down until someone buys.
  4. Blitz: Fast-paced, short duration bidding wars.
  5. Phantom: Blind bidding where bids are kept hidden until the end.
- Users can view live stats, review bid history, and request mock funds.
- Admins possess advanced real-time user moderation and auction cancellation features.

Rule: Respond in a helpful tone. Avoid fabricating statistics. Keep responses under 3 paragraphs unless requested.
`;

const AUCTASYNC_ROADMAP = `
# AuctaSync Product Roadmap
- Phase 1: Core WebSockets integration for instantaneous live bidding indicators. (Completed)
- Phase 2: Implementation of smart machine learning bid suggestions and predictive price corridors. (In Progress)
- Phase 3: Integration with native web3 wallet states for cross-chain auction listings. (Planned)
`;

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { flowType = "groq", messages = [], user, queryResult } = body;

        // --- CASE A: SYSTEM CHATBOT ENGINE (Groq Integration) ---
        if (flowType === "groq") {
            if (!process.env.GROQ_API_KEY) {
                return NextResponse.json(
                    {
                        reply: "Groq API key is not configured in Server Environment.",
                    },
                    { status: 500 },
                );
            }

            const userContext = user
                ? `User Context:\n- Username: ${user.name}\n- Wallet Balance: $${user.money}\n- Total Won: ${user.auctions_won}\n- Current Status: ${user.is_suspended ? "Suspended" : "Active"}`
                : "";

            const response = await fetch(
                "https://api.groq.com/openai/v1/chat/completions",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                    },
                    body: JSON.stringify({
                        model: "llama-3.1-8b-instant",
                        messages: [
                            {
                                role: "system",
                                content: BASE_SYSTEM_PROMPT.trim(),
                            },
                            {
                                role: "system",
                                content: AUCTASYNC_ROADMAP.trim(),
                            },
                            ...(userContext
                                ? [
                                      {
                                          role: "system",
                                          content: userContext.trim(),
                                      },
                                  ]
                                : []),
                            ...messages.filter((m: any) => m.role !== "system"),
                        ],
                        temperature: 0.6,
                        max_tokens: 512,
                    }),
                },
            );

            const data = await response.json();
            if (!response.ok || !data.choices?.[0]) {
                console.error("Groq Error Response:", data);
                return NextResponse.json(
                    {
                        reply: "The AI core is currently sleeping. Please try again shortly!",
                    },
                    { status: 500 },
                );
            }

            return NextResponse.json({
                reply: data.choices[0].message.content,
            });
        }

        // --- CASE B: DIALOGFLOW WEBHOOK PROCESSING ---
        if (queryResult) {
            const intent = queryResult.intent?.displayName;
            const auctionName = queryResult.parameters?.["auction_name"];

            if (!auctionName) {
                return NextResponse.json({
                    fulfillmentText:
                        "Which auction item are you looking for? Try saying something like 'Tell me about the Tesla auction'.",
                });
            }

            const supabase = await createSupabaseServerClient();
            const { data: auction, error: auctionError } = await supabase
                .from("auctions")
                .select("auction_id, auction_type, highest_bid, item_name")
                .ilike("item_name", `%${auctionName}%`)
                .maybeSingle();

            if (auctionError || !auction) {
                return NextResponse.json({
                    fulfillmentText: `I couldn't locate an active auction containing "${auctionName}". Could you double-check the item's spelling?`,
                });
            }

            if (intent === "SmartBidSuggestion") {
                if (auction.auction_type === "reverse") {
                    const { data: bids } = await supabase
                        .from("bids")
                        .select("bid_amount")
                        .eq("auction_id", auction.auction_id);

                    const freq: Record<number, number> = {};
                    bids?.forEach((b) => {
                        const amt =
                            typeof b.bid_amount === "string"
                                ? parseFloat(b.bid_amount)
                                : b.bid_amount;
                        if (!isNaN(amt)) {
                            freq[amt] = (freq[amt] || 0) + 1;
                        }
                    });

                    const unique = Object.entries(freq)
                        .filter(([_, count]) => count === 1)
                        .map(([amt]) => parseFloat(amt));

                    const suggested = Math.min(...unique);

                    return NextResponse.json({
                        fulfillmentText: isFinite(suggested)
                            ? `In this Reverse auction, the lowest unique bid is currently $${suggested.toFixed(2)}. Placing a unique offer slightly below this could secure your lead!`
                            : "No unique bids have been registered yet. Try submitting a small, fractional or unusual amount (e.g., $1.43) to take an early lead!",
                    });
                }

                const currentHighest = auction.highest_bid
                    ? `$${auction.highest_bid}`
                    : "no bids yet";
                return NextResponse.json({
                    fulfillmentText: `The current highest bid for the ${auction.item_name} is ${currentHighest}. To take the lead, try placing a bid at least 5% higher!`,
                });
            }

            if (intent === "TopBidders") {
                const { data: bids } = await supabase
                    .from("bids")
                    .select("user_name, bid_amount")
                    .eq("auction_id", auction.auction_id)
                    .order("bid_amount", { ascending: false })
                    .limit(3);

                const txt = bids?.length
                    ? `🏆 Here are the current top bidders for the ${auction.item_name}:\n` +
                      bids
                          .map(
                              (b, i) =>
                                  `${i + 1}. ${b.user_name} — $${b.bid_amount}`,
                          )
                          .join("\n")
                    : `There are currently no bids registered on the ${auction.item_name}. You could be the first!`;

                return NextResponse.json({ fulfillmentText: txt });
            }
        }

        return NextResponse.json(
            { message: "Invalid action or flow signature." },
            { status: 400 },
        );
    } catch (e: any) {
        console.error("Internal API Handler Error:", e);
        return NextResponse.json(
            {
                reply: "Sorry, I had trouble processing that request on our servers.",
            },
            { status: 500 },
        );
    }
}
