/**
 * Tasas y fórmulas CCT 40/88 — Oro Blanco S.A.S.
 * Derivadas del recibo muestra Agosto 2026 (Torres).
 * Se actualizan en cctRates del empleado cuando el convenio sube.
 */
export interface CctRates {
  sueldoDiario: number;         // $/día hábil (básico CCT / 25)
  diasHabilesMes: number;       // divisor: normalmente 25
  presentismo: number;          // monto fijo mensual 0305
  kmRate0323: number;           // $/km remunerativo (0323)
  dietasKm: number;             // km por dieta para 0395 (default 34)
  diaViaticoRate0395: number;   // $/dieta (0395)
  homeNights: number;           // noches en casa por ciclo (dietas - homeNights = pernoctadas)
  nocheViaticoRate0401: number; // $/pernoctada (0401)
  comidaMonto: number;          // monto fijo comida 0402
  adicionalNoRem: number;       // monto fijo no rem adicional (9999 / redondeo CCT)
  pctCtbJubilacion: number;     // % emp (10.72)
  pctCtbLey19032: number;       // % emp (1.41)
  pctCtbAsigFamiliares: number; // % emp (4.68)
  pctCtbFondoEmpleo: number;    // % emp (0.94)
  pctCtbObraSocial: number;     // % emp (5.64)
  pctCtbArt: number;            // % emp (20.43 — transporte automotor de carga)
  artSumaFija: number;          // fijo ART suma fija
  costoCCT: number;             // fijo costo derivado CCT
  seguroVida: number;           // fijo seguro de vida km (5361)
  pctDescJubilacion: number;    // % trab (11)
  pctDescLey19032: number;      // % trab (3)
  pctDescObraSocial: number;    // % trab (3)
  pctDescCuotaSindical: number; // % trab (1.5)
  pctDescSeguroSepelio: number; // % trab (3)
}

/** Tasas vigentes Agosto 2026 — actualizar con cada actualización CCT */
export const TASAS_DEFAULT: CctRates = {
  sueldoDiario: 43811.09,
  diasHabilesMes: 25,
  presentismo: 106765.50,
  kmRate0323: 96.80,
  dietasKm: 34,
  diaViaticoRate0395: 3731.16,
  homeNights: 4,
  nocheViaticoRate0401: 27425.33,
  comidaMonto: 8.07,
  adicionalNoRem: 148260.76,
  pctCtbJubilacion: 10.72,
  pctCtbLey19032: 1.41,
  pctCtbAsigFamiliares: 4.68,
  pctCtbFondoEmpleo: 0.94,
  pctCtbObraSocial: 5.64,
  pctCtbArt: 20.43,
  artSumaFija: 1933.08,
  costoCCT: 6195.91,
  seguroVida: 424.62,
  pctDescJubilacion: 11,
  pctDescLey19032: 3,
  pctDescObraSocial: 3,
  pctDescCuotaSindical: 1.5,
  pctDescSeguroSepelio: 3,
};

export interface ReciboCalculado {
  // Conceptos remunerativos
  diasSueldo: number;
  montoSueldo: number;
  montoPresentismo: number;
  baseKmRecorrido: number;
  montoKmRecorrido: number;
  // Conceptos no remunerativos
  baseDietas: number;
  montoViaticosKm: number;
  basePernoctadas: number;
  montoViaticoEspecial: number;
  montoComida: number;
  montoAdicionalNoRem: number;
  // Contribuciones empleador
  ctbJubilacion: number;
  ctbLey19032: number;
  ctbAsigFamiliares: number;
  ctbFondoEmpleo: number;
  ctbObraSocial: number;
  ctbArtPorcentual: number;
  ctbArtSumaFija: number;
  ctbCostoCCT: number;
  ctbSeguroVida: number;
  // Descuentos
  descJubilacion: number;
  descLey19032: number;
  descObraSocial: number;
  descCuotaSindical: number;
  descSeguroSepelio: number;
  // Totales
  totalRem: number;
  totalNoRem: number;
  totalCtb: number;
  totalDesc: number;
  sueldoBruto: number;
  sueldoNeto: number;
  roiSa: number;
}

