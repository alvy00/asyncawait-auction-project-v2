/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// GET /api/auctions/favorites?user_id=abc
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const user_id = searchParams.get("user_id");

        if (!user_id) {
            return NextResponse.json(
                { message: "Missing user_id parameter" },
                { status: 400 },
            );
        }

        const supabase = await createSupabaseServerClient();
        const { data, error } = await supabase
            .from("user_favorites")
            .select("auction_id")
            .eq("user_id", user_id);

        if (error) {
            return NextResponse.json(
                { message: "Failed to fetch favourites", error },
                { status: 500 },
            );
        }

        const auctionIds = data.map((fav) => fav.auction_id);
        return NextResponse.json(auctionIds, { status: 200 });
    } catch (e: any) {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 },
        );
    }
}

// POST /api/auctions/favorites
export async function POST(request: Request) {
    try {
        const { action, auction_id, user_id } = await request.json(); // action = 'add' or 'remove'
        const supabase = await createSupabaseServerClient();

        if (!auction_id || !user_id) {
            return NextResponse.json(
                { message: "Missing metadata parameters" },
                { status: 400 },
            );
        }

        if (action === "add") {
            const { data, error } = await supabase
                .from("user_favorites")
                .insert([{ user_id, auction_id }]);

            if (error) {
                return NextResponse.json(
                    { message: "Error favoriting auction", error },
                    { status: 400 },
                );
            }
            return NextResponse.json(
                { message: "Auction favorited successfully", data },
                { status: 200 },
            );
        }

        if (action === "remove") {
            const { data, error } = await supabase
                .from("user_favorites")
                .delete()
                .eq("user_id", user_id)
                .eq("auction_id", auction_id);

            if (error) {
                return NextResponse.json(
                    { message: "Error unfavoriting auction", error },
                    { status: 400 },
                );
            }
            return NextResponse.json(
                { message: "Auction unfavorited successfully", data },
                { status: 200 },
            );
        }

        return NextResponse.json(
            { message: "Invalid action type specified" },
            { status: 400 },
        );
    } catch (e: any) {
        return NextResponse.json(
            { message: "Something went wrong" },
            { status: 500 },
        );
    }
}
