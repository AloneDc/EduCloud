import { supabase } from "./supabaseClient";

/**
 * 🔹 Obtener resumen de asistencia por curso
 * Devuelve totales de presente / falta / tardanza y porcentajes.
 */
export async function getAttendanceSummary() {
  const { data, error } = await supabase.rpc("get_attendance_summary");

  if (error) {
    console.error("❌ Error al obtener resumen:", error.message);
    throw new Error("Error al generar el reporte de asistencia.");
  }

  return data ?? [];
}

/**
 * 🔹 Obtener detalle de asistencia de un curso específico
 */
export async function getCourseAttendanceDetails(courseId: string) {
  const { data, error } = await supabase
    .from("attendance")
    .select(
      `
      id,
      date,
      status,
      student:student_id(full_name, dni),
      session:session_id(topic, date)
    `
    )
    .eq("course_id", courseId)
    .order("date", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
/**
 * 🔹 Obtener resumen de asistencia por curso (para docente)
 */
export async function getAttendanceSummaryByTeacher(teacherId: string) {
  const { data, error } = await supabase.rpc(
    "get_attendance_summary_by_teacher",
    { p_teacher_id: teacherId }
  );

  if (error) {
    console.error("❌ Error al obtener resumen de asistencia:", error.message);
    throw new Error("Error al generar el reporte de asistencia.");
  }

  return data ?? [];
}
