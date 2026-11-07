// Lo que toda pantalla del motor de decisión necesita saber, derivado en un
// solo sitio. Vive en `lib` y no junto a los componentes para que el archivo
// de componentes exporte solo componentes: si no, el refresco en caliente de
// Vite deja de funcionar en todas las pantallas que lo importan.

import { useApp } from '../store.js';
import { CIUDADES_DEFECTO, nombreRol } from '../data/mercado.js';
import { calc } from './mercado.js';

export function useMotor() {
  const perfil = useApp((s) => s.perfil);
  const diagnostico = useApp((s) => s.diagnostico);
  const plan = useApp((s) => s.plan);

  const esPro = plan === 'pro' || plan === 'institucional';
  const rol = perfil?.rolObjetivo ?? diagnostico?.rol ?? null;
  const ciudades = perfil?.ciudades?.length ? perfil.ciudades : CIUDADES_DEFECTO;
  const skills = perfil?.skills ?? [];
  const listo = Boolean(diagnostico && rol);

  return {
    perfil, diagnostico, plan, esPro, rol, ciudades, skills, listo,
    nombre: rol ? nombreRol(rol) : '',
    mercado: rol ? calc(rol, skills, ciudades) : null,
  };
}

// A dónde aterriza un estudiante con sesión abierta. Sin diagnóstico, al
// diagnóstico: el chat vacío no le dice con cuántas ofertas calza (§9.1).
// Vive aquí y lo usan el login, el registro y el guard de rutas, para que los
// cuatro destinos no vuelvan a separarse.
export function destinoTrasLogin(estado = useApp.getState()) {
  const { usuario, diagnostico, docenteOpcion } = estado;
  if (usuario?.tipo === 'docente') return docenteOpcion === 'B' ? '/docente/panel' : '/docente';
  return diagnostico ? '/chat' : '/diagnostico';
}
