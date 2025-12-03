const schemaPerson = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Juan Sebastián",
  "jobTitle": "Arquitecto de Soluciones Digitales",
  "url": "https://portafolio-juanSebastian.duodecimstudio.com.ar",
 "sameAs": [
    "https://www.linkedin.com/in/juan-sebastian-42ab7aa5/",
    "https://github.com/theduodecim"
  ]
};

const script = document.createElement('script');
script.type = 'application/ld+json';
script.text = JSON.stringify(schemaPerson);
document.head.appendChild(script);
