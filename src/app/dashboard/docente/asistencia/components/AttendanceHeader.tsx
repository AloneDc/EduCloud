"use client";

import { CalendarDays, PlusCircle } from "lucide-react";

interface AttendanceHeaderProps {
  date: string;
  topic: string;
  setDate: (val: string) => void;
  setTopic: (val: string) => void;
  onSave: () => void;
  saving: boolean;
}

export default function AttendanceHeader({
  date,
  topic,
  setDate,
  setTopic,
  onSave,
  saving,
}: AttendanceHeaderProps) {
  return (
    <div className="flex flex-wrap gap-4 mb-6 items-center justify-between">
      <div className="flex items-center gap-3">
        <CalendarDays className="text-blue-600" size={22} />
        <h2 className="text-xl font-bold text-gray-800">
          Registrar asistencia
        </h2>
      </div>

      <div className="flex flex-wrap gap-3 items-center w-full sm:w-auto">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm"
        />
        <input
          type="text"
          placeholder="Tema o descripción"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="border px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 text-sm w-full sm:w-64"
        />
        <button
          onClick={onSave}
          disabled={saving}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-white transition ${
            saving
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          <PlusCircle size={18} />
          {saving ? "Guardando..." : "Guardar"}
        </button>
      </div>
    </div>
  );
}
