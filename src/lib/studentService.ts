import { supabase } from "./supabaseClient";

/**
 * 🔹 Obtiene todos los docentes registrados con sus cursos asignados.
 * No depende de relaciones internas de Supabase (evita errores {}).
 */
export async function getTeachersWithCourses() {
  // 1️⃣ Obtener docentes
  const { data: teachers, error: tError } = await supabase
    .from("users")
    .select("id, full_name, role")
    .eq("role", "docente");

  if (tError) {
    console.error("❌ Error cargando docentes:", tError.message);
    throw tError;
  }

  // 2️⃣ Obtener cursos con su docente asignado
  const { data: courses, error: cError } = await supabase
    .from("courses")
    .select("id, name, grade, section, level, teacher_id");

  if (cError) {
    console.error("❌ Error cargando cursos:", cError.message);
    throw cError;
  }

  // 3️⃣ Combinar docentes con sus cursos
  const teachersWithCourses = teachers.map((teacher) => ({
    ...teacher,
    courses: courses.filter((c) => c.teacher_id === teacher.id),
  }));

  return teachersWithCourses;
}

/**
 * 🔹 Obtiene los estudiantes registrados de un curso específico.
 */
export async function getStudentsByCourse(courseId: string) {
  const { data, error } = await supabase
    .from("students")
    .select("id, full_name, dni, created_at")
    .eq("course_id", courseId)
    .order("full_name", { ascending: true });

  if (error) {
    console.error("❌ Error cargando estudiantes:", error.message);
    throw error;
  }

  return data || [];
}

/**
 * 🔹 Agrega un nuevo estudiante al curso indicado.
 */
export async function addStudentToCourse(
  courseId: string,
  studentData: { full_name: string; dni?: string }
) {
  const { error } = await supabase.from("students").insert([
    {
      course_id: courseId,
      full_name: studentData.full_name.trim(),
      dni: studentData.dni?.trim() || null,
    },
  ]);

  if (error) {
    console.error("❌ Error al agregar estudiante:", error.message);
    throw error;
  }
}

/**
 * 🔹 Elimina un estudiante por su ID.
 */
export async function deleteStudent(studentId: string) {
  const { error } = await supabase
    .from("students")
    .delete()
    .eq("id", studentId);
  if (error) {
    console.error("❌ Error eliminando estudiante:", error.message);
    throw error;
  }
}
