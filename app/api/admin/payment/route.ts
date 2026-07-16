/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import SSLCommerzPayment from "sslcommerz-lts";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// api/admin/payment/route.ts
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            action,
            auction_id,
            item_name,
            name,
            email,
            category,
            payment,
        } = body;

        // --- CASE A: INITIATE TRANSACTION ORDER ---
        if (action === "initiate") {
            const trans_id = `txn_${uuidv4().replace(/-/g, "").slice(0, 24)}`;
            const data = {
                total_amount: payment,
                currency: "USD",
                tran_id: trans_id,
                success_url: `${new URL(request.url).origin}/api/admin/payment?action=success&auction_id=${auction_id}`,
                fail_url: "--",
                cancel_url: "--",
                ipn_url: "--",
                shipping_method: "Courier",
                product_name: item_name,
                product_category: category,
                cus_name: name,
                cus_email: email,
                cus_country: "Bangladesh",
                cus_phone: "017...11",
                ship_name: name,
                ship_city: "Dhaka",
                ship_country: "Bangladesh",
            };

            const sslcz = new SSLCommerzPayment(
                process.env.STORE_ID!,
                process.env.STORE_PASSWD!,
                false,
            );
            const apiResponse = await sslcz.init(data);

            if (apiResponse?.GatewayPageURL) {
                return NextResponse.json(
                    { GatewayPageURL: apiResponse.GatewayPageURL },
                    { status: 200 },
                );
            }
            return NextResponse.json(
                { error: "Failed to initiate payment" },
                { status: 500 },
            );
        }
    } catch (error) {
        return NextResponse.json(
            { error: "Something went wrong" },
            { status: 500 },
        );
    }
}

// --- CASE B: TRANSACTION SUCCESS CALLBACK RECEIVED ---
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const action = searchParams.get("action");
        const auction_id = searchParams.get("auction_id");

        if (action === "success" && auction_id) {
            const supabase = await createSupabaseServerClient();
            const { error } = await supabase
                .from("auctions")
                .update({ payment_status: "paid" })
                .eq("auction_id", auction_id);

            if (error)
                return NextResponse.json(
                    { error: "Payment Failed to record" },
                    { status: 500 },
                );

            // Perform server redirect back to your client workspace interface page
            return NextResponse.redirect(
                `${new URL(request.url).origin}/dashboard?payment=success`,
            );
        }
        return NextResponse.json(
            { error: "Bad query sequence action" },
            { status: 400 },
        );
    } catch (e) {
        return NextResponse.json(
            { error: "Server error while updating payment status" },
            { status: 500 },
        );
    }
}
