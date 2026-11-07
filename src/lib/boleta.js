// Boleta de venta electrónica en PDF.
//
// Se arma en el navegador con jsPDF y se descarga directo: nada de
// window.print(), que imprimía la pantalla de confirmación tal cual.
// Los datos de la compra son reales (fecha, monto, medio de pago, cliente);
// la empresa emisora, su RUC y su dirección son FICTICIOS: es un prototipo y
// el documento lo dice en el pie.
//
// Solo se usan caracteres de Latin-1 (á, ñ, °, ·): las fuentes estándar de
// jsPDF no traen viñetas ni guiones largos y los pintarían como basura.

import { jsPDF } from 'jspdf';

// Copia mínima de los nombres de METODOS_PAGO y PRO (data/contenido.js):
// importar ese módulo arrastra el catálogo JSON entero solo por cuatro textos.
const METODOS = { tarjeta: 'Tarjeta', yape: 'Yape', plin: 'Plin', pagoefectivo: 'PagoEfectivo' };
const PLAN = 'Pro estudiante';

export const EMPRESA = {
  marca: 'LMI-U',
  razonSocial: 'LMI-U S.A.C.',
  lema: 'Inteligencia del mercado laboral universitario',
  ruc: '20612345671',
  direccion: 'Av. Javier Prado Este 4200, Of. 1203',
  distrito: 'Santiago de Surco, Lima - Perú',
  correo: 'facturacion@lmi-u.pe',
  web: 'lmi-u.pe',
  telefono: '(01) 640-2026',
  serie: 'B001',
};

const IGV = 0.18;

// ── Paleta (la misma de la app, en RGB) ──
const C = {
  tinta: [23, 21, 58],
  gris: [98, 96, 128],
  linea: [206, 203, 228],
  suave: [243, 242, 255],
  acento: [75, 59, 255],
  lima: [198, 242, 78],
  blanco: [255, 255, 255],
};

