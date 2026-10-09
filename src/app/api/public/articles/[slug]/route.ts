import { NextResponse } from "next/server";
import { getArticleBySlug } from "@/lib/queries";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const article = await getArticleBySlug(slug);
    if (!article) {
      return NextResponse.json({ error: "Article not found." }, { status: 404 });
    }
    return NextResponse.json(article);
  } catch (error) {
    console.error("[api/public/articles/[slug]]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
