/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  docs: [
    'intro',
    {
      type: 'category',
      label: 'Get Started',
      collapsed: false,
      items: [
        'getting-started/installation',
        'getting-started/authentication',
        'getting-started/first-command',
      ],
    },
    {
      type: 'category',
      label: 'CLI Reference',
      collapsed: false,
      items: [
        'cli-reference/overview',
        'cli-reference/analyst',
        'cli-reference/prediction',
        'cli-reference/symbol',
        'cli-reference/content',
        'cli-reference/research',
      ],
    },
    {
      type: 'category',
      label: 'Guides',
      items: [
        'guides/finding-top-analysts',
        'guides/sector-edge-research',
        'guides/filtering-by-period',
        'guides/scripting-and-automation',
        'guides/using-with-ai-agents',
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      items: [
        'concepts/return-calculation',
        'concepts/accuracy-rate',
        'concepts/prediction-model',
        'concepts/sector-edge',
      ],
    },
  ],
};

module.exports = sidebars;
