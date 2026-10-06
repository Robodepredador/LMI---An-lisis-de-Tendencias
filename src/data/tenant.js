// Marca blanca. En producción el tenant saldría del subdominio; aquí se elige
// en el login institucional.
export const TENANTS = {
  'LMI-U': {
    id: 'LMI-U', name: 'LMI-U', mono: 'L',
    accent: 'oklch(0.78 0.14 60)',
    powered: false,
    uni: 'Universidad Andina del Sur', dom: 'uandina.edu.pe',
  },
  'Universidad Andina del Sur': {
    id: 'Universidad Andina del Sur', name: 'Andina Laboral', mono: 'UA',
    accent: 'oklch(0.76 0.11 235)',
    powered: true,
    uni: 'Universidad Andina del Sur', dom: 'uandina.edu.pe',
  },
  'Instituto Pacífico': {
    id: 'Instituto Pacífico', name: 'Pacífico Empleo', mono: 'IP',
    accent: 'oklch(0.8 0.13 150)',
    powered: true,
    uni: 'Instituto Pacífico', dom: 'ipacifico.edu.pe',
  },
};

export const TENANT_IDS = Object.keys(TENANTS);
export const getTenant = (id) => TENANTS[id] ?? TENANTS['LMI-U'];

// Solo los tenants de marca blanca son instituciones elegibles en el acceso
// docente: LMI-U es la marca del producto, no una universidad con licencia.
export const INSTITUCIONES = TENANT_IDS.filter((id) => TENANTS[id].powered);
