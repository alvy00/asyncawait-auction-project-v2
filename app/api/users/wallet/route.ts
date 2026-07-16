/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
    try {
        const { action, user_id, amount } = await request.json();
        if (!user_id || !amount)
            return NextResponse.json(
                { message: "All fields required!" },
                { status: 400 },
            );

        const targetAmount = Number(amount);
        if (isNaN(targetAmount) || targetAmount <= 0)
            return NextResponse.json(
                { message: "Invalid transaction amount" },
                { status: 400 },
            );

        const supabase = await createSupabaseServerClient();

        // --- DEPOSIT ACTION ---
        if (action === "deposit") {
            const { data: txData, error: insErr } = await supabase
                .from("transactions")
                .insert([{ user_id, type: "deposit", amount: targetAmount }])
                .select();
            if (insErr)
                return NextResponse.json(
                    { message: insErr.message },
                    { status: 400 },
                );

            const { error: rpcErr } = await supabase.rpc(
                "increment_user_total_deposits",
                { user_id, deposit_amount: targetAmount },
            );
            if (rpcErr)
                return NextResponse.json(
                    { message: rpcErr.message },
                    { status: 400 },
                );

            return NextResponse.json({
                message: "Deposit successful",
                transaction: txData[0],
            });
        }

        // --- WITHDRAW ACTION ---
        if (action === "withdraw") {
            const { data: userData, error: userErr } = await supabase
                .from("users")
                .select("money")
                .eq("user_id", user_id)
                .single();
            if (userErr)
                return NextResponse.json(
                    { message: userErr.message },
                    { status: 400 },
                );
            if (!userData || userData.money < targetAmount)
                return NextResponse.json(
                    { message: "Insufficient funds" },
                    { status: 400 },
                );

            const { data: txData, error: insErr } = await supabase
                .from("transactions")
                .insert([
                    { user_id, type: "withdrawal", amount: -targetAmount },
                ])
                .select();
            if (insErr)
                return NextResponse.json(
                    { message: insErr.message },
                    { status: 400 },
                );

            const { error: rpcErr } = await supabase.rpc(
                "increment_user_total_withdrawals",
                { user_id, withdrawal_amount: targetAmount },
            );
            if (rpcErr)
                return NextResponse.json(
                    { message: rpcErr.message },
                    { status: 400 },
                );

            await supabase
                .from("users")
                .update({ money: userData.money - targetAmount })
                .eq("user_id", user_id);
            return NextResponse.json({
                message: "Withdrawal successful",
                transaction: txData[0],
            });
        }

        // --- RECORD WIN ACTION ---
        if (action === "record-win") {
            const { data: txData, error: insErr } = await supabase
                .from("transactions")
                .insert([{ user_id, type: "win", amount: -targetAmount }])
                .select();
            if (insErr)
                return NextResponse.json(
                    { message: insErr.message },
                    { status: 400 },
                );

            const { error: rpcErr } = await supabase.rpc(
                "increment_user_spent_on_bids",
                { user_id, spent_amount: targetAmount },
            );
            if (rpcErr)
                return NextResponse.json(
                    { message: rpcErr.message },
                    { status: 400 },
                );

            return NextResponse.json({
                message: "Win recorded successfully",
                transaction: txData[0],
            });
        }

        return NextResponse.json(
            { message: "Invalid action provided" },
            { status: 400 },
        );
    } catch (e) {
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 },
        );
    }
}
