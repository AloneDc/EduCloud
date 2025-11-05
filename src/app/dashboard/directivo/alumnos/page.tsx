"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { motion } from "framer-motion";
import { User, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface Teacher {
  id: string;
  full_name: string;
  role: string;
  courses: Course[];
}

interface Course {
  id: string;
  name: string;
  grade?: string;
  section?: string;
  level?: string;
  nivel_educativo?: string;
}

export default function GestionAlumnosPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeachersAndCourses();
  }, []);

  const fetchTeachersAndCourses = async () => {
    setLoading(true);

    // 🔍 Obtener usuario actual
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      toast.error("Error al obtener sesión.");
      setLoading(false);
      return;
    }

    // 🏫 Obtener institución del directivo
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

    // 👩‍🏫 Obtener docentes de la institución
    const { data: teachersData, error: teachersError } = await supabase
      .from("users")
      .select("id, full_name, role")
      .eq("institution_id", institutionId)
      .eq("role", "docente")
      .order("full_name", { ascending: true });

    if (teachersError) {
      toast.error("Error al cargar docentes.");
      setLoading(false);
      return;
    }

    // 📘 Obtener cursos de la institución
    const { data: coursesData, error: coursesError } = await supabase
      .from("courses")
      .select("id, name, grade, section, level, nivel_educativo, teacher_id")
      .eq("institution_id", institutionId)
      .eq("archived", false)
      .order("name", { ascending: true });

    if (coursesError) {
      toast.error("Error al cargar cursos.");
      setLoading(false);
      return;
    }

    // 🧩 Vincular cursos con docentes
    const teachersWithCourses = teachersData.map((t) => ({
      ...t,
      courses: (coursesData || []).filter((c) => c.teacher_id === t.id),
    }));

    setTeachers(teachersWithCourses);
    setLoading(false);
  };

  return (
    <DashboardLayout role="directivo" title="Gestión de Alumnos por Curso">
      <div className="max-w-6xl mx-auto py-10">
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-3xl font-extrabold mb-8 flex items-center gap-2 text-gray-800"
        >
          <User className="text-blue-600" /> Docentes y Cursos
        </motion.h2>

        {loading ? (
          <p className="text-gray-500 text-center py-10">
            Cargando docentes...
          </p>
        ) : teachers.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No hay docentes registrados en tu institución.
          </p>
        ) : (
          <div className="space-y-8">
            {teachers.map((teacher, index) => (
              <motion.div
                key={teacher.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-blue-700 mb-3">
                  👩‍🏫 {teacher.full_name}
                </h3>

                {teacher.courses && teacher.courses.length > 0 ? (
                  <ul className="space-y-3">
                    {teacher.courses.map((course) => (
                      <li
                        key={course.id}
                        className="flex justify-between items-center border-b border-gray-100 pb-2"
                      >
                        <div>
                          <p className="font-medium text-gray-800">
                            {course.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {course.grade || ""} {course.section || ""} —{" "}
                            {course.nivel_educativo || course.level || ""}
                          </p>
                        </div>

                        <Link
                          href={`/dashboard/directivo/alumnos/${course.id}`}
                          className="text-sm text-blue-600 font-semibold hover:underline flex items-center gap-1"
                        >
                          <BookOpen size={16} /> Gestionar alumnos
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500 text-sm">
                    Este docente no tiene cursos asignados.
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
