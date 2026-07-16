import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({ Message: "Hello world!" }, { status: 500 });
}
