/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";

// api/admin/newsletter/route.ts
export async function POST(request: Request) {
    try {
        const { email } = await request.json();
        if (!email)
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 },
            );

        const response = await fetch(
            "https://api.buttondown.email/v1/subscribers",
            {
                method: "POST",
                headers: {
                    Authorization: `Token ${process.env.BUTTONDOWN_API_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email_address: email }),
            },
        );

        if (!response.ok) {
            const errorText = await response.text();
            return NextResponse.json(
                { error: "Subscription failed", detail: errorText },
                { status: 500 },
            );
        }

        return NextResponse.json(
            { message: "Subscribed successfully!" },
            { status: 200 },
        );
    } catch (err) {
        return NextResponse.json(
            { error: "Subscription failed" },
            { status: 500 },
        );
    }
}
