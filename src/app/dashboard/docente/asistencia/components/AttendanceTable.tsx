"use client";

interface AttendanceTableProps {
  students: { id: string; full_name: string }[];
  attendance: Record<string, string>;
  setAttendance: (val: Record<string, string>) => void;
}

export default function AttendanceTable({
  students,
  attendance,
  setAttendance,
}: AttendanceTableProps) {
  const statuses = [
    { key: "presente", label: "✅ Presente", color: "text-green-600" },
    { key: "tarde", label: "🕒 Tarde", color: "text-yellow-600" },
    { key: "ausente", label: "❌ Ausente", color: "text-red-600" },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border text-sm rounded-xl overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="text-left p-3">Estudiante</th>
            {statuses.map((s) => (
              <th key={s.key} className="text-center p-3">
                {s.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {students.map((s) => (
            <tr
              key={s.id}
              className="border-b hover:bg-gray-50 transition text-gray-700"
            >
              <td className="p-3 font-medium">{s.full_name}</td>
              {statuses.map((status) => (
                <td key={status.key} className="text-center">
                  <input
                    type="radio"
                    name={s.id}
                    value={status.key}
                    checked={attendance[s.id] === status.key}
                    onChange={() =>
                      setAttendance({ ...attendance, [s.id]: status.key })
                    }
                    className="cursor-pointer"
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
