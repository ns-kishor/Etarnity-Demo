import { NextResponse } from "next/server";
import { getTechnologyAreas } from "@/lib/queries";

export async function GET() {
  try {
    const areas = await getTechnologyAreas();
    return NextResponse.json(areas);
  } catch (error) {
    console.error("[api/public/technology]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
