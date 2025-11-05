"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { motion } from "framer-motion";

// 🔹 Tipos de datos reales según Supabase
interface Teacher {
  full_name: string;
}

interface CourseData {
  id: string;
  name: string;
  grade: string | null;
  section: string | null;
  teacher_id: string | null;
  teacher: Teacher[] | null;
}

interface SupabaseStudent {
  id: string;
  full_name: string;
  dni: string | null;
  estado: string;
  nivel_educativo: string;
  courses: CourseData[] | null;
}

// 🔹 Tipo usado en la interfaz de usuario
interface StudentRow {
  id: string;
  full_name: string;
  dni: string | null;
  estado: string;
  nivel_educativo: string;
  course_name: string | null;
  grade: string | null;
  section: string | null;
  teacher_name: string | null;
}

export default function ListaGeneralAlumnos(): React.ReactElement {
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    nivel_educativo: "",
    grade: "",
    section: "",
  });

  useEffect(() => {
    void fetchStudents();
  }, []);

  const fetchStudents = async (): Promise<void> => {
    setLoading(true);
    try {
      // 🔹 Obtener usuario autenticado
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        toast.error("Error al obtener sesión.");
        setLoading(false);
        return;
      }

      // 🔹 Obtener institución del directivo
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("institution_id")
        .eq("id", user.id)
        .single();

      if (userError || !userData?.institution_id) {
        toast.error("No se encontró institución asignada.");
        setLoading(false);
        return;
      }

      const institutionId = userData.institution_id;

      // 🔹 Obtener IDs de cursos de esa institución
      const { data: courseIds, error: courseError } = await supabase
        .from("courses")
        .select("id")
        .eq("institution_id", institutionId);

      if (courseError) throw courseError;

      const courseIdList = courseIds?.map((c) => c.id) || [];

      if (courseIdList.length === 0) {
        setStudents([]);
        setLoading(false);
        return;
      }

      // 🔹 Obtener alumnos con join a curso y docente
      const { data, error } = await supabase
        .from("students")
        .select(
          `
          id,
          full_name,
          dni,
          estado,
          nivel_educativo,
          courses:course_id (
            id,
            name,
            grade,
            section,
            teacher_id,
            teacher:users!courses_teacher_id_fkey (full_name)
          )
        `
        )
        .in("course_id", courseIdList)
        .order("full_name", { ascending: true });

      if (error) throw error;

      // 🔹 Formatear datos limpiando arrays y relaciones
      const formatted: StudentRow[] =
        (data as SupabaseStudent[])?.map((s) => {
          const course = s.courses?.[0];
          const teacher = course?.teacher?.[0];
          return {
            id: s.id,
            full_name: s.full_name,
            dni: s.dni,
            estado: s.estado,
            nivel_educativo: s.nivel_educativo,
            course_name: course?.name ?? null,
            grade: course?.grade ?? null,
            section: course?.section ?? null,
            teacher_name: teacher?.full_name ?? null,
          };
        }) ?? [];

      setStudents(formatted);
    } catch (err) {
      console.error("❌ Error al cargar alumnos:", err);
      toast.error("Error al cargar alumnos.");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    return (
      (!filters.nivel_educativo ||
        s.nivel_educativo === filters.nivel_educativo) &&
      (!filters.grade || s.grade === filters.grade) &&
      (!filters.section || s.section === filters.section)
    );
  });

  return (
    <DashboardLayout role="directivo" title="Lista General de Alumnos">
      <div className="max-w-6xl mx-auto py-10">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-bold mb-8 text-gray-800"
        >
          📋 Lista general de alumnos
        </motion.h2>

        {/* 🔹 Filtros */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            className="border rounded-lg px-3 py-2 text-sm"
            value={filters.nivel_educativo}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                nivel_educativo: e.target.value,
              }))
            }
          >
            <option value="">Todos los niveles</option>
            <option value="Inicial">Inicial</option>
            <option value="Primaria">Primaria</option>
            <option value="Secundaria">Secundaria</option>
          </select>

          <input
            type="text"
            placeholder="Filtrar por grado"
            value={filters.grade}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, grade: e.target.value }))
            }
            className="border rounded-lg px-3 py-2 text-sm"
          />

          <input
            type="text"
            placeholder="Filtrar por sección"
            value={filters.section}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, section: e.target.value }))
            }
            className="border rounded-lg px-3 py-2 text-sm"
          />

          <button
            onClick={() =>
              setFilters({ nivel_educativo: "", grade: "", section: "" })
            }
            className="text-sm px-3 py-2 border rounded-lg hover:bg-gray-50"
          >
            Limpiar filtros
          </button>
        </div>

        {/* 🔹 Tabla */}
        {loading ? (
          <p className="text-gray-500 text-center">Cargando alumnos...</p>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white p-10 rounded-xl text-center text-gray-500 border shadow">
            No hay alumnos registrados.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white rounded-2xl shadow border border-gray-100">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-gray-50 border-b">
                <tr>
                  {[
                    "Nombre",
                    "DNI",
                    "Nivel",
                    "Grado",
                    "Sección",
                    "Curso",
                    "Docente",
                    "Estado",
                  ].map((h) => (
                    <th
                      key={h}
                      className="p-3 text-left font-semibold text-gray-600 uppercase text-xs"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="p-3 font-medium">{s.full_name}</td>
                    <td className="p-3">{s.dni || "—"}</td>
                    <td className="p-3">{s.nivel_educativo}</td>
                    <td className="p-3">{s.grade || "—"}</td>
                    <td className="p-3">{s.section || "—"}</td>
                    <td className="p-3">{s.course_name || "—"}</td>
                    <td className="p-3">{s.teacher_name || "—"}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          s.estado === "activo"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {s.estado.toUpperCase()}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
