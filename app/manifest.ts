import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MindReply MRagent",
    short_name: "MRagent",
    description: "Warm mind reads and one clear next move for tense work moments.",
    start_url: "/agent",
    scope: "/",
    display: "standalone",
    background_color: "#f4efe4",
    theme_color: "#162033",
    categories: ["business", "utilities"],
  };
}
