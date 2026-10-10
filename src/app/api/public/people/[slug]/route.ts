import { NextResponse } from "next/server";
import { getPersonBySlug } from "@/lib/queries";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const person = await getPersonBySlug(slug);
    if (!person) {
      return NextResponse.json({ error: "Person not found." }, { status: 404 });
    }
    return NextResponse.json(person);
  } catch (error) {
    console.error("[api/public/people/[slug]]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
