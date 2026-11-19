import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import AdminSidebar from "@/components/admin/sidebar";
import AdminBreadcrumb from "@/components/admin/breadcrumb";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="min-h-screen bg-[#F8F8F4] flex">
      <AdminSidebar userEmail={session.email} userName={session.name ?? undefined} userPicture={session.picture ?? undefined} />
      <main className="flex-1 overflow-auto pt-14 md:pt-0">
        <AdminBreadcrumb />
        {children}
      </main>
    </div>
  );
}
