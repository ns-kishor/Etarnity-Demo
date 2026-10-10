import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { authErrorResponse, requireAdmin } from "@/lib/auth";
import type { AuditEntry, DashboardStats } from "@/lib/types";

/** Aggregate counts + recent audit activity for the admin dashboard. */
export async function GET(req: Request) {
  try {
    await requireAdmin(req, "VIEWER");

    const [
      totalBusinesses,
      publishedBusinesses,
      totalProjects,
      publishedProjects,
      totalArticles,
      publishedArticles,
      draftArticles,
      publicPeople,
      totalInquiries,
      openInquiries,
      mediaCount,
      recentLogs,
    ] = await Promise.all([
      db.business.count(),
      db.business.count({ where: { isPublished: true } }),
      db.project.count(),
      db.project.count({ where: { isPublished: true } }),
      db.article.count(),
      db.article.count({ where: { status: "PUBLISHED" } }),
      db.article.count({ where: { status: "DRAFT" } }),
      db.person.count({ where: { isPublic: true } }),
      db.contactInquiry.count(),
      db.contactInquiry.count({
        where: { status: { in: ["NEW", "IN_PROGRESS"] } },
      }),
      db.mediaItem.count(),
      db.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { name: true } } },
      }),
    ]);

    const stats: DashboardStats = {
      publishedBusinesses,
      totalBusinesses,
      publishedProjects,
      totalProjects,
      publishedArticles,
      totalArticles,
      draftArticles,
      publicPeople,
      openInquiries,
      totalInquiries,
      mediaCount,
      recentActivity: recentLogs.map(
        (log): AuditEntry => ({
          id: log.id,
          action: log.action,
          entityType: log.entityType,
          entityId: log.entityId,
          actor: log.actor?.name ?? null,
          createdAt: log.createdAt.toISOString(),
        })
      ),
    };

    return NextResponse.json(stats);
  } catch (error) {
    return authErrorResponse(error);
  }
}
