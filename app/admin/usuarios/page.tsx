import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import UsuariosClient from "@/components/admin/usuarios-client";

export const dynamic = "force-dynamic";

export default async function UsuariosPage() {
  const session = await getSession();
  const dbUsers = await prisma.adminUser.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F1A2E]">Usuarios autorizados</h1>
        <p className="text-[#4A5568] text-sm mt-1">
          Solo estas cuentas de Google pueden acceder al panel
        </p>
      </div>
      <UsuariosClient
        dbUsers={dbUsers}
        currentEmail={session?.email ?? ""}
      />
    </div>
  );
}
