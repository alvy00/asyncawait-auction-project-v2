/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
    try {
        const now = new Date().toISOString();
        const supabase = await createSupabaseServerClient();

        // Ended auctions update
        const { error: endedError } = await supabase
            .from("auctions")
            .update({ status: "ended" })
            .lt("end_time", now);
        if (endedError)
            return NextResponse.json(
                {
                    message: "Failed to update ended auctions",
                    error: endedError,
                },
                { status: 500 },
            );

        // Live auctions update
        const { error: liveError } = await supabase
            .from("auctions")
            .update({ status: "live" })
            .gte("start_time", now)
            .lt("end_time", now);
        if (liveError)
            return NextResponse.json(
                { message: "Failed to update live auctions", error: liveError },
                { status: 500 },
            );

        // Upcoming auctions update
        const { error: upcomingError } = await supabase
            .from("auctions")
            .update({ status: "upcoming" })
            .gt("start_time", now);
        if (upcomingError)
            return NextResponse.json(
                {
                    message: "Failed to update upcoming auctions",
                    error: upcomingError,
                },
                { status: 500 },
            );

        return NextResponse.json(
            { message: "Auction statuses updated successfully" },
            { status: 200 },
        );
    } catch (e) {
        return NextResponse.json(
            { message: "Server error during maintenance" },
            { status: 500 },
        );
    }
}
