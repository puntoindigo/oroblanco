import Link from "next/link";
import EmpleadoForm from "@/components/admin/empleado-form";

export default function NuevoEmpleadoPage() {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <Link href="/admin/empleados" className="text-[#4A5568] hover:text-[#0F1A2E] text-sm">
          ← Empleados
        </Link>
      </div>
      <h1 className="text-2xl font-bold text-[#0F1A2E] mb-6">Nuevo empleado</h1>
      <EmpleadoForm />
    </div>
  );
}
