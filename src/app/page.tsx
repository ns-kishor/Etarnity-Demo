import SiteApp from "@/components/site/app";
import { getHomePayload } from "@/lib/queries";

// Disable static prerendering at build time so Vercel builds succeed without requiring a cold database connection
export const dynamic = "force-dynamic";

export default async function Page() {
  try {
    const payload = await getHomePayload();
    return <SiteApp initialData={payload} />;
  } catch (error) {
    console.warn("Failed to load initial home payload, rendering fallback:", error);
    return (
      <SiteApp
        initialData={{
          company: null,
          businesses: [],
          projects: [],
          problems: [],
        }}
      />
    );
  }
}
