import { NextResponse } from "next/server";
import { getPublishedArticles } from "@/lib/queries";

export async function GET() {
  try {
    const articles = await getPublishedArticles();
    return NextResponse.json(articles);
  } catch (error) {
    console.error("[api/public/articles]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
