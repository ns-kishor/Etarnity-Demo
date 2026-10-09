"use client";

import * as React from "react";
import {
  Building,
  Building2,
  ExternalLink,
  FolderKanban,
  Images,
  Inbox,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Newspaper,
  UserCog,
  Users,
} from "lucide-react";
import { Logo } from "@/components/site/logo";
import { LoadingState } from "@/components/site/states";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { api, toastError, toastSuccess, useAdminData } from "./admin-utils";
import { useRouter } from "@/lib/router";
import type { AdminUser, ContactInquiry } from "@/lib/types";
import { cn } from "@/lib/utils";

/* Sections — lazy-loaded, routed by segments[1]. */
const OverviewSection = React.lazy(() => import("./overview"));
const BusinessesSection = React.lazy(() => import("./businesses"));
const ProjectsSection = React.lazy(() => import("./projects"));
const PeopleSection = React.lazy(() => import("./people"));
const ArticlesSection = React.lazy(() => import("./articles"));
const MediaSection = React.lazy(() => import("./media"));
const InquiriesSection = React.lazy(() => import("./inquiries"));
const CompanySection = React.lazy(() => import("./company"));
const UsersSection = React.lazy(() => import("./users"));

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: number;
}

function roleLabel(role: string): string {
  return role.replace(/_/g, " ");
}

/* ---------------------------------------------------------------- */
/* Sidebar                                                            */
/* ---------------------------------------------------------------- */

function SidebarNav({
  user,
  onNavigate,
  onLogout,
  loggingOut,
}: {
  user: AdminUser;
  onNavigate: () => void;
  onLogout: () => void;
  loggingOut: boolean;
}) {
  const { path, navigate } = useRouter();

  const { data: inquiries } = useAdminData<ContactInquiry[]>(
    "/api/admin/inquiries"
  );
  const newCount = (inquiries ?? []).filter((i) => i.status === "NEW").length;

  const navItems: NavItem[] = [
    { label: "Overview", path: "/admin", icon: <LayoutDashboard className="size-4" /> },
    {
      label: "Businesses",
      path: "/admin/businesses",
      icon: <Building2 className="size-4" />,
    },
    {
      label: "Projects",
      path: "/admin/projects",
      icon: <FolderKanban className="size-4" />,
    },
    { label: "People", path: "/admin/people", icon: <Users className="size-4" /> },
    {
      label: "Articles",
      path: "/admin/articles",
      icon: <Newspaper className="size-4" />,
    },
    { label: "Media", path: "/admin/media", icon: <Images className="size-4" /> },
    {
      label: "Inquiries",
      path: "/admin/inquiries",
      icon: <Inbox className="size-4" />,
      badge: newCount,
    },
    {
      label: "Company",
      path: "/admin/company",
      icon: <Building className="size-4" />,
    },
    ...(user.role === "SUPER_ADMIN"
      ? [
          {
            label: "Users",
            path: "/admin/users",
            icon: <UserCog className="size-4" />,
          },
        ]
      : []),
  ];

  const isActive = (item: NavItem) =>
    item.path === "/admin" ? path === "/admin" : path.startsWith(item.path);

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pb-6 pt-6">
        <Logo variant="light" />
      </div>

      <nav aria-label="Admin sections" className="flex-1 space-y-0.5 px-3">
        {navItems.map((item) => {
          const active = isActive(item);
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => {
                navigate(item.path);
                onNavigate();
              }}
              aria-current={active ? "page" : undefined}
              className={cn(
                "relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric",
                active
                  ? "bg-warmwhite font-medium text-graphite"
                  : "text-ink-soft hover:text-graphite"
              )}
            >
              {active ? (
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-electric"
                />
              ) : null}
              {item.icon}
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && item.badge > 0 ? (
                <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-electric px-1.5 py-0.5 font-mono text-[10px] font-medium text-white">
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </nav>

      {/* Bottom: user card + logout */}
      <div className="space-y-3 border-t border-hairline p-4">
        <div className="flex items-center gap-3 rounded-lg bg-warmwhite px-3 py-2.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-graphite font-mono text-[10px] uppercase text-warmwhite">
            {user.name.slice(0, 2)}
          </span>
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-xs font-medium text-graphite">
              {user.name}
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.15em] text-ink-soft">
              {roleLabel(user.role)}
            </span>
          </span>
        </div>
        <button
          type="button"
          onClick={onLogout}
          disabled={loggingOut}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-soft transition-colors hover:text-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
        >
          <LogOut className="size-4" />
          {loggingOut ? "Signing out…" : "Sign out"}
        </button>
        <a
          href="#/"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink-soft transition-colors hover:text-graphite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
        >
          <ExternalLink className="size-4" />
          View Site
          <span aria-hidden="true" className="ml-auto font-mono text-xs">
            ↗
          </span>
        </a>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- */
/* Lazy section routing                                               */
/* ---------------------------------------------------------------- */

const SectionFallback = () => (
  <div className="pt-24">
    <LoadingState label="Loading section" />
  </div>
);

function Section({ section, user }: { section: string; user: AdminUser }) {
  switch (section) {
    case "businesses":
      return <BusinessesSection />;
    case "projects":
      return <ProjectsSection />;
    case "people":
      return <PeopleSection />;
    case "articles":
      return <ArticlesSection />;
    case "media":
      return <MediaSection />;
    case "inquiries":
      return <InquiriesSection />;
    case "company":
      return <CompanySection />;
    case "users":
      return user.role === "SUPER_ADMIN" ? (
        <UsersSection me={user} />
      ) : (
        <OverviewSection />
      );
    default:
      return <OverviewSection />;
  }
}

/* ---------------------------------------------------------------- */
/* Shell                                                              */
/* ---------------------------------------------------------------- */

export default function AdminShell({
  user,
  onLogout,
}: {
  user: AdminUser;
  onLogout: () => void;
}) {
  const router = useRouter();
  const section = router.segments[1] ?? "";
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [loggingOut, setLoggingOut] = React.useState(false);

  const logout = async () => {
    setLoggingOut(true);
    try {
      await api("/api/admin/logout", "POST");
      toastSuccess("Signed out");
      onLogout();
    } catch (e) {
      toastError(
        "Could not sign out.",
        e instanceof Error ? e.message : undefined
      );
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-warmwhite">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-60 shrink-0 border-r border-hairline bg-white lg:block">
        <SidebarNav
          user={user}
          onNavigate={() => undefined}
          onLogout={() => void logout()}
          loggingOut={loggingOut}
        />
      </aside>

      {/* Mobile drawer */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 gap-0 p-0 sm:max-w-xs">
          <SheetHeader className="sr-only">
            <SheetTitle>Admin navigation</SheetTitle>
          </SheetHeader>
          <SidebarNav
            user={user}
            onNavigate={() => setMobileOpen(false)}
            onLogout={() => {
              setMobileOpen(false);
              void logout();
            }}
            loggingOut={loggingOut}
          />
        </SheetContent>
      </Sheet>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-40 flex items-center justify-between border-b border-hairline bg-white px-4 py-3 lg:hidden">
          <Logo variant="light" />
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open admin menu"
            className="inline-flex size-10 items-center justify-center rounded-md text-graphite transition-colors hover:bg-warmwhite focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-electric"
          >
            <Menu className="size-5" />
          </button>
        </div>

        <main className="mx-auto w-full max-w-6xl flex-1 px-6 pb-16 pt-6 md:px-10">
          <React.Suspense fallback={<SectionFallback />}>
            <Section section={section} user={user} />
          </React.Suspense>
        </main>
      </div>
    </div>
  );
}
