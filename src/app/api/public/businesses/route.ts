import { NextResponse } from "next/server";
import { getPublishedBusinesses } from "@/lib/queries";

export async function GET() {
  try {
    const businesses = await getPublishedBusinesses();
    return NextResponse.json(businesses);
  } catch (error) {
    console.error("[api/public/businesses]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
