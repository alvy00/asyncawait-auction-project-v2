/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
    params: Promise<{ type: string; id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
    try {
        const { type, id } = await context.params;
        const supabase = await createSupabaseServerClient();

        let query = supabase.from(type).select("*");

        // Dynamically query against the proper UUID column configurations
        if (type === "users") query = query.eq("user_id", id);
        else if (type === "auctions") query = query.eq("auction_id", id);
        else if (type === "bids") query = query.eq("bid_id", id);
        else
            return NextResponse.json(
                { message: "Invalid entity module route parameter" },
                { status: 400 },
            );

        const { data, error } = await query.single();
        if (error)
            return NextResponse.json(
                { message: `Error pulling single record from ${type}`, error },
                { status: 400 },
            );

        return NextResponse.json(data, { status: 200 });
    } catch (e) {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 },
        );
    }
}
