"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  getStudentsByCourse,
  saveAttendance,
  getSessionByDate,
  isSessionEditable,
} from "@/lib/attendanceService";
import { toLocalDateString, formatFullSpanishDate } from "@/lib/dateUtils";
import type {
  AttendanceStatus,
  Student,
  Teacher,
  Course,
} from "@/types/attendance";
import { supabase } from "@/lib/supabaseClient";

import DashboardLayout from "@/components/layout/DashboardLayout";
import AttendanceConfirmModal from "../components/AttendanceConfirmModal";
import {
  Clock,
  CalendarDays,
  Save,
  Info,
  AlertCircle,
  Lock,
  CheckCircle2,
  XCircle,
  UserCheck,
  Users,
} from "lucide-react";

/* ============================================
   🧠 Tipos locales
============================================ */
interface AttendanceMap {
  [studentId: string]: AttendanceStatus;
}

/* ============================================
   🎨 Configuración de estados de asistencia
============================================ */
const ATTENDANCE_STATES = [
  {
    value: "presente" as AttendanceStatus,
    label: "P",
    fullLabel: "Presente",
    color: "bg-green-100 text-green-700 hover:bg-green-200 border-green-300",
    activeColor: "bg-green-600 text-white border-green-700",
    icon: CheckCircle2,
  },
  {
    value: "falta" as AttendanceStatus,
    label: "F",
    fullLabel: "Falta",
    color: "bg-red-100 text-red-700 hover:bg-red-200 border-red-300",
    activeColor: "bg-red-600 text-white border-red-700",
    icon: XCircle,
  },
  {
    value: "tardanza" as AttendanceStatus,
    label: "T",
    fullLabel: "Tardanza",
    color:
      "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 border-yellow-300",
    activeColor: "bg-yellow-600 text-white border-yellow-700",
    icon: Clock,
  },
  {
    value: "justificado" as AttendanceStatus,
    label: "J",
    fullLabel: "Justificado",
    color: "bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-300",
    activeColor: "bg-blue-600 text-white border-blue-700",
    icon: UserCheck,
  },
];

