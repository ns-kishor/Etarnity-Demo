import { NextResponse } from "next/server";
import { getJobPositions } from "@/lib/queries";

export async function GET() {
  try {
    const positions = await getJobPositions();
    return NextResponse.json(positions);
  } catch (error) {
    console.error("[api/public/careers]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
