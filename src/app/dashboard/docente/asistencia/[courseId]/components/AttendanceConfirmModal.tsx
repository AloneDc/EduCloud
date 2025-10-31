"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, X } from "lucide-react";
import type { AttendanceStatus } from "@/types/attendance";
import React from "react";

/* ============================================
   🧠 Tipado de Props
============================================ */
export interface AttendanceMap {
  [studentId: string]: AttendanceStatus;
}

export interface AttendanceConfirmModalProps {
  attendance: AttendanceMap;
  onClose: () => void;
}

/* ============================================
   🎨 Modal de Confirmación de Asistencia
============================================ */
const AttendanceConfirmModal: React.FC<AttendanceConfirmModalProps> = ({
  attendance,
  onClose,
}) => {
  const summary = React.useMemo(() => {
    const counts = {
      presente: 0,
      falta: 0,
      tardanza: 0,
      justificado: 0,
    };
    Object.values(attendance).forEach((status) => {
      if (status in counts) counts[status as keyof typeof counts]++;
    });
    const total = Object.keys(attendance).length;
    return { ...counts, total };
  }, [attendance]);

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative text-center"
        >
          <CheckCircle className="text-green-500 w-14 h-14 mx-auto mb-2 animate-bounce" />
          <h2 className="text-xl font-semibold text-gray-800 mb-1">
            ¡Asistencia guardada!
          </h2>
          <p className="text-gray-500 text-sm mb-4">
            Los registros se han almacenado correctamente.
          </p>

          {/* 📊 Resumen */}
          <div className="grid grid-cols-2 gap-3 text-sm mb-4">
            <div className="bg-green-50 text-green-700 rounded-lg px-3 py-2 flex justify-between">
              <span>Presentes</span>
              <strong>{summary.presente}</strong>
            </div>
            <div className="bg-red-50 text-red-700 rounded-lg px-3 py-2 flex justify-between">
              <span>Faltas</span>
              <strong>{summary.falta}</strong>
            </div>
            <div className="bg-yellow-50 text-yellow-700 rounded-lg px-3 py-2 flex justify-between">
              <span>Tardanzas</span>
              <strong>{summary.tardanza}</strong>
            </div>
            <div className="bg-blue-50 text-blue-700 rounded-lg px-3 py-2 flex justify-between">
              <span>Justificados</span>
              <strong>{summary.justificado}</strong>
            </div>
          </div>

          <p className="text-gray-700 text-sm mb-5">
            Total registrados: <strong>{summary.total}</strong>
          </p>

          {/* 🔘 Botón cerrar */}
          <button
            onClick={onClose}
            className="flex items-center justify-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition w-full"
          >
            <X className="w-4 h-4" /> Cerrar
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AttendanceConfirmModal;
