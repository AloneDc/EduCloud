"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface Student {
  id: string;
  full_name: string;
  dni: string | null;
  estado: "activo" | "retirado";
  nivel_educativo: string;
  created_at?: string;
}

interface Course {
  id: string;
  name: string;
  nivel_educativo: string;
}

export default function GestionAlumnosPorCurso(): React.ReactElement {
  const { courseId } = useParams() as { courseId: string };
  const [course, setCourse] = useState<Course | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ full_name: "", dni: "" });

  useEffect(() => {
    if (courseId) void fetchData(courseId);
  }, [courseId]);

  // 🔹 Obtener datos del curso + alumnos
  const fetchData = async (id: string): Promise<void> => {
    setLoading(true);
    try {
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, name, nivel_educativo")
        .eq("id", id)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      const { data: studentsData, error: studentsError } = await supabase
        .from("students")
        .select("id, full_name, dni, estado, nivel_educativo, created_at")
        .eq("course_id", id)
        .order("full_name", { ascending: true });

      if (studentsError) throw studentsError;
      setStudents(studentsData || []);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar datos del curso.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Crear nuevo alumno (usando endpoint seguro)
  const handleCreate = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!form.full_name) {
      toast.warning("El nombre del alumno es obligatorio.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("Sesión no válida.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/students/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: form.full_name,
          dni: form.dni || null,
          nivel_educativo: course?.nivel_educativo,
          course_id: courseId,
          director_id: user.id,
        }),
      });

      const result = await res.json();

      if (!res.ok)
        throw new Error(result.error || "Error al registrar alumno.");

      toast.success("✅ Alumno matriculado correctamente.");
      setModalOpen(false);
      setForm({ full_name: "", dni: "" });
      void fetchData(courseId);
    } catch (err) {
      console.error(err);
      toast.error("Error al registrar alumno.");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Cambiar estado (activo / retirado)
  const handleToggleEstado = async (
    id: string,
    estado: string
  ): Promise<void> => {
    const nuevoEstado = estado === "activo" ? "retirado" : "activo";
    const { error } = await supabase
      .from("students")
      .update({ estado: nuevoEstado })
      .eq("id", id);

    if (error) {
      toast.error("Error al cambiar estado del alumno.");
    } else {
      toast.success(
        `Alumno ${
          nuevoEstado === "activo" ? "reactivado" : "retirado"
        } correctamente.`
      );
      void fetchData(courseId);
    }
  };

  return (
    <DashboardLayout role="directivo" title="Gestión de Alumnos">
      <div className="max-w-5xl mx-auto py-10">
        {loading ? (
          <p className="text-gray-500 text-center">Cargando...</p>
        ) : !course ? (
          <p className="text-center text-gray-500">
            No se encontró información del curso.
          </p>
        ) : (
          <>
            {/* Encabezado */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-between items-center mb-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {course.name}
                </h2>
                <p className="text-gray-600 text-sm">
                  Nivel: {course.nivel_educativo}
                </p>
              </div>

              <button
                onClick={() => setModalOpen(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                + Nuevo Alumno
              </button>
            </motion.div>

            {/* Tabla de alumnos */}
            {students.length === 0 ? (
              <div className="bg-white p-10 rounded-xl text-center text-gray-500 border shadow">
                No hay alumnos registrados aún.
              </div>
            ) : (
              <div className="overflow-x-auto bg-white rounded-2xl shadow border border-gray-100">
                <table className="w-full border-collapse text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      {["Nombre", "DNI", "Nivel", "Estado", "Acción"].map(
                        (h) => (
                          <th
                            key={h}
                            className="p-3 text-left font-semibold text-gray-600 uppercase text-xs"
                          >
                            {h}
                          </th>
                        )
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, i) => (
                      <motion.tr
                        key={s.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="p-3 font-medium">{s.full_name}</td>
                        <td className="p-3">{s.dni || "—"}</td>
                        <td className="p-3">{s.nivel_educativo}</td>
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
                        <td className="p-3 text-right">
                          <button
                            onClick={() =>
                              void handleToggleEstado(s.id, s.estado)
                            }
                            className={`px-3 py-1 text-sm font-semibold rounded-lg border ${
                              s.estado === "activo"
                                ? "text-red-600 border-red-300 hover:bg-red-50"
                                : "text-green-600 border-green-300 hover:bg-green-50"
                            } transition`}
                          >
                            {s.estado === "activo" ? "Retirar" : "Reactivar"}
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl"
          >
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              Registrar nuevo alumno
            </h3>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, full_name: e.target.value }))
                  }
                  className="w-full border px-3 py-2 rounded-lg"
                  placeholder="Ej. Luis Fernández"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">DNI</label>
                <input
                  type="text"
                  value={form.dni}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, dni: e.target.value }))
                  }
                  className="w-full border px-3 py-2 rounded-lg"
                  placeholder="Ej. 45879512"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
