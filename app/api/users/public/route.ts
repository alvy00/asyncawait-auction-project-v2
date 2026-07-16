import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    const { user_id } = await request.json();
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
        .from("users")
        .select("name")
        .eq("user_id", user_id)
        .single();

    if (error || !data) {
        return NextResponse.json(
            { message: "User not found" },
            { status: 404 },
        );
    }

    return NextResponse.json(data);
}
