/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const target = searchParams.get("target") || "stats";
        const supabase = await createSupabaseServerClient();

        // --- TARGET A: ADMIN OVERVIEW METRICS ---
        if (target === "stats") {
            const { count: userCount, error: userError } = await supabase
                .from("users")
                .select("*", { count: "exact", head: true });
            if (userError)
                return NextResponse.json(
                    { message: "Error counting users" },
                    { status: 400 },
                );

            const { count: auctionCount, error: auctionError } = await supabase
                .from("auctions")
                .select("*", { count: "exact", head: true });
            if (auctionError)
                return NextResponse.json(
                    { message: "Error counting auctions" },
                    { status: 400 },
                );

            const { count: bidCount, error: bidError } = await supabase
                .from("bids")
                .select("*", { count: "exact", head: true });
            if (bidError)
                return NextResponse.json(
                    { message: "Error counting bids" },
                    { status: 400 },
                );

            return NextResponse.json(
                {
                    userCount,
                    auctionCount,
                    bidCount,
                    generatedAt: new Date().toISOString(),
                },
                { status: 200 },
            );
        }

        // --- TARGET B: GET ALL USERS ---
        if (target === "users") {
            const { data, error } = await supabase.from("users").select("*");
            if (error)
                return NextResponse.json(
                    { message: "Error fetching users", error },
                    { status: 400 },
                );
            return NextResponse.json(data, { status: 200 });
        }

        // --- TARGET C: GET ALL AUCTIONS ---
        if (target === "auctions") {
            const { data, error } = await supabase
                .from("auctions")
                .select("*")
                .order("created_at", { ascending: false });
            if (error)
                return NextResponse.json(
                    { message: "Error fetching auctions", error },
                    { status: 400 },
                );
            return NextResponse.json(data, { status: 200 });
        }

        // --- TARGET D: GET ALL BIDS ---
        if (target === "bids") {
            const { data, error } = await supabase
                .from("bids")
                .select("*")
                .order("created_at", { ascending: false });
            if (error)
                return NextResponse.json(
                    { message: "Error fetching bids", error },
                    { status: 400 },
                );
            return NextResponse.json(data, { status: 200 });
        }

        return NextResponse.json(
            { message: "Invalid target specified" },
            { status: 400 },
        );
    } catch (e) {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 },
        );
    }
}

// Handles user removal actions
export async function DELETE(request: Request) {
    try {
        const { user_id } = await request.json();
        if (!user_id)
            return NextResponse.json(
                { message: "Missing user_id parameter" },
                { status: 400 },
            );

        const supabase = await createSupabaseServerClient();
        const { error } = await supabase
            .from("users")
            .delete()
            .eq("user_id", user_id);

        if (error)
            return NextResponse.json(
                { message: "Error deleting user", error },
                { status: 400 },
            );
        return NextResponse.json({ message: "User deleted!" }, { status: 200 });
    } catch (e) {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}

// Handles updating user statuses (Locking / Unlocking account states)
export async function PATCH(request: Request) {
    try {
        const { user_id, is_suspended } = await request.json();
        if (!user_id || typeof is_suspended !== "boolean") {
            return NextResponse.json(
                { message: "Missing user_id or is_suspended parameters" },
                { status: 400 },
            );
        }

        const supabase = await createSupabaseServerClient();
        const { error } = await supabase
            .from("users")
            .update({ is_suspended })
            .eq("user_id", user_id);

        if (error)
            return NextResponse.json(
                { message: "Error updating account state", error },
                { status: 400 },
            );

        return NextResponse.json(
            { message: `User status updated successfully` },
            { status: 200 },
        );
    } catch (e) {
        return NextResponse.json({ message: "Server error" }, { status: 500 });
    }
}
