import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Auditerra Docs",
  description:
    "Technical Documentation - Soil Diagnostics & Restoration Platform",
  lang: "en-US",
  ignoreDeadLinks: [
    /http:\/\/localhost/,
    /\.\/index/,
    /\/guide\/getting-started/,
    // REMOVE THIS LINE: /\/dev_guide\/overview/,
    /\/architecture\/arch/,
    /\/api\/introduction/,
    /\/security\/overview/,
    /\/ai\/overview/,
    /\/guide\/overview/,
    /\/architecture\/overview/,
    /\/api\/overview/,
  ],
  themeConfig: {
    logo: {
      src: "/logo.svg",
      alt: "Auditerra Logo",
    },
    search: {
      provider: "local",
    },
    nav: [
      { text: "Home", link: "/" },
      { text: "Documentation", link: "/overview" },
    ],
    sidebar: [
      {
        text: "Documentation",
        items: [
          { text: "Overview", link: "/overview" },
          { text: "Architecture", link: "/architecture/overview" },
          { text: "Backend", link: "/api/overview" },
          { text: "Frontend Web", link: "/Frontend-Web/overview" },
          { text: "Frontend Mobile", link: "/frontend-mobile/overview" },
          { text: "Security", link: "/security/overview" },
          { text: "AI Module", link: "/ai/overview" },
          { text: "Deployment", link: "/deployment/overview" },
        ],
      },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/akirachix/Scisync_Technical_Documentation",
      },
    ],
    footer: {
      message: "Built for Kenya's land restoration",
      copyright: "Copyright © 2026 Auditerra Team",
    },
  },
});
