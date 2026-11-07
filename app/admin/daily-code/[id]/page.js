import DailyCodeEditor from "@/components/admin/DailyCodeEditor";

export const metadata = { title: "Edit today's code — Gopo Workspace Admin" };

export default async function EditDailyCodePage({ params }) {
  const { id } = await params;
  return <DailyCodeEditor entryId={id} />;
}
