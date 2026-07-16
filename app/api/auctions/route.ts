/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse, NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { auctionSchema } from "@/lib/schema";

// GET /api/auctions
// Fetches general auctions, transitions expired live auctions, and supports optional filtering by user_id
export async function GET(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();
        const currentTime = new Date().toISOString();

        // 1. Parse query parameters
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("user_id");
        const category = searchParams.get("category");

        // 2. Batch update live auctions that have passed their end time
        const { error: updateError } = await supabase
            .from("auctions")
            .update({ status: "ended" })
            .eq("status", "live")
            .lt("end_time", currentTime);

        if (updateError) {
            console.error(
                "Failed to transition expired auctions:",
                updateError.message,
            );
        }

        // 3. Build query dynamically
        let query = supabase
            .from("auctions")
            .select("*")
            .order("created_at", { ascending: false });

        if (userId) {
            query = query.eq("user_id", userId);
        }

        if (category) {
            query = query.eq("category", category);
        }

        const { data, error } = await query;

        if (error) {
            return NextResponse.json(
                { message: error.message },
                { status: 400 },
            );
        }

        return NextResponse.json(data, { status: 200 });
    } catch (e: any) {
        console.error("Error fetching auctions:", e);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 },
        );
    }
}

// POST /api/auctions
// Creates a new auction (Authenticated)
export async function POST(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();

        // Authenticate using Server Client Auth Session
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Unauthorized access" },
                { status: 401 },
            );
        }

        const body = await request.json();
        const result = auctionSchema.safeParse(body);

        if (!result.success) {
            return NextResponse.json(
                { error: "Invalid auction data", issues: result.error.issues },
                { status: 400 },
            );
        }

        const { data, error } = await supabase
            .from("auctions")
            .insert([
                {
                    user_id: user.id,
                    ...result.data,
                },
            ])
            .select();

        if (error) {
            return NextResponse.json(
                { error: "Database Insert Failed", message: error.message },
                { status: 500 },
            );
        }

        if (!data || data.length === 0) {
            return NextResponse.json(
                {
                    error: "Database Insert Returned No Data",
                    message: "Failed to create auction.",
                },
                { status: 500 },
            );
        }

        return NextResponse.json(
            { message: "Auction created successfully", auction: data[0] },
            { status: 201 },
        );
    } catch (e: any) {
        console.error("Error creating auction:", e);
        return NextResponse.json(
            {
                error: "Internal Server Error",
                message: e.message || "An error occurred",
            },
            { status: 500 },
        );
    }
}

// DELETE /api/auctions
// Deletes an auction by ID (Authenticated & Owner Validated)
export async function DELETE(request: NextRequest) {
    try {
        const supabase = await createSupabaseServerClient();

        // 1. Authenticate user session
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { message: "Unauthorized: Access is denied" },
                { status: 401 },
            );
        }

        // 2. Parse URL parameters for the target ID
        const { searchParams } = new URL(request.url);
        const auction_id = searchParams.get("id");

        if (!auction_id) {
            return NextResponse.json(
                { message: "auction id parameter (?id=...) is required" },
                { status: 400 },
            );
        }

        // 3. Execute row deletion matching target ID and authenticating owner
        const { error, count } = await supabase
            .from("auctions")
            .delete({ count: "exact" })
            .eq("auction_id", auction_id)
            .eq("user_id", user.id); // Guard against cross-user deletion spoofing

        if (error) {
            return NextResponse.json(
                {
                    message: "Error deleting auction record",
                    error: error.message,
                },
                { status: 400 },
            );
        }

        // Check if a row was actually targeted and deleted
        if (count === 0) {
            return NextResponse.json(
                {
                    message:
                        "Auction not found or you lack permission to remove it",
                },
                { status: 404 },
            );
        }

        return NextResponse.json(
            { message: "Auction deleted successfully" },
            { status: 200 },
        );
    } catch (e: any) {
        console.error("Critical error inside DELETE route handler:", e);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 },
        );
    }
}
