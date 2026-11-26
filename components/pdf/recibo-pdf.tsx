import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import { numALetras } from "@/lib/num-a-letras";

// ─── Empresa fija ─────────────────────────────────────────────────────────────
const EMPRESA = {
  nombre: "TRANSPORTE Y LOGISTICA ORO BLANCO S.A.S.",
  cuit: "30-71818840-3",
  domicilio: "Aregñino 1902 - Rosario",
};

// ─── Tipos ────────────────────────────────────────────────────────────────────
export interface ReciboData {
  periodoDisplay: string;
  remuneracionAsignada: number;
  sueldoBruto: number;
  seccion: string;
  modalidad: string;
  fechaReconocida?: string;
  obraSocialNombre?: string;
  lugaryFecha: string;
  periodoPago: string;
  roiSa?: number;
  ctb: {
    jubilacion: number;
    ley19032: number;
    asigFamiliares: number;
    fondoEmpleo: number;
    obraSocial: number;
    artPorcentual: number;
    artSumaFija: number;
    seguroVida: number;
    costoCCT?: number;
  };
  rem: {
    diasSueldo: number;
    montoSueldo: number;
    montoPresentismo: number;
    baseKmRecorrido: number;
    montoKmRecorrido: number;
  };
  noRem: {
    baseViaticosKm: number;
    montoViaticosKm: number;
    baseViaticoEspecial: number;
    montoViaticoEspecial: number;
    montoComida: number;
    montoRedondeo?: number;
  };
  desc: {
    jubilacion: number;
    ley19032: number;
    obraSocial: number;
    cuotaSindical: number;
    seguroSepelio?: number;
  };
  totalRem: number;
  totalNoRem: number;
  totalDesc: number;
  sueldoNeto: number;
}