// ── Utilidades de formato ──
const pad = (n, l = 2) => String(n).padStart(l, '0');
const MESES = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SET', 'OCT', 'NOV', 'DIC'];
const fecha = (d) => `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
const fechaLarga = (d) => `${pad(d.getDate())}-${MESES[d.getMonth()]}-${d.getFullYear()}`;
const hora = (d) => `${pad(d.getHours())}:${pad(d.getMinutes())}`;
const soles = (n) => n.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function sumarMes(d) {
  const r = new Date(d);
  r.setMonth(r.getMonth() + 1);
  return r;
}

// Hash simple y estable para derivar códigos a partir del id del pago.
function hash(texto) {
  let h = 2166136261;
  for (let i = 0; i < texto.length; i++) {
    h ^= texto.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function numeroBoleta(pago) {
  if (pago.numero) return pago.numero;
  return `${EMPRESA.serie}-${pad(hash(String(pago.id)) % 100000000, 8)}`;
}

const operacion = (pago) => String(pago.id).replace(/-/g, '').slice(0, 10).toUpperCase();

function medioDePago(pago) {
  const nombre = METODOS[pago.metodo] ?? String(pago.metodo ?? 'Yape');
  const d = pago.detalleMetodo ?? {};
  if (pago.metodo === 'tarjeta' && d.ultimos4) return `${d.marca ?? 'Tarjeta'} **** ${d.ultimos4}`;
  if (pago.metodo === 'yape' && d.celular) return `Yape ${d.celular.slice(0, 3)} *** ${d.celular.slice(-3)}`;
  return nombre;
}

// ── Número a letras (para el "SON: ...") ──
const UNI = ['', 'UNO', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE', 'DIEZ',
  'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE', 'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE',
  'VEINTE', 'VEINTIUNO', 'VEINTIDÓS', 'VEINTITRÉS', 'VEINTICUATRO', 'VEINTICINCO', 'VEINTISÉIS',
  'VEINTISIETE', 'VEINTIOCHO', 'VEINTINUEVE'];
const DEC = ['', '', '', 'TREINTA', 'CUARENTA', 'CINCUENTA', 'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'];
const CEN = ['', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS', 'QUINIENTOS', 'SEISCIENTOS',
  'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'];

function menorMil(n) {
  if (n === 0) return '';
  if (n === 100) return 'CIEN';
  const c = Math.floor(n / 100);
  const r = n % 100;
  let t = CEN[c];
  if (r > 0) {
    const resto = r < 30 ? UNI[r] : `${DEC[Math.floor(r / 10)]}${r % 10 ? ` Y ${UNI[r % 10]}` : ''}`;
    t = t ? `${t} ${resto}` : resto;
  }
  return t;
}

export function enLetras(monto) {
  const entero = Math.floor(monto);
  const cent = Math.round((monto - entero) * 100);
  let txt;
  if (entero === 0) txt = 'CERO';
  else {
    const miles = Math.floor(entero / 1000);
    const resto = entero % 1000;
    const pMiles = miles === 0 ? '' : miles === 1 ? 'MIL' : `${menorMil(miles)} MIL`;
    txt = [pMiles, menorMil(resto)].filter(Boolean).join(' ');
  }
  return `${txt} CON ${pad(cent)}/100 SOLES`;
}

// ── Dibujo ──

// Logo ficticio: la cabeza de Lumi, en vectores para que se vea nítida.
function logo(doc, x, y, s = 22) {
  const k = s / 22;
  const P = (v) => v * k;
  doc.setLineWidth(P(0.6));
  doc.setDrawColor(...C.tinta);

  // Antena
  doc.line(x + P(11), y + P(5.2), x + P(11), y + P(2.4));
  doc.setFillColor(...C.lima);
  doc.circle(x + P(11), y + P(1.9), P(1.4), 'FD');

  // Orejas
  doc.roundedRect(x + P(1.2), y + P(8.6), P(2.6), P(5), P(1.3), P(1.3), 'FD');
  doc.roundedRect(x + P(18.2), y + P(8.6), P(2.6), P(5), P(1.3), P(1.3), 'FD');

  // Cabeza y pantalla
  doc.setFillColor(...C.blanco);
  doc.roundedRect(x + P(3.3), y + P(4.8), P(15.4), P(13.2), P(5.4), P(5.4), 'FD');
  doc.setFillColor(...C.acento);
  doc.roundedRect(x + P(5.2), y + P(6.9), P(11.6), P(8.6), P(3.4), P(3.4), 'F');

  // Ojos y sonrisa
  doc.setDrawColor(...C.lima);
  doc.setLineWidth(P(0.75));
  doc.setLineCap('round');
  doc.lines([[P(1.1), P(-1.3), P(2.3), P(-1.3), P(3.4), 0]], x + P(6.8), y + P(10.6), [1, 1], 'S');
  doc.lines([[P(1.1), P(-1.3), P(2.3), P(-1.3), P(3.4), 0]], x + P(11.8), y + P(10.6), [1, 1], 'S');
  doc.lines([[P(1), P(1.2), P(2.6), P(1.2), P(3.6), 0]], x + P(9.2), y + P(12.4), [1, 1], 'S');
  doc.setLineCap('butt');

  // Sombra lima bajo la cabeza
  doc.setFillColor(...C.lima);
  doc.ellipse(x + P(11), y + P(20.4), P(7.5), P(1.1), 'F');
}

// Código QR de adorno (no es escaneable: el documento es ficticio).
function qrFalso(doc, x, y, lado, semilla) {
  const n = 25;
  const m = lado / n;
  let s = semilla || 1;
  const rnd = () => {
    s ^= s << 13; s ^= s >>> 17; s ^= s << 5;
    return ((s >>> 0) % 1000) / 1000;
  };
  const enFinder = (i, j) =>
    (i < 8 && j < 8) || (i < 8 && j >= n - 8) || (i >= n - 8 && j < 8);

  doc.setFillColor(...C.blanco);
  doc.rect(x - 1.5, y - 1.5, lado + 3, lado + 3, 'F');
  doc.setFillColor(...C.tinta);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (!enFinder(i, j) && rnd() > 0.52) doc.rect(x + j * m, y + i * m, m, m, 'F');
    }
  }
  const finder = (fx, fy) => {
    doc.setFillColor(...C.tinta);
    doc.rect(fx, fy, 7 * m, 7 * m, 'F');
    doc.setFillColor(...C.blanco);
    doc.rect(fx + m, fy + m, 5 * m, 5 * m, 'F');
    doc.setFillColor(...C.tinta);
    doc.rect(fx + 2 * m, fy + 2 * m, 3 * m, 3 * m, 'F');
  };
  finder(x, y);
  finder(x + (n - 7) * m, y);
  finder(x, y + (n - 7) * m);
}

function texto(doc, t, x, y, { tam = 8.5, negrita = false, color = C.tinta, alinear = 'left', ancho } = {}) {
  doc.setFont('helvetica', negrita ? 'bold' : 'normal');
  doc.setFontSize(tam);
  doc.setTextColor(...color);
  const opts = { align: alinear };
  if (ancho) opts.maxWidth = ancho;
  doc.text(t, x, y, opts);
}

// Celda con etiqueta pequeña arriba y valor en negrita abajo.
function celda(doc, x, y, w, h, etiqueta, valor) {
  doc.setDrawColor(...C.linea);
  doc.setLineWidth(0.25);
  doc.rect(x, y, w, h);
  texto(doc, etiqueta.toUpperCase(), x + 2.5, y + 4, { tam: 6.3, color: C.gris, negrita: true });
  const v = doc.setFont('helvetica', 'bold').setFontSize(8.6).splitTextToSize(String(valor), w - 5)[0];
  texto(doc, v, x + 2.5, y + 8.6, { tam: 8.6, negrita: true });
}

// Panel con banda de título (como los bloques de la boleta de referencia).
function panel(doc, x, y, w, h, titulo) {
  doc.setDrawColor(...C.acento);
  doc.setLineWidth(0.4);
  doc.rect(x, y, w, h);
  doc.setFillColor(...C.suave);
  doc.rect(x, y, w, 7, 'F');
  doc.line(x, y + 7, x + w, y + 7);
  texto(doc, titulo, x + w / 2, y + 4.8, { tam: 8, negrita: true, color: C.acento, alinear: 'center' });
}

function filaPar(doc, x, y, w, etiqueta, valor, { negrita = false } = {}) {
  texto(doc, etiqueta, x, y, { tam: 7.8, color: C.gris });
  texto(doc, valor, x + w, y, { tam: 7.8, negrita: true, alinear: 'right', color: negrita ? C.acento : C.tinta });
}

export function crearBoleta(pago, usuario) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const M = 14;
  const W = 210 - M * 2;
  const emitida = new Date(pago.ts);
  const fin = sumarMes(emitida);
  fin.setDate(fin.getDate() - 1);
  const proximo = sumarMes(emitida);
  const numero = numeroBoleta(pago);
  const total = Number(pago.monto);
  const gravada = Math.round((total / (1 + IGV)) * 100) / 100;
  const igv = Math.round((total - gravada) * 100) / 100;
  const cliente = (usuario?.nombre ?? 'Cliente').toUpperCase();

  doc.setProperties({
    title: `Boleta ${numero} - ${EMPRESA.razonSocial}`,
    subject: 'Boleta de venta electrónica',
    author: EMPRESA.razonSocial,
    creator: EMPRESA.marca,
  });

  // Franja de marca arriba
  doc.setFillColor(...C.acento);
  doc.rect(0, 0, 210, 3, 'F');
  doc.setFillColor(...C.lima);
  doc.rect(150, 0, 60, 3, 'F');

  // ── A · Emisor ──
  let y = 12;
  logo(doc, M, y, 24);
  texto(doc, EMPRESA.marca, M + 28, y + 9, { tam: 22, negrita: true, color: C.acento });
  texto(doc, EMPRESA.lema, M + 28, y + 14, { tam: 7.8, color: C.gris });
  texto(doc, EMPRESA.razonSocial, M, y + 30, { tam: 9, negrita: true });
  texto(doc, `${EMPRESA.direccion} - ${EMPRESA.distrito}`, M, y + 34.5, { tam: 7.5, color: C.gris });
  texto(doc, `${EMPRESA.correo}  ·  ${EMPRESA.telefono}  ·  ${EMPRESA.web}`, M, y + 38.5, { tam: 7.5, color: C.gris });
  texto(doc, `R.U.C.: ${EMPRESA.ruc}`, M, y + 42.5, { tam: 7.5, negrita: true });

  // Recuadro del comprobante
  const bx = 128;
  const bw = 210 - M - bx;
  doc.setDrawColor(...C.acento);
  doc.setLineWidth(0.7);
  doc.roundedRect(bx, y, bw, 34, 2, 2);
  texto(doc, `R.U.C. N° ${EMPRESA.ruc}`, bx + bw / 2, y + 8, { tam: 11, negrita: true, alinear: 'center' });
  doc.setFillColor(...C.acento);
  doc.rect(bx, y + 12, bw, 10, 'F');
  texto(doc, 'BOLETA DE VENTA', bx + bw / 2, y + 16.3, { tam: 9.5, negrita: true, color: C.blanco, alinear: 'center' });
  texto(doc, 'ELECTRÓNICA', bx + bw / 2, y + 20.3, { tam: 8, negrita: true, color: C.lima, alinear: 'center' });
  texto(doc, numero, bx + bw / 2, y + 29.5, { tam: 13, negrita: true, alinear: 'center' });

  texto(doc, `Emitida: ${fechaLarga(emitida)}  ${hora(emitida)}`, 210 - M, y + 40, { tam: 7.8, negrita: true, alinear: 'right' });
  texto(doc, `Periodo: del ${fechaLarga(emitida)} al ${fechaLarga(fin)}`, 210 - M, y + 44, { tam: 7.8, alinear: 'right', color: C.gris });

  // ── B · Adquiriente ──
  y = 62;
  const h = 11;
  const c3 = W / 3;
  celda(doc, M, y, c3 * 2, h, 'Cliente', cliente);
  celda(doc, M + c3 * 2, y, c3, h, 'Doc. de identidad', 'No requerido (< S/ 700)');
  celda(doc, M, y + h, c3 * 2, h, 'Correo electrónico', usuario?.email ?? '-');
  celda(doc, M + c3 * 2, y + h, c3, h, 'Tipo de cliente', usuario?.rol ?? 'Estudiante');
  celda(doc, M, y + h * 2, c3, h, 'Universidad', usuario?.universidad ?? '-');
  celda(doc, M + c3, y + h * 2, c3, h, 'Carrera', usuario?.carrera ?? '-');
  celda(doc, M + c3 * 2, y + h * 2, c3 / 2, h, 'Moneda', 'PEN (Soles)');
  celda(doc, M + c3 * 2.5, y + h * 2, c3 / 2, h, 'Forma de pago', 'Contado');

  // ── C · Detalle ──
  y = 102;
  const th = 64;
  panel(doc, M, y, W, th, 'DETALLE DEL SERVICIO');
  const col = [
    { t: 'CANT.', w: 12, a: 'center' },
    { t: 'UNID.', w: 13, a: 'center' },
    { t: 'CÓDIGO', w: 18, a: 'center' },
    { t: 'DESCRIPCIÓN', w: W - 12 - 13 - 18 - 22 - 16 - 24, a: 'left' },
    { t: 'V. UNITARIO', w: 22, a: 'right' },
    { t: 'DSCTO.', w: 16, a: 'right' },
    { t: 'IMPORTE', w: 24, a: 'right' },
  ];
  let cx = M;
  const hy = y + 7;
  doc.setDrawColor(...C.linea);
  doc.setLineWidth(0.25);
  col.forEach((c, i) => {
    const tx = c.a === 'center' ? cx + c.w / 2 : c.a === 'right' ? cx + c.w - 2.5 : cx + 2.5;
    texto(doc, c.t, tx, hy + 4.6, { tam: 6.8, negrita: true, color: C.gris, alinear: c.a });
    if (i > 0) doc.line(cx, hy, cx, y + th - 9);
    c.x = cx;
    cx += c.w;
  });
  doc.line(M, hy + 7, M + W, hy + 7);

  const ry = hy + 13;
  const celdaTxt = (i, t, opt = {}) => {
    const c = col[i];
    const tx = c.a === 'center' ? c.x + c.w / 2 : c.a === 'right' ? c.x + c.w - 2.5 : c.x + 2.5;
    texto(doc, t, tx, ry + (opt.dy ?? 0), { tam: 8.3, alinear: c.a, ...opt });
  };
  celdaTxt(0, '1');
  celdaTxt(1, 'ZZ');
  celdaTxt(2, 'PRO-MES');
  celdaTxt(3, (pago.concepto ?? `${PLAN} · mensual`).replace(PLAN, `Suscripción ${PLAN}`), { negrita: true });
  celdaTxt(3, 'Ofertas para mí, ruta de aprendizaje y adaptación de CV', { dy: 4.2, tam: 7.2, color: C.gris });
  celdaTxt(3, `Servicio del ${fecha(emitida)} al ${fecha(fin)}`, { dy: 8, tam: 7.2, color: C.gris });
  celdaTxt(4, soles(gravada));
  celdaTxt(5, '0.00');
  celdaTxt(6, soles(gravada), { negrita: true });

  // Pie de la tabla
  doc.setDrawColor(...C.acento);
  doc.setLineWidth(0.4);
  doc.line(M, y + th - 9, M + W, y + th - 9);
  texto(doc, 'TOTAL VALOR DE VENTA: S/', M + W - 30, y + th - 3.2, { tam: 8, negrita: true, alinear: 'right' });
  texto(doc, soles(gravada), M + W - 2.5, y + th - 3.2, { tam: 8.5, negrita: true, alinear: 'right' });

  // ── D / E / F · Pago, suscripción y totales ──
  y = 172;
  const ph = 40;
  const pw = (W - 8) / 3;

  panel(doc, M, y, pw, ph, 'DATOS DEL PAGO');
  let py = y + 13;
  [
    ['Medio', medioDePago(pago)],
    ['N° de operación', operacion(pago)],
    ['Fecha y hora', `${fecha(emitida)} ${hora(emitida)}`],
    ['Estado', 'PAGADO'],
  ].forEach(([k, v]) => { filaPar(doc, M + 3, py, pw - 6, k, v, { negrita: v === 'PAGADO' }); py += 6.4; });

  const x2 = M + pw + 4;
  panel(doc, x2, y, pw, ph, 'SUSCRIPCIÓN');
  py = y + 13;
  [
    ['Plan', PLAN],
    ['Renovación', 'Mensual automática'],
    ['Próximo cobro', fecha(proximo)],
    ['Permanencia', 'Sin permanencia'],
  ].forEach(([k, v]) => { filaPar(doc, x2 + 3, py, pw - 6, k, v); py += 6.4; });

  const x3 = M + (pw + 4) * 2;
  panel(doc, x3, y, pw, ph, 'RESUMEN');
  py = y + 13;
  [
    ['Op. gravada', `S/ ${soles(gravada)}`],
    ['Op. exonerada', 'S/ 0.00'],
    ['IGV (18%)', `S/ ${soles(igv)}`],
  ].forEach(([k, v]) => { filaPar(doc, x3 + 3, py, pw - 6, k, v); py += 6.4; });
  doc.setFillColor(...C.acento);
  doc.rect(x3, y + ph - 10, pw, 10, 'F');
  texto(doc, 'IMPORTE TOTAL', x3 + 3, y + ph - 3.6, { tam: 8, negrita: true, color: C.blanco });
  texto(doc, `S/ ${soles(total)}`, x3 + pw - 3, y + ph - 3.4, { tam: 11, negrita: true, color: C.lima, alinear: 'right' });

  // Importe en letras
  y = 218;
  doc.setDrawColor(...C.linea);
  doc.setLineWidth(0.25);
  doc.setFillColor(...C.suave);
  doc.rect(M, y, W, 9, 'FD');
  texto(doc, 'SON:', M + 3, y + 5.9, { tam: 8, negrita: true, color: C.gris });
  texto(doc, enLetras(total), M + 13, y + 5.9, { tam: 8.5, negrita: true });

  // ── Pie: QR, hash y aviso ──
  y = 236;
  qrFalso(doc, M + 1.5, y + 1.5, 28, hash(String(pago.id)));
  const fx = M + 37;
  texto(doc, 'Representación impresa de la Boleta de Venta Electrónica.', fx, y + 5, { tam: 8, negrita: true });
  texto(doc, `Consulte su comprobante en ${EMPRESA.web}/comprobantes con su N° de operación.`, fx, y + 9.5, { tam: 7.5, color: C.gris });
  texto(doc, `Código hash: ${hash(numero + pago.id).toString(36).toUpperCase()}${hash(String(pago.ts)).toString(36).toUpperCase()}=`, fx, y + 14, { tam: 7.5, color: C.gris });
  texto(doc, 'Al ser una suscripción, puedes cancelar la renovación cuando quieras desde Mi cuenta > Pagos.', fx, y + 18.5, { tam: 7.5, color: C.gris });

  doc.setFillColor(...C.lima);
  doc.roundedRect(fx, y + 22, W - 37, 8, 1.5, 1.5, 'F');
  texto(doc, `Gracias por invertir en tu futuro, ${(usuario?.nombre ?? '').split(' ')[0] || 'estudiante'}.`, fx + 3, y + 27.2, { tam: 8.3, negrita: true });

  // Aviso de documento ficticio
  doc.setDrawColor(...C.linea);
  doc.line(M, 280, 210 - M, 280);
  texto(
    doc,
    'Documento de demostración generado por el prototipo LMI-U. La razón social, el R.U.C. y la dirección del emisor son ficticios; no tiene validez tributaria.',
    105, 285, { tam: 6.8, color: C.gris, alinear: 'center', ancho: W },
  );

  doc.setFillColor(...C.acento);
  doc.rect(0, 294, 210, 3, 'F');

  return doc;
}

export function descargarBoleta(pago, usuario) {
  const doc = crearBoleta(pago, usuario);
  doc.save(`Boleta-${numeroBoleta(pago)}.pdf`);
}
