"use client";

import React from "react";
import { motion } from "framer-motion";
import { CalendarDays, TrendingUp, AlertCircle } from "lucide-react";

/* ============================================
   🧠 Tipado de Props
============================================ */
export type AttendanceStatus =
  | "presente"
  | "falta"
  | "tardanza"
  | "justificado";

export interface WeeklyAttendanceResult {
  student_id: string;
  full_name: string;
  date: string;
  status: AttendanceStatus;
}

export interface AttendanceWeekViewProps {
  courseId: string;
  weekData: WeeklyAttendanceResult[];
}

/* ============================================
   🎨 Configuración de colores y etiquetas
============================================ */
const STATUS_CONFIG: Record<
  AttendanceStatus,
  { label: string; color: string; tooltip: string }
> = {
  presente: {
    label: "P",
    color: "bg-green-100 text-green-700 border-green-200",
    tooltip: "Presente",
  },
  falta: {
    label: "F",
    color: "bg-red-100 text-red-700 border-red-200",
    tooltip: "Falta",
  },
  tardanza: {
    label: "R",
    color: "bg-yellow-100 text-yellow-700 border-yellow-200",
    tooltip: "Retardo",
  },
  justificado: {
    label: "J",
    color: "bg-blue-100 text-blue-700 border-blue-200",
    tooltip: "Justificado",
  },
};

/* ============================================
   📅 Días de la semana (orden fijo)
============================================ */
const WEEK_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"];
const WEEK_DAYS_SHORT = ["Lun", "Mar", "Mié", "Jue", "Vie"];

/* ============================================
   🛠️ Utilidades
============================================ */
/**
 * Parsea una fecha en formato ISO (YYYY-MM-DD) sin conversión de zona horaria
 * @param dateString - Fecha en formato "YYYY-MM-DD"
 * @returns Objeto Date en hora local
 */
const parseLocalDate = (dateString: string): Date => {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
};

/**
 * Obtiene el nombre del día de la semana de forma segura
 */
const getWeekdayName = (date: Date): string => {
  const weekdayIndex = date.getDay();
  return [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ][weekdayIndex];
};

