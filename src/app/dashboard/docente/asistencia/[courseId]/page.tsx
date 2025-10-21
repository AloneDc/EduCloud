"use client";

import React, { useEffect, useState, useCallback } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getStudentsByCourse, saveAttendance } from "@/lib/attendanceService";
import AttendanceHeader from "../components/AttendanceHeader";
import AttendanceTable from "../components/AttendanceTable";
import AttendanceHistory from "../components/AttendanceHistory";
import { motion } from "framer-motion";

interface Student {
  id: string;
  full_name: string;
}

interface AsistenciaPageProps {
  params: { courseId: string };
}

export default function AsistenciaPage({ params }: AsistenciaPageProps) {
  const { courseId } = params;

  const [students, setStudents] = useState<Student[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [date, setDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );
  const [topic, setTopic] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string>("");

  // 🔹 Cargar estudiantes del curso
  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getStudentsByCourse(courseId);
      setStudents(data || []);
    } catch (err) {
      console.error(err);
      setFeedback("❌ Error al cargar estudiantes.");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    if (courseId) loadStudents();
  }, [courseId, loadStudents]);

  // 🔹 Guardar asistencia
  const handleSave = async () => {
    if (!topic.trim()) {
      setFeedback("⚠️ Agrega un tema o descripción de la sesión.");
      return;
    }

    if (Object.keys(attendance).length === 0) {
      setFeedback("⚠️ Marca la asistencia de al menos un estudiante.");
      return;
    }

    setSaving(true);
    setFeedback("⏳ Guardando asistencia...");
    try {
      await saveAttendance(courseId, date, topic, attendance);
      setFeedback("✅ Asistencia registrada correctamente.");

      // Limpiar estados después de guardar
      setAttendance({});
      setTopic("");

      // Ocultar mensaje después de unos segundos
      setTimeout(() => setFeedback(""), 2500);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setFeedback("❌ Error al guardar asistencia: " + error.message);
      } else {
        setFeedback("❌ Error desconocido al guardar asistencia.");
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout role="docente" title="Registro de Asistencia">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="max-w-6xl mx-auto px-4"
      >
        {/* HEADER */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mb-6">
          <AttendanceHeader
            date={date}
            topic={topic}
            setDate={setDate}
            setTopic={setTopic}
            onSave={handleSave}
            saving={saving}
          />

          {/* TABLA DE ASISTENCIA */}
          {loading ? (
            <p className="text-gray-500 text-center py-10 animate-pulse">
              Cargando estudiantes...
            </p>
          ) : students.length === 0 ? (
            <div className="text-center text-gray-600 bg-gray-50 border border-dashed border-gray-300 rounded-xl shadow-sm py-10">
              No hay estudiantes registrados para este curso.
            </div>
          ) : (
            <AttendanceTable
              students={students}
              attendance={attendance}
              setAttendance={setAttendance}
            />
          )}

          {/* FEEDBACK */}
          {feedback && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`text-center mt-4 text-sm font-medium ${
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
            </motion.p>
          )}
        </div>

        {/* HISTORIAL DE SESIONES */}
        <AttendanceHistory courseId={courseId} />
      </motion.div>
    </DashboardLayout>
  );
}
