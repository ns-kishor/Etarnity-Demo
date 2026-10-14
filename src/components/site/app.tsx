"use client";

import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "@/lib/router";
import type { HomePayload } from "@/lib/queries";
import { Header } from "./header";
import { Footer } from "./footer";
import { BrandIntro } from "./intro";
import AdminApp from "@/components/admin/admin-app";
import HomePage from "./pages/home";
import CompanyPage from "./pages/company";
import MissionVisionPage from "./pages/mission-vision";
import BusinessesPage from "./pages/businesses";
import BusinessDetailPage from "./pages/business-detail";
import TechnologyPage from "./pages/technology";
import WorkPage from "./pages/work";
import ProjectDetailPage from "./pages/project-detail";
import PeoplePage from "./pages/people";
import PersonDetailPage from "./pages/person-detail";
import InsightsPage from "./pages/insights";
import ArticlePage from "./pages/article-detail";
import CareersPage from "./pages/careers";
import ContactPage from "./pages/contact";
import PrivacyPage from "./pages/privacy";
import TermsPage from "./pages/terms";
import NotFoundPage from "./pages/not-found";

function renderRoute(
  path: string,
  segments: string[],
  initialData: HomePayload
): React.ReactNode {
  if (path === "/") return <HomePage initialData={initialData} />;
  if (path === "/company") return <CompanyPage />;
  if (path === "/company/mission-vision") return <MissionVisionPage />;
  if (path === "/businesses") return <BusinessesPage />;
  if (segments[0] === "businesses" && segments[1])
    return <BusinessDetailPage slug={segments[1]} />;
  if (path === "/technology") return <TechnologyPage />;
  if (path === "/work") return <WorkPage />;
  if (segments[0] === "work" && segments[1])
    return <ProjectDetailPage slug={segments[1]} />;
  if (path === "/people") return <PeoplePage />;
  if (segments[0] === "people" && segments[1])
    return <PersonDetailPage slug={segments[1]} />;
  if (path === "/insights") return <InsightsPage />;
  if (segments[0] === "insights" && segments[1])
    return <ArticlePage slug={segments[1]} />;
  if (path === "/careers") return <CareersPage />;
  if (path === "/contact") return <ContactPage />;
  if (path === "/privacy-policy") return <PrivacyPage />;
  if (path === "/terms") return <TermsPage />;
  return <NotFoundPage />;
}

export default function SiteApp({
  initialData,
}: {
  initialData: HomePayload;
}) {
  const { path, segments } = useRouter();

  // Reset scroll on every route change.
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  // Admin renders standalone — no public chrome.
  if (path === "/admin" || path.startsWith("/admin/")) {
    return <AdminApp />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-warmwhite">
      {/* Brand intro — plays once per browser session (see intro.tsx). */}
      <BrandIntro />
      <Header />
      <main id="main-content" className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={path}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.18 } }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            {renderRoute(path, segments, initialData)}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer email={initialData?.company?.contactEmail ?? undefined} />
    </div>
  );
}
