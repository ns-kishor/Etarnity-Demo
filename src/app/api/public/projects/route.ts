import { NextResponse } from "next/server";
import { getPublishedProjects } from "@/lib/queries";

export async function GET() {
  try {
    const projects = await getPublishedProjects();
    return NextResponse.json(projects);
  } catch (error) {
    console.error("[api/public/projects]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
