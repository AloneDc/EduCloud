"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import Link from "next/link";
import { getTeachersWithCourses } from "@/lib/studentService";
import { User, BookOpen } from "lucide-react";

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
  teacher_id: string;
}

export default function GestionAlumnosPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getTeachersWithCourses();
        setTeachers(data);
      } catch (err) {
        console.error("❌ Error cargando docentes:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <DashboardLayout role="directivo" title="Gestión de Alumnos por Curso">
      <div className="max-w-6xl mx-auto py-10">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
          <User className="text-blue-600" /> Docentes y Cursos
        </h2>

        {loading ? (
          <p className="text-gray-500 text-center">Cargando docentes...</p>
        ) : teachers.length === 0 ? (
          <p className="text-center text-gray-500 py-10">
            No se encontraron docentes registrados.
          </p>
        ) : (
          <div className="space-y-8">
            {teachers.map((teacher) => (
              <div
                key={teacher.id}
                className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold text-blue-700 mb-2">
                  {teacher.full_name}
                </h3>

                {teacher.courses && teacher.courses.length > 0 ? (
                  <ul className="space-y-2">
                    {teacher.courses.map((course) => (
                      <li
                        key={course.id}
                        className="flex justify-between items-center border-b py-2"
                      >
                        <div>
                          <p className="font-medium">{course.name}</p>
                          <p className="text-sm text-gray-500">
                            {course.grade || ""} {course.section || ""} —{" "}
                            {course.level || ""}
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
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
