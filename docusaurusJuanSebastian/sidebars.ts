import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  // Crea una sidebar principal llamada 'techSidebar' (referenciada en el config.ts)
  techSidebar: [
    {
      type: 'category',
      label: '🚀 Trayectoria & Skills',
      link: {
        type: 'generated-index',
        title: 'Mi Perfil Profesional',
        description: 'Una vista detallada de mi experiencia, roles y habilidades clave.',
      },
      items: [
        'trayectoria/resumen',      // Tu CV en formato Markdown
        'trayectoria/stack-core',   // Tu lista de tecnologías fuertes (React, Node, etc.)
        'trayectoria/filosofia',    // Cómo lideras equipos, cómo gestionas código
      ],
    },
    {
      type: 'category',
      label: '🏗️ Arquitectura de Sistemas',
      link: {
        type: 'generated-index',
        title: 'El "Cómo" detrás del Código',
        description: 'Documentación sobre las decisiones de diseño y escalabilidad de proyectos complejos.',
      },
      items: [
        'arquitectura/ecosistema-duodecim', // *Cómo* manejaste la bocha de subdominios
        'arquitectura/estrategia-cloud',   // AWS/GCP/Azure que usas
        'arquitectura/gestion-ci-cd',      // Tu proceso de despliegue
      ],
    },
    {
      type: 'category',
      label: '🧠 Digital Garden & Snippets',
      link: {
        type: 'generated-index',
        title: 'Notas y Aprendizaje Continuo',
        description: 'Mi base de conocimiento personal y soluciones reutilizables.',
      },
      items: [
        'snippets/react-hooks-avanzados',
        'snippets/graphql-rest',
        'snippets/troubleshooting-serverless',
      ],
    },
  ],
};

export default sidebars;