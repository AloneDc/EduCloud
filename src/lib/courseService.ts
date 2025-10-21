import { supabase } from "./supabaseClient";

/* ------------------------------------------------------------
 * 🧱 Tipo base: Course
 * ---------------------------------------------------------- */
export interface Course {
  id: string;
  teacher_id: string;
  name: string;
  grade: string;
  section?: string;
  level?: string;
  year?: string | number; // 👈 Permite ambas opciones
  period?: string;
  created_at?: string;
}

/* ------------------------------------------------------------
 * 🔹 Obtener todos los cursos de un docente
 * ---------------------------------------------------------- */
export async function getCoursesByTeacher(
  teacherId: string
): Promise<Course[]> {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Error al obtener cursos: ${error.message}`);
  return (data ?? []) as Course[];
}

/* ------------------------------------------------------------
 * 🔹 Crear un nuevo curso
 * ---------------------------------------------------------- */
export async function createCourse(
  teacherId: string,
  courseData: Omit<Course, "id" | "teacher_id" | "created_at">
): Promise<Course[]> {
  const { data, error } = await supabase
    .from("courses")
    .insert([
      {
        teacher_id: teacherId,
        name: courseData.name,
        grade: courseData.grade,
        section: courseData.section || "",
        level: courseData.level || "",
        year: courseData.year || "",
        period: courseData.period || "",
      },
    ])
    .select("*"); // ✅ Devuelve el registro recién creado

  if (error) throw new Error(`Error al crear curso: ${error.message}`);
  return (data ?? []) as Course[];
}

/* ------------------------------------------------------------
 * 🔹 Obtener un curso específico por ID
 * ---------------------------------------------------------- */
export async function getCourseById(courseId: string): Promise<Course | null> {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (error) throw new Error(`Error al obtener el curso: ${error.message}`);
  return data as Course;
}
