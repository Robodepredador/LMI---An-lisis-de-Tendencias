import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CUENTAS_DEMO } from './data/demo.js';

export const CONSULTAS_GRATIS = 3;

// El plan gratis se queda en un diagnóstico al mes, y es deliberado: el muro
// es parte del experimento. En Pro es ilimitado (§7.9 del plan).
export const DIAGNOSTICOS_GRATIS = 1;

export const PRECIO_PRO = 19;

const periodoActual = () => new Date().toISOString().slice(0, 7); // 'YYYY-MM'

// Los cuatro tramos que el registro aprobado ofrece. El indice es lo que se
// guarda; el texto es lo que Lumi repite en su consejo.
export const CICLOS = ['1ro – 2do', '3ro – 4to', '5to – 6to', '7mo o más'];

const iniciales = (nombre) =>
  nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

const estadoInicial = {
  usuario: null,          // { email, nombre, iniciales, rol, ciclo, carrera, universidad, areas, ciudades, tipo }
  cuentas: {},            // email -> { clave, perfil }  — el "servidor de cuentas" del navegador
  tenant: 'LMI-U',
  docenteOpcion: null,    // 'A' | 'B' — cuál vista docente eligió

  // Dos planes y nada más. 'institucional' no se compra: lo asigna el tenant
  // de marca blanca, así que se conserva (§7.5). 'creditos' desapareció: ese
  // modelo de negocio quedó inviable (§6.3).
  plan: 'free',           // 'free' | 'pro' | 'institucional'
  usadasMes: 0,
  periodo: periodoActual(),

  // El diagnóstico: lo que el estudiante contó de sí mismo y lo que salió.
  perfil: null,           // { modoEntrada, cvParseado, skills[], carrera, universidad, ciclo, rolObjetivo, ciudades[], tiempoSemanal, presupuesto }
  diagnostico: null,      // { fecha, pctHoy, nHoy, total, camino[], rol, ciudades }
  diagnosticosMes: 0,

  consultas: [],          // [{ id, pregunta, resultado, ts, costo }]
  hiloActual: null,       // la conversación abierta; null = la próxima pregunta abre una
  pagos: [],              // [{ id, ts, concepto, monto, metodo }]
  pendiente: null,        // pregunta guardada al chocar con el paywall

  metodoPago: 'yape',
  // El paywall nuevo reemplaza a ModalPlanes en toda la app (§7.4). `paywall`
  // es el motivo con el que se abrió, y da el titular; `paywallDestino` es a
  // dónde llevar al confirmar el pago.
  paywall: null,
  paywallDestino: null,
  rutaRetornoChat: '/chat',
  pagoReciente: false,
};

// Lo que se guarda de la sesión en su cuenta. Vive en un sitio porque cuatro
// acciones lo necesitan igual, y antes se repetía campo por campo: cada vez
// que se agregaba uno había que acordarse de las cuatro.
//
// OJO con el nombre: en el registro de la cuenta, `perfil` es la identidad
// (correo, nombre, iniciales) y existe desde antes. El perfil del diagnóstico
// se guarda aparte como `perfilMotor`, o escribirlo borraría la sesión.
const instantanea = (s) => ({
  consultas: s.consultas,
  plan: s.plan,
  usadasMes: s.usadasMes,
  periodo: s.periodo,
  pagos: s.pagos,
  tenant: s.tenant,
  docenteOpcion: s.docenteOpcion,
  perfilMotor: s.perfil,
  diagnostico: s.diagnostico,
  diagnosticosMes: s.diagnosticosMes,
});

