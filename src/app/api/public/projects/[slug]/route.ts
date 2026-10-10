import { NextResponse } from "next/server";
import { getProjectBySlug } from "@/lib/queries";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const project = await getProjectBySlug(slug);
    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }
    return NextResponse.json(project);
  } catch (error) {
    console.error("[api/public/projects/[slug]]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
