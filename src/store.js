import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CUENTAS_DEMO } from './data/demo.js';

export const CONSULTAS_GRATIS = 3;

const periodoActual = () => new Date().toISOString().slice(0, 7); // 'YYYY-MM'

// Los cuatro tramos que el registro aprobado ofrece. El indice es lo que se
// guarda; el texto es lo que Lumi repite en su consejo.
export const CICLOS = ['1ro – 2do', '3ro – 4to', '5to – 6to', '7mo o más'];

const iniciales = (nombre) =>
  nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

const estadoInicial = {
  usuario: null,          // { email, nombre, iniciales, rol, ciclo, carrera, areas, ciudades, tipo }
  cuentas: {},            // email -> { clave, perfil }  — el "servidor de cuentas" del navegador
  tenant: 'LMI-U',
  docenteOpcion: null,    // 'A' | 'B' — cuál vista docente eligió

  plan: 'free',           // 'free' | 'creditos' | 'pro' | 'institucional'
  creditos: 0,
  usadasMes: 0,
  periodo: periodoActual(),

  consultas: [],          // [{ id, pregunta, resultado, ts, costo }]
  hiloActual: null,       // la conversación abierta; null = la próxima pregunta abre una
  pagos: [],              // [{ id, ts, concepto, monto, metodo }]
  pendiente: null,        // pregunta guardada al chocar con el paywall

  pack: '25',
  metodoPago: 'yape',
  modalPlanes: false,
  rutaRetornoChat: '/chat',
  pagoReciente: false,
};

