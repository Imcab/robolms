/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // <- CRÍTICO: Le dice a Next.js que genere HTML/CSS/JS puros
  images: {
    unoptimized: true, // <- Evita que Next.js intente optimizar imágenes en el servidor
  },
  // Si tu repositorio se llama "RoboLMS", descomenta las líneas de abajo
  // y pon el nombre exacto de tu repositorio para que los estilos no se rompan:
  // basePath: '/RoboLMS',
};

module.exports = nextConfig;