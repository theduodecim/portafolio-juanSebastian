import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Juan Sebastián Portafolio',
  tagline: 'Arquitecto de Soluciones Digitales & Creador de @DuodecimStudio',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://thedoodecim.github.io',
  baseUrl: '/juan-sebastian-docs/',

  organizationName: 'TheDuodecim',
  projectName: 'docusaurus-JuanSebastian',
  deploymentBranch: 'gh-pages',
  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'es',
    locales: ['es'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/TheDuodecim/juan-sebastian-docs/tree/main/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          editUrl: 'https://github.com/TheDuodecim/juan-sebastian-docs/tree/main/',
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: 'img/juan-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
      defaultMode: 'dark',
    },
    
    navbar: {
      title: 'Juan Sebastian CV',
      logo: {
        alt: 'Juan Sebastian Logo',
        src: 'img/logo_personal.png',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'techSidebar',
          position: 'left',
          label: 'Tech Stack & Wiki',
        },
        {
          href: 'https://www.linkedin.com/in/juan-sebastian-42ab7aa5/',
          label: 'LinkedIn',
          position: 'right',
        },
        {
          href: 'https://duodecimstudio.com.ar',
          label: 'DuodecimStudio ↗',
          position: 'right',
        },
      ],
    },
    
    // FOOTER ARREGLADO - Mejor distribución
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Conocimiento',
          items: [
            {
              label: 'Resumen de Trayectoria (CV)',
              to: '/docs/trayectoria/resumen',
            },
            {
              label: 'Stack Core & Skills',
              to: '/docs/trayectoria/stack-core',
            },
            {
              label: 'Arquitectura de Sistemas',
              to: '/docs/arquitectura/ecosistema-duodecimstudio',
            },
          ],
        },
        {
          title: 'Ecosistema',
          items: [
            {
              label: 'DuodecimStudio',
              href: 'https://duodecimstudio.com.ar',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/TheDuodecim',
            },
            {
              label: 'LinkedIn',
              href: 'https://www.linkedin.com/in/juan-sebastian-42ab7aa5/',
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Juan Sebastián Portafolio · Creador de @DuodecimStudio · Built with Docusaurus`,
    },
    
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;