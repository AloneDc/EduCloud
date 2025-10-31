"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAttendanceSummaryByTeacher } from "@/lib/reportService";
import { supabase } from "@/lib/supabaseClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";
import { motion } from "framer-motion";

interface Summary {
  course_id: string;
  course_name: string;
  total_presentes: number;
  total_faltas: number;
  total_tardanzas: number;
  total_justificados: number;
  porcentaje_asistencia: number;
}

export default function AsistenciaResumenPage() {
  const [summary, setSummary] = useState<Summary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      setLoading(true);
      const { data: userData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !userData?.user) {
        console.error("⚠️ Usuario no autenticado:", authError);
        setLoading(false);
        return;
      }

      try {
        const data = await getAttendanceSummaryByTeacher(userData.user.id);
        setSummary(data);
      } catch (err) {
        console.error("❌ Error cargando resumen:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSummary();
  }, []);

  return (
    <DashboardLayout role="docente" title="Resumen de Asistencia">
      <div className="max-w-5xl mx-auto p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          📊 Resumen de asistencia por curso
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Cargando datos...</p>
        ) : summary.length === 0 ? (
          <div className="text-center text-gray-600 bg-gray-50 border border-dashed border-gray-300 rounded-xl py-10">
            No hay registros de asistencia aún.
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6"
          >
            <ResponsiveContainer width="100%" height={380}>
              <BarChart data={summary}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="course_name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="total_presentes"
                  name="Presentes"
                  stackId="a"
                  fill="#16a34a"
                />
                <Bar
                  dataKey="total_tardanzas"
                  name="Tardanzas"
                  stackId="a"
                  fill="#facc15"
                />
                <Bar
                  dataKey="total_faltas"
                  name="Faltas"
                  stackId="a"
                  fill="#dc2626"
                />
                <Bar
                  dataKey="total_justificados"
                  name="Justificados"
                  stackId="a"
                  fill="#3b82f6"
                />
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-8">
              <h3 className="font-semibold text-gray-700 mb-3">
                🧮 Porcentajes y totales por curso
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {summary.map((item) => (
                  <div
                    key={item.course_id}
                    className="border border-gray-200 rounded-xl p-4 bg-gray-50 shadow-sm hover:shadow-md transition"
                  >
                    <h4 className="font-bold text-blue-700">
                      {item.course_name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Asistencia:{" "}
                      <span className="font-semibold text-green-600">
                        {item.porcentaje_asistencia}%
                      </span>
                    </p>

                    <ul className="text-xs text-gray-600 mt-2 space-y-0.5">
                      <li>🟢 Presentes: {item.total_presentes}</li>
                      <li>🟡 Tardanzas: {item.total_tardanzas}</li>
                      <li>🔴 Faltas: {item.total_faltas}</li>
                      <li>🔵 Justificados: {item.total_justificados}</li>
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