/* ============================================
   📘 Página: Tomar Asistencia
============================================ */
export default function TomarAsistenciaPage(): React.JSX.Element {
  const router = useRouter();
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;

  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<AttendanceMap>({});
  const [topic, setTopic] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [status, setStatus] = useState<"ready" | "done" | "locked">("ready");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    toLocalDateString(new Date())
  );

  /* ============================================
     🔹 Obtener contexto: docente y curso
  ============================================ */
  useEffect(() => {
    const fetchContext = async (): Promise<void> => {
      try {
        const { data: authData, error: authError } =
          await supabase.auth.getUser();
        if (authError || !authData?.user) {
          console.error("Error al obtener usuario:", authError);
          return;
        }

        const { data: teacherData, error: teacherError } = await supabase
          .from("users")
          .select("id, full_name, email")
          .eq("id", authData.user.id)
          .single<Teacher>();

        if (teacherError) {
          console.error("Error al obtener docente:", teacherError);
        } else {
          setTeacher(teacherData ?? null);
        }

        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("id, name, grade, section, level, area")
          .eq("id", courseId)
          .single<Course>();

        if (courseError) {
          console.error("Error al obtener curso:", courseError);
        } else {
          setCourse(courseData ?? null);
        }
      } catch (error) {
        console.error("Error general en fetchContext:", error);
      }
    };
    void fetchContext();
  }, [courseId]);

  /* ============================================
     🔹 Verificar sesión según fecha seleccionada
  ============================================ */
  const checkStatus = useCallback(async (): Promise<void> => {
    try {
      const session = await getSessionByDate(courseId, selectedDate);
      if (!session) {
        setStatus("ready");
        return;
      }
      const editable = await isSessionEditable(session.id);
      setStatus(editable ? "done" : "locked");
    } catch (error) {
      console.error("Error al verificar estado de sesión:", error);
      setStatus("ready");
    }
  }, [courseId, selectedDate]);

  /* ============================================
     🔹 Cargar estudiantes
  ============================================ */
  useEffect(() => {
    const load = async (): Promise<void> => {
      setLoading(true);
      try {
        const data = await getStudentsByCourse(courseId);
        // Ordenar alfabéticamente
        const sortedStudents = data.sort((a, b) =>
          a.full_name.localeCompare(b.full_name, "es")
        );
        setStudents(sortedStudents);

        // Inicializar todos como "presente"
        const defaultMap: AttendanceMap = {};
        sortedStudents.forEach((s) => (defaultMap[s.id] = "presente"));
        setAttendance(defaultMap);
      } catch (error) {
        console.error("Error al cargar estudiantes:", error);
        setFeedback("❌ Error al cargar estudiantes.");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [courseId]);

  /* ============================================
     🔹 Verificar estado cuando cambia la fecha
  ============================================ */
  useEffect(() => {
    void checkStatus();
  }, [checkStatus, selectedDate]);

  /* ============================================
     📊 Calcular estadísticas en tiempo real
  ============================================ */
  const stats = useMemo(() => {
    const totals = {
      presente: 0,
      falta: 0,
      tardanza: 0,
      justificado: 0,
    };

    Object.values(attendance).forEach((state) => {
      totals[state]++;
    });

    return totals;
  }, [attendance]);

  /* ============================================
     🎯 Atajos de teclado para marcar todos
  ============================================ */
  const markAllAs = useCallback(
    (state: AttendanceStatus) => {
      if (status !== "ready") return;
      const newAttendance: AttendanceMap = {};
      students.forEach((s) => (newAttendance[s.id] = state));
      setAttendance(newAttendance);
      setFeedback(`✅ Todos marcados como ${state}`);
      setTimeout(() => setFeedback(null), 2000);
    },
    [students, status]
  );

  /* ============================================
     💾 Guardar asistencia
  ============================================ */
  const handleSave = async (): Promise<void> => {
    if (!topic.trim()) {
      setFeedback("⚠️ Ingresa un tema o descripción de la sesión.");
      setTimeout(() => setFeedback(null), 3000);
      return;
    }

    setSaving(true);
    setFeedback("⏳ Guardando asistencia...");

    try {
      await saveAttendance(courseId, selectedDate, topic, attendance);
      setShowConfirm(true);
      setFeedback(null);
      setStatus("done");

      // Redirigir después del modal
      setTimeout(() => {
        router.push(`/dashboard/docente/asistencia/${courseId}`);
      }, 2000);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido.";
      setFeedback(`❌ ${msg}`);
      setTimeout(() => setFeedback(null), 5000);
    } finally {
      setSaving(false);
    }
  };

  /* ============================================
     🎨 Render UI
  ============================================ */
  return (
    <DashboardLayout role="docente" title="Tomar Asistencia">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-6xl mx-auto px-4 py-6"
      >
        {/* 🧾 Encabezado */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 mb-6">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3 mb-2">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <CalendarDays className="text-white w-6 h-6" />
                </div>
                {course
                  ? `${course.name} — ${course.grade ?? ""}° ${
                      course.section ?? ""
                    }`
                  : "Cargando curso..."}
              </h2>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span className="font-medium">
                  {teacher?.full_name ?? "Docente"}
                </span>
                <span className="text-gray-400">•</span>
                <span>{formatFullSpanishDate(selectedDate)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-400 focus:border-transparent transition-all"
                max={toLocalDateString(new Date())}
              />
              <button
                onClick={() => setSelectedDate(toLocalDateString(new Date()))}
                className="px-4 py-2 text-sm bg-white border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium"
              >
                📅 Hoy
              </button>
            </div>
          </div>

          {/* Estadísticas en tiempo real */}
          {students.length > 0 && status === "ready" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-4 pt-4 border-t border-blue-200"
            >
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Total: {students.length} estudiantes
                  </span>
                </div>
                <div className="flex gap-3 text-sm">
                  {ATTENDANCE_STATES.map((state) => (
                    <div
                      key={state.value}
                      className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg border"
                    >
                      <state.icon className="w-4 h-4" />
                      <span className="font-semibold">
                        {stats[state.value]}
                      </span>
                      <span className="text-gray-600 hidden sm:inline">
                        {state.fullLabel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* 🔒 Estado bloqueado */}
        {status === "locked" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-50 border-2 border-gray-300 rounded-2xl p-8 text-center"
          >
            <Lock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Asistencia Bloqueada
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              La asistencia de esta fecha está bloqueada. Solo puede editarse
              durante las primeras 24 horas desde su registro.
            </p>
          </motion.div>
        ) : (
          <>
            {/* 📋 Campo tema */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                Tema o descripción de la sesión
              </label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full border-2 border-gray-300 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all"
                placeholder="Ejemplo: Resolución de ecuaciones de segundo grado"
                disabled={status !== "ready"}
              />
            </div>

            {/* 🎯 Atajos rápidos */}
            {status === "ready" && students.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 bg-amber-50 border border-amber-200 rounded-xl p-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-amber-600" />
                    <span className="text-sm font-medium text-gray-700">
                      Atajos rápidos:
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {ATTENDANCE_STATES.map((state) => (
                      <button
                        key={state.value}
                        onClick={() => markAllAs(state.value)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${state.color}`}
                        title={`Marcar todos como ${state.fullLabel}`}
                      >
                        <state.icon className="w-3.5 h-3.5" />
                        Todos {state.fullLabel}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 👩‍🎓 Lista de alumnos */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Header de la tabla */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-3 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    Lista de Estudiantes
                  </span>
                  <span className="text-xs text-gray-500 hidden sm:inline">
                    Haz clic en las letras para registrar la asistencia
                  </span>
                </div>
              </div>

              {loading ? (
                <div className="py-16 text-center">
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
                    Cargando estudiantes...
                  </p>
                </div>
              ) : students.length === 0 ? (
                <div className="p-12 text-center">
                  <AlertCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    No hay estudiantes registrados
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Este curso no tiene estudiantes asignados todavía.
                  </p>
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {students.map((student, idx) => (
                    <motion.li
                      key={student.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 px-6 py-4 hover:bg-blue-50/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                          {student.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join("")
                            .toUpperCase()}
                        </span>
                        <span className="text-gray-800 text-sm font-medium">
                          {student.full_name}
                        </span>
                      </div>

                      <div className="flex gap-2 flex-wrap sm:flex-nowrap">
                        {ATTENDANCE_STATES.map((state) => {
                          const isActive =
                            attendance[student.id] === state.value;
                          return (
                            <button
                              key={state.value}
                              onClick={() =>
                                setAttendance((prev) => ({
                                  ...prev,
                                  [student.id]: state.value,
                                }))
                              }
                              disabled={status !== "ready"}
                              title={state.fullLabel}
                              className={`px-4 py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                                isActive ? state.activeColor : state.color
                              } ${
                                status !== "ready"
                                  ? "opacity-50 cursor-not-allowed"
                                  : "hover:scale-105 active:scale-95"
                              }`}
                            >
                              {state.label}
                            </button>
                          );
                        })}
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )}
            </div>

            {/* 💾 Botón Guardar */}
            {students.length > 0 && (
              <div className="flex justify-center mt-8">
                <button
                  onClick={handleSave}
                  disabled={saving || status !== "ready"}
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all transform hover:scale-105 active:scale-95"
                >
                  {saving ? (
                    <>
                      <Clock className="w-5 h-5 animate-spin" />
                      Guardando asistencia...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      Guardar asistencia
                    </>
                  )}
                </button>
              </div>
            )}
          </>
        )}

        {/* 💬 Feedback flotante */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
            >
              <div
                className={`px-6 py-3 rounded-xl shadow-lg font-medium text-sm flex items-center gap-2 ${
                  feedback.startsWith("✅")
                    ? "bg-green-600 text-white"
                    : feedback.startsWith("❌")
                    ? "bg-red-600 text-white"
                    : "bg-yellow-600 text-white"
                }`}
              >
                {feedback}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* ✅ Modal de confirmación */}
      <AnimatePresence>
        {showConfirm && (
          <AttendanceConfirmModal
            attendance={attendance}
            onClose={() => {
              setShowConfirm(false);
              router.push(`/dashboard/docente/asistencia/${courseId}`);
            }}
          />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
