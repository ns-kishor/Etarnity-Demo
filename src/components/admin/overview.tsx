"use client";

import * as React from "react";
import { useAdminData, formatDateTime } from "./admin-utils";
import AdminHeader from "./admin-header";
import { EmptyState, ErrorState, LoadingState } from "@/components/site/states";
import type { DashboardStats } from "@/lib/types";

function StatCard({
  label,
  value,
  note,
}: {
  label: string;
  value: React.ReactNode;
  note: string;
}) {
  return (
    <div className="rounded-xl border border-hairline bg-white p-5">
      <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-graphite">
        {value}
      </p>
      <p className="mt-2 text-xs text-ink-soft">{note}</p>
    </div>
  );
}

export default function OverviewSection() {
  const { data, loading, error, refresh } = useAdminData<DashboardStats>(
    "/api/admin/dashboard"
  );

  return (
    <div>
      <AdminHeader
        section="Overview"
        title="Overview"
        description="Live counts from the ETARNITY database — published content, people, inquiries and media."
      />

      {loading ? <LoadingState label="Loading dashboard" /> : null}

      {!loading && error ? (
        <ErrorState message={error} onRetry={refresh} />
      ) : null}

      {!loading && !error && data ? (
        <div className="space-y-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Published Businesses"
              value={data.publishedBusinesses}
              note={`of ${data.totalBusinesses} total`}
            />
            <StatCard
              label="Published Projects"
              value={data.publishedProjects}
              note={`of ${data.totalProjects} total`}
            />
            <StatCard
              label="Published Articles"
              value={data.publishedArticles}
              note={`${data.draftArticles} draft${
                data.draftArticles === 1 ? "" : "s"
              } · ${data.totalArticles} total`}
            />
            <StatCard
              label="Public People"
              value={data.publicPeople}
              note="visible on the site"
            />
            <StatCard
              label="Open Inquiries"
              value={data.openInquiries}
              note={`of ${data.totalInquiries} total`}
            />
            <StatCard
              label="Media Items"
              value={data.mediaCount}
              note="uploaded assets"
            />
          </div>

          <div className="rounded-xl border border-hairline bg-white">
            <div className="border-b border-hairline px-5 py-4">
              <h2 className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
                Recent Activity
              </h2>
            </div>
            {data.recentActivity.length === 0 ? (
              <div className="p-6">
                <EmptyState
                  title="No admin activity recorded yet."
                  description="Actions taken in this panel will appear here."
                  className="border-0 bg-transparent py-6"
                />
              </div>
            ) : (
              <ul className="divide-y divide-hairline">
                {data.recentActivity.map((entry) => (
                  <li
                    key={entry.id}
                    className="flex flex-wrap items-center gap-x-4 gap-y-1 px-5 py-3"
                  >
                    <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-ink-soft">
                      {formatDateTime(entry.createdAt)}
                    </span>
                    <span className="font-mono text-[11px] font-medium text-graphite">
                      {entry.action}
                    </span>
                    <span className="text-xs text-ink-soft">
                      {entry.entityType}
                      {entry.entityId ? ` #${entry.entityId}` : ""}
                      {entry.actor ? ` · by ${entry.actor}` : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
