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
        'trayectoria/Filosofia',    // Cómo lideras equipos, cómo gestionas código
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
        'arquitectura/infraestructura-servidores',   // AWS/GCP/Azure que usas
        'arquitectura/automatizacion-devops',      // Tu proceso de despliegue
        'arquitectura/ecosistema-duodecimstudio' // *Cómo* manejaste la bocha de subdominios
      ],
    },
    {
      type: 'category',
      label: '🧠 Snippets & Patrones Reutilizables',
      link: {
        type: 'generated-index',
        title: 'Notas y Aprendizaje Continuo',
        description: 'Mi base de conocimiento personal y soluciones reutilizables.',
      },
      items: [
        'snippets/angular-20-snippets',
        'snippets/react-19-snippets',
         'snippets/backend-snippets',
          'snippets/docker-devops-snippets'
      ],
    },
  ],
};

export default sidebars;