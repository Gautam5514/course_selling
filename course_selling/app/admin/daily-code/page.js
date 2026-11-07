import { Suspense } from "react";
import DailyCodeListPage from "@/components/admin/DailyCodeListPage";

export const metadata = { title: "Today Code — Gopo Workspace Admin" };

export default function AdminDailyCode() {
  return (
    <Suspense fallback={null}>
      <DailyCodeListPage />
    </Suspense>
  );
}
