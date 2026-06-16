import { createFileRoute } from "@tanstack/react-router";
import { CircuitFlow } from "@/components/CircuitFlow";
import { SITE, SITE_TITLE } from "@/lib/site";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: SITE_TITLE },
      { name: "description", content: SITE.description },
      { name: "keywords", content: SITE.keywords },
      { property: "og:title", content: SITE_TITLE },
      { property: "og:description", content: SITE.description },
    ],
  }),
  component: () => <CircuitFlow />,
});
