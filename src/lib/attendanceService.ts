import { supabase } from "@/lib/supabaseClient";
import type {
  AttendanceStatus,
  Student,
  AttendanceSession,
} from "@/types/attendance";
import {
  toLocalDateISO,
  getMondayOfCurrentWeekLocal,
  parseLocalDate,
  getWeekDaysRange,
} from "@/lib/dateUtils";

/* ============================================
   🧠 Tipos internos y auxiliares
============================================ */
export interface AttendanceInsert {
  session_id: string;
  course_id: string;
  student_id: string;
  date: string;
  status: AttendanceStatus;
}

export interface AttendanceRecord extends AttendanceInsert {
  id: string;
}

export interface AttendanceDetail {
  id: string;
  status: AttendanceStatus;
  date: string;
  student: Omit<Student, "course_id"> & { course_id?: string };
}

export interface AttendanceSummary {
  total: number;
  presente: number;
  falta: number;
  tardanza: number;
  justificado: number;
  porcentajes: Record<AttendanceStatus, number>;
}

export interface WeeklyAttendanceResult {
  student_id: string;
  full_name: string;
  date: string;
  status: AttendanceStatus;
}

/* ============================================
   🔹 Obtener estudiantes por curso
============================================ */
export async function getStudentsByCourse(
  courseId: string
): Promise<Student[]> {
  const { data, error } = await supabase
    .from("students")
    .select("id, full_name, dni, course_id")
    .eq("course_id", courseId)
    .order("full_name", { ascending: true });

  if (error) throw new Error(`Error al obtener estudiantes: ${error.message}`);
  return data ?? [];
}

/* ============================================
   🔹 Obtener sesión del día
============================================ */
export async function getSessionByDate(
  courseId: string,
  date: string
): Promise<AttendanceSession | null> {
  // ✅ date ya viene en formato "YYYY-MM-DD", no convertir
  const { data, error } = await supabase
    .from("attendance_sessions")
    .select("id, course_id, teacher_id, date, created_at, topic")
    .eq("course_id", courseId)
    .eq("date", date)
    .maybeSingle();

  if (error) return null;
  return data ?? null;
}

/* ============================================
   🔹 Verificar si la sesión es editable (≤ 24h)
============================================ */
export async function isSessionEditable(sessionId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("attendance_sessions")
    .select("created_at")
    .eq("id", sessionId)
    .single();

  if (error || !data?.created_at) return false;

  const diffHours =
    (Date.now() - new Date(data.created_at).getTime()) / (1000 * 60 * 60);
  return diffHours <= 24;
}

/* ============================================
   🔹 Guardar asistencia
============================================ */
export async function saveAttendance(
  courseId: string,
  date: string, // Ya viene en formato "YYYY-MM-DD"
  topic: string,
  records: Record<string, AttendanceStatus>
): Promise<void> {
  // ✅ NO convertir - date ya está en el formato correcto
  // ❌ ANTES: const localDate = toLocalDateString(date);
  // ✅ AHORA: usar directamente el string
  const localDate = date;

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData?.user) throw new Error("Usuario no autenticado.");

  const teacherId = authData.user.id;

  // Verificar si ya existe una sesión para esta fecha
  const existingSession = await getSessionByDate(courseId, localDate);
  if (existingSession)
    throw new Error("Ya existe una sesión registrada para esta fecha.");

  // Crear la sesión de asistencia
  const { data: session, error: sessionError } = await supabase
    .from("attendance_sessions")
    .insert([
      {
        course_id: courseId,
        teacher_id: teacherId,
        date: localDate, // ✅ String directo
        topic,
      },
    ])
    .select()
    .single<AttendanceSession>();

  if (sessionError || !session)
    throw new Error("Error al crear sesión de asistencia.");

  const validStatuses: AttendanceStatus[] = [
    "presente",
    "falta",
    "tardanza",
    "justificado",
  ];

  // Preparar datos de asistencia
  const attendanceData: AttendanceInsert[] = Object.entries(records)
    .map(([student_id, rawStatus]) => {
      const status = rawStatus.toLowerCase() as AttendanceStatus;
      if (!validStatuses.includes(status)) return null;
      return {
        session_id: session.id,
        course_id: courseId,
        student_id,
        date: localDate, // ✅ String directo
        status,
      };
    })
    .filter((r): r is AttendanceInsert => r !== null);

  if (attendanceData.length === 0)
    throw new Error("No hay registros válidos para guardar.");

  // Insertar registros de asistencia
  const { error: insertError } = await supabase
    .from("attendance")
    .insert(attendanceData);

  if (insertError)
    throw new Error(`Error al guardar registros: ${insertError.message}`);
}