export const useApp = create(
  persist(
    (set, get) => ({
      ...estadoInicial,

      // ── Paywall ───────────────────────────────────────────────────
      abrirPaywall: (motivo = null, destino = null) => set({ paywall: motivo ?? 'general', paywallDestino: destino }),
      cerrarPaywall: () => set({ paywall: null }),
      limpiarPaywallDestino: () => set({ paywallDestino: null }),
      setRutaRetornoChat: (rutaRetornoChat) => set({ rutaRetornoChat }),
      limpiarAvisoPago: () => set({ pagoReciente: false }),

      esPro: () => ['pro', 'institucional'].includes(get().plan),

      // ── Periodo: el plan gratis se renueva solo al cambiar de mes ──
      sincronizarPeriodo: () => {
        const p = periodoActual();
        if (get().periodo !== p) {
          set((s) => {
            const cuentas = { ...s.cuentas };
            if (s.usuario?.email) {
              const e = s.usuario.email.trim().toLowerCase();
              if (cuentas[e]) cuentas[e] = { ...cuentas[e], periodo: p, usadasMes: 0, diagnosticosMes: 0 };
            }
            return { periodo: p, usadasMes: 0, diagnosticosMes: 0, cuentas };
          });
        }
      },

      // ── Cuentas ───────────────────────────────────────────────────
      registrar: ({ email, clave, nombre, ciclo = 2, carrera = null, ...extra }) => {
        const e = email.trim().toLowerCase();
        if (get().cuentas[e]) return { ok: false, error: 'Ya existe una cuenta con este correo.' };
        const identidad = { email: e, nombre, iniciales: iniciales(nombre), rol: 'Estudiante',
          ciclo, carrera, universidad: null, areas: [], ciudades: [], tipo: 'personal', ...extra };
        const limpio = {
          consultas: [],
          plan: 'free',
          usadasMes: 0,
          periodo: periodoActual(),
          pagos: [],
          tenant: 'LMI-U',
          docenteOpcion: null,
          diagnostico: null,
          diagnosticosMes: 0,
        };
        set((s) => ({
          cuentas: { ...s.cuentas, [e]: { clave, perfil: identidad, perfilMotor: null, ...limpio } },
          usuario: identidad,
          perfil: null,
          ...limpio,
          hiloActual: null,
          pendiente: null,
        }));
        return { ok: true };
      },

      entrar: ({ email, clave }) => {
        const e = email.trim().toLowerCase();
        const cuenta = get().cuentas[e];
        if (!cuenta) return { ok: false, error: 'No existe una cuenta con este correo.' };
        if (cuenta.clave !== clave) return { ok: false, error: 'Contraseña incorrecta.' };
        set({
          usuario: cuenta.perfil,
          consultas: cuenta.consultas || [],
          plan: cuenta.plan || 'free',
          usadasMes: cuenta.usadasMes ?? 0,
          periodo: cuenta.periodo || periodoActual(),
          pagos: cuenta.pagos || [],
          tenant: cuenta.tenant || 'LMI-U',
          docenteOpcion: cuenta.docenteOpcion ?? null,
          perfil: cuenta.perfilMotor ?? null,
          diagnostico: cuenta.diagnostico ?? null,
          diagnosticosMes: cuenta.diagnosticosMes ?? 0,
          hiloActual: null,
          pendiente: null,
          rutaRetornoChat: '/chat',
          paywall: null,
          paywallDestino: null,
        });
        return { ok: true };
      },

      entrarDemo: (id) => {
        const demo = CUENTAS_DEMO.find((c) => c.id === id);
        if (!demo) return { ok: false, error: 'Cuenta de demostración no encontrada.' };
        const e = demo.perfil.email.trim().toLowerCase();

        // Guardar el estado del usuario anterior si había uno
        const u = get().usuario;
        const cuentas = { ...get().cuentas };
        if (u?.email) {
          const prevE = u.email.trim().toLowerCase();
          const prevC = cuentas[prevE] || { perfil: u, clave: 'demo' };
          cuentas[prevE] = { ...prevC, ...instantanea(get()) };
        }

        // `estadoCargar` tiene la forma del ESTADO (su `perfil` es el del
        // diagnóstico). Al registro de la cuenta se escribe con
        // `instantanea`, que lo renombra a `perfilMotor` y deja intacta la
        // identidad.
        const g = cuentas[e];
        const estadoCargar = {
          plan: g?.plan ?? demo.estado.plan,
          usadasMes: g?.usadasMes ?? demo.estado.usadasMes ?? 0,
          periodo: g?.periodo ?? demo.estado.periodo ?? periodoActual(),
          pagos: g?.pagos ?? demo.estado.pagos ?? [],
          consultas: g?.consultas ?? demo.estado.consultas ?? [],
          tenant: g?.tenant ?? demo.estado.tenant ?? 'LMI-U',
          docenteOpcion: g?.docenteOpcion ?? demo.estado.docenteOpcion ?? null,
          perfil: demo.estado.diagnostico === null ? null : (g?.perfilMotor ?? demo.estado.perfil ?? null),
          diagnostico: demo.estado.diagnostico === null ? null : (g?.diagnostico ?? demo.estado.diagnostico ?? null),
          diagnosticosMes: demo.estado.diagnostico === null ? 0 : (g?.diagnosticosMes ?? demo.estado.diagnosticosMes ?? 0),
        };

        set({
          ...estadoCargar,
          usuario: demo.perfil,
          hiloActual: null,
          pendiente: null,
          rutaRetornoChat: '/chat',
          paywall: null,
          paywallDestino: null,
          cuentas: {
            ...cuentas,
            [e]: { clave: 'demo', perfil: demo.perfil, ...instantanea(estadoCargar) },
          },
        });
        return { ok: true };
      },

      salir: () => {
        const u = get().usuario;
        const cuentas = { ...get().cuentas };
        if (u?.email) {
          const e = u.email.trim().toLowerCase();
          cuentas[e] = { ...(cuentas[e] || { perfil: u }), ...instantanea(get()) };
        }
        set({ ...estadoInicial, cuentas, periodo: periodoActual() });
      },

      actualizarPerfil: (cambios) =>
        set((s) => {
          const perfil = { ...s.usuario, ...cambios };
          const e = perfil.email.trim().toLowerCase();
          const cuenta = s.cuentas[e];
          return {
            usuario: perfil,
            cuentas: cuenta ? { ...s.cuentas, [e]: { ...cuenta, perfil } } : s.cuentas,
          };
        }),

      // ── Diagnóstico ───────────────────────────────────────────────
      // Entrar a "Mi diagnóstico" con uno hecho lleva al reporte; rehacerlo es
      // lo que consume el cupo del mes (§7.8). Así el límite de 1/mes no
      // castiga a quien solo quiere volver a mirar su reporte.
      guardarPerfilMotor: (cambios) =>
        set((s) => {
          const perfil = { ...(s.perfil ?? {}), ...cambios };
          const cuentas = { ...s.cuentas };
          if (s.usuario?.email) {
            const e = s.usuario.email.trim().toLowerCase();
            cuentas[e] = { ...(cuentas[e] || { perfil: s.usuario }), perfilMotor: perfil };
          }
          return { perfil, cuentas };
        }),

      puedeDiagnosticar: () => {
        if (get().esPro()) return true;
        return get().diagnosticosMes < DIAGNOSTICOS_GRATIS;
      },

      guardarDiagnostico: (diagnostico) =>
        set((s) => {
          const diagnosticosMes = s.esPro() ? s.diagnosticosMes : s.diagnosticosMes + 1;
          const cuentas = { ...s.cuentas };
          if (s.usuario?.email) {
            const e = s.usuario.email.trim().toLowerCase();
            cuentas[e] = { ...(cuentas[e] || { perfil: s.usuario }), diagnostico, diagnosticosMes };
          }
          return { diagnostico, diagnosticosMes, cuentas };
        }),

      // ── Consumo ───────────────────────────────────────────────────
      // Cuántas consultas le quedan. null = ilimitadas.
      restantes: () => {
        const { plan, usadasMes } = get();
        if (plan === 'pro' || plan === 'institucional') return null;
        return Math.max(0, CONSULTAS_GRATIS - usadasMes);
      },

      puedeConsultar: () => get().restantes() !== 0,

      // Se cobra DESPUÉS de saber que hubo respuesta: las que salen sin datos
      // suficientes no consumen nada (es la promesa de la metodología).
      registrarConsulta: ({ pregunta, resultado, hiloId: hiloIdParam, retomada = false }) => {
        // Solo se cobra lo que de verdad se respondió: si no hay muestra
        // suficiente, la pregunta queda fuera de alcance, o no se encontró
        // ningún rol del catálogo, no hubo respuesta que cobrar.
        const cobra = !resultado.sinDatos
          && !resultado.fueraDeAlcance
          && (resultado.roleIds?.length ?? 0) > 0;
        const { plan } = get();
        // Una pregunta se une a la conversación abierta o al hilo indicado; si no hay ninguna,
        // abre una nueva. Es lo que hace que el historial tenga una fila por charla
        // y no una por pregunta (como en ChatGPT o Claude).
        const hiloId = hiloIdParam || get().hiloActual || crypto.randomUUID();
        const consulta = { id: crypto.randomUUID(), hiloId, pregunta, resultado, ts: Date.now(), costo: cobra ? 1 : 0, retomada };
        const nuevasConsultas = [consulta, ...get().consultas];
        const nuevasUsadas = cobra && plan === 'free' ? get().usadasMes + 1 : get().usadasMes;

        set((s) => {
          const cuentas = { ...s.cuentas };
          if (s.usuario?.email) {
            const e = s.usuario.email.trim().toLowerCase();
            const cuenta = cuentas[e] || { perfil: s.usuario };
            cuentas[e] = { ...cuenta, consultas: nuevasConsultas, usadasMes: nuevasUsadas };
          }
          return {
            consultas: nuevasConsultas,
            hiloActual: hiloId,
            usadasMes: nuevasUsadas,
            cuentas,
          };
        });
        return consulta;
      },

      setHiloActual: (hiloId) => set({ hiloActual: hiloId }),

      // Cierra la conversación abierta. No crea nada: la siguiente pregunta es
      // la que abre la nueva, así que pulsarlo no deja filas vacías.
      nuevaConsulta: () => set({ hiloActual: null, pendiente: null }),

      // Elimina una conversación entera del historial
      eliminarHilo: (hiloId) =>
        set((s) => {
          const nuevasConsultas = s.consultas.filter((c) => (c.hiloId ?? c.id) !== hiloId);
          const cuentas = { ...s.cuentas };
          if (s.usuario?.email) {
            const e = s.usuario.email.trim().toLowerCase();
            const cuenta = cuentas[e] || { perfil: s.usuario };
            cuentas[e] = { ...cuenta, consultas: nuevasConsultas };
          }
          return {
            consultas: nuevasConsultas,
            hiloActual: s.hiloActual === hiloId ? null : s.hiloActual,
            cuentas,
          };
        }),

      // Las consultas de un hilo, de la más antigua a la más reciente.
      // El `?? c.id` cubre el historial guardado antes de que existieran los
      // hilos: cada consulta suelta cuenta como su propia conversación.
      hiloDe: (id) => get().consultas.filter((c) => (c.hiloId ?? c.id) === id).slice().reverse(),

      // El hilo abierto ahora mismo. Vacío justo después de "+ Nueva consulta".
      hiloVisible: () => (get().hiloActual ? get().hiloDe(get().hiloActual) : []),

      // Una fila por conversación, de la más reciente a la más antigua.
      conversaciones: () => {
        const porHilo = new Map();
        // `consultas` va de la más nueva a la más vieja, así que la última que
        // se ve de cada hilo es su primera pregunta: esa da el título.
        for (const c of get().consultas) {
          const id = c.hiloId ?? c.id;
          const previa = porHilo.get(id);
          porHilo.set(id, {
            id,
            titulo: c.pregunta,
            ts: previa?.ts ?? c.ts,
            consultas: previa ? [c, ...previa.consultas] : [c],
          });
        }
        return [...porHilo.values()].sort((a, b) => b.ts - a.ts);
      },

      guardarPendiente: (pregunta) => set({ pendiente: pregunta }),
      limpiarPendiente: () => set({ pendiente: null }),
      resetearIntentos: () =>
        set((s) => {
          const limpio = {
            usadasMes: 0,
            plan: 'free',
            consultas: [],
            pagos: [],
            diagnostico: null,
            diagnosticosMes: 0,
          };
          const cuentas = { ...s.cuentas };
          if (s.usuario?.email) {
            const e = s.usuario.email.trim().toLowerCase();
            if (cuentas[e]) cuentas[e] = { ...cuentas[e], ...limpio };
          }
          return {
            ...limpio,
            pendiente: null,
            hiloActual: null,
            rutaRetornoChat: '/chat',
            pagoReciente: false,
            paywall: null,
            paywallDestino: null,
            cuentas,
          };
        }),

      // ── Compra ────────────────────────────────────────────────────
      setMetodoPago: (metodoPago) => set({ metodoPago }),

      // Un solo producto: la suscripción Pro estudiante. "Activar Pro" pasa
      // por la pasarela y es al confirmar cuando se desbloquea (§6.4).
      // `detalleMetodo` guarda lo justo para la boleta: marca y últimos 4
      // dígitos de la tarjeta, o el celular de Yape. Nunca el número completo.
      confirmarPago: (detalleMetodo = null) => {
        const { metodoPago } = get();
        const pago = {
          id: crypto.randomUUID(),
          ts: Date.now(),
          concepto: 'Pro estudiante · mensual',
          monto: PRECIO_PRO,
          metodo: metodoPago,
          detalleMetodo,
        };
        set((s) => {
          const nuevosPagos = [pago, ...s.pagos];
          const cuentas = { ...s.cuentas };
          if (s.usuario?.email) {
            const e = s.usuario.email.trim().toLowerCase();
            const cuenta = cuentas[e] || { perfil: s.usuario };
            cuentas[e] = { ...cuenta, plan: 'pro', pagos: nuevosPagos };
          }
          return { plan: 'pro', pagos: nuevosPagos, pagoReciente: true, paywall: null, cuentas };
        });
        return pago;
      },

      setTenant: (tenant) => set({ tenant }),
      setDocenteOpcion: (docenteOpcion) => set({ docenteOpcion }),
    }),
    {
      name: 'lmiu',
      // v3: se fue el plan de créditos. Sin esta migración, un tester que ya
      // entró abre la app con `plan: 'creditos'` guardado en su navegador y ve
      // un plan que no existe.
      version: 3,
      migrate: (persistedState, version) => {
        if (!persistedState) return persistedState;
        const s = { ...persistedState };

        if (version < 3) {
          const aPlanVigente = (c) => {
            const limpio = { ...c };
            delete limpio.creditos;
            if (limpio.plan === 'creditos') limpio.plan = 'free';
            return limpio;
          };
          // Quien tenía créditos pasa a gratis SIN perder su historial.
          delete s.creditos;
          delete s.pack;
          if (s.plan === 'creditos') s.plan = 'free';
          const cuentas = {};
          for (const [k, v] of Object.entries(s.cuentas || {})) cuentas[k] = aPlanVigente(v);
          s.cuentas = cuentas;
          s.perfil = s.perfil ?? null;
          s.diagnostico = s.diagnostico ?? null;
          s.diagnosticosMes = s.diagnosticosMes ?? 0;
        }

        // Diego arranca sin historial propio del plan de créditos.
        const cuentas = { ...(s.cuentas || {}) };
        if (cuentas['diego.ramos@demo.pe']) {
          cuentas['diego.ramos@demo.pe'] = {
            ...cuentas['diego.ramos@demo.pe'],
            plan: 'free',
            usadasMes: 0,
          };
        }
        // Asegurar que las cuentas registradas mantengan sus consultas
        for (const k of Object.keys(cuentas)) {
          if (!cuentas[k].consultas) {
            if (s.usuario?.email?.toLowerCase() === k.toLowerCase()) {
              cuentas[k].consultas = s.consultas || [];
              cuentas[k].plan = s.plan;
              cuentas[k].usadasMes = s.usadasMes;
              cuentas[k].pagos = s.pagos || [];
            } else {
              cuentas[k].consultas = [];
            }
          }
        }
        let consultas = s.consultas || [];
        if (s.usuario?.email === 'diego.ramos@demo.pe') consultas = [];
        else consultas = consultas.filter((c) => !String(c.id).startsWith('demo-c'));

        return { ...s, cuentas, consultas };
      },
      // Las acciones no se serializan; solo el estado persistente. `paywall`
      // es de la sesión: un refresh no debe reabrir el muro.
      partialize: (s) => Object.fromEntries(
        Object.entries(s).filter(([k, v]) => typeof v !== 'function' && k !== 'paywall'),
      ),
    },
  ),
);
