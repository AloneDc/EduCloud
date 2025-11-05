"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { motion } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface Docente {
  id: string;
  full_name: string;
  email: string;
  nivel_educativo: string;
  active: boolean;
}

export default function GestionDocentes() {
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocentes();
  }, []);

  // 🧩 Obtener docentes de la institución del directivo
  const fetchDocentes = async () => {
    setLoading(true);

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      toast.error("No se pudo obtener la sesión del usuario.");
      setLoading(false);
      return;
    }

    // Obtener institución del directivo
    const { data: directivoData, error: userError } = await supabase
      .from("users")
      .select("institution_id")
      .eq("id", user.id)
      .single();

    if (userError || !directivoData?.institution_id) {
      toast.error("Error: el directivo no tiene institución asignada.");
      setLoading(false);
      return;
    }

    // Cargar docentes de la misma institución
    const { data, error } = await supabase
      .from("users")
      .select("id, full_name, email, nivel_educativo, active")
      .eq("role", "docente")
      .eq("institution_id", directivoData.institution_id)
      .order("full_name", { ascending: true });

    if (error) {
      console.error("Error al cargar docentes:", error);
      toast.error("Error al cargar docentes.");
    } else {
      setDocentes(data || []);
    }

    setLoading(false);
  };

  // 🧩 Desactivar docente
  const toggleDocenteEstado = async (id: string, currentState: boolean) => {
    const { error } = await supabase
      .from("users")
      .update({ active: !currentState })
      .eq("id", id);

    if (error) {
      toast.error("Error al actualizar estado del docente.");
      return;
    }

    toast.success(
      `Docente ${currentState ? "desactivado" : "activado"} correctamente.`
    );
    fetchDocentes();
  };

  return (
    <DashboardLayout role="directivo" title="Gestión de Docentes">
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-6"
      >
        <h2 className="text-3xl font-extrabold text-gray-800">Docentes</h2>
        <p className="text-gray-600 mt-1">
          Consulta y gestiona los docentes registrados en tu institución.
        </p>
      </motion.div>

      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Cargando docentes...
        </div>
      ) : docentes.length === 0 ? (
        <div className="bg-white p-10 rounded-xl text-center text-gray-500 border shadow">
          No hay docentes registrados aún.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow border border-gray-100">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                {[
                  "Nombre",
                  "Correo",
                  "Nivel educativo",
                  "Estado",
                  "Acciones",
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
              {docentes.map((d, i) => (
                <motion.tr
                  key={d.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b hover:bg-gray-50 transition"
                >
                  <td className="p-3 font-medium">{d.full_name}</td>
                  <td className="p-3">{d.email}</td>
                  <td className="p-3">{d.nivel_educativo}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        d.active
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-red-100 text-red-700 border border-red-300"
                      }`}
                    >
                      {d.active ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => toggleDocenteEstado(d.id, d.active)}
                      className={`px-3 py-1 rounded-lg text-sm font-semibold border ${
                        d.active
                          ? "text-red-600 border-red-300 hover:bg-red-50"
                          : "text-green-600 border-green-300 hover:bg-green-50"
                      } transition`}
                    >
                      {d.active ? "Desactivar" : "Activar"}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
