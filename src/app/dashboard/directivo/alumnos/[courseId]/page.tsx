"use client";

import { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  getStudentsByCourse,
  addStudentToCourse,
  deleteStudent,
} from "@/lib/studentService";
import { motion } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { useParams } from "next/navigation";

interface Student {
  id: string;
  full_name: string;
  dni?: string;
  created_at?: string;
}

export default function GestionAlumnosCursoPage() {
  const params = useParams();
  const courseId = params?.courseId as string;

  const [students, setStudents] = useState<Student[]>([]);
  const [fullName, setFullName] = useState("");
  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState("");

  // ✅ useCallback evita que loadStudents cambie en cada render
  const loadStudents = useCallback(async () => {
    if (!courseId) return;
    setLoading(true);
    try {
      const data = await getStudentsByCourse(courseId);
      setStudents(data);
    } catch (error) {
      console.error("❌ Error al cargar estudiantes:", error);
      setFeedback("❌ Error al cargar estudiantes.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]); // ✅ ya no dará warning

  const handleAdd = async () => {
    if (!fullName.trim()) {
      setFeedback("⚠️ Ingresa un nombre válido.");
      return;
    }

    setSaving(true);
    try {
      await addStudentToCourse(courseId, { full_name: fullName, dni });
      setFullName("");
      setDni("");
      setFeedback("✅ Alumno agregado correctamente.");
      await loadStudents();
    } catch (err) {
      console.error("❌ Error al agregar alumno:", err);
      setFeedback("❌ Error al agregar alumno.");
    } finally {
      setSaving(false);
      setTimeout(() => setFeedback(""), 2500);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este alumno?")) return;
    try {
      await deleteStudent(id);
      setFeedback("🗑️ Alumno eliminado correctamente.");
      await loadStudents();
    } catch (err) {
      console.error("❌ Error al eliminar alumno:", err);
      setFeedback("❌ Error al eliminar alumno.");
    } finally {
      setTimeout(() => setFeedback(""), 2500);
    }
  };

  return (
    <DashboardLayout role="directivo" title="Gestión de Alumnos">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-4xl mx-auto py-8"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Alumnos del curso
        </h2>

        {/* Formulario para agregar alumno */}
        <div className="bg-white p-5 rounded-2xl border shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nombre completo"
              className="border rounded-xl p-2 w-full"
            />
            <input
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              placeholder="DNI (opcional)"
              className="border rounded-xl p-2 w-full sm:w-48"
            />
            <button
              onClick={handleAdd}
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-4 py-2 flex items-center gap-1"
            >
              <Plus size={16} /> {saving ? "Guardando..." : "Agregar"}
            </button>
          </div>
        </div>

        {/* Tabla de alumnos */}
        {loading ? (
          <p className="text-gray-500 text-center">Cargando alumnos...</p>
        ) : students.length === 0 ? (
          <p className="text-gray-500 text-center">
            No hay alumnos registrados.
          </p>
        ) : (
          <table className="w-full bg-white border rounded-2xl shadow-sm">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3">Nombre</th>
                <th className="p-3">DNI</th>
                <th className="p-3 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{s.full_name}</td>
                  <td className="p-3">{s.dni || "—"}</td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {feedback && (
          <p
            className={`mt-4 text-center text-sm font-medium ${
              feedback.startsWith("✅")
                ? "text-green-600"
                : feedback.startsWith("❌")
                ? "text-red-600"
                : feedback.startsWith("⚠️")
                ? "text-yellow-600"
                : "text-gray-700"
            }`}
          >
            {feedback}
          </p>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
