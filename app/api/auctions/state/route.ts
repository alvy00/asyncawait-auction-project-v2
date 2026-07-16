/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// api/auctions/state/route.ts
export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get("action"); // expects 'paywallet' or 'updatestatus'
        const supabase = await createSupabaseServerClient();

        // --- ACTION A: DEDUCT FROM WALLET & MARK PAID ---
        if (action === "paywallet") {
            const { user_id, amount, auction_id } = await request.json();

            if (!user_id || !amount || !auction_id) {
                return NextResponse.json(
                    { message: "Missing user_id, amount or auction_id" },
                    { status: 400 },
                );
            }

            const { data: user, error: fetchError } = await supabase
                .from("users")
                .select("money, spent_on_bids")
                .eq("user_id", user_id)
                .single();

            if (fetchError || !user) {
                return NextResponse.json(
                    { message: "User not found", error: fetchError?.message },
                    { status: 500 },
                );
            }

            if (user.money < amount) {
                return NextResponse.json(
                    { message: "Insufficient balance" },
                    { status: 400 },
                );
            }

            // Decrement wallet balance
            const { error: updateUserError } = await supabase
                .from("users")
                .update({
                    money: user.money - amount,
                    spent_on_bids: (user.spent_on_bids ?? 0) + amount,
                })
                .eq("user_id", user_id);

            if (updateUserError) {
                return NextResponse.json(
                    {
                        message: "Failed to update user balance",
                        error: updateUserError.message,
                    },
                    { status: 500 },
                );
            }

            // Complete auction payments status mapping
            const { error: updateAuctionError } = await supabase
                .from("auctions")
                .update({ payment_status: "paid" })
                .eq("auction_id", auction_id);

            if (updateAuctionError) {
                return NextResponse.json(
                    {
                        message: "Failed to update auction payment status",
                        error: updateAuctionError.message,
                    },
                    { status: 500 },
                );
            }

            return NextResponse.json(
                { message: "Payment successful" },
                { status: 200 },
            );
        }

        // --- ACTION B: UPDATE AUCTION STATUS (e.g. End and update winning user metrics) ---
        if (action === "updatestatus") {
            const { auction_id, status } = await request.json();

            if (!auction_id || !status) {
                return NextResponse.json(
                    { message: "Missing auction_id or status" },
                    { status: 400 },
                );
            }

            const { data: updatedAuction, error: updateError } = await supabase
                .from("auctions")
                .update({ status })
                .eq("auction_id", auction_id)
                .select("auction_id, status, highest_bid, highest_bidder_id")
                .single();

            if (updateError) {
                return NextResponse.json(
                    {
                        message: "Failed to update auction status",
                        error: updateError,
                    },
                    { status: 400 },
                );
            }

            // If transition states to "ended" and there is a top bidder, update their counters
            if (status === "ended" && updatedAuction?.highest_bidder_id) {
                const { data: userData, error: fetchUserError } = await supabase
                    .from("users")
                    .select("auctions_won, spent_on_bids")
                    .eq("user_id", updatedAuction.highest_bidder_id)
                    .single();

                if (!fetchUserError && userData) {
                    await supabase
                        .from("users")
                        .update({
                            auctions_won: userData.auctions_won + 1,
                            spent_on_bids:
                                userData.spent_on_bids +
                                updatedAuction.highest_bid,
                        })
                        .eq("user_id", updatedAuction.highest_bidder_id);
                }
            }

            return NextResponse.json(
                {
                    message: "Auction status updated successfully",
                    updatedAuction,
                },
                { status: 200 },
            );
        }

        return NextResponse.json(
            { message: "Invalid action specifier query" },
            { status: 400 },
        );
    } catch (e: any) {
        console.error(e);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 },
        );
    }
}
