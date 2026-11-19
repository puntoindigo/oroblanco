import ClienteForm from "@/components/admin/cliente-form";

export default function NuevoClientePage() {
  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F1A2E]">Nuevo cliente</h1>
      </div>
      <ClienteForm />
    </div>
  );
}