export interface EmpleadoInfo {
  nombre: string;
  apellido: string | null;
  legajo: string | null;
  cuit: string | null;
  cct: string | null;
  categoria: string | null;
  fechaIngreso: Date | string | null;
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const C = {
  azul: "#0F1A2E",
  gris: "#6B7280",
  fondoFila: "#F3F4F6",
  borde: "#D1D5DB",
  dorado: "#C9A84C",
};

const S = StyleSheet.create({
  page: { fontFamily: "Helvetica", fontSize: 6.5, padding: 20, color: C.azul },
  // Header empresa
  header: {
    backgroundColor: C.azul, color: "white", padding: "5 8",
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginBottom: 4,
  },
  headerEmpresa: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  headerSub: { fontSize: 6, color: "#CBD5E1" },
  // Info grid
  infoGrid: { flexDirection: "row", flexWrap: "wrap", borderWidth: 1, borderColor: C.borde, marginBottom: 3 },
  celda: { borderRightWidth: 1, borderBottomWidth: 1, borderColor: C.borde, padding: "2 4" },
  celdaLabel: { fontSize: 5, color: C.gris, textTransform: "uppercase", marginBottom: 1 },
  celdaVal: { fontSize: 7, fontFamily: "Helvetica-Bold" },
  // Sección con header oscuro
  secHeader: {
    backgroundColor: C.azul, color: "white", fontFamily: "Helvetica-Bold",
    fontSize: 7, padding: "3 6", marginTop: 3,
  },
  // Tabla genérica
  tabla: { borderLeftWidth: 1, borderTopWidth: 1, borderColor: C.borde },
  filaHead: {
    flexDirection: "row", backgroundColor: "#E5E7EB",
    borderBottomWidth: 1, borderColor: C.borde,
  },
  fila: { flexDirection: "row", borderBottomWidth: 1, borderColor: C.borde },
  filaGris: { flexDirection: "row", backgroundColor: C.fondoFila, borderBottomWidth: 1, borderColor: C.borde },
  celdaT: { borderRightWidth: 1, borderColor: C.borde, padding: "2 4" },
  // Totales
  filaTotal: {
    flexDirection: "row", backgroundColor: C.azul, color: "white",
    borderBottomWidth: 1, borderColor: C.borde,
  },
  // Neto grande
  netoBox: {
    backgroundColor: C.azul, color: "white", padding: "4 8",
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginTop: 3,
  },
  netLabel: { fontSize: 9, fontFamily: "Helvetica-Bold" },
  netVal: { fontSize: 11, fontFamily: "Helvetica-Bold" },
  // Letras
  letrasBox: { borderWidth: 1, borderColor: C.borde, padding: "3 6", marginTop: 3 },
  letrasText: { fontSize: 7, fontFamily: "Helvetica-Bold" },
  // Pie
  pie: { flexDirection: "row", marginTop: 5, gap: 10 },
  pieCol: { flex: 1 },
  pieTabla: { borderWidth: 1, borderColor: C.borde },
  filaDetalle: { flexDirection: "row", borderBottomWidth: 1, borderColor: C.borde },
  // Firma
  firmas: { flexDirection: "row", marginTop: 20, gap: 20 },
  firmaBox: { flex: 1, borderTopWidth: 1, borderColor: C.gris, paddingTop: 3 },
  firmaLabel: { fontSize: 6, color: C.gris, textAlign: "center" },
  // Helpers
  bold: { fontFamily: "Helvetica-Bold" },
  right: { textAlign: "right" },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
const $ = (n: number | undefined) =>
  n !== undefined && n !== 0
    ? `$${n.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "";

const pct = (n: number) =>
  n > 0 ? `${((n / 1) * 100).toFixed(2)}%` : "";

function FilaConcepto({
  codigo,
  concepto,
  base,
  monto,
  par,
}: {
  codigo: string;
  concepto: string;
  base?: string | number;
  monto: number;
  par?: boolean;
}) {
  const Fila = par ? S.filaGris : S.fila;
  return (
    <View style={Fila}>
      <View style={[S.celdaT, { width: 32 }]}><Text>{codigo}</Text></View>
      <View style={[S.celdaT, { flex: 1 }]}><Text>{concepto}</Text></View>
      <View style={[S.celdaT, { width: 36, ...S.right }]}><Text>{base ?? ""}</Text></View>
      <View style={[S.celdaT, { width: 36, ...S.right }]}><Text></Text></View>
      <View style={[S.celdaT, { width: 60, ...S.right }]}><Text style={S.bold}>{$(monto)}</Text></View>
    </View>
  );
}

function SubHeader({ label }: { label: string }) {
  return (
    <View style={[S.fila, { backgroundColor: "#DBEAFE" }]}>
      <View style={[S.celdaT, { flex: 1 }]}>
        <Text style={[S.bold, { fontSize: 6.5 }]}>{label}</Text>
      </View>
    </View>
  );
}

function FilaDetallePie({ label, emp, trab }: { label: string; emp: string; trab?: string }) {
  return (
    <View style={S.filaDetalle}>
      <View style={[S.celdaT, { flex: 1 }]}><Text style={S.bold}>{label}</Text></View>
      <View style={[S.celdaT, { width: 55, ...S.right }]}><Text>{emp}</Text></View>
      {trab !== undefined && (
        <View style={[S.celdaT, { width: 55, ...S.right }]}><Text>{trab}</Text></View>
      )}
    </View>
  );
}

// ─── Documento principal ───────────────────────────────────────────────────────
export function ReciboDocument({
  empleado,
  recibo,
}: {
  empleado: EmpleadoInfo;
  recibo: ReciboData;
}) {
  const nombreCompleto = empleado.apellido
    ? `${empleado.apellido.toUpperCase()}, ${empleado.nombre.toUpperCase()}`
    : empleado.nombre.toUpperCase();

  const fechaIngreso = empleado.fechaIngreso
    ? new Date(empleado.fechaIngreso).toLocaleDateString("es-AR")
    : "—";

  const ctbTotal =
    recibo.ctb.jubilacion +
    recibo.ctb.ley19032 +
    recibo.ctb.asigFamiliares +
    recibo.ctb.fondoEmpleo +
    recibo.ctb.obraSocial +
    recibo.ctb.artPorcentual +
    recibo.ctb.artSumaFija +
    recibo.ctb.seguroVida +
    (recibo.ctb.costoCCT ?? 0);

  const costoEmpleador = recibo.sueldoBruto + ctbTotal;

  return (
    <Document>
      <Page size="A4" style={S.page}>
        {/* ── Header empresa ── */}
        <View style={S.header}>
          <View>
            <Text style={S.headerEmpresa}>{EMPRESA.nombre}</Text>
            <Text style={S.headerSub}>C.U.I.T.: {EMPRESA.cuit} &nbsp;&nbsp; {EMPRESA.domicilio}</Text>
          </View>
          <Text style={{ fontSize: 8, color: "#94A3B8" }}>RECIBO DE SUELDO</Text>
        </View>

        {/* ── Info empleado ── */}
        <View style={S.infoGrid}>
          {/* Fila 1 */}
          <View style={[S.celda, { width: "15%" }]}>
            <Text style={S.celdaLabel}>Período</Text>
            <Text style={S.celdaVal}>{recibo.periodoDisplay}</Text>
          </View>
          <View style={[S.celda, { width: "30%" }]}>
            <Text style={S.celdaLabel}>Apellido y Nombre</Text>
            <Text style={S.celdaVal}>{nombreCompleto}</Text>
          </View>
          <View style={[S.celda, { width: "8%" }]}>
            <Text style={S.celdaLabel}>Nº Legajo</Text>
            <Text style={S.celdaVal}>{empleado.legajo ?? "—"}</Text>
          </View>
          <View style={[S.celda, { width: "15%" }]}>
            <Text style={S.celdaLabel}>Rem. Asignada</Text>
            <Text style={S.celdaVal}>{$(recibo.remuneracionAsignada)}</Text>
          </View>
          <View style={[S.celda, { width: "15%" }]}>
            <Text style={S.celdaLabel}>Sueldo Bruto</Text>
            <Text style={S.celdaVal}>{$(recibo.sueldoBruto)}</Text>
          </View>
          <View style={[S.celda, { flex: 1, borderRightWidth: 0 }]}>
            <Text style={S.celdaLabel}>C.U.I.T.</Text>
            <Text style={S.celdaVal}>{empleado.cuit ?? "—"}</Text>
          </View>
          {/* Fila 2 */}
          <View style={[S.celda, { width: "15%" }]}>
            <Text style={S.celdaLabel}>Fecha Ingreso</Text>
            <Text style={S.celdaVal}>{fechaIngreso}</Text>
          </View>
          <View style={[S.celda, { width: "15%" }]}>
            <Text style={S.celdaLabel}>Fecha Reconocida</Text>
            <Text style={S.celdaVal}>{recibo.fechaReconocida ?? fechaIngreso}</Text>
          </View>
          <View style={[S.celda, { width: "8%" }]}>
            <Text style={S.celdaLabel}>Antigüedad</Text>
            <Text style={S.celdaVal}>0 Años</Text>
          </View>
          <View style={[S.celda, { flex: 1, borderRightWidth: 0 }]}>
            <Text style={S.celdaLabel}>Calificación Profesional</Text>
            <Text style={S.celdaVal}>{empleado.cct ?? "—"}</Text>
          </View>
          {/* Fila 3 */}
          <View style={[S.celda, { width: "23%" }]}>
            <Text style={S.celdaLabel}>Categoría Laboral</Text>
            <Text style={S.celdaVal}>{empleado.categoria ?? "—"}</Text>
          </View>
          <View style={[S.celda, { width: "15%" }]}>
            <Text style={S.celdaLabel}>Sección</Text>
            <Text style={S.celdaVal}>{recibo.seccion}</Text>
          </View>
          <View style={[S.celda, { flex: 1, borderRightWidth: 0 }]}>
            <Text style={S.celdaLabel}>Modalidad de Contratación</Text>
            <Text style={S.celdaVal}>{recibo.modalidad}</Text>
          </View>
          {/* Fila 4 */}
          <View style={[S.celda, { width: "23%" }]}>
            <Text style={S.celdaLabel}>Obra Social</Text>
            <Text style={S.celdaVal}>{recibo.obraSocialNombre ?? "—"}</Text>
          </View>
          <View style={[S.celda, { width: "15%" }]}>
            <Text style={S.celdaLabel}>Lugar y Fecha de Pago</Text>
            <Text style={S.celdaVal}>{recibo.lugaryFecha}</Text>
          </View>
          <View style={[S.celda, { width: "20%" }]}>
            <Text style={S.celdaLabel}>Período de Pago</Text>
            <Text style={S.celdaVal}>{recibo.periodoPago}</Text>
          </View>
          <View style={[S.celda, { flex: 1, borderRightWidth: 0 }]}>
            <Text style={S.celdaLabel}>ROI SA</Text>
            <Text style={[S.celdaVal, { color: C.dorado }]}>{$(recibo.roiSa)}</Text>
          </View>
        </View>

        {/* ── Costo total empleador ── */}
        <Text style={S.secHeader}>COSTO TOTAL EMPLEADOR</Text>
        <View style={S.tabla}>
          <View style={S.filaHead}>
            <View style={[S.celdaT, { width: 32 }]}><Text style={S.bold}>Cód.</Text></View>
            <View style={[S.celdaT, { flex: 1 }]}><Text style={S.bold}>Concepto</Text></View>
            <View style={[S.celdaT, { width: 60, ...S.right }]}><Text style={S.bold}>Monto</Text></View>
          </View>
          {[
            { c: "5010", l: "Contribución Jubilación", v: recibo.ctb.jubilacion },
            { c: "5020", l: "Contribución Ley 19032", v: recibo.ctb.ley19032 },
            { c: "5030", l: "Contribución Asig. Familiares", v: recibo.ctb.asigFamiliares },
            { c: "5040", l: "Contribución Fondo de Empleo", v: recibo.ctb.fondoEmpleo },
            { c: "5050", l: "Contribución Obra Social", v: recibo.ctb.obraSocial },
            { c: "5060", l: "Contribución Porcentual ART", v: recibo.ctb.artPorcentual },
            { c: "5250", l: "Contribución Suma Fija ART", v: recibo.ctb.artSumaFija },
            { c: "5361", l: "KM Contribución Fija Seguro de Vida", v: recibo.ctb.seguroVida },
          ].map(({ c, l, v }, i) => (
            <View key={c} style={i % 2 === 0 ? S.fila : S.filaGris}>
              <View style={[S.celdaT, { width: 32 }]}><Text>{c}</Text></View>
              <View style={[S.celdaT, { flex: 1 }]}><Text>{l}</Text></View>
              <View style={[S.celdaT, { width: 60, ...S.right }]}><Text style={S.bold}>{$(v)}</Text></View>
            </View>
          ))}
          {recibo.ctb.costoCCT !== undefined && recibo.ctb.costoCCT > 0 && (
            <View style={S.fila}>
              <View style={[S.celdaT, { width: 32 }]}><Text></Text></View>
              <View style={[S.celdaT, { flex: 1 }]}><Text>Costo Derivado de CCT</Text></View>
              <View style={[S.celdaT, { width: 60, ...S.right }]}><Text style={S.bold}>{$(recibo.ctb.costoCCT)}</Text></View>
            </View>
          )}
          <View style={S.filaTotal}>
            <View style={[S.celdaT, { flex: 1 }]}><Text style={S.bold}>SUB TOTAL CONTRIBUCIONES EMPLEADOR</Text></View>
            <View style={[S.celdaT, { width: 60, ...S.right }]}><Text style={S.bold}>{$(ctbTotal)}</Text></View>
          </View>
        </View>

        {/* ── Sueldo bruto ── */}
        <Text style={S.secHeader}>SUELDO BRUTO &nbsp;&nbsp; {$(recibo.sueldoBruto)}</Text>
        <View style={S.tabla}>
          <View style={S.filaHead}>
            <View style={[S.celdaT, { width: 32 }]}><Text style={S.bold}>Cód.</Text></View>
            <View style={[S.celdaT, { flex: 1 }]}><Text style={S.bold}>Concepto</Text></View>
            <View style={[S.celdaT, { width: 36, ...S.right }]}><Text style={S.bold}>Base</Text></View>
            <View style={[S.celdaT, { width: 36, ...S.right }]}><Text style={S.bold}>Unidad</Text></View>
            <View style={[S.celdaT, { width: 60, ...S.right }]}><Text style={S.bold}>Monto</Text></View>
          </View>

          <SubHeader label="REMUNERATIVO" />
          <FilaConcepto codigo="0301" concepto="Sueldo" base={`${recibo.rem.diasSueldo} días`} monto={recibo.rem.montoSueldo} />
          <FilaConcepto codigo="0305" concepto="Presentismo" monto={recibo.rem.montoPresentismo} par />
          <FilaConcepto codigo="0323" concepto="KM Recorrido (4-2-3)" base={recibo.rem.baseKmRecorrido} monto={recibo.rem.montoKmRecorrido} />

          <SubHeader label="NO REMUNERATIVO" />
          <FilaConcepto codigo="0395" concepto="Viáticos por KM Recorrido (4-2-4)" base={recibo.noRem.baseViaticosKm} monto={recibo.noRem.montoViaticosKm} />
          <FilaConcepto codigo="0401" concepto="Viático Especial (4-1-13)" base={recibo.noRem.baseViaticoEspecial} monto={recibo.noRem.montoViaticoEspecial} par />
          <FilaConcepto codigo="0402" concepto="Comida (4-1-12)" monto={recibo.noRem.montoComida} />
          {recibo.noRem.montoRedondeo !== undefined && recibo.noRem.montoRedondeo !== 0 && (
            <FilaConcepto codigo="9999" concepto="Redondeo" monto={recibo.noRem.montoRedondeo} par />
          )}

          <SubHeader label="DESCUENTOS" />
          <FilaConcepto codigo="4010" concepto="Jubilación" monto={recibo.desc.jubilacion} />
          <FilaConcepto codigo="4020" concepto="Ley 19032" monto={recibo.desc.ley19032} par />
          <FilaConcepto codigo="4051" concepto="Obra Social" monto={recibo.desc.obraSocial} />
          <FilaConcepto codigo="4210" concepto="Cuota Sindical" monto={recibo.desc.cuotaSindical} par />
          {recibo.desc.seguroSepelio !== undefined && recibo.desc.seguroSepelio > 0 && (
            <FilaConcepto codigo="4211" concepto="Seguro y Sepelio" monto={recibo.desc.seguroSepelio} />
          )}
        </View>

        {/* ── Composición salarial ── */}
        <View style={{ flexDirection: "row", borderWidth: 1, borderColor: C.borde, borderTopWidth: 0, marginTop: 0 }}>
          <View style={[S.celdaT, { flex: 1 }]}>
            <Text style={S.celdaLabel}>COMPOSICIÓN SALARIAL</Text>
          </View>
          <View style={[S.celdaT, { flex: 1 }]}>
            <Text style={S.celdaLabel}>Remunerativo</Text>
            <Text style={S.bold}>{$(recibo.totalRem)}</Text>
          </View>
          <View style={[S.celdaT, { flex: 1 }]}>
            <Text style={S.celdaLabel}>No Remunerativo</Text>
            <Text style={S.bold}>{$(recibo.totalNoRem)}</Text>
          </View>
          <View style={[S.celdaT, { flex: 1 }]}>
            <Text style={S.celdaLabel}>Descuentos</Text>
            <Text style={S.bold}>{$(recibo.totalDesc)}</Text>
          </View>
        </View>

        {/* ── Sueldo neto ── */}
        <View style={S.netoBox}>
          <Text style={S.netLabel}>SUELDO NETO</Text>
          <Text style={S.netVal}>{$(recibo.sueldoNeto)}</Text>
        </View>

        {/* ── Importe en letras ── */}
        <View style={S.letrasBox}>
          <Text style={S.letrasText}>{numALetras(recibo.sueldoNeto)}</Text>
        </View>

        {/* ── Detalle pie de página ── */}
        <View style={S.pie}>
          <View style={[S.pieCol]}>
            <View style={S.pieTabla}>
              <View style={[S.filaDetalle, { backgroundColor: "#E5E7EB" }]}>
                <View style={[S.celdaT, { flex: 1 }]}><Text style={S.bold}>Detalle composición salarial</Text></View>
                <View style={[S.celdaT, { width: 55, ...S.right }]}><Text style={S.bold}>Empleador</Text></View>
                <View style={[S.celdaT, { width: 55, ...S.right }]}><Text style={S.bold}>Trabajador</Text></View>
              </View>
              <FilaDetallePie label="Total Costo Sindical" emp={$(recibo.desc.cuotaSindical / 2)} trab={$(recibo.desc.cuotaSindical / 2)} />
              <FilaDetallePie label="Total Costo Seg. Social" emp={$(recibo.ctb.jubilacion + recibo.ctb.ley19032)} trab={$(recibo.desc.jubilacion + recibo.desc.ley19032)} />
              <FilaDetallePie label="Total Costo Obra Social" emp={$(recibo.ctb.obraSocial)} trab={$(recibo.desc.obraSocial)} />
              <FilaDetallePie label="Total Costo ART" emp={$(recibo.ctb.artPorcentual + recibo.ctb.artSumaFija)} trab="$0,00" />
              <FilaDetallePie label="Total Costo SVCO" emp={$(recibo.ctb.seguroVida)} trab="$0,00" />
            </View>
          </View>
          <View style={[S.pieCol]}>
            <View style={S.pieTabla}>
              <View style={[S.filaDetalle, { backgroundColor: "#E5E7EB" }]}>
                <View style={[S.celdaT, { flex: 1 }]}><Text style={S.bold}>Costo total empleador</Text></View>
                <View style={[S.celdaT, { width: 55, ...S.right }]}><Text style={S.bold}>{$(costoEmpleador)}</Text></View>
              </View>
              <FilaDetallePie label="Sueldo Neto" emp={$(recibo.sueldoNeto)} />
              <FilaDetallePie label="Seguridad Social Empleador" emp={$(recibo.ctb.jubilacion + recibo.ctb.ley19032 + recibo.ctb.asigFamiliares + recibo.ctb.fondoEmpleo)} />
              <FilaDetallePie label="Obra Social Empleador" emp={$(recibo.ctb.obraSocial)} />
              <FilaDetallePie label="ART" emp={$(recibo.ctb.artPorcentual + recibo.ctb.artSumaFija)} />
              <FilaDetallePie label="SVCO" emp={$(recibo.ctb.seguroVida)} />
            </View>
          </View>
        </View>

        {/* ── Firmas ── */}
        <View style={S.firmas}>
          <View style={S.firmaBox}>
            <Text style={S.firmaLabel}>FIRMA DEL EMPLEADO</Text>
          </View>
          <View style={S.firmaBox}>
            <Text style={S.firmaLabel}>FIRMA DEL EMPLEADOR</Text>
          </View>
        </View>

        <Text style={{ fontSize: 5.5, color: C.gris, marginTop: 6, textAlign: "center" }}>
          Recibí el importe neto de este liquidación en pago de mi remuneración correspondiente al período indicado de la misma conforme a la ley vigente.
        </Text>
      </Page>
    </Document>
  );
}
