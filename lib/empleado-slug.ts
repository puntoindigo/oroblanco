import { prisma } from "@/lib/prisma";

/** Genera un slug legible: CUIL sin guiones, o apellido-nombre en kebab */
export function generarSlug(emp: {
  id: string;
  cuit: string | null;
  apellido: string | null;
  nombre: string;
}): string {
  if (emp.cuit?.trim()) {
    return emp.cuit.replace(/\D/g, ""); // "20-12345678-9" → "20123456789"
  }
  const parts = [emp.apellido, emp.nombre].filter(Boolean).join(" ");
  if (parts) {
    return parts
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }
  return emp.id;
}

/** Resuelve slug → empleado. Acepta también el cuid original para no romper links viejos. */
export async function resolverEmpleado(slug: string) {
  const porId = await prisma.empleado.findUnique({ where: { id: slug } });
  if (porId) return porId;

  const todos = await prisma.empleado.findMany();
  return todos.find((e) => generarSlug(e) === slug) ?? null;
}
