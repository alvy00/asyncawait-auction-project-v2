/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const user_id = searchParams.get("user_id");

    if (!user_id)
        return NextResponse.json(
            { message: "Missing user_id" },
            { status: 400 },
        );

    const supabase = await createSupabaseServerClient();

    // The inner join query
    const { data, error } = await supabase
        .from("user_favorites")
        .select(
            `
            auction:auction_id (
                auction_id,
                item_name,
                starting_price,
                images,
                auction_type,
                creator,
                status,
                end_time
            )
        `,
        )
        .eq("user_id", user_id);

    if (error)
        return NextResponse.json(
            { message: "Error fetching" },
            { status: 500 },
        );

    const auctions = data.map((item: any) => item.auction);
    return NextResponse.json(auctions);
}
