const unidades = ["", "UN", "DOS", "TRES", "CUATRO", "CINCO", "SEIS", "SIETE", "OCHO", "NUEVE"];
const decenas = ["", "DIEZ", "VEINTE", "TREINTA", "CUARENTA", "CINCUENTA", "SESENTA", "SETENTA", "OCHENTA", "NOVENTA"];
const especiales = ["DIEZ", "ONCE", "DOCE", "TRECE", "CATORCE", "QUINCE", "DIECISÉIS", "DIECISIETE", "DIECIOCHO", "DIECINUEVE"];
const centenas = ["", "CIENTO", "DOSCIENTOS", "TRESCIENTOS", "CUATROCIENTOS", "QUINIENTOS", "SEISCIENTOS", "SETECIENTOS", "OCHOCIENTOS", "NOVECIENTOS"];

function grupo(n: number): string {
  if (n === 0) return "";
  if (n === 100) return "CIEN";
  const c = Math.floor(n / 100);
  const resto = n % 100;
  const parteC = c > 0 ? centenas[c] + (resto > 0 ? " " : "") : "";
  if (resto === 0) return parteC;
  if (resto < 10) return parteC + unidades[resto];
  if (resto < 20) return parteC + especiales[resto - 10];
  const d = Math.floor(resto / 10);
  const u = resto % 10;
  return parteC + decenas[d] + (u > 0 ? " Y " + unidades[u] : "");
}

export function numALetras(n: number): string {
  const entero = Math.floor(n);
  if (entero === 0) return "CERO PESOS";

  const millones = Math.floor(entero / 1_000_000);
  const miles = Math.floor((entero % 1_000_000) / 1000);
  const resto = entero % 1000;

  const partes: string[] = [];

  if (millones > 0) {
    if (millones === 1) partes.push("UN MILLÓN");
    else partes.push(grupo(millones) + " MILLONES");
  }
  if (miles > 0) {
    if (miles === 1) partes.push("MIL");
    else partes.push(grupo(miles) + " MIL");
  }
  if (resto > 0) partes.push(grupo(resto));

  return "Son Pesos " + partes.join(" ") + " con 00/100";
}
