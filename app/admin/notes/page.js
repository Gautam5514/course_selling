import { Suspense } from "react";
import NotesListPage from "@/components/admin/NotesListPage";

export const metadata = { title: "Notes & PDFs — Gopo Workspace Admin" };

export default function AdminNotes() {
  return (
    <Suspense fallback={null}>
      <NotesListPage />
    </Suspense>
  );
}
