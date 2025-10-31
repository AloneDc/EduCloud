"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabaseClient";
import {
  getAttendanceSummary,
  getWeeklyAttendance,
  exportAttendanceCSV,
  getAttendanceHistory,
} from "@/lib/attendanceService";
import {
  getMondayOfCurrentWeekLocal,
  parseLocalDate,
  toLocalDateString,
  formatDayMonth,
} from "@/lib/dateUtils";
import type {
  AttendanceSummary,
  WeeklyAttendanceResult,
  Course,
  Teacher,
} from "@/types/attendance";
import DashboardLayout from "@/components/layout/DashboardLayout";
import AttendanceWeekView from "./components/AttendanceWeekView";
import AttendanceSummaryCard from "./components/AttendanceSummaryCard";
import {
  CalendarDays,
  ClipboardList,
  Download,
  PlusCircle,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  History,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
} from "lucide-react";
import { saveAs } from "file-saver";

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

type TabType = "week" | "summary" | "history";

/* ============================================
   📘 Página: Resumen de Asistencia del Curso
============================================ */
const AsistenciaCursoPage: React.FC = () => {
  const router = useRouter();
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  const [course, setCourse] = useState<Course | null>(null);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [weekData, setWeekData] = useState<WeeklyAttendanceResult[]>([]);
  const [history, setHistory] = useState<AttendanceHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeTab, setActiveTab] = useState<TabType>("week");

  /* ============================================
     🔹 Cargar contexto: curso + docente
  ============================================= */
  useEffect(() => {
    const fetchContext = async (): Promise<void> => {
      try {
        const { data: authData } = await supabase.auth.getUser();
        if (!authData?.user) return;

        const { data: teacherData } = await supabase
          .from("users")
          .select("id, full_name, email")
          .eq("id", authData.user.id)
          .single<Teacher>();

        setTeacher(teacherData ?? null);

        const { data: courseData } = await supabase
          .from("courses")
          .select("id, name, grade, section, level, area")
          .eq("id", courseId)
          .single<Course>();

        setCourse(courseData ?? null);
      } catch (error) {
        console.error("Error al cargar contexto:", error);
      }
    };

    void fetchContext();
  }, [courseId]);

  /* ============================================
     🔹 Obtener lunes de la semana con offset
  ============================================= */
  const getMondayOffset = (offset: number): string => {
    const baseMonday = parseLocalDate(getMondayOfCurrentWeekLocal());
    baseMonday.setDate(baseMonday.getDate() + offset * 7);
    return toLocalDateString(baseMonday);
  };

  /* ============================================
     🔹 Cargar todos los datos
  ============================================= */
  useEffect(() => {
    const loadData = async (): Promise<void> => {
      setLoading(true);
      try {
        const monday = getMondayOffset(weekOffset);
        const [week, summaryData, historyData] = await Promise.all([
          getWeeklyAttendance(courseId, monday),
          getAttendanceSummary(courseId),
          getAttendanceHistory(courseId),
        ]);

        setWeekData(week ?? []);
        setSummary(summaryData ?? null);
        setHistory(historyData ?? []);
      } catch (err) {
        console.error("❌ Error al cargar datos:", err);
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [courseId, weekOffset]);

  /* ============================================
     💾 Descargar CSV
  ============================================= */
  const handleDownload = async (): Promise<void> => {
    try {
      const blob = await exportAttendanceCSV(courseId);
      saveAs(blob, `asistencia_${course?.name ?? "curso"}.csv`);
    } catch (err) {
      console.error("❌ Error al descargar CSV:", err);
      alert("No se pudo descargar la asistencia.");
    }
  };

  /* ============================================
     🚀 Navegar a tomar asistencia
  ============================================= */
  const handleTomarAsistencia = (): void => {
    router.push(`/dashboard/docente/asistencia/${courseId}/tomar`);
  };

  /* ============================================
     🎨 Tabs de navegación
  ============================================= */
  const tabs = [
    { id: "week" as TabType, label: "Semana Actual", icon: CalendarDays },
    { id: "summary" as TabType, label: "Resumen General", icon: TrendingUp },
    { id: "history" as TabType, label: "Historial", icon: History },
  ];

  /* ============================================
     🎨 Render principal
  ============================================= */
  return (
    <DashboardLayout role="docente" title="Asistencia del Curso">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-7xl mx-auto px-4 py-6 space-y-6"
      >
        {/* 🧩 Encabezado Premium */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl shadow-sm p-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <ClipboardList className="w-6 h-6 text-white" />
                </div>
                {course
                  ? `${course.name} — ${course.grade ?? ""}° ${
                      course.section ?? ""
                    }`
                  : "Cargando curso..."}
              </h1>
              <p className="text-gray-600 text-sm flex items-center gap-2">
                <span className="font-medium">
                  {teacher?.full_name ?? "Docente"}
                </span>
                <span className="text-gray-400">•</span>
                <span>
                  {new Date().toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </span>
              </p>
            </div>

            {/* Botones de acción */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleTomarAsistencia}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <PlusCircle className="w-4 h-4" />
                Tomar Asistencia
              </button>

              <button
                onClick={handleDownload}
                className="flex items-center gap-2 bg-white border-2 border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all shadow-sm hover:shadow-md"
              >
                <Download className="w-4 h-4" />
                Exportar CSV
              </button>
            </div>
          </div>
        </div>

        {/* 📊 Estadísticas rápidas */}
        {summary && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="bg-white border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-xs text-green-600 font-semibold">
                  PRESENTES
                </span>
              </div>
              <p className="text-2xl font-bold text-green-700">
                {summary.presente}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {summary.porcentajes.presente.toFixed(1)}%
              </p>
            </div>

            <div className="bg-white border-2 border-red-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="text-xs text-red-600 font-semibold">
                  FALTAS
                </span>
              </div>
              <p className="text-2xl font-bold text-red-700">{summary.falta}</p>
              <p className="text-xs text-gray-500 mt-1">
                {summary.porcentajes.falta.toFixed(1)}%
              </p>
            </div>

            <div className="bg-white border-2 border-yellow-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-yellow-600" />
                <span className="text-xs text-yellow-600 font-semibold">
                  TARDANZAS
                </span>
              </div>
              <p className="text-2xl font-bold text-yellow-700">
                {summary.tardanza}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {summary.porcentajes.tardanza.toFixed(1)}%
              </p>
            </div>

            <div className="bg-white border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <UserCheck className="w-5 h-5 text-blue-600" />
                <span className="text-xs text-blue-600 font-semibold">
                  JUSTIFICADOS
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-700">
                {summary.justificado}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {summary.porcentajes.justificado.toFixed(1)}%
              </p>
            </div>
          </motion.div>
        )}

        {/* 🔖 Tabs de navegación */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-2 flex gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 📄 Contenido de tabs */}
        <AnimatePresence mode="wait">
          {/* TAB: Semana Actual */}
          {activeTab === "week" && (
            <motion.div
              key="week"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                  Resumen Semanal
                </h2>

                {/* Controles de semana */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setWeekOffset((o) => o - 1)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
                  >
                    <ChevronLeft className="w-4 h-4" /> Anterior
                  </button>
                  <button
                    onClick={() => setWeekOffset(0)}
                    className={`text-sm px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                      weekOffset === 0
                        ? "bg-blue-600 text-white shadow-md"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    Actual
                  </button>
                  <button
                    onClick={() => setWeekOffset((o) => o + 1)}
                    disabled={weekOffset >= 0}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium disabled:text-gray-400 disabled:hover:bg-transparent"
                  >
                    Siguiente <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
                  />
                  <p className="text-gray-500 font-medium">
                    Cargando resumen...
                  </p>
                </div>
              ) : (
                <AttendanceWeekView courseId={courseId} weekData={weekData} />
              )}
            </motion.div>
          )}

          {/* TAB: Resumen General */}
          {activeTab === "summary" && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                Resumen General del Curso
              </h2>

              {loading ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
                  />
                  <p className="text-gray-500 font-medium">
                    Cargando estadísticas...
                  </p>
                </div>
              ) : summary ? (
                <AttendanceSummaryCard summary={summary} />
              ) : (
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">
                    No hay registros de asistencia aún.
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB: Historial */}
          {activeTab === "history" && (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                Historial de Sesiones
              </h2>

              {loading ? (
                <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                    className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full mx-auto mb-4"
                  />
                  <p className="text-gray-500 font-medium">
                    Cargando historial...
                  </p>
                </div>
              ) : history.length === 0 ? (
                <div className="bg-white border-2 border-gray-200 rounded-2xl p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No hay historial disponible
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Aún no se han registrado sesiones de asistencia.
                  </p>
                </div>
              ) : (
                <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b-2 border-gray-200">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-gray-700">
                        Últimas {Math.min(10, history.length)} sesiones
                      </span>
                    </div>
                  </div>

                  {/* Tabla */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-gray-700 border-b border-gray-200">
                          <th className="px-6 py-3 text-left font-semibold">
                            Fecha
                          </th>
                          <th className="px-6 py-3 text-left font-semibold">
                            Tema
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-green-600">
                            P
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-red-600">
                            F
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-yellow-600">
                            T
                          </th>
                          <th className="px-4 py-3 text-center font-semibold text-blue-600">
                            J
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {history.slice(0, 10).map((item, idx) => (
                          <motion.tr
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors"
                          >
                            <td className="px-6 py-4 text-gray-800 font-medium whitespace-nowrap">
                              {formatDayMonth(item.date)}
                            </td>
                            <td className="px-6 py-4 text-gray-700">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="line-clamp-1">
                                  {item.topic}
                                </span>
                              </div>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-green-100 text-green-700 font-bold text-xs">
                                {item.total_presentes}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-red-100 text-red-700 font-bold text-xs">
                                {item.total_faltas}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-yellow-100 text-yellow-700 font-bold text-xs">
                                {item.total_tardanzas}
                              </span>
                            </td>
                            <td className="px-4 py-4 text-center">
                              <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-700 font-bold text-xs">
                                {item.total_justificados}
                              </span>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Ver todo */}
                  {history.length > 10 && (
                    <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 text-center">
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/docente/asistencia/${courseId}/historial`
                          )
                        }
                        className="text-sm text-blue-600 hover:text-blue-700 font-semibold hover:underline"
                      >
                        Ver todas las {history.length} sesiones →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </DashboardLayout>
  );
};

export default AsistenciaCursoPage;
