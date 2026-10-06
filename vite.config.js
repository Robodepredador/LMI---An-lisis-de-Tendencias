import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// Vite no sirve funciones serverless. Este plugin monta api/chat.js como
// middleware en desarrollo, para que el archivo que corre en local sea
// exactamente el mismo que Vercel ejecutará en producción.
function apiEnDesarrollo(env) {
  return {
    name: 'api-en-desarrollo',
    configureServer(server) {
      server.middlewares.use('/api/chat', async (req, res) => {
        // El handler espera la forma de Vercel: req.body ya parseado y
        // res.status().json(). Se adapta aquí, no en el handler.
        let crudo = '';
        for await (const trozo of req) crudo += trozo;
        try { req.body = crudo ? JSON.parse(crudo) : {}; } catch { req.body = {}; }

        res.status = (code) => { res.statusCode = code; return res; };
        res.json = (data) => {
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify(data));
          return res;
        };

        // Ojo: `process.env.X = undefined` guarda la CADENA "undefined", que es
        // truthy y haría creer al handler que hay clave. Solo se asigna si existe.
        if (env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY) process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;

        try {
          const { default: handler } = await server.ssrLoadModule('/api/chat.js');
          await handler(req, res);
          // Si el handler terminó sin escribir nada, el navegador recibe una
          // respuesta vacía y el error es imposible de diagnosticar desde ahí.
          if (!res.writableEnded) res.status(500).json({ error: 'El servidor no devolvió respuesta.' });
        } catch (e) {
          server.config.logger.error(`[api/chat] ${e.stack ?? e}`);
          if (!res.writableEnded) res.status(500).json({ error: 'Error del servidor de desarrollo.' });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // '' carga TODAS las variables de .env.local, no solo las VITE_*.
  // GEMINI_API_KEY se queda en el servidor: nunca se expone al cliente.
  const env = loadEnv(mode, process.cwd(), '');
  return { plugins: [react(), apiEnDesarrollo(env)] };
});
