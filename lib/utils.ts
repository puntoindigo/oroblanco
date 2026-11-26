export { cn } from "cn"

/** Muestra empresa si tiene valor, sino nombre. Regla universal de display de clientes. */
export function clienteLabel(c: { nombre: string; empresa?: string | null }): string {
  return c.empresa?.trim() || c.nombre;
}
