/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const mode = searchParams.get("mode"); // expects 'regular' (classic/blitz), 'dutch', 'reverse', 'phantom'
        const { auction_id, amount } = await request.json();

        const supabase = await createSupabaseServerClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 },
            );
        }

        // Fetch targeted auction status
        const { data: auction, error: auctionErr } = await supabase
            .from("auctions")
            .select("*")
            .eq("auction_id", auction_id)
            .single();

        if (auctionErr || !auction) {
            return NextResponse.json(
                { message: "Auction not found!" },
                { status: 400 },
            );
        }

        const now = new Date();
        if (now > new Date(auction.end_time)) {
            return NextResponse.json(
                { message: "Auction has ended :(" },
                { status: 400 },
            );
        }

        if (now < new Date(auction.start_time)) {
            return NextResponse.json(
                { message: "Auction has not started yet" },
                { status: 400 },
            );
        }

        if (isNaN(amount) || amount <= 0) {
            return NextResponse.json(
                { message: "Please enter a valid bid amount" },
                { status: 400 },
            );
        }

        // --- MODE 1: DUTCH BID (Instant Purchase & End Auction) ---
        if (mode === "dutch") {
            const { data: bid, error: bidErr } = await supabase.rpc(
                "place_bid_transaction",
                {
                    p_auction_id: auction_id,
                    p_bid_amount: amount,
                    p_highest_bid: auction.highest_bid,
                    p_user_id: user.id,
                },
            );

            if (bidErr) {
                return NextResponse.json(
                    { message: "Bid could not be placed!", error: bidErr },
                    { status: 400 },
                );
            }

            // Immediately end auction on purchase
            await supabase
                .from("auctions")
                .update({ end_time: now.toISOString(), status: "ended" })
                .eq("auction_id", auction_id);
            return NextResponse.json(
                { message: "Bid placed!" },
                { status: 200 },
            );
        }

        // --- MODE 2: CLASSIC / BLITZ BID (Highest Bid Ascending) ---
        if (mode === "regular") {
            if (amount <= auction.highest_bid) {
                return NextResponse.json(
                    {
                        message: `Bid must be higher than the current highest bid ($${auction.highest_bid})`,
                    },
                    { status: 401 },
                );
            }

            const { data: bid, error: bidErr } = await supabase.rpc(
                "place_bid_transaction",
                {
                    p_auction_id: auction_id,
                    p_bid_amount: amount,
                    p_highest_bid: auction.highest_bid,
                    p_user_id: user.id,
                },
            );

            if (bidErr) {
                return NextResponse.json(
                    { message: "Bid could not be placed!", error: bidErr },
                    { status: 400 },
                );
            }
            return NextResponse.json(
                { message: "Bid placed!" },
                { status: 200 },
            );
        }

        // --- MODE 3: REVERSE BID (Lowest Bid Descending) ---
        if (mode === "reverse") {
            const currentLowestBid =
                auction.highest_bid > 0
                    ? auction.highest_bid
                    : auction.starting_price;

            if (Number(amount) >= currentLowestBid) {
                return NextResponse.json(
                    {
                        message: `Your bid must be lower than current lowest bid ($${currentLowestBid})`,
                    },
                    { status: 401 },
                );
            }

            const { data: bid, error: bidErr } = await supabase.rpc(
                "place_bid_transaction",
                {
                    p_auction_id: auction_id,
                    p_bid_amount: amount,
                    p_highest_bid: currentLowestBid,
                    p_user_id: user.id,
                },
            );

            if (bidErr) {
                return NextResponse.json(
                    { message: "Bid could not be placed!", error: bidErr },
                    { status: 400 },
                );
            }
            return NextResponse.json(
                { message: "Lower bid placed!" },
                { status: 200 },
            );
        }

        // --- MODE 4: PHANTOM BID (Concealed Hidden Bids) ---
        if (mode === "phantom") {
            const { data: bid, error: bidErr } = await supabase.rpc(
                "place_bid_trans_hidden",
                {
                    p_auction_id: auction_id,
                    p_user_id: user.id,
                    p_bid_amount: amount,
                },
            );

            if (bidErr) {
                return NextResponse.json(
                    { message: "Bid could not be placed!", error: bidErr },
                    { status: 400 },
                );
            }
            return NextResponse.json(
                { message: "Bid placed!" },
                { status: 200 },
            );
        }

        return NextResponse.json(
            { message: "Invalid bidding mode parameters" },
            { status: 400 },
        );
    } catch (e: any) {
        console.error(e);
        return NextResponse.json(
            { message: "Something went wrong!" },
            { status: 500 },
        );
    }
}
