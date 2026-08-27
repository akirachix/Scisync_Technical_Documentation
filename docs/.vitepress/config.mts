import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Auditerra Docs",
  description:
    "Technical Documentation - Soil Diagnostics & Restoration Platform",
  lang: "en-US",

  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Overview", link: "/overview" },
      { text: "Architecture", link: "/architecture/overview" },
    ],

    sidebar: [
      {
        text: "Documentation",
        items: [
          { text: "Overview", link: "/overview" },
          { text: "Getting Started", link: "/guide/overview" },
          { text: "Architecture and Style", link: "/architecture/overview" },
          { text: "API", link: "/api/overview" },
          { text: "Frontend Web", link: "/Frontend-Web/overview" },
          { text: "Frontend Mobile", link: "/frontend-mobile/overview" },
          { text: "Security", link: "/security/overview" },
          { text: "AI", link: "/ai/overview" },
          { text: "Deployment", link: "/deployment/overview" },
          { text: "Developer Guide", link: "/dev_guide/overview" },
        ],
      },
    ],

    socialLinks: [{ icon: "github", link: "https://github.com" }],
  },
});
