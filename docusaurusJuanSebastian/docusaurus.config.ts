import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// El nombre de tu archivo de configuración es .ts, así que mantenemos el tipado

const config: Config = {
  // --- INFORMACIÓN BASE: Marca Personal ---
  title: 'Juan Sebastián', // [CAMBIO CLAVE 1] Nombre de la marca
  tagline: 'Arquitecto de Soluciones Digitales & Founder @ DuodecimStudio', // [CAMBIO CLAVE 2] Tagline profesional
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  // AJUSTA ESTOS DOMINIOS CUANDO DESPLIEGUES:
  url: 'https://juansebastian.dev', // [AJUSTAR] Tu dominio personal (o GitHub Pages)
  baseUrl: '/',

  // Configuración de despliegue (ajusta si usas GitHub/Vercel)
  organizationName: 'tu-usuario-de-github', // [AJUSTAR] Tu usuario o la organización de Duodecim
  projectName: 'juan-sebastian-docs', // [AJUSTAR] Nombre del repositorio

  onBrokenLinks: 'throw',

  // Configuración de Idioma
  i18n: {
    defaultLocale: 'es', // [CAMBIO CLAVE 3] Lo ponemos en español
    locales: ['es'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          // El sidebarPath ya estaba bien:
          sidebarPath: './sidebars.ts', 
          // Ajusta el link de edición (si lo usas) a tu propio repo
          editUrl: 
            'https://github.com/tu-usuario-de-github/juan-sebastian-docs/tree/main/',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Ajusta el link de edición (si lo usas) a tu propio repo
          editUrl:
            'https://github.com/tu-usuario-de-github/juan-sebastian-docs/tree/main/',
          // Mantenemos las buenas prácticas
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
    // --- TEMAS Y NAVBAR ---
    image: 'img/juan-social-card.jpg', // [AJUSTAR] Imagen de previsualización para LinkedIn
    colorMode: {
      respectPrefersColorScheme: true, // Respeta el modo oscuro/claro del sistema
      defaultMode: 'dark', // Sugiero 'dark' para un perfil tech senior
    },
    
    navbar: {
      title: 'JS.', // Nombre corto y limpio
      logo: {
        alt: 'Juan Sebastian Logo',
        src: 'img/logo-personal.svg', // [AJUSTAR] Logo personal
      },
      items: [
        // ESTO CORRIGE EL ERROR ANTERIOR: USAMOS 'techSidebar'
        {
          type: 'docSidebar',
          sidebarId: 'techSidebar', // [CORRECCIÓN CLAVE 4] Cambiado de 'tutorialSidebar' a 'techSidebar'
          position: 'left',
          label: 'Tech Stack & Wiki', // [CAMBIO CLAVE 5] Nuevo label profesional
        },
        {to: '/blog', label: 'Bitácora', position: 'left'}, // Blog de opinión/experiencia
        
        // El link CLAVE a tu empresa (sin mezclar contenido)
        {
          href: 'https://www.linkedin.com/in/juan-sebastian-42ab7aa5/',
          label: 'LinkedIn',
          position: 'right',
        },
        {
          href: 'https://duodecimstudio.com.ar',
          label: 'DuodecimStudio ↗', // Indicamos que va a un sitio externo
          position: 'right',
        },
      ],
    },
    
    // --- FOOTER ---
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Conocimiento',
          items: [
            {
              label: 'Mi CV (Trayectoria)',
              to: '/docs/trayectoria/resumen',
            },
            {
              label: 'Arquitectura de Sistemas',
              to: '/docs/arquitectura/ecosistema-duodecim',
            },
          ],
        },
        {
          title: 'Ecosistema',
          items: [
            {
              label: 'DuodecimStudio (Servicios)',
              href: 'https://duodecimstudio.com.ar',
            },
            {
              label: 'GitHub',
              href: `https://github.com/tu-usuario-de-github/juan-sebastian-docs`,
            },
          ],
        },
      ],
      copyright: `© ${new Date().getFullYear()} Juan Sebastián. Built with Docusaurus.`,
    },
    
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;