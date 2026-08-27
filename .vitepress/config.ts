import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Auditerra',
  description: 'Technical Documentation',
  lang: 'en-US',
  
  base: '/',
  
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/introduction' },
      { text: 'Architecture', link: '/architecture/overview' },
      { text: 'API', link: '/api/introduction' },
      { text: 'Frontend', link: '/frontend/overview' },
    ],
    
    sidebar: {
      '/guide/': [
        {
          text: 'Guide',
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Getting Started', link: '/guide/getting-started' },
          ]
        }
      ],
      '/architecture/': [
        {
          text: 'Architecture',
          items: [
            { text: 'Overview', link: '/architecture/overview' },
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Introduction', link: '/api/introduction' },
            { text: 'Users & Farmers', link: '/api/users-farmers' },
            { text: 'Tickets & Diagnostics', link: '/api/tickets-diagnostics' },
            { text: 'Staff & Locations', link: '/api/staff-locations' },
            { text: 'Schemas & Repositories', link: '/api/schemas-repositories' },
          ]
        }
      ],
      '/frontend/': [
        {
          text: 'Frontend',
          items: [
            { text: 'Overview', link: '/frontend/overview' },
            { text: 'Mobile PWA', link: '/frontend/mobile' },
          ]
        }
      ]
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-org/auditerra' },
    ],
    
    footer: {
      message: 'Built with ❤️ for Kenya\'s land restoration',
      copyright: 'Copyright © 2026 Auditerra Team'
    }
  }
});
