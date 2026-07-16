/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// api/auctions/history/route.ts
export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get("type"); // expects 'personal' or 'top'
        const supabase = await createSupabaseServerClient();

        // 1. GET USER BID HISTORY
        if (type === "personal") {
            const { user_id } = await request.json();
            if (!user_id)
                return NextResponse.json(
                    { error: "Missing user_id" },
                    { status: 400 },
                );

            const { data, error } = await supabase
                .from("bids")
                .select("*")
                .eq("user_id", user_id);

            if (error)
                return NextResponse.json(
                    { error: "Failed to fetch bid history" },
                    { status: 500 },
                );

            const formatted = data.map((bid) => ({
                ...bid,
                created_at: new Date(bid.created_at).toLocaleDateString(
                    "en-US",
                    {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                    },
                ),
            }));

            return NextResponse.json(formatted, { status: 200 });
        }

        // 2. GET TOP BIDS ON SPECIFIC AUCTION
        if (type === "top") {
            const { auction_id } = await request.json();
            if (!auction_id)
                return NextResponse.json(
                    { message: "Auction id required!" },
                    { status: 400 },
                );

            const { data, error } = await supabase
                .from("bids")
                .select(
                    `
          bid_amount,
          created_at,
          users(name)
        `,
                )
                .eq("auction_id", auction_id)
                .order("bid_amount", { ascending: false })
                .limit(5);

            if (error)
                return NextResponse.json(
                    { message: "Supabase query failed", error },
                    { status: 500 },
                );

            const topBids = data.map((bid: any) => ({
                amount: bid.bid_amount,
                name: bid.users?.name || "Unknown",
                created_at: bid.created_at,
            }));

            return NextResponse.json(topBids, { status: 200 });
        }

        return NextResponse.json(
            { message: "Invalid history query type parameters" },
            { status: 400 },
        );
    } catch (e: any) {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
