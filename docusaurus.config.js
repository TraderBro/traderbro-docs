// @ts-check
const { themes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'TraderBro CLI',
  tagline: 'Analyst predictions, returns, and sector analytics — from your terminal',
  favicon: 'img/favicon.ico',
  url: 'https://docs.traderbro.ai',
  baseUrl: '/',
  organizationName: 'traderbro',
  projectName: 'traderbro-docs',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/',
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/traderbro/traderbro-docs/edit/main/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      colorMode: {
        defaultMode: 'dark',
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'TraderBro Docs',
        items: [
          {
            to: '/getting-started/installation',
            label: 'Get Started',
            position: 'left',
          },
          {
            to: '/cli-reference/overview',
            label: 'CLI Reference',
            position: 'left',
          },
          {
            to: '/guides/finding-top-analysts',
            label: 'Guides',
            position: 'left',
          },
          {
            to: '/concepts/return-calculation',
            label: 'Concepts',
            position: 'left',
          },
          {
            href: 'https://traderbro.ai',
            label: 'Open App',
            position: 'right',
          },
          {
            href: 'https://github.com/traderbro/traderbro-cli-binary',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              { label: 'Get Started', to: '/getting-started/installation' },
              { label: 'CLI Reference', to: '/cli-reference/overview' },
              { label: 'Guides', to: '/guides/finding-top-analysts' },
            ],
          },
          {
            title: 'More',
            items: [
              { label: 'TraderBro App', href: 'https://traderbro.ai' },
              { label: 'GitHub', href: 'https://github.com/traderbro/traderbro-cli-binary' },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} TraderBro`,
      },
      prism: {
        theme: themes.github,
        darkTheme: themes.dracula,
        additionalLanguages: ['bash', 'json'],
      },
    }),
};

module.exports = config;
