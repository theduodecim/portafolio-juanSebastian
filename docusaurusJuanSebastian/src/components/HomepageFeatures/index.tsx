import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  emoji: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Arquitectura Escalable',
    emoji: '🏗️',
    description: (
      <>
        Diseño ecosistemas digitales complejos y robustos. 
        Experiencia real orquestando múltiples subdominios y microservicios, 
        como se ve en la infraestructura de <strong>DuodecimStudio</strong>.
      </>
    ),
  },
  {
    title: 'Visión de Negocio',
    emoji: '🚀',
    description: (
      <>
        No solo escribo código; construyo soluciones que <strong>generan valor</strong>.
        Entiendo la diferencia entre "código limpio" y "producto viable",
        alineando la tecnología con los objetivos comerciales.
      </>
    ),
  },
  {
    title: 'Liderazgo Técnico',
    emoji: '🧠',
    description: (
      <>
        Capacidad para liderar equipos, definir stacks tecnológicos modernos
        (Angular, React, Node.js, Cloud) y transformar requisitos abstractos en
        hojas de ruta de ingeniería claras.
      </>
    ),
  },
];

function Feature({title, emoji, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <span style={{fontSize: '5rem', lineHeight: '1.5'}} role="img" aria-label={title}>
          {emoji}
        </span>
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}