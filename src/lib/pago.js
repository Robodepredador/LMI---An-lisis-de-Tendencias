// Validación real de los datos de pago. Un checkout donde cualquier número
// pasa se nota enseguida; este rechaza lo que un procesador rechazaría.
// No se cobra nada: no hay pasarela detrás.

// Número reservado para probar el camino de "tarjeta rechazada". Es el que la
// industria usa como declinada de prueba, así que resulta familiar.
export const TARJETA_RECHAZADA = '4000000000000002';

export const soloDigitos = (s) => s.replace(/\D/g, '');

export const formatearTarjeta = (s) =>
  soloDigitos(s).slice(0, 19).replace(/(.{4})/g, '$1 ').trim();

// Algoritmo de Luhn: la misma comprobación que hace cualquier pasarela antes
// de enviar la tarjeta a la red.
export function luhnValido(numero) {
  const d = soloDigitos(numero);
  if (d.length < 13 || d.length > 19) return false;
  let suma = 0;
  let doble = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = Number(d[i]);
    if (doble) { n *= 2; if (n > 9) n -= 9; }
    suma += n;
    doble = !doble;
  }
  return suma % 10 === 0;
}

export function marcaDe(numero) {
  const d = soloDigitos(numero);
  if (/^4/.test(d)) return 'Visa';
  if (/^5[1-5]/.test(d) || /^2[2-7]/.test(d)) return 'Mastercard';
  if (/^3[47]/.test(d)) return 'Amex';
  if (/^3(0[0-5]|[68])/.test(d)) return 'Diners';
  return null;
}

export function vencimientoValido(valor) {
  const m = /^(\d{2})\s*\/\s*(\d{2})$/.exec(valor.trim());
  if (!m) return false;
  const mes = Number(m[1]);
  const anio = 2000 + Number(m[2]);
  if (mes < 1 || mes > 12) return false;
  const ahora = new Date();
  // Una tarjeta vale hasta el último día de su mes de vencimiento.
  const ultimoDia = new Date(anio, mes, 0, 23, 59, 59);
  return ultimoDia >= ahora;
}

export const formatearVencimiento = (s) => {
  const d = soloDigitos(s).slice(0, 4);
  return d.length <= 2 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
};

export const cvvValido = (cvv, numero) =>
  new RegExp(`^\\d{${marcaDe(numero) === 'Amex' ? 4 : 3}}$`).test(cvv.trim());

// Devuelve el primer problema encontrado, o null si todo está bien.
export function validarTarjeta({ numero, vencimiento, cvv }) {
  if (!soloDigitos(numero)) return 'Escribe el número de tu tarjeta.';
  if (!marcaDe(numero)) return 'No reconocemos esa tarjeta. Aceptamos Visa, Mastercard, Amex y Diners.';
  if (!luhnValido(numero)) return 'Ese número de tarjeta no es válido. Revísalo.';
  if (!vencimientoValido(vencimiento)) return 'La fecha de vencimiento no es válida o ya pasó.';
  if (!cvvValido(cvv, numero)) return `El código de seguridad debe tener ${marcaDe(numero) === 'Amex' ? 4 : 3} dígitos.`;
  return null;
}

// Un pago que nunca falla no se siente real.
export const esRechazada = (numero) => soloDigitos(numero) === TARJETA_RECHAZADA;

export const celularValido = (s) => /^9\d{8}$/.test(soloDigitos(s));