function r2(n: number) { return Math.round(n * 100) / 100; }

export function calcularRecibo(
  km: number,
  diasTrabajados: number,
  rates: CctRates
): ReciboCalculado {
  // ── Remunerativos ─────────────────────────────────────────────────────────
  const montoSueldo = r2(rates.sueldoDiario * diasTrabajados);
  const montoPresentismo = r2(rates.presentismo);
  const montoKmRecorrido = r2(km * rates.kmRate0323);
  const totalRem = r2(montoSueldo + montoPresentismo + montoKmRecorrido);

  // ── No remunerativos ──────────────────────────────────────────────────────
  const baseDietas = Math.floor(km / rates.dietasKm);
  const basePernoctadas = Math.max(0, baseDietas - rates.homeNights);
  const montoViaticosKm = r2(baseDietas * rates.diaViaticoRate0395);
  const montoViaticoEspecial = r2(basePernoctadas * rates.nocheViaticoRate0401);
  const montoComida = r2(rates.comidaMonto);
  const montoAdicionalNoRem = r2(rates.adicionalNoRem);
  const totalNoRem = r2(montoViaticosKm + montoViaticoEspecial + montoComida + montoAdicionalNoRem);

  const sueldoBruto = r2(totalRem + totalNoRem);

  // ── Contribuciones empleador (base = totalRem) ─────────────────────────────
  const pct = (base: number, p: number) => r2(base * p / 100);
  const ctbJubilacion = pct(totalRem, rates.pctCtbJubilacion);
  const ctbLey19032 = pct(totalRem, rates.pctCtbLey19032);
  const ctbAsigFamiliares = pct(totalRem, rates.pctCtbAsigFamiliares);
  const ctbFondoEmpleo = pct(totalRem, rates.pctCtbFondoEmpleo);
  const ctbObraSocial = pct(totalRem, rates.pctCtbObraSocial);
  const ctbArtPorcentual = pct(totalRem, rates.pctCtbArt);
  const ctbArtSumaFija = r2(rates.artSumaFija);
  const ctbCostoCCT = r2(rates.costoCCT);
  const ctbSeguroVida = r2(rates.seguroVida);
  const totalCtb = r2(
    ctbJubilacion + ctbLey19032 + ctbAsigFamiliares + ctbFondoEmpleo +
    ctbObraSocial + ctbArtPorcentual + ctbArtSumaFija + ctbCostoCCT + ctbSeguroVida
  );

  // ── Descuentos trabajador (base = totalRem) ────────────────────────────────
  const descJubilacion = pct(totalRem, rates.pctDescJubilacion);
  const descLey19032 = pct(totalRem, rates.pctDescLey19032);
  const descObraSocial = pct(totalRem, rates.pctDescObraSocial);
  const descCuotaSindical = pct(totalRem, rates.pctDescCuotaSindical);
  const descSeguroSepelio = pct(totalRem, rates.pctDescSeguroSepelio);
  const totalDesc = r2(descJubilacion + descLey19032 + descObraSocial + descCuotaSindical + descSeguroSepelio);

  const sueldoNeto = r2(sueldoBruto - totalDesc);
  const roiSa = r2(sueldoBruto + totalCtb);

  return {
    diasSueldo: diasTrabajados,
    montoSueldo, montoPresentismo, baseKmRecorrido: km, montoKmRecorrido,
    baseDietas, montoViaticosKm, basePernoctadas, montoViaticoEspecial,
    montoComida, montoAdicionalNoRem,
    ctbJubilacion, ctbLey19032, ctbAsigFamiliares, ctbFondoEmpleo,
    ctbObraSocial, ctbArtPorcentual, ctbArtSumaFija, ctbCostoCCT, ctbSeguroVida,
    descJubilacion, descLey19032, descObraSocial, descCuotaSindical, descSeguroSepelio,
    totalRem, totalNoRem, totalCtb, totalDesc,
    sueldoBruto, sueldoNeto, roiSa,
  };
}
