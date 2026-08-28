import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Auditerra Docs",
  description: "Technical Documentation - Soil Diagnostics & Restoration Platform",
  lang: "en-US",

  base: "/",

  ignoreDeadLinks: true,

  head: [
    ["link", { rel: "stylesheet", href: "/custom.css" }]
  ],

  themeConfig: {
    logo: {
      src: "/home.svg",
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
          { text: "Backend", link: "/api/overview" },
          { text: "Frontend Web", link: "/Frontend-Web/overview" },
          { text: "Frontend Mobile", link: "/frontend-mobile/overview" },
          { text: "Security", link: "/security/overview" },
          { text: "AI Module", link: "/ai/overview" },
          { text: "Deployment", link: "/deployment/overview" },
          { text: "Developer Guide", link: "/dev_guide/overview" },
        ],
      },
    ],

    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/najmahares/Auditerra-Technical-Documentation-1",
      },
    ],

    footer: {
      message: "Built for Kenya's land restoration",
      copyright: "Copyright © 2026 Auditerra Team",
    },
  },
});
