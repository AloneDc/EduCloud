"use client";

import { motion } from "framer-motion";
import { Users, CalendarDays } from "lucide-react";

interface ReportCardProps {
  report: {
    course_name: string;
    teacher_name: string;
    total_asistencias: number;
    total_presentes: number;
    total_faltas: number;
    total_tardanzas: number;
    porcentaje_asistencia: number;
    ultima_sesion: string;
  };
}

export default function ReportCard({ report }: ReportCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition"
    >
      <h3 className="text-lg font-bold text-blue-700 mb-1">
        {report.course_name}
      </h3>
      <p className="text-sm text-gray-600 mb-3">{report.teacher_name}</p>

      <div className="flex justify-between text-sm text-gray-700 mb-2">
        <span className="flex items-center gap-1">
          <Users size={14} /> {report.total_asistencias} registros
        </span>
        <span className="flex items-center gap-1 text-gray-500">
          <CalendarDays size={14} /> {report.ultima_sesion || "—"}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-sm">
        <p className="text-green-600">✅ Presentes: {report.total_presentes}</p>
        <p className="text-red-600">❌ Faltas: {report.total_faltas}</p>
        <p className="text-yellow-600">
          ⚠️ Tardanzas: {report.total_tardanzas}
        </p>
      </div>

      <div className="mt-4 text-center">
        <div
          className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
            report.porcentaje_asistencia >= 90
              ? "bg-green-100 text-green-700"
              : report.porcentaje_asistencia >= 75
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          Asistencia: {report.porcentaje_asistencia ?? 0}%
        </div>
      </div>
    </motion.div>
  );
}
