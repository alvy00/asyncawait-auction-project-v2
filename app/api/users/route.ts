/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// 1. Get Current Logged IN User's Database Data (replaces /getuser)
// api/users/route.ts
export async function GET(request: Request) {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return NextResponse.json(
            { message: "Missing or invalid Authorization header" },
            { status: 401 },
        );
    }

    const token = authHeader.split(" ")[1];

    try {
        const supabase = await createSupabaseServerClient();
        const { data: authData, error: authError } =
            await supabase.auth.getUser(token);

        if (authError || !authData?.user) {
            return NextResponse.json(
                { message: "User not authenticated", data: authData },
                { status: 401 },
            );
        }

        const userId = authData.user.id;

        let { data: userDatabaseData, error: dbError } = await supabase
            .from("users")
            .select("*")
            .eq("user_id", userId)
            .single();

        // User not found in DB, creating new user...
        if (dbError && dbError.code === "PGRST116") {
            const { data: createdUser, error: insertError } = await supabase
                .from("users")
                .insert({
                    user_id: userId,
                    email: authData.user.email,
                    name:
                        authData.user.user_metadata?.full_name ||
                        authData.user.email,
                    username:
                        authData.user.user_metadata?.full_name?.toLowerCase() ||
                        authData.user.email?.split("@")[0],
                })
                .select()
                .single();

            if (insertError) {
                return NextResponse.json(
                    { message: "Failed to create user" },
                    { status: 500 },
                );
            }

            userDatabaseData = createdUser;
        } else if (dbError) {
            return NextResponse.json(
                { message: "Database error" },
                { status: 500 },
            );
        }

        return NextResponse.json(userDatabaseData, { status: 200 });
    } catch (e) {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 },
        );
    }
}

// 2. User SignUP & Base Updates (replaces /signup, /fetchuser, /nameupdate, /emailupdate, /bioupdate)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, user_id, name, username, email, password, bio } = body;
        const supabase = await createSupabaseServerClient();

        // --- CASE A: SIGN UP ---
        if (action === "signup") {
            if (!name || !username || !email || !password) {
                return NextResponse.json(
                    { message: "All fields are required!" },
                    { status: 400 },
                );
            }

            const isValidEmail = (str: string) =>
                /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(str);
            if (!isValidEmail(email))
                return NextResponse.json(
                    { message: "Email address is invalid" },
                    { status: 400 },
                );

            const { data: existingEmail } = await supabase
                .from("users")
                .select("*")
                .eq("email", email);
            const { data: existingUsername } = await supabase
                .from("users")
                .select("*")
                .eq("username", username);

            if (existingEmail && existingEmail.length > 0)
                return NextResponse.json(
                    { message: "Email already in use!" },
                    { status: 400 },
                );
            if (existingUsername && existingUsername.length > 0)
                return NextResponse.json(
                    { message: "Username already taken!" },
                    { status: 400 },
                );

            const { data: signupData, error: signupErr } =
                await supabase.auth.signUp({ email, password });
            if (signupErr || !signupData.user)
                return NextResponse.json(
                    { message: signupErr?.message || "Signup failed" },
                    { status: 400 },
                );

            const { error: profileErr } = await supabase.from("users").insert([
                {
                    user_id: signupData.user.id,
                    name,
                    username,
                    email,
                },
            ]);

            if (profileErr)
                return NextResponse.json(
                    { message: profileErr.message },
                    { status: 400 },
                );
            return NextResponse.json(
                { message: "User created successfully!" },
                { status: 201 },
            );
        }

        // --- CASE B: FETCH USER BY ID ---
        if (action === "fetch") {
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("user_id", user_id)
                .single();
            if (error)
                return NextResponse.json(
                    { message: "DB error", error },
                    { status: 400 },
                );
            return NextResponse.json(data, { status: 200 });
        }

        // --- CASE C: UPDATE FIELDS ---
        if (action === "update") {
            if (!user_id)
                return NextResponse.json(
                    { message: "Missing user_id" },
                    { status: 400 },
                );

            const updateData: Record<string, any> = {};
            if (name !== undefined) updateData.name = name;
            if (email !== undefined) updateData.email = email;
            if (bio !== undefined) updateData.bio = bio;

            const { data, error } = await supabase
                .from("users")
                .update(updateData)
                .eq("user_id", user_id);
            if (error)
                return NextResponse.json(
                    { message: "Error updating user profile", error },
                    { status: 400 },
                );

            return NextResponse.json(
                { message: "Profile updated successfully", data },
                { status: 200 },
            );
        }

        return NextResponse.json(
            { message: "Invalid action configuration" },
            { status: 400 },
        );
    } catch (e) {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 },
        );
    }
}