/* ============================================
   🔹 Obtener registros por sesión
============================================ */
interface AttendanceQueryRow {
  id: string;
  status: AttendanceStatus;
  date: string;
  students:
    | { id: string; full_name: string; dni?: string; course_id?: string }
    | { id: string; full_name: string; dni?: string; course_id?: string }[]
    | null;
}

export async function getAttendanceBySession(
  sessionId: string
): Promise<AttendanceDetail[]> {
  const { data, error } = await supabase
    .from("attendance")
    .select(
      `
      id,
      status,
      date,
      students:student_id (
        id,
        full_name,
        dni,
        course_id
      )
    `
    )
    .eq("session_id", sessionId);

  if (error) throw new Error("Error al obtener registros de asistencia.");
  if (!data) return [];

  const normalized: AttendanceDetail[] = (data as AttendanceQueryRow[]).map(
    (record) => {
      const studentData = Array.isArray(record.students)
        ? record.students[0]
        : record.students;

      return {
        id: record.id,
        status: record.status,
        date: record.date,
        student: {
          id: studentData?.id ?? "",
          full_name: studentData?.full_name ?? "Sin nombre",
          dni: studentData?.dni ?? "",
          course_id: studentData?.course_id,
        },
      };
    }
  );

  return normalized.sort((a, b) =>
    a.student.full_name.localeCompare(b.student.full_name, "es", {
      sensitivity: "base",
    })
  );
}

/* ============================================
   🔹 Resumen global por curso
============================================ */
export async function getAttendanceSummary(
  courseId: string
): Promise<AttendanceSummary> {
  const { data, error } = await supabase
    .from("attendance")
    .select("status, session_id, attendance_sessions!inner(course_id)")
    .eq("attendance_sessions.course_id", courseId);

  if (error) throw new Error("Error al generar el resumen de asistencia.");

  const counts: Record<AttendanceStatus, number> = {
    presente: 0,
    falta: 0,
    tardanza: 0,
    justificado: 0,
  };

  data?.forEach((r) => {
    const s = r.status as AttendanceStatus;
    if (s in counts) counts[s]++;
  });

  const total = data?.length ?? 0;
  const porcentajes = Object.fromEntries(
    Object.entries(counts).map(([k, v]) => [k, total ? (v / total) * 100 : 0])
  ) as Record<AttendanceStatus, number>;

  return { total, ...counts, porcentajes };
}

