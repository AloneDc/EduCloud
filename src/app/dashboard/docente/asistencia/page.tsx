"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { CalendarDays, BookOpen } from "lucide-react";

interface Course {
  id: string;
  name: string;
  area?: string;
  period: string;
  teacher_id: string;
}

export default function AsistenciaCursosPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);

      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        console.error(
          "⚠️ Usuario no autenticado o error de sesión:",
          authError
        );
        setLoading(false);
        return;
      }

      console.log("✅ Usuario autenticado:", user.id, user.email);

      // 🔹 Verificamos si la tabla tiene coincidencias exactas
      const { data, error } = await supabase
        .from("courses")
        .select("id, name, area, period, teacher_id")
        .eq("teacher_id", user.id)
        .order("name", { ascending: true });

      if (error) {
        console.error("❌ Error al cargar cursos:", error.message);
      } else {
        console.log("📚 Cursos encontrados:", data);
        setCourses(data || []);
      }

      setLoading(false);
    };

    fetchCourses();
  }, []);

  return (
    <DashboardLayout role="docente" title="Asistencia por Curso">
      <div className="max-w-6xl mx-auto py-10">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 flex items-center gap-2">
          <CalendarDays className="text-blue-600" /> Asistencia de mis cursos
        </h2>

        {loading ? (
          <div className="text-center py-10 text-gray-500">
            Cargando cursos...
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <BookOpen className="mx-auto text-blue-500 mb-3" size={42} />
            <p className="text-gray-600 font-medium">
              No tienes cursos asignados actualmente.
            </p>
            <p className="text-gray-500 text-sm mt-2">
              Consulta con tu administrador para verificar tu asignación.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <Link
                key={course.id}
                href={`/dashboard/docente/asistencia/${course.id}`}
                className="group bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-400 transition flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-blue-700 text-lg mb-1">
                    {course.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {course.area || "Área no especificada"}
                  </p>
                </div>
                <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                  <span>Periodo: {course.period}</span>
                  <CalendarDays size={16} className="text-blue-600" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
