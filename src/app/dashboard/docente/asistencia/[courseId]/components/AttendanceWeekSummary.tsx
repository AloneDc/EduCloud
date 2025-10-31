"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";
import {
  getMondayOfCurrentWeekLocal,
  getWeekDaysRange,
  parseLocalDate,
  toLocalDateString,
} from "@/lib/dateUtils";
import type { AttendanceStatus } from "@/types/attendance";

/* ============================================
   🧠 Tipado de Props y estructuras
============================================ */
interface AttendanceWeekSummaryProps {
  courseId: string;
}

interface StudentBasic {
  id: string;
  full_name: string;
}

interface AttendanceRow {
  student_id: string;
  date: string;
  status: AttendanceStatus;
  students: { full_name: string } | { full_name: string }[];
}

interface SummaryRecord {
  student_id: string;
  full_name: string;
  date: string;
  status: AttendanceStatus;
}

/* ============================================
   📘 Componente principal
============================================ */
const AttendanceWeekSummary: React.FC<AttendanceWeekSummaryProps> = ({
  courseId,
}) => {
  const [records, setRecords] = useState<SummaryRecord[]>([]);
  const [students, setStudents] = useState<StudentBasic[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);

  useEffect(() => {
    const loadWeekData = async (): Promise<void> => {
      const monday = parseLocalDate(getMondayOfCurrentWeekLocal());
      monday.setDate(monday.getDate() + weekOffset * 7);

      const friday = new Date(monday);
      friday.setDate(monday.getDate() + 4);

      const start = toLocalDateString(monday);
      const end = toLocalDateString(friday);

      // 🔹 Cargar estudiantes
      const { data: studentData, error: studentError } = await supabase
        .from("students")
        .select("id, full_name")
        .eq("course_id", courseId)
        .order("full_name", { ascending: true });

      if (studentError) {
        console.error("Error al cargar estudiantes:", studentError);
      } else {
        setStudents((studentData ?? []) as StudentBasic[]);
      }

      // 🔹 Cargar registros de asistencia
      const { data: attendanceData, error: attendanceError } = await supabase
        .from("attendance")
        .select("student_id, date, status, students(full_name)")
        .eq("course_id", courseId)
        .gte("date", start)
        .lte("date", end);

      if (attendanceError) {
        console.error("Error al cargar asistencia:", attendanceError);
        setRecords([]);
        return;
      }

      const mapped: SummaryRecord[] = (attendanceData ?? []).map((a) => {
        const row = a as AttendanceRow;
        const studentData = Array.isArray(row.students)
          ? row.students[0]
          : row.students;

        return {
          student_id: row.student_id,
          full_name: studentData?.full_name ?? "Desconocido",
          date: row.date,
          status: row.status,
        };
      });

      setRecords(mapped);
    };

    void loadWeekData();
  }, [courseId, weekOffset]);

  // 🔹 Obtener rango de fechas
  const mondayISO = getMondayOfCurrentWeekLocal();
  const weekDays = getWeekDaysRange(mondayISO);

  const getStatus = (
    studentId: string,
    date: string
  ): AttendanceStatus | "" => {
    const record = records.find(
      (r) => r.student_id === studentId && r.date === date
    );
    return record?.status ?? "";
  };

  const getColor = (status: AttendanceStatus | ""): string => {
    switch (status) {
      case "presente":
        return "bg-green-100 text-green-700";
      case "falta":
        return "bg-red-100 text-red-700";
      case "tardanza":
        return "bg-yellow-100 text-yellow-700";
      case "justificado":
        return "bg-blue-100 text-blue-700";
      default:
        return "text-gray-400";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white border border-gray-200 rounded-2xl shadow-sm p-4"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
        <h3 className="text-base font-semibold text-gray-800 flex items-center gap-2">
          📊 Resumen semanal
        </h3>
        <div className="flex gap-2">
          <button
            onClick={() => setWeekOffset((prev) => prev - 1)}
            className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            ← Semana anterior
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className={`px-3 py-1 text-sm rounded-lg ${
              weekOffset === 0
                ? "bg-blue-600 text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Semana actual
          </button>
          <button
            onClick={() => setWeekOffset((prev) => prev + 1)}
            className="px-3 py-1 text-sm bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
            disabled={weekOffset >= 0}
          >
            Semana siguiente →
          </button>
        </div>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-center border-collapse">
          <thead>
            <tr className="text-gray-600 bg-gray-50 border-b">
              <th className="text-left px-2 py-2">Alumno</th>
              {weekDays.map((dayISO, i) => (
                <th key={i} className="px-2 py-2 capitalize">
                  {parseLocalDate(dayISO).toLocaleDateString("es-ES", {
                    weekday: "short",
                    day: "numeric",
                  })}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td
                  colSpan={weekDays.length + 1}
                  className="text-gray-400 py-6 text-center text-sm"
                >
                  No hay estudiantes registrados.
                </td>
              </tr>
            ) : (
              students.map((s) => (
                <tr key={s.id} className="border-t hover:bg-gray-50">
                  <td className="text-left font-medium px-2 py-2">
                    {s.full_name}
                  </td>
                  {weekDays.map((d, i) => {
                    const status = getStatus(s.id, d);
                    return (
                      <td
                        key={i}
                        className={`px-2 py-1 rounded ${getColor(status)}`}
                      >
                        {status ? status.charAt(0).toUpperCase() : "—"}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};

export default AttendanceWeekSummary;
