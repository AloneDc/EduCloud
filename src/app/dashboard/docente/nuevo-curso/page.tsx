"use client";

import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { createCourse } from "@/lib/courseService";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { BookOpen, Calendar, Layers } from "lucide-react";

export default function NuevoCursoPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    grade: "",
    section: "",
    level: "",
    year: new Date().getFullYear(),
    period: "",
  });
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) throw new Error("Usuario no autenticado");

      await createCourse(user.id, form);

      setStatus("✅ Curso creado correctamente");
      setTimeout(() => router.push("/dashboard/docente"), 1000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setStatus("❌ Error: " + err.message);
      } else {
        setStatus("❌ Error desconocido al crear el curso.");
        console.error("Error inesperado:", err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout role="docente" title="Registrar Nuevo Curso">
      <div className="flex justify-center py-10 bg-gray-50 min-h-screen">
        <form
          onSubmit={handleSubmit}
          className="bg-gradient-to-br from-white to-blue-50 border border-gray-200 shadow-md rounded-2xl p-8 w-full max-w-xl"
        >
          <div className="flex items-center gap-3 mb-6">
            <BookOpen className="text-blue-600" size={28} />
            <h2 className="text-2xl font-bold text-gray-800">
              Registrar nuevo curso
            </h2>
          </div>

          <div className="space-y-5">
            {/* Nombre del curso */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Nombre del curso
              </label>
              <input
                type="text"
                placeholder="Ejemplo: Matemática"
                className="w-full border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 px-4 py-2 rounded-lg transition"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>

            {/* Grado y Sección */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Grado
                </label>
                <input
                  type="text"
                  placeholder="Ej: 3°"
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 px-4 py-2 rounded-lg transition"
                  value={form.grade}
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Sección
                </label>
                <input
                  type="text"
                  placeholder="Ej: B"
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 px-4 py-2 rounded-lg transition"
                  value={form.section}
                  onChange={(e) =>
                    setForm({ ...form, section: e.target.value })
                  }
                  required
                />
              </div>
            </div>

            {/* Nivel */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                <Layers size={16} /> Nivel educativo
              </label>
              <input
                type="text"
                placeholder="Ej: Secundaria"
                className="w-full border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 px-4 py-2 rounded-lg transition"
                value={form.level}
                onChange={(e) => setForm({ ...form, level: e.target.value })}
              />
            </div>

            {/* Año y periodo */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Año académico
                </label>
                <input
                  type="number"
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 px-4 py-2 rounded-lg transition"
                  value={form.year}
                  onChange={(e) => setForm({ ...form, year: +e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                  <Calendar size={16} /> Periodo
                </label>
                <input
                  type="text"
                  placeholder="Ej: 2025-I"
                  className="w-full border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-100 px-4 py-2 rounded-lg transition"
                  value={form.period}
                  onChange={(e) =>
                    setForm({ ...form, period: e.target.value.toUpperCase() })
                  }
                />
              </div>
            </div>

            {/* Botón */}
            <button
              disabled={loading}
              type="submit"
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg shadow-sm transition"
            >
              {loading ? "Guardando curso..." : "💾 Guardar curso"}
            </button>

            {/* Mensaje de estado */}
            {status && (
              <div
                className={`text-center mt-3 text-sm font-medium ${
                  status.startsWith("✅") ? "text-green-600" : "text-red-600"
                }`}
              >
                {status}
              </div>
            )}
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