export const useApp = create(
  persist(
    (set, get) => ({
      ...estadoInicial,

      abrirModalPlanes: () => set({ modalPlanes: true }),
      cerrarModalPlanes: () => set({ modalPlanes: false }),
      setRutaRetornoChat: (rutaRetornoChat) => set({ rutaRetornoChat }),
      limpiarAvisoPago: () => set({ pagoReciente: false }),

      // ── Periodo: el plan gratis se renueva solo al cambiar de mes ──
      sincronizarPeriodo: () => {
        const p = periodoActual();
        if (get().periodo !== p) {
          set((s) => {
            const cuentas = { ...s.cuentas };
            if (s.usuario?.email) {
              const e = s.usuario.email.trim().toLowerCase();
              if (cuentas[e]) cuentas[e] = { ...cuentas[e], periodo: p, usadasMes: 0 };
            }
            return { periodo: p, usadasMes: 0, cuentas };
          });
        }
      },

      // ── Cuentas ───────────────────────────────────────────────────
      registrar: ({ email, clave, nombre, ciclo = 2, carrera = null, ...extra }) => {
        const e = email.trim().toLowerCase();
        if (get().cuentas[e]) return { ok: false, error: 'Ya existe una cuenta con este correo.' };
        const perfil = { email: e, nombre, iniciales: iniciales(nombre), rol: 'Estudiante',
          ciclo, carrera, areas: [], ciudades: [], tipo: 'personal', ...extra };
        const nuevaCuenta = {
          clave,
          perfil,
          consultas: [],
          plan: 'free',
          creditos: 0,
          usadasMes: 0,
          periodo: periodoActual(),
          pagos: [],
          tenant: 'LMI-U',
          docenteOpcion: null,
        };
        set((s) => ({
          cuentas: { ...s.cuentas, [e]: nuevaCuenta },
          usuario: perfil,
          consultas: [],
          plan: 'free',
          creditos: 0,
          usadasMes: 0,
          periodo: periodoActual(),
          pagos: [],
          tenant: 'LMI-U',
          docenteOpcion: null,
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
          creditos: cuenta.creditos ?? 0,
          usadasMes: cuenta.usadasMes ?? 0,
          periodo: cuenta.periodo || periodoActual(),
          pagos: cuenta.pagos || [],
          tenant: cuenta.tenant || 'LMI-U',
          docenteOpcion: cuenta.docenteOpcion ?? null,
          hiloActual: null,
          pendiente: null,
          rutaRetornoChat: '/chat',
        });
        return { ok: true };
      },

      entrarDemo: (id) => {
        const demo = CUENTAS_DEMO.find((c) => c.id === id);
        if (!demo) return { ok: false, error: 'Cuenta de demostración no encontrada.' };
        const e = demo.perfil.email.trim().toLowerCase();

        // Guardar el estado del usuario anterior si había uno
        const u = get().usuario;
        let cuentas = { ...get().cuentas };
        if (u?.email) {
          const prevE = u.email.trim().toLowerCase();
          const prevC = cuentas[prevE] || { perfil: u, clave: 'demo' };
          cuentas[prevE] = {
            ...prevC,
            consultas: get().consultas,
            plan: get().plan,
            creditos: get().creditos,
            usadasMes: get().usadasMes,
            periodo: get().periodo,
            pagos: get().pagos,
            tenant: get().tenant,
            docenteOpcion: get().docenteOpcion,
          };
        }

        // Si es Diego, asegurar que siempre comience con historial vacío
        if (id === 'diego' && cuentas[e]) {
          cuentas[e] = {
            ...cuentas[e],
            consultas: [],
            creditos: 25,
            usadasMes: 0,
          };
        }

        const guardada = cuentas[e];
        const estadoCargar = guardada ? {
          plan: guardada.plan ?? demo.estado.plan,
          creditos: guardada.creditos ?? demo.estado.creditos,
          usadasMes: guardada.usadasMes ?? demo.estado.usadasMes,
          periodo: guardada.periodo ?? demo.estado.periodo ?? periodoActual(),
          pagos: guardada.pagos ?? demo.estado.pagos ?? [],
          consultas: guardada.consultas ?? demo.estado.consultas ?? [],
          tenant: guardada.tenant ?? demo.estado.tenant ?? 'LMI-U',
          docenteOpcion: guardada.docenteOpcion ?? demo.estado.docenteOpcion ?? null,
        } : demo.estado;

        set({
          ...estadoCargar,
          usuario: demo.perfil,
          hiloActual: null,
          pendiente: null,
          rutaRetornoChat: '/chat',
          cuentas: {
            ...cuentas,
            [e]: {
              clave: 'demo',
              perfil: demo.perfil,
              ...estadoCargar,
            },
          },
        });
        return { ok: true };
      },

      salir: () => {
        const u = get().usuario;
        let cuentas = { ...get().cuentas };
        if (u?.email) {
          const e = u.email.trim().toLowerCase();
          const cuenta = cuentas[e] || { perfil: u };
          cuentas[e] = {
            ...cuenta,
            consultas: get().consultas,
            plan: get().plan,
            creditos: get().creditos,
            usadasMes: get().usadasMes,
            periodo: get().periodo,
            pagos: get().pagos,
            tenant: get().tenant,
            docenteOpcion: get().docenteOpcion,
          };
        }
        set({
          ...estadoInicial,
          cuentas,
          periodo: periodoActual(),
        });
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

      // ── Consumo ───────────────────────────────────────────────────
      // Cuántas consultas le quedan. null = ilimitadas.
      restantes: () => {
        const { plan, creditos, usadasMes } = get();
        if (plan === 'pro' || plan === 'institucional') return null;
        if (plan === 'creditos') return creditos;
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
        const nuevosCreditos = cobra && plan === 'creditos' ? Math.max(0, get().creditos - 1) : get().creditos;

        set((s) => {
          const cuentas = { ...s.cuentas };
          if (s.usuario?.email) {
            const e = s.usuario.email.trim().toLowerCase();
            const cuenta = cuentas[e] || { perfil: s.usuario };
            cuentas[e] = {
              ...cuenta,
              consultas: nuevasConsultas,
              usadasMes: nuevasUsadas,
              creditos: nuevosCreditos,
            };
          }
          return {
            consultas: nuevasConsultas,
            hiloActual: hiloId,
            usadasMes: nuevasUsadas,
            creditos: nuevosCreditos,
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
            cuentas[e] = {
              ...cuenta,
              consultas: nuevasConsultas,
            };
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
          const cuentas = { ...s.cuentas };
          if (s.usuario?.email) {
            const e = s.usuario.email.trim().toLowerCase();
            if (cuentas[e]) {
              cuentas[e] = {
                ...cuentas[e],
                usadasMes: 0,
                creditos: 0,
                plan: 'free',
                consultas: [],
                pagos: [],
              };
            }
          }
          return {
            usadasMes: 0,
            creditos: 0,
            plan: 'free',
            consultas: [],
            pagos: [],
            pendiente: null,
            hiloActual: null,
            rutaRetornoChat: '/chat',
            pagoReciente: false,
            cuentas,
          };
        }),

      // ── Compra ────────────────────────────────────────────────────
      setPack: (pack) => set({ pack }),
      setMetodoPago: (metodoPago) => set({ metodoPago }),

      confirmarPago: () => {
        const { pack, metodoPago } = get();
        const compras = {
          '10': { concepto: '10 consultas', monto: 12, creditos: 10, plan: 'creditos' },
          '25': { concepto: '25 consultas', monto: 25, creditos: 25, plan: 'creditos' },
          pro: { concepto: 'Plan Pro · mensual', monto: 29, creditos: 0, plan: 'pro' },
        };
        const c = compras[pack];
        const pago = { id: crypto.randomUUID(), ts: Date.now(), concepto: c.concepto, monto: c.monto, metodo: metodoPago };
        set((s) => {
          const nuevosCreditos = c.plan === 'creditos' ? s.creditos + c.creditos : s.creditos;
          const nuevosPagos = [pago, ...s.pagos];
          const cuentas = { ...s.cuentas };
          if (s.usuario?.email) {
            const e = s.usuario.email.trim().toLowerCase();
            const cuenta = cuentas[e] || { perfil: s.usuario };
            cuentas[e] = {
              ...cuenta,
              plan: c.plan,
              creditos: nuevosCreditos,
              pagos: nuevosPagos,
            };
          }
          return {
            plan: c.plan,
            creditos: nuevosCreditos,
            pagos: nuevosPagos,
            pagoReciente: true,
            cuentas,
          };
        });
        return pago;
      },

      setTenant: (tenant) => set({ tenant }),
      setDocenteOpcion: (docenteOpcion) => set({ docenteOpcion }),
    }),
    {
      name: 'lmiu',
      version: 2,
      migrate: (persistedState) => {
        if (!persistedState) return persistedState;
        const cuentas = { ...(persistedState.cuentas || {}) };
        // Limpiar consultas de Diego en cuentas guardadas
        if (cuentas['diego.ramos@demo.pe']) {
          cuentas['diego.ramos@demo.pe'] = {
            ...cuentas['diego.ramos@demo.pe'],
            consultas: [],
            creditos: 25,
            usadasMes: 0,
          };
        }
        // Asegurar que las cuentas registradas mantengan sus consultas
        for (const k of Object.keys(cuentas)) {
          if (!cuentas[k].consultas) {
            if (persistedState.usuario?.email?.toLowerCase() === k.toLowerCase()) {
              cuentas[k].consultas = persistedState.consultas || [];
              cuentas[k].plan = persistedState.plan;
              cuentas[k].creditos = persistedState.creditos;
              cuentas[k].usadasMes = persistedState.usadasMes;
              cuentas[k].pagos = persistedState.pagos || [];
            } else {
              cuentas[k].consultas = [];
            }
          }
        }
        let consultas = persistedState.consultas || [];
        if (persistedState.usuario?.email === 'diego.ramos@demo.pe') {
          consultas = [];
        } else {
          consultas = consultas.filter((c) => !String(c.id).startsWith('demo-c'));
        }
        return {
          ...persistedState,
          cuentas,
          consultas,
        };
      },
      // Las acciones no se serializan; solo el estado persistente.
      partialize: (s) => Object.fromEntries(Object.entries(s).filter(([k, v]) => typeof v !== 'function' && k !== 'modalPlanes')),
    },
  ),
);
