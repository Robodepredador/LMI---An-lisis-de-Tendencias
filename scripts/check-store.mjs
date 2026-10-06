// Comprueba la lógica del store: autenticación, cobro de consultas y renovación
// del plan gratis. Es la lógica con ramas del proyecto; si se rompe, la app
// "parece" funcionar y el fallo solo aparece en la demo.
//   node scripts/check-store.mjs
import assert from 'node:assert/strict';

// zustand/persist escribe en localStorage; en node no existe. Lo busca en
// `window`, así que hay que montar los dos para que la persistencia se ejerza
// de verdad y no quede sin probar.
const mem = new Map();
const almacen = {
  getItem: (k) => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => mem.set(k, String(v)),
  removeItem: (k) => mem.delete(k),
};
globalThis.localStorage = almacen;
globalThis.window = { localStorage: almacen };

const { useApp, CONSULTAS_GRATIS } = await import('../src/store.js');
const s = () => useApp.getState();

const ok = { sinDatos: false, fueraDeAlcance: false, roleIds: ['analista-datos-jr'] };
const sinDatos = { sinDatos: true, fueraDeAlcance: false, roleIds: ['analista-calidad'] };
const fuera = { sinDatos: false, fueraDeAlcance: true, roleIds: [] };
const noEncontrado = { sinDatos: false, fueraDeAlcance: false, roleIds: [], sugerencias: ['analista-procesos'] };

// ── Registro y autenticación ─────────────────────────────────────────
assert.equal(s().entrar({ email: 'nadie@demo.pe', clave: 'x' }).ok, false,
  'un correo no registrado no debe poder entrar');

assert.equal(s().registrar({ email: 'Ana@Demo.pe', clave: 'secreta', nombre: 'Ana Quispe' }).ok, true);
assert.equal(s().usuario.iniciales, 'AQ', 'las iniciales salen del nombre');
assert.equal(s().usuario.email, 'ana@demo.pe', 'el correo se normaliza a minúsculas');

assert.equal(s().registrar({ email: 'ana@demo.pe', clave: 'otra', nombre: 'Ana Dos' }).ok, false,
  'no se puede registrar dos veces el mismo correo');

s().salir();
assert.equal(s().usuario, null, 'salir cierra la sesión');
assert.ok(s().cuentas['ana@demo.pe'], 'pero la cuenta registrada sobrevive al cierre de sesión');

assert.equal(s().entrar({ email: 'ana@demo.pe', clave: 'equivocada' }).ok, false,
  'LA DEFENSA 1: una contraseña incorrecta NO debe dejar entrar');
assert.equal(s().usuario, null, 'y no debe quedar sesión abierta tras el intento fallido');
assert.equal(s().entrar({ email: ' ANA@demo.pe ', clave: 'secreta' }).ok, true,
  'la clave correcta entra, ignorando espacios y mayúsculas del correo');

// ── Cobro de consultas ───────────────────────────────────────────────
assert.equal(s().restantes(), CONSULTAS_GRATIS, 'cuenta nueva: 3 consultas gratis');

s().registrarConsulta({ pregunta: 'habilidades de analista', resultado: ok });
assert.equal(s().restantes(), CONSULTAS_GRATIS - 1, 'una consulta con respuesta sí descuenta');

s().registrarConsulta({ pregunta: 'salarios en Cusco', resultado: sinDatos });
assert.equal(s().restantes(), CONSULTAS_GRATIS - 1,
  'LA PROMESA DE LA METODOLOGÍA: sin datos suficientes NO descuenta');

s().registrarConsulta({ pregunta: 'qué tiempo hace', resultado: fuera });
assert.equal(s().restantes(), CONSULTAS_GRATIS - 1, 'fuera de alcance tampoco descuenta');

s().registrarConsulta({ pregunta: 'cuánto gana un chef', resultado: noEncontrado });
assert.equal(s().restantes(), CONSULTAS_GRATIS - 1,
  'rol fuera del catálogo: la pantalla dice que no se cobra, así que no debe cobrarse');

assert.equal(s().consultas.length, 4, 'las cuatro quedan en el historial, cobren o no');
assert.equal(s().consultas[0].pregunta, 'cuánto gana un chef', 'la más reciente va primero');

s().registrarConsulta({ pregunta: 'a', resultado: ok });
s().registrarConsulta({ pregunta: 'b', resultado: ok });
assert.equal(s().restantes(), 0, 'agotadas las 3');
assert.equal(s().puedeConsultar(), false, 'y ya no puede consultar');

// ── Compra ───────────────────────────────────────────────────────────
s().setPack('25');
s().setMetodoPago('yape');
const pago = s().confirmarPago();
assert.equal(s().plan, 'creditos');
assert.equal(s().creditos, 25, 'la compra acredita 25');
assert.equal(s().restantes(), 25, 'y pasan a ser las consultas disponibles');
assert.equal(s().pagos[0].id, pago.id, 'el pago queda registrado para la pantalla de cuenta');
assert.equal(s().pagos[0].monto, 25);

s().registrarConsulta({ pregunta: 'c', resultado: ok });
assert.equal(s().creditos, 24, 'con plan de créditos se descuenta del saldo');
s().registrarConsulta({ pregunta: 'd', resultado: sinDatos });
assert.equal(s().creditos, 24, 'y sin datos sigue sin cobrar');

s().setPack('pro');
s().confirmarPago();
assert.equal(s().restantes(), null, 'Pro es ilimitado');
assert.equal(s().puedeConsultar(), true);

// ── Renovación mensual (defensa 3: ninguna fecha escrita a mano) ─────
useApp.setState({ plan: 'free', usadasMes: 3, periodo: '2000-01' });
assert.equal(s().restantes(), 0);
s().sincronizarPeriodo();
assert.equal(s().usadasMes, 0, 'al cambiar de mes el plan gratis se renueva solo');
assert.equal(s().restantes(), CONSULTAS_GRATIS);

// ── Cuentas de demostración ──────────────────────────────────────────
assert.equal(s().entrarDemo('diego').ok, true);
assert.equal(s().plan, 'creditos');
assert.equal(s().creditos, 21, 'Diego entra con saldo');
assert.ok(s().consultas.length > 0, 'y con historial');
assert.ok(s().pagos.length > 0, 'y con pagos previos');

assert.equal(s().entrarDemo('martin').ok, true);
assert.equal(s().restantes(), null, 'Martín entra con licencia institucional ilimitada');
assert.equal(s().tenant, 'Universidad Andina del Sur', 'y arrastra su marca blanca');
assert.equal(s().consultas.length, 0, 'cambiar de cuenta demo no mezcla el historial de la anterior');

assert.equal(s().entrarDemo('inexistente').ok, false);

// ── Persistencia: lo que sobrevive al refresh ────────────────────────
const guardado = JSON.parse(mem.get('lmiu') ?? 'null');
assert.ok(guardado, 'el store tiene que haber escrito en localStorage');
assert.ok(guardado.state.cuentas['ana@demo.pe'], 'la cuenta registrada se guarda');
assert.equal(guardado.state.usuario.email, 'msalas@uandina.edu.pe', 'y la sesión actual también');
assert.equal(guardado.state.tenant, 'Universidad Andina del Sur');
assert.ok(!('registrar' in guardado.state), 'las acciones no se serializan, solo el estado');

console.log('✓ store: autenticación, cobro, compra, renovación, cuentas demo y persistencia');
