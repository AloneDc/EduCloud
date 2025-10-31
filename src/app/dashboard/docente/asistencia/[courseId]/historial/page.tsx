"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import { getAttendanceHistory } from "@/lib/attendanceService";
import { formatFullSpanishDate, getMonthName, getYear } from "@/lib/dateUtils";
import type { Teacher, Course } from "@/types/attendance";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  CalendarDays,
  ClipboardList,
  ChevronLeft,
  TrendingUp,
  Users,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Download,
  Filter,
  AlertCircle,
} from "lucide-react";

/* ============================================
   🧠 Tipos
============================================ */
interface AttendanceHistoryItem {
  id: string;
  date: string;
  topic: string;
  total_presentes: number;
  total_faltas: number;
  total_tardanzas: number;
  total_justificados: number;
}

/* ============================================
   📘 Página Principal
============================================ */
export default function HistorialAsistenciaPage(): React.JSX.Element {
  const router = useRouter();
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [history, setHistory] = useState<AttendanceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMonth, setFilterMonth] = useState<string>("all");

  /* ============================================
     🔹 Cargar datos
  ============================================ */
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (authData?.user) {
          const { data: teacherData } = await supabase
            .from("users")
            .select("id, full_name, email")
            .eq("id", authData.user.id)
            .single<Teacher>();
          setTeacher(teacherData ?? null);
        }

        const { data: courseData } = await supabase
          .from("courses")
          .select("id, name, grade, section, level, area")
          .eq("id", courseId)
          .single<Course>();
        setCourse(courseData ?? null);

        const list = await getAttendanceHistory(courseId);
        setHistory(list);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [courseId]);

  /* ============================================
     📊 Estadísticas globales
  ============================================ */
  const stats = useMemo(() => {
    const totals = {
      sesiones: history.length,
      presente: 0,
      falta: 0,
      tardanza: 0,
      justificado: 0,
      total: 0,
    };

    history.forEach((item) => {
      totals.presente += item.total_presentes;
      totals.falta += item.total_faltas;
      totals.tardanza += item.total_tardanzas;
      totals.justificado += item.total_justificados;
    });

    totals.total =
      totals.presente + totals.falta + totals.tardanza + totals.justificado;

    const attendance_rate =
      totals.total > 0
        ? ((totals.presente / totals.total) * 100).toFixed(1)
        : "0.0";

    return { ...totals, attendance_rate };
  }, [history]);

  /* ============================================
     🔹 Meses únicos para filtro
  ============================================ */
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    history.forEach((item) => {
      const monthYear = `${getYear(item.date)}-${String(
        new Date(item.date + "T00:00:00").getMonth() + 1
      ).padStart(2, "0")}`;
      months.add(monthYear);
    });
    return Array.from(months).sort().reverse();
  }, [history]);

  /* ============================================
     🔹 Filtrar por mes
  ============================================ */
  const filteredHistory = useMemo(() => {
    if (filterMonth === "all") return history;

    return history.filter((item) => {
      const itemMonthYear = `${getYear(item.date)}-${String(
        new Date(item.date + "T00:00:00").getMonth() + 1
      ).padStart(2, "0")}`;
      return itemMonthYear === filterMonth;
    });
  }, [history, filterMonth]);

  /* ============================================
     📥 Exportar a CSV
  ============================================ */
  const handleExport = () => {
    const csvHeader = "Fecha,Tema,Presentes,Faltas,Tardanzas,Justificados\n";
    const csvRows = filteredHistory
      .map(
        (item) =>
          `${formatFullSpanishDate(item.date)},"${item.topic}",${
            item.total_presentes
          },${item.total_faltas},${item.total_tardanzas},${
            item.total_justificados
          }`
      )
      .join("\n");

    const blob = new Blob([csvHeader + csvRows], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `historial-asistencia-${course?.name ?? "curso"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  /* ============================================
     🎨 Render UI
  ============================================ */
  return (
    <DashboardLayout role="docente" title="Historial de Asistencia">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto px-4 py-6 space-y-6"
      >
        {/* 🧾 Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                  title="Volver"
                >
                  <ChevronLeft className="w-5 h-5 text-blue-600" />
                </button>
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <ClipboardList className="text-white w-6 h-6" />
                  </div>
                  {course
                    ? `${course.name} — ${course.grade ?? ""}° ${
                        course.section ?? ""
                      }`
                    : "Cargando curso..."}
                </h2>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 ml-14">
                <Users className="w-4 h-4" />
                <span className="font-medium">
                  {teacher?.full_name ?? "Docente"}
                </span>
              </div>
            </div>

            <button
              onClick={handleExport}
              disabled={filteredHistory.length === 0}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Download className="w-4 h-4" />
              Exportar CSV
            </button>
          </div>
        </div>

        {/* 📊 Estadísticas Globales */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4"
          >
            {/* Sesiones */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-5 h-5 text-gray-600" />
                <span className="text-xs text-gray-500 font-medium">
                  SESIONES
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-800">
                {stats.sesiones}
              </p>
            </div>

            {/* Asistencia */}
            <div className="bg-white border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-xs text-green-600 font-medium">
                  PRESENTES
                </span>
              </div>
              <p className="text-2xl font-bold text-green-700">
                {stats.presente}
              </p>
            </div>

            {/* Faltas */}
            <div className="bg-white border-2 border-red-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-xs text-red-600 font-medium">FALTAS</span>
              </div>
              <p className="text-2xl font-bold text-red-700">{stats.falta}</p>
            </div>

            {/* Tardanzas */}
            <div className="bg-white border-2 border-yellow-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-xs text-yellow-600 font-medium">
                  TARDANZAS
                </span>
              </div>
              <p className="text-2xl font-bold text-yellow-700">
                {stats.tardanza}
              </p>
            </div>

            {/* Justificados */}
            <div className="bg-white border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <span className="text-xs text-blue-600 font-medium">
                  JUSTIFICADOS
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {stats.justificado}
              </p>
            </div>

            {/* % Asistencia */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 border-2 border-indigo-600 rounded-xl p-4 text-white">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-xs font-medium">% ASISTENCIA</span>
              </div>
              <p className="text-2xl font-bold">{stats.attendance_rate}%</p>
            </div>
          </motion.div>
        )}

        {/* 🔍 Filtro por mes */}
        {availableMonths.length > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-3 bg-white border border-gray-200 rounded-xl p-4"
          >
            <Filter className="w-5 h-5 text-gray-600" />
            <label className="text-sm font-medium text-gray-700">
              Filtrar por mes:
            </label>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="flex-1 max-w-xs border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent"
            >
              <option value="all">Todos los meses</option>
              {availableMonths.map((month) => {
                const [year, monthNum] = month.split("-");
                const date = new Date(parseInt(year), parseInt(monthNum) - 1);
                return (
                  <option key={month} value={month}>
                    {getMonthName(date)} {year}
                  </option>
                );
              })}
            </select>
          </motion.div>
        )}

        {/* 📋 Tabla de historial */}
        {loading ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
            />
            <p className="text-gray-500 font-medium">Cargando historial...</p>
          </div>
        ) : filteredHistory.length === 0 ? (
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No hay registros disponibles
            </h3>
            <p className="text-gray-500 text-sm">
              {filterMonth === "all"
                ? "No se han registrado sesiones de asistencia aún."
                : "No hay sesiones en el mes seleccionado."}
            </p>
          </div>
        ) : (
          <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            {/* Header de la tabla */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b-2 border-gray-200">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-gray-700">
                  Historial de Sesiones
                </span>
                <span className="text-xs text-gray-500">
                  ({filteredHistory.length}{" "}
                  {filteredHistory.length === 1 ? "sesión" : "sesiones"})
                </span>
              </div>
            </div>

            {/* Tabla responsive */}
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-50 text-gray-700 border-b border-gray-200">
                    <th className="px-6 py-3 text-left font-semibold">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-blue-600" />
                        Fecha
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left font-semibold">
                      Tema de Sesión
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="w-4 h-4 text-green-600 mb-1" />
                        <span className="text-green-600">P</span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      <div className="flex flex-col items-center">
                        <XCircle className="w-4 h-4 text-red-600 mb-1" />
                        <span className="text-red-600">F</span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      <div className="flex flex-col items-center">
                        <Clock className="w-4 h-4 text-yellow-600 mb-1" />
                        <span className="text-yellow-600">T</span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      <div className="flex flex-col items-center">
                        <UserCheck className="w-4 h-4 text-blue-600 mb-1" />
                        <span className="text-blue-600">J</span>
                      </div>
                    </th>
                    <th className="px-4 py-3 text-center font-semibold">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {filteredHistory.map((item, idx) => {
                      const total =
                        item.total_presentes +
                        item.total_faltas +
                        item.total_tardanzas +
                        item.total_justificados;

                      return (
                        <motion.tr
                          key={item.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: idx * 0.03 }}
                          className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-gray-800 font-medium whitespace-nowrap">
                            {formatFullSpanishDate(item.date)}
                          </td>
                          <td className="px-6 py-4 text-gray-700">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                              <span className="line-clamp-2">{item.topic}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-green-100 text-green-700 font-bold">
                              {item.total_presentes}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-red-100 text-red-700 font-bold">
                              {item.total_faltas}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-yellow-100 text-yellow-700 font-bold">
                              {item.total_tardanzas}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-blue-100 text-blue-700 font-bold">
                              {item.total_justificados}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-gray-700 font-bold">
                              {total}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
