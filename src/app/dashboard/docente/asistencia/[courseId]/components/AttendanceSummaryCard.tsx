"use client";

import React from "react";
import type { AttendanceSummary } from "@/types/attendance";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck,
  PieChart,
} from "lucide-react";

/* ============================================
   🧠 Tipado de Props
============================================ */
interface AttendanceSummaryCardProps {
  summary: AttendanceSummary;
}

/* ============================================
   📘 Componente principal
============================================ */
const AttendanceSummaryCard: React.FC<AttendanceSummaryCardProps> = ({
  summary,
}) => {
  const total = summary.total || 1; // Evitar división por cero

  const rows = [
    {
      label: "Presentes",
      count: summary.presente,
      color: "text-green-600",
      icon: <CheckCircle2 className="w-5 h-5 text-green-600" />,
      percentage: ((summary.presente / total) * 100).toFixed(1),
    },
    {
      label: "Faltas",
      count: summary.falta,
      color: "text-red-600",
      icon: <XCircle className="w-5 h-5 text-red-600" />,
      percentage: ((summary.falta / total) * 100).toFixed(1),
    },
    {
      label: "Tardanzas",
      count: summary.tardanza,
      color: "text-yellow-600",
      icon: <Clock className="w-5 h-5 text-yellow-600" />,
      percentage: ((summary.tardanza / total) * 100).toFixed(1),
    },
    {
      label: "Justificados",
      count: summary.justificado,
      color: "text-blue-600",
      icon: <FileCheck className="w-5 h-5 text-blue-600" />,
      percentage: ((summary.justificado / total) * 100).toFixed(1),
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6"
    >
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <PieChart className="w-5 h-5 text-blue-600" />
          Estadísticas de Asistencia
        </h3>
        <span className="text-sm text-gray-500">
          Total registros: <strong>{summary.total}</strong>
        </span>
      </div>

      {/* Cuerpo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {rows.map((r) => (
          <motion.div
            key={r.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center text-center border border-gray-100 rounded-xl p-4 hover:shadow-md transition"
          >
            <div className="mb-2">{r.icon}</div>
            <p className="text-sm text-gray-700 font-medium">{r.label}</p>
            <p className={`text-xl font-bold ${r.color}`}>{r.count}</p>
            <p className="text-xs text-gray-500">{r.percentage}%</p>
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-500">
        Datos actualizados automáticamente con base en la asistencia registrada.
      </div>
    </motion.div>
  );
};

export default AttendanceSummaryCard;
