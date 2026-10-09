import SiteApp from "@/components/site/app";
import { getHomePayload } from "@/lib/queries";

export default async function Page() {
  const payload = await getHomePayload();
  return <SiteApp initialData={payload} />;
}
