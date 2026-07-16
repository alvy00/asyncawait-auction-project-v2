/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type RouteContext = {
    params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
    try {
        const { id } = await context.params;
        const supabase = await createSupabaseServerClient();

        const { data, error } = await supabase
            .from("auctions")
            .select("*")
            .eq("auction_id", id)
            .single();

        if (error) {
            return NextResponse.json(
                { message: "Error fetching auction details.", data },
                { status: 500 },
            );
        }

        return NextResponse.json(data, { status: 200 });
    } catch (err: any) {
        return NextResponse.json(
            { message: "Unexpected server error." },
            { status: 500 },
        );
    }
}
