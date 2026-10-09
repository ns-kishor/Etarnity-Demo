import { NextResponse } from "next/server";
import { getBusinessBySlug } from "@/lib/queries";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const business = await getBusinessBySlug(slug);
    if (!business) {
      return NextResponse.json({ error: "Business not found." }, { status: 404 });
    }
    return NextResponse.json(business);
  } catch (error) {
    console.error("[api/public/businesses/[slug]]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
