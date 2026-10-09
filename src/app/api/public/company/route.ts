import { NextResponse } from "next/server";
import { getCompanyProfile } from "@/lib/queries";

export async function GET() {
  try {
    const profile = await getCompanyProfile();
    return NextResponse.json(profile);
  } catch (error) {
    console.error("[api/public/company]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
