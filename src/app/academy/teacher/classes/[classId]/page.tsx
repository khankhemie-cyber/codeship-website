import RosterClient from "./RosterClient";

export const runtime = "edge";

export default function TeacherClassPage({ params }: { params: { classId: string } }) {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <RosterClient classId={params.classId} />
    </div>
  );
}
