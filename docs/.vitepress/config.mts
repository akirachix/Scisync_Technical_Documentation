import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Auditerra Docs",
  description:
    "Technical Documentation : Soil Diagnostics & Restoration Platform",
  lang: "en-US",
  ignoreDeadLinks: [
    /http:\/\/localhost/,
    /\.\/index/,
    /\/guide\/getting-started/,
    /\/dev_guide\/overview/,
    /\/architecture\/arch/,
    /\/api\/introduction/,
    /\/security\/overview/,
    /\/ai\/overview/,
    /\/deployment\/overview/,
    /\/guide\/overview/,
    /\/architecture\/overview/,
    /\/api\/overview/,
  ],
  themeConfig: {
    logo: {
      src: "/logo.svg",
      alt: "Auditerra Logo",
      width: 108,
      height: 148,
    },
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
          { text: "Architecture", link: "/architecture/overview" },
          { text: "API", link: "/api/overview" },
          { text: "Frontend Web", link: "/Frontend-Web/overview" },
          { text: "Frontend Mobile", link: "/frontend-mobile/overview" },
          { text: "Security", link: "/security/overview" },
          { text: "AI ", link: "/ai/overview" },
          { text: "Deployment", link: "/deployment/overview" },
          { text: "Developer Guide", link: "/dev_guide/overview" },
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
