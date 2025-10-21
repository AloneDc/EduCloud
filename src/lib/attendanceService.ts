import { supabase } from "./supabaseClient";

/**
 * 🔹 Obtener lista de estudiantes de un curso
 */
export async function getStudentsByCourse(courseId: string) {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("course_id", courseId)
    .order("full_name", { ascending: true });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/**
 * 🔹 Guardar asistencia de los estudiantes
 */
export async function saveAttendance(
  courseId: string,
  date: string,
  topic: string,
  records: Record<string, string>
) {
  const { data: authData, error: authError } = await supabase.auth.getUser();

  if (authError)
    throw new Error("Error al obtener el usuario: " + authError.message);
  if (!authData?.user)
    throw new Error("No hay sesión activa. Inicia sesión nuevamente.");

  const user = authData.user; // ✅ TypeScript ya sabe que no es null

  // Crear la sesión de asistencia
  const { data: session, error: sessionError } = await supabase
    .from("attendance_sessions")
    .insert([
      {
        course_id: courseId,
        teacher_id: user.id,
        date,
        topic,
      },
    ])
    .select()
    .single();

  if (sessionError)
    throw new Error("Error al crear sesión: " + sessionError.message);

  // Construir registros de asistencia
  const attendanceData = Object.entries(records).map(
    ([student_id, status]) => ({
      session_id: session.id,
      student_id,
      status,
    })
  );

  // Insertar asistencia
  const { error: insertError } = await supabase
    .from("attendance")
    .insert(attendanceData);
  if (insertError)
    throw new Error("Error al guardar asistencia: " + insertError.message);

  return true;
}
