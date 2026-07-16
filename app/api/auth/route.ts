/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, email, password, access_token, refresh_token } = body;
        const supabase = await createSupabaseServerClient();

        // --- STANDARD SIGN IN ---
        if (action === "login") {
            if (!email || !password)
                return NextResponse.json(
                    { message: "All fields required!" },
                    { status: 400 },
                );

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });
            if (error || !data || !data.session) {
                return NextResponse.json(
                    { message: error?.message || "Invalid login credentials." },
                    { status: 401 },
                );
            }

            return NextResponse.json(
                {
                    message: "Login successful!",
                    session: {
                        access_token: data.session.access_token,
                        refresh_token: data.session.refresh_token,
                    },
                    user: data.user,
                },
                { status: 200 },
            );
        }

        // --- OAUTH CALLBACK SESSION EXCHANGE ---
        if (action === "callback") {
            if (!access_token || !refresh_token)
                return NextResponse.json(
                    { message: "Missing tokens" },
                    { status: 400 },
                );

            await supabase.auth.setSession({ access_token, refresh_token });
            const { data: user, error } = await supabase.auth.getUser();

            if (error || !user)
                return NextResponse.json(
                    { message: "Invalid tokens", error },
                    { status: 401 },
                );
            return NextResponse.json({ user }, { status: 200 });
        }

        return NextResponse.json(
            { message: "Invalid auth action" },
            { status: 400 },
        );
    } catch (e) {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 },
        );
    }
}
