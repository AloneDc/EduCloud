/* ============================================
   📘 Tipos globales del módulo de asistencia
   Compatible con Supabase + Next.js + TS strict
============================================ */

/* -------------------------------
   🔹 Estado de asistencia
-------------------------------- */
export type AttendanceStatus =
  | "presente"
  | "falta"
  | "tardanza"
  | "justificado";

/* -------------------------------
   🔹 Estudiante
-------------------------------- */
export interface Student {
  id: string;
  full_name: string;
  dni?: string;
  course_id: string;
  created_at?: string;
}

/* -------------------------------
   🔹 Curso
-------------------------------- */
export interface Course {
  id: string;
  name: string;
  grade?: string;
  section?: string;
  level?: string;
  area?: string;
  year?: number;
  period?: string;
  teacher_id?: string;
  created_at?: string;
}

/* -------------------------------
   🔹 Usuario / Docente
-------------------------------- */
export interface Teacher {
  id: string;
  full_name: string;
  email: string;
  role?: "docente" | "directivo" | "supervisor" | "admin";
  institution_id?: string;
}

/* -------------------------------
   🔹 Sesión de asistencia
-------------------------------- */
export interface AttendanceSession {
  id: string;
  course_id: string;
  teacher_id: string;
  date: string; // formato YYYY-MM-DD
  topic?: string;
  created_at: string;
  week_number?: number;
}

/* -------------------------------
   🔹 Registro individual
-------------------------------- */
export interface AttendanceRecord {
  id: string;
  session_id: string;
  course_id: string;
  student_id: string;
  date: string;
  status: AttendanceStatus;
}

/* -------------------------------
   🔹 Inserción de registro
-------------------------------- */
export interface AttendanceInsert {
  session_id: string;
  course_id: string;
  student_id: string;
  date: string;
  status: AttendanceStatus;
}

/* -------------------------------
   🔹 Detalle completo de asistencia
-------------------------------- */
export interface AttendanceDetail {
  id: string;
  status: AttendanceStatus;
  date: string;
  student: {
    id: string;
    full_name: string;
    dni?: string;
    course_id?: string;
  };
}

/* -------------------------------
   🔹 Resumen de asistencia
-------------------------------- */
export interface AttendanceSummary {
  total: number;
  presente: number;
  falta: number;
  tardanza: number;
  justificado: number;
  porcentajes: Record<AttendanceStatus, number>;
}

/* -------------------------------
   🔹 Resumen semanal / planilla
-------------------------------- */
export interface WeeklyAttendanceResult {
  student_id: string;
  full_name: string;
  date: string;
  status: AttendanceStatus;
}

/* -------------------------------
   🔹 Parámetros auxiliares
-------------------------------- */
export interface AttendanceFilter {
  courseId: string;
  startDate?: string;
  endDate?: string;
}

export interface AttendanceUpdate {
  id: string;
  status: AttendanceStatus;
}
