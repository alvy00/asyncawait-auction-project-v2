/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// api/auctions/filter/route.ts
export async function POST(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const filterType = searchParams.get("type");
        const supabase = await createSupabaseServerClient();
        const now = new Date().toISOString();

        // 1. FEATURED AUCTIONS
        if (filterType === "featured") {
            const { data, error } = await supabase
                .from("auctions")
                .select("*")
                .gte("end_time", now)
                .order("total_bids", { ascending: false })
                .order("starting_price", { ascending: false })
                .limit(6);

            if (error) throw error;
            return NextResponse.json(data);
        }

        // 2. UNPAID AUCTIONS
        if (filterType === "unpaid") {
            const { user_id } = await request.json();
            if (!user_id) {
                return NextResponse.json(
                    { message: "Missing user_id" },
                    { status: 400 },
                );
            }

            const { data, error } = await supabase
                .from("auctions")
                .select("*")
                .eq("highest_bidder_id", user_id)
                .eq("payment_status", "unpaid")
                .lt("end_time", now);

            if (error) throw error;
            return NextResponse.json(data);
        }

        return NextResponse.json(
            { message: "Invalid filter type" },
            { status: 400 },
        );
    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json(
            { message: error.message || "Internal server error" },
            { status: 500 },
        );
    }
}
