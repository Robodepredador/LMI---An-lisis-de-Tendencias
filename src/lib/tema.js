// El tema es del estudiante, no del sistema: el interruptor manda y se
// recuerda. La primera visita arranca por lo que tenga configurado su equipo.
// El script síncrono de index.html aplica esto mismo antes de pintar, así que
// aquí solo se repite la lógica para los cambios en caliente.

export const CLAVE = 'lmi-tema';

export function leerTema() {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado === 'claro' || guardado === 'oscuro') return guardado;
  } catch {
    // Modo privado o almacenamiento bloqueado: se cae a la preferencia del equipo.
  }
  return globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'oscuro' : 'claro';
}

export function aplicarTema(tema) {
  const raiz = document.documentElement;
  if (tema === 'oscuro') raiz.setAttribute('data-theme', 'dark');
  else raiz.removeAttribute('data-theme');
  try { localStorage.setItem(CLAVE, tema); } catch { /* ídem */ }
  return tema;
}

export function alternarTema() {
  return aplicarTema(leerTema() === 'oscuro' ? 'claro' : 'oscuro');
}
