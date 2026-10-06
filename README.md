# LMI-U · Mercado Laboral Inteligente (Análisis de Tendencias)

Prototipo de alta fidelidad de **LMI-U**, una plataforma de inteligencia de mercado laboral para estudiantes y egresados universitarios en el Perú. Permite explorar la demanda real de competencias, salarios referenciales contrastados y brechas de formación mediante consultas en lenguaje natural asistidas por Gemini.

---

## 🚀 Despliegue en Vercel (Paso a Paso)

Este repositorio está 100% listo para desplegar en [Vercel](https://vercel.com) con cero configuración adicional:

1. **Importar Repositorio:**
   - Inicia sesión en [Vercel Dashboard](https://vercel.com/dashboard).
   - Haz clic en **"Add New..."** → **"Project"**.
   - Conecta tu cuenta de GitHub y selecciona el repositorio `Robodepredador/LMI---An-lisis-de-Tendencias`.

2. **Configuración de Proyecto (automática):**
   - **Framework Preset**: `Vite` (detectado automáticamente).
   - **Root Directory**: `./` (la raíz del repositorio ya contiene el proyecto).
   - **Build Command**: `vite build`
   - **Output Directory**: `dist`

3. **Variables de Entorno (Environment Variables):**
   - En la sección **Environment Variables**, añade:
     - **Name**: `GEMINI_API_KEY`
     - **Value**: Tu clave de Google Gemini API (obtenida en [Google AI Studio](https://aistudio.google.com/)).
   - Selecciona los entornos: `Production`, `Preview`, `Development`.

4. **Desplegar:**
   - Haz clic en **"Deploy"**.
   - En menos de 1 minuto tendrás tu URL de producción activa con el SPA routing configurado y la Serverless Function `/api/chat` funcionando.

---

## 🛠️ Tecnologías y Arquitectura

- **Frontend**: React 19, React Router v7, Zustand, Vite 8.
- **Visualización de Datos**: Gráficos SVG interactivos con animaciones fluidas y micro-interacciones en tiempo real.
- **Backend Serverless**: Vercel Serverless Function (`/api/chat.js`) con Google GenAI SDK (`@google/genai`).
- **Enrutamiento SPA**: `vercel.json` configurado para manejar rutas directas (`/chat`, `/planes`, etc.).
- **Diseño**: CSS responsivo con diseño moderno, componentes accesibles y micro-animaciones continuas.

---

## 💻 Desarrollo Local

1. **Clonar e instalar dependencias:**
   ```bash
   git clone https://github.com/Robodepredador/LMI---An-lisis-de-Tendencias.git
   cd LMI---An-lisis-de-Tendencias
   npm install
   ```

2. **Configurar variables de entorno:**
   Crea un archivo `.env` en la raíz del proyecto:
   ```env
   GEMINI_API_KEY=tu_gemini_api_key_aqui
   ```

3. **Iniciar servidor de desarrollo:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:5173](http://localhost:5173) en tu navegador.

4. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## 👥 Cuentas Demo para Pruebas

En la pantalla de acceso (`/login`):
- **Valeria Ríos** (Estudiante de 9no ciclo): Modo exploratorio con consultas libres.
- **Diego Morales** (Egresado reciente): Modo avanzado de transición laboral.