/* ============================================
   🔹 Asistencia semanal (planilla)
============================================ */
export async function getWeeklyAttendance(
  courseId: string,
  weekStart: string // Ya viene en formato "YYYY-MM-DD"
): Promise<WeeklyAttendanceResult[]> {
  // ✅ Usar parseLocalDate para evitar desfase
  const weekStartDate = parseLocalDate(weekStart);
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekStartDate.getDate() + 4); // Lunes + 4 días = Viernes

  const weekStartISO = toLocalDateISO(weekStartDate);
  const weekEndISO = toLocalDateISO(weekEndDate);

  const { data, error } = await supabase
    .from("attendance")
    .select(
      `
      student_id,
      status,
      date,
      students!inner(full_name)
    `
    )
    .eq("course_id", courseId)
    .gte("date", weekStartISO)
    .lte("date", weekEndISO)
    .order("date", { ascending: true });

  if (error)
    throw new Error(
      `No se pudo obtener la asistencia semanal: ${error.message}`
    );

  if (!data || data.length === 0) return [];

  return (
    data as {
      student_id: string;
      status: AttendanceStatus;
      date: string;
      students: { full_name: string } | { full_name: string }[];
    }[]
  ).map((r) => {
    const studentData = Array.isArray(r.students) ? r.students[0] : r.students;

    return {
      student_id: r.student_id,
      full_name: studentData?.full_name ?? "Sin nombre",
      date: r.date,
      status: r.status,
    };
  });
}

/* ============================================
   🔹 Exportar asistencia como CSV
============================================ */
export async function exportAttendanceCSV(courseId: string): Promise<Blob> {
  interface AttendanceCSVRow {
    date: string;
    status: AttendanceStatus;
    students: { full_name: string } | { full_name: string }[];
    attendance_sessions: { topic: string } | { topic: string }[];
  }

  const { data, error } = await supabase
    .from("attendance")
    .select(
      `
      date,
      status,
      students!inner(full_name),
      attendance_sessions!inner(topic)
    `
    )
    .eq("attendance_sessions.course_id", courseId)
    .order("date", { ascending: true });

  if (error) throw new Error(`Error al exportar CSV: ${error.message}`);
  if (!data || data.length === 0)
    throw new Error("No hay registros de asistencia para exportar.");

  const rows = data as AttendanceCSVRow[];

  const csvHeader = "Fecha,Alumno,Estado,Tema\n";

  const csvRows = rows
    .map((r) => {
      const student =
        Array.isArray(r.students) && r.students.length > 0
          ? r.students[0].full_name
          : (r.students as { full_name: string })?.full_name ?? "Sin nombre";

      const topic =
        Array.isArray(r.attendance_sessions) && r.attendance_sessions.length > 0
          ? r.attendance_sessions[0].topic
          : (r.attendance_sessions as { topic: string })?.topic ?? "-";

      return `${r.date},"${student}",${r.status},"${topic}"`;
    })
    .join("\n");

  return new Blob([csvHeader + csvRows], { type: "text/csv;charset=utf-8" });
}

/* ============================================
   🔹 Obtener historial de sesiones por curso
============================================ */
export async function getAttendanceHistory(courseId: string): Promise<
  {
    id: string;
    date: string;
    topic: string;
    total_presentes: number;
    total_faltas: number;
    total_tardanzas: number;
    total_justificados: number;
  }[]
> {
  const { data, error } = await supabase
    .from("attendance_sessions")
    .select(
      `
      id,
      date,
      topic,
      attendance (
        status
      )
    `
    )
    .eq("course_id", courseId)
    .order("date", { ascending: false });

  if (error) {
    console.error("❌ Error al obtener historial:", error.message);
    throw new Error(`Error al obtener historial: ${error.message}`);
  }

  if (!data) return [];

  // Mapear y contar estados de asistencia
  return data.map((session) => {
    const counts = {
      total_presentes: 0,
      total_faltas: 0,
      total_tardanzas: 0,
      total_justificados: 0,
    };

    (session.attendance ?? []).forEach((r: { status: string }) => {
      switch (r.status) {
        case "presente":
          counts.total_presentes++;
          break;
        case "falta":
          counts.total_faltas++;
          break;
        case "tardanza":
          counts.total_tardanzas++;
          break;
        case "justificado":
          counts.total_justificados++;
          break;
      }
    });

    return {
      id: session.id,
      date: session.date,
      topic: session.topic ?? "-",
      ...counts,
    };
  });
}

/* ============================================
   🧮 Exportar funciones de utilidades
============================================ */
export { getMondayOfCurrentWeekLocal, getWeekDaysRange };
