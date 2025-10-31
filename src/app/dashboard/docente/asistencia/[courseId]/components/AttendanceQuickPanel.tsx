"use client";

import type { FC } from "react";
import { motion } from "framer-motion";
import type { Student, AttendanceStatus } from "@/types/attendance";

interface AttendanceQuickPanelProps {
  students: Student[];
  attendance: Record<string, AttendanceStatus>;
  setAttendance: (a: Record<string, AttendanceStatus>) => void;
  topic: string;
  setTopic: (t: string) => void;
  onMarkAll: () => void;
  onSave: () => void;
  status: "ready" | "done" | "locked";
  feedback: string | null;
  loading: boolean;
}

const AttendanceQuickPanel: FC<AttendanceQuickPanelProps> = ({
  students,
  attendance,
  setAttendance,
  topic,
  setTopic,
  onMarkAll,
  onSave,
  status,
  feedback,
  loading,
}) => {
  const toggleStatus = (studentId: string, status: AttendanceStatus): void => {
    setAttendance({ ...attendance, [studentId]: status });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-gray-700 font-semibold">🧾 Toma de asistencia</h3>
        {status === "ready" && (
          <button
            onClick={onMarkAll}
            className="text-sm font-medium border border-green-600 text-green-700 px-3 py-1.5 rounded-lg hover:bg-green-50"
          >
            ☑️ Marcar todos presentes
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-10 animate-pulse">
          Cargando estudiantes...
        </p>
      ) : students.length === 0 ? (
        <p className="text-gray-400 text-center">
          No hay estudiantes registrados.
        </p>
      ) : (
        <ul className="space-y-3">
          {students.map((s) => (
            <li
              key={s.id}
              className="flex items-center justify-between border-b border-gray-100 pb-2"
            >
              <span className="text-gray-700 font-medium text-sm">
                {s.full_name}
              </span>
              <div className="flex gap-2">
                {(
                  [
                    "presente",
                    "falta",
                    "tardanza",
                    "justificado",
                  ] as AttendanceStatus[]
                ).map((st) => (
                  <button
                    key={st}
                    onClick={() => toggleStatus(s.id, st)}
                    className={`text-xs px-2 py-1 rounded border transition ${
                      attendance[s.id] === st
                        ? st === "presente"
                          ? "bg-green-100 border-green-400 text-green-700"
                          : st === "falta"
                          ? "bg-red-100 border-red-400 text-red-700"
                          : st === "tardanza"
                          ? "bg-yellow-100 border-yellow-400 text-yellow-700"
                          : "bg-blue-100 border-blue-400 text-blue-700"
                        : "border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {st.charAt(0).toUpperCase()}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Campo de tema */}
      <div className="mt-5">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tema / Observaciones
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Ejemplo: Revisión de ecuaciones cuadráticas..."
        />
      </div>

      {/* Guardar */}
      <div className="flex justify-end mt-6">
        <button
          onClick={onSave}
          disabled={status !== "ready"}
          className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          Guardar asistencia
        </button>
      </div>

      {feedback && (
        <p
          className={`text-center mt-3 text-sm font-medium ${
            feedback.startsWith("✅")
              ? "text-green-600"
              : feedback.startsWith("⚠️")
              ? "text-yellow-600"
              : feedback.startsWith("❌")
              ? "text-red-600"
              : "text-gray-500"
          }`}
        >
          {feedback}
        </p>
      )}
    </motion.div>
  );
};

export default AttendanceQuickPanel;
