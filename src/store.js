import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CUENTAS_DEMO } from './data/demo.js';

export const CONSULTAS_GRATIS = 3;

const periodoActual = () => new Date().toISOString().slice(0, 7); // 'YYYY-MM'

const iniciales = (nombre) =>
  nombre.trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

const estadoInicial = {
  usuario: null,          // { email, nombre, iniciales, rol, areas, ciudades, tipo }
  cuentas: {},            // email -> { clave, perfil }  — el "servidor de cuentas" del navegador
  tenant: 'LMI-U',
  docenteOpcion: null,    // 'A' | 'B' — cuál vista docente eligió

  plan: 'free',           // 'free' | 'creditos' | 'pro' | 'institucional'
  creditos: 0,
  usadasMes: 0,
  periodo: periodoActual(),

  consultas: [],          // [{ id, pregunta, resultado, ts, costo }]
  hiloDesde: 0,           // el hilo visible arranca aquí; "+ Nueva consulta" lo adelanta
  pagos: [],              // [{ id, ts, concepto, monto, metodo }]
  pendiente: null,        // pregunta guardada al chocar con el paywall

  pack: '25',
  metodoPago: 'yape',
  modalPlanes: false,
};

export const useApp = create(
  persist(
    (set, get) => ({
      ...estadoInicial,

      abrirModalPlanes: () => set({ modalPlanes: true }),
      cerrarModalPlanes: () => set({ modalPlanes: false }),

      // ── Periodo: el plan gratis se renueva solo al cambiar de mes ──
      sincronizarPeriodo: () => {
        const p = periodoActual();
        if (get().periodo !== p) set({ periodo: p, usadasMes: 0 });
      },

      // ── Cuentas ───────────────────────────────────────────────────
      registrar: ({ email, clave, nombre }) => {
        const e = email.trim().toLowerCase();
        if (get().cuentas[e]) return { ok: false, error: 'Ya existe una cuenta con este correo.' };
        const perfil = { email: e, nombre, iniciales: iniciales(nombre), rol: 'Estudiante', areas: [], ciudades: [], tipo: 'personal' };
        set((s) => ({ cuentas: { ...s.cuentas, [e]: { clave, perfil } }, usuario: perfil }));
        return { ok: true };
      },

      entrar: ({ email, clave }) => {
        const e = email.trim().toLowerCase();
        const cuenta = get().cuentas[e];
        if (!cuenta) return { ok: false, error: 'No existe una cuenta con este correo.' };
        if (cuenta.clave !== clave) return { ok: false, error: 'Contraseña incorrecta.' };
        set({ usuario: cuenta.perfil });
        return { ok: true };
      },

      entrarDemo: (id) => {
        const demo = CUENTAS_DEMO.find((c) => c.id === id);
        if (!demo) return { ok: false, error: 'Cuenta de demostración no encontrada.' };
        // hiloDesde a 0: el historial de la cuenta demo tiene que verse entero.
        set({ ...demo.estado, usuario: demo.perfil, hiloDesde: 0 });
        return { ok: true };
      },

      salir: () => set({ ...estadoInicial, cuentas: get().cuentas, periodo: periodoActual() }),

      actualizarPerfil: (cambios) =>
        set((s) => {
          const perfil = { ...s.usuario, ...cambios };
          const e = perfil.email;
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
      registrarConsulta: ({ pregunta, resultado }) => {
        // Solo se cobra lo que de verdad se respondió: si no hay muestra
        // suficiente, la pregunta queda fuera de alcance, o no se encontró
        // ningún rol del catálogo, no hubo respuesta que cobrar.
        const cobra = !resultado.sinDatos
          && !resultado.fueraDeAlcance
          && (resultado.roleIds?.length ?? 0) > 0;
        const { plan } = get();
        const consulta = { id: crypto.randomUUID(), pregunta, resultado, ts: Date.now(), costo: cobra ? 1 : 0 };
        set((s) => ({
          consultas: [consulta, ...s.consultas],
          usadasMes: cobra && plan === 'free' ? s.usadasMes + 1 : s.usadasMes,
          creditos: cobra && plan === 'creditos' ? Math.max(0, s.creditos - 1) : s.creditos,
        }));
        return consulta;
      },

      // Empieza un hilo en blanco sin borrar nada: las consultas anteriores
      // siguen en el historial de la barra lateral.
      nuevaConsulta: () => set({ hiloDesde: Date.now(), pendiente: null }),

      // Las del hilo visible ahora mismo, de la más antigua a la más reciente.
      hiloVisible: () => get().consultas.filter((c) => c.ts >= get().hiloDesde).slice().reverse(),

      guardarPendiente: (pregunta) => set({ pendiente: pregunta }),
      limpiarPendiente: () => set({ pendiente: null }),
      resetearIntentos: () => set({
        usadasMes: 0,
        creditos: 0,
        plan: 'free',
        consultas: [],
        pagos: [],
        pendiente: null,
        hiloDesde: Date.now(),
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
        set((s) => ({
          plan: c.plan,
          creditos: c.plan === 'creditos' ? s.creditos + c.creditos : s.creditos,
          pagos: [pago, ...s.pagos],
        }));
        return pago;
      },

      setTenant: (tenant) => set({ tenant }),
      setDocenteOpcion: (docenteOpcion) => set({ docenteOpcion }),
    }),
    {
      name: 'lmiu',
      version: 1,
      // Las acciones no se serializan; solo el estado persistente.
      partialize: (s) => Object.fromEntries(Object.entries(s).filter(([k, v]) => typeof v !== 'function' && k !== 'modalPlanes')),
    },
  ),
);