/* ============================================
   📘 Componente principal
============================================ */
const AttendanceWeekView: React.FC<AttendanceWeekViewProps> = ({
  weekData,
}) => {
  /* ============================================
     🔹 Agrupar registros por estudiante
  ============================================ */
  const { grouped, dateHeaders } = React.useMemo(() => {
    const result: Record<
      string,
      { full_name: string; records: Record<string, AttendanceStatus | null> }
    > = {};

    const headers: Record<string, string> = {};

    if (!weekData || weekData.length === 0) {
      return { grouped: result, dateHeaders: headers };
    }

    // Crear un mapa fecha -> día (sin desfase de zona horaria)
    const uniqueDates = Array.from(new Set(weekData.map((r) => r.date))).sort();

    const dayMap: Record<string, string> = {};
    uniqueDates.forEach((date) => {
      const jsDate = parseLocalDate(date);
      const weekdayName = getWeekdayName(jsDate);
      const weekdayIndex = jsDate.getDay();

      // Solo días laborables (Lunes=1 a Viernes=5)
      if (weekdayIndex >= 1 && weekdayIndex <= 5) {
        dayMap[date] = weekdayName;
        // Guardar fecha formateada para el header (ej: "15/01")
        headers[weekdayName] = date.substring(5).split("-").reverse().join("/");
      }
    });

    // Agrupar registros por estudiante
    weekData.forEach((record) => {
      const dayName = dayMap[record.date];
      if (!dayName) return;

      if (!result[record.student_id]) {
        result[record.student_id] = {
          full_name: record.full_name,
          records: {},
        };
      }

      result[record.student_id].records[dayName] = record.status;
    });

    return { grouped: result, dateHeaders: headers };
  }, [weekData]);

  // Ordenar estudiantes alfabéticamente
  const students = React.useMemo(
    () =>
      Object.values(grouped).sort((a, b) =>
        a.full_name.localeCompare(b.full_name, "es")
      ),
    [grouped]
  );

  /* ============================================
     📊 Estadísticas globales
  ============================================ */
  const stats = React.useMemo(() => {
    const totals = {
      presente: 0,
      falta: 0,
      tardanza: 0,
      justificado: 0,
      total: 0,
    };

    students.forEach((student) => {
      WEEK_DAYS.forEach((day) => {
        const status = student.records[day];
        if (status) {
          totals[status]++;
          totals.total++;
        }
      });
    });

    const attendance_rate =
      totals.total > 0
        ? ((totals.presente / totals.total) * 100).toFixed(1)
        : "0.0";

    return { ...totals, attendance_rate };
  }, [students]);

  /* ============================================
     🎨 Render UI
  ============================================ */
  return (
    <div className="space-y-4">
      {/* Header con estadísticas */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="font-semibold text-gray-700">
              Asistencia Semanal
            </span>
            <span className="text-2xl font-bold text-blue-600">
              {stats.attendance_rate}%
            </span>
          </div>
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-500"></span>
              <span className="text-gray-600">P: {stats.presente}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500"></span>
              <span className="text-gray-600">F: {stats.falta}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
              <span className="text-gray-600">R: {stats.tardanza}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              <span className="text-gray-600">J: {stats.justificado}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tabla */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="overflow-x-auto bg-white border border-gray-200 rounded-2xl shadow-sm"
      >
        <table className="min-w-full border-collapse text-sm">
          {/* Encabezado */}
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
              <th className="text-left px-4 py-3 font-semibold text-sm sticky left-0 bg-gray-50 z-10">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-blue-600" />
                  <span className="text-gray-700">Alumno</span>
                </div>
              </th>
              {WEEK_DAYS.map((day, idx) => (
                <th
                  key={day}
                  className="text-center px-3 py-2 font-semibold text-gray-700 min-w-[80px]"
                >
                  <div className="flex flex-col items-center">
                    <span className="hidden sm:inline">{day}</span>
                    <span className="sm:hidden">{WEEK_DAYS_SHORT[idx]}</span>
                    {dateHeaders[day] && (
                      <span className="text-xs text-gray-500 font-normal">
                        {dateHeaders[day]}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th className="text-center px-3 py-2 font-semibold text-gray-700 min-w-[140px]">
                Totales
              </th>
            </tr>
          </thead>

          {/* Cuerpo */}
          <tbody>
            {students.length === 0 ? (
              <tr>
                <td
                  colSpan={WEEK_DAYS.length + 2}
                  className="text-center py-12"
                >
                  <div className="flex flex-col items-center gap-3 text-gray-400">
                    <AlertCircle className="w-12 h-12" />
                    <p className="text-gray-500 font-medium">
                      No hay registros de asistencia esta semana
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              students.map((student, idx) => {
                const totals = {
                  presente: 0,
                  falta: 0,
                  tardanza: 0,
                  justificado: 0,
                };

                WEEK_DAYS.forEach((day) => {
                  const status = student.records[day];
                  if (status) totals[status]++;
                });

                return (
                  <motion.tr
                    key={student.full_name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
                  >
                    {/* Alumno */}
                    <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap sticky left-0 bg-white">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center text-xs font-bold">
                          {student.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </span>
                        <span className="max-w-[200px] truncate">
                          {student.full_name}
                        </span>
                      </div>
                    </td>

                    {/* Días */}
                    {WEEK_DAYS.map((day) => {
                      const status = student.records[day];
                      const config = status ? STATUS_CONFIG[status] : null;
                      return (
                        <td
                          key={day}
                          className="text-center py-3"
                          title={config?.tooltip ?? "Sin registro"}
                        >
                          {config ? (
                            <span
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-lg text-xs font-bold border ${config.color} transition-transform hover:scale-110`}
                            >
                              {config.label}
                            </span>
                          ) : (
                            <span className="text-gray-300 text-lg">—</span>
                          )}
                        </td>
                      );
                    })}

                    {/* Totales */}
                    <td className="text-center text-xs text-gray-600 px-2">
                      <div className="flex items-center justify-center gap-2 flex-wrap">
                        <span className="inline-flex items-center gap-1 bg-green-50 px-2 py-1 rounded font-semibold text-green-700">
                          P:{totals.presente}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-red-50 px-2 py-1 rounded font-semibold text-red-700">
                          F:{totals.falta}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded font-semibold text-yellow-700">
                          R:{totals.tardanza}
                        </span>
                        <span className="inline-flex items-center gap-1 bg-blue-50 px-2 py-1 rounded font-semibold text-blue-700">
                          J:{totals.justificado}
                        </span>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </motion.div>

      {/* Leyenda */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
        <p className="text-xs text-gray-600 mb-2 font-semibold">Leyenda:</p>
        <div className="flex flex-wrap gap-3 text-xs">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span
                className={`w-6 h-6 rounded-lg border ${config.color} flex items-center justify-center font-bold`}
              >
                {config.label}
              </span>
              <span className="text-gray-600">{config.tooltip}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AttendanceWeekView;
