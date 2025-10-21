"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getCoursesByTeacher, Course } from "@/lib/courseService"; // 👈 Importamos el tipo real
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { BookOpen, FolderPlus, RefreshCw, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

export default function DocenteDashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      setError(null);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("No se encontró el usuario autenticado.");

      const data = await getCoursesByTeacher(user.id);
      // 👇 Aseguramos compatibilidad con el tipo del estado
      setCourses(
        (data ?? []).map((c) => ({
          ...c,
          id: c.id || "", // Garantiza que id nunca sea undefined
        }))
      );
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error("Error al cargar cursos:", err.message);
        setError("❌ " + err.message);
      } else {
        console.error("Error desconocido:", err);
        setError("❌ Ocurrió un error inesperado al cargar tus cursos.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <DashboardLayout role="docente" title="Mis Cursos">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
            📘 Portafolio de Cursos
          </h2>
          <p className="text-gray-500 mt-1 text-sm">
            Tienes {courses.length} curso{courses.length !== 1 ? "s" : ""}{" "}
            registrados
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={fetchCourses}
            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition border border-gray-300"
          >
            <RefreshCw size={16} /> Actualizar
          </button>
          <Link
            href="/dashboard/docente/nuevo-curso"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition"
          >
            <FolderPlus size={18} /> Nuevo curso
          </Link>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start gap-3 text-red-700">
          <AlertTriangle size={20} className="mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Cargando */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 text-gray-500">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          >
            <RefreshCw size={36} className="text-blue-500 mb-4" />
          </motion.div>
          <p className="text-sm">Cargando tus cursos...</p>
        </div>
      )}

      {/* Sin cursos */}
      {!loading && courses.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-12 bg-white rounded-2xl shadow-md border border-gray-200"
        >
          <BookOpen size={48} className="mx-auto text-blue-500 mb-3" />
          <p className="text-gray-700 font-semibold mb-1">
            Aún no tienes cursos registrados
          </p>
          <p className="text-gray-500 text-sm mb-4">
            Crea tu primer curso para comenzar a subir tus planificaciones e
            informes.
          </p>
          <Link
            href="/dashboard/docente/nuevo-curso"
            className="inline-block bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition"
          >
            Crear un curso →
          </Link>
        </motion.div>
      )}

      {/* Lista de cursos */}
      {!loading && courses.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
        >
          {courses.map((c) => (
            <motion.div
              key={c.id}
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 200, damping: 12 }}
            >
              <Link
                href={`/dashboard/docente/curso/${c.id}`}
                className="group bg-gradient-to-br from-blue-50 to-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:border-blue-400 transition-all duration-300 p-6 flex flex-col justify-between h-full"
              >
                <div>
                  <h3 className="font-bold text-blue-700 text-lg mb-1 group-hover:text-blue-800 transition">
                    {c.name}
                  </h3>
                  <p className="text-gray-600 text-sm truncate">
                    {c.grade}° {c.section} • {c.level}
                  </p>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-500">
                    Periodo: {c.period} ({c.year})
                  </p>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}
    </DashboardLayout>
  );
}
