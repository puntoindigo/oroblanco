import VehiculoForm from "@/components/admin/vehiculo-form";

export default function NuevoVehiculoPage() {
  return (
    <div className="p-6 sm:p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F1A2E]">Nuevo vehículo</h1>
        <p className="text-[#4A5568] text-sm mt-1">Agregar un vehículo a la flota</p>
      </div>
      <VehiculoForm />
    </div>
  );
}
