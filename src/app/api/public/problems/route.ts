import { NextResponse } from "next/server";
import { getProblemPairs } from "@/lib/queries";

/** Active homepage "Problem Solving" pairs, ordered. */
export async function GET() {
  try {
    const problems = await getProblemPairs();
    return NextResponse.json(problems);
  } catch (error) {
    console.error("[api/public/problems]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
