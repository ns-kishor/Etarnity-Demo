import { NextResponse } from "next/server";
import { getPublicPeople } from "@/lib/queries";

export async function GET() {
  try {
    const people = await getPublicPeople();
    return NextResponse.json(people);
  } catch (error) {
    console.error("[api/public/people]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
