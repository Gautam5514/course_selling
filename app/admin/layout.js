import AdminShell from "@/components/admin/AdminShell";

export const metadata = {
  title: "Admin — Gopo Workspace",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }) {
  return <AdminShell>{children}</AdminShell>;
}
