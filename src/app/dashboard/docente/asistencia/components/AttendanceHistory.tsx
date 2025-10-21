"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Calendar, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface AttendanceHistoryProps {
  courseId: string;
}

interface AttendanceSession {
  id: string;
  date: string;
  topic?: string;
  created_at?: string;
}

export default function AttendanceHistory({
  courseId,
}: AttendanceHistoryProps) {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from("attendance_sessions")
          .select("id, date, topic, created_at")
          .eq("course_id", courseId)
          .order("date", { ascending: false });

        if (error) throw error;
        setSessions(data || []);
      } catch (err) {
        console.error(err);
        setError("❌ Error al cargar el historial de asistencia.");
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [courseId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6 mt-6"
    >
      <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <Calendar className="text-blue-600" /> Historial de sesiones
      </h3>

      {loading ? (
        <p className="text-gray-500 text-center py-4 animate-pulse">
          Cargando historial...
        </p>
      ) : error ? (
        <p className="text-red-600 text-center py-4">{error}</p>
      ) : sessions.length === 0 ? (
        <p className="text-gray-500 text-center py-4">
          No hay sesiones registradas todavía.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {sessions.map((s, index) => (
            <motion.li
              key={s.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="py-3 flex justify-between items-center hover:bg-gray-50 px-2 rounded-md transition"
            >
              <div>
                <p className="font-medium text-gray-800">
                  {new Date(s.date).toLocaleDateString("es-ES", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
                <p className="text-sm text-gray-500">
                  {s.topic || "Sin tema registrado"}
                </p>
              </div>
              <button className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm font-medium transition">
                <FileText size={14} /> Ver detalle
              </button>
            </motion.li>
          ))}
        </ul>
      )}
    </motion.div>
  );
}
