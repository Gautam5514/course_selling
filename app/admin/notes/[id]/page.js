import NoteEditor from "@/components/admin/NoteEditor";

export const metadata = { title: "Edit note — Gopo Workspace Admin" };

export default async function EditNotePage({ params }) {
  const { id } = await params;
  return <NoteEditor noteId={id} />;
}
