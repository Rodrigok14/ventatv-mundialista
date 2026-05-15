import AdminClient from "@/app/admin/ui/AdminClient";

export const dynamic = "force-dynamic";

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <AdminClient />
    </main>
  );
}

