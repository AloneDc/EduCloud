"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAttendanceSummary } from "@/lib/reportService";
import ReportCard from "./ReportCard";
import { BarChart2 } from "lucide-react";

interface Report {
  course_id: string;
  course_name: string;
  teacher_name: string;
  total_asistencias: number;
  total_presentes: number;
  total_faltas: number;
  total_tardanzas: number;
  porcentaje_asistencia: number;
  ultima_sesion: string;
}

export default function ReportesAsistenciaPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await getAttendanceSummary();
        setReports(data);
      } catch (err) {
        console.error("❌ Error cargando reportes:", err);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, []);

  return (
    <DashboardLayout role="directivo" title="Reportes de Asistencia">
      <div className="max-w-6xl mx-auto py-10">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
          <BarChart2 className="text-blue-600" /> Resumen de Asistencia
          Institucional
        </h2>

        {loading ? (
          <p className="text-gray-500 text-center">Cargando reportes...</p>
        ) : reports.length === 0 ? (
          <p className="text-gray-500 text-center">
            No se han registrado asistencias aún.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => (
              <ReportCard key={report.course_id} report={report} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
