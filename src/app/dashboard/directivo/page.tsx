"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getAllDocuments } from "@/lib/reviewService";
import Link from "next/link";
import { motion } from "framer-motion";

// ---------------------------
// 🔹 Tipado fuerte del documento
// ---------------------------
interface DocumentData {
  id: string;
  title: string;
  type: string;
  period: string;
  status: "pendiente" | "aprobado" | "observado";
  users?: {
    full_name: string;
  };
}

// ---------------------------
// 🔹 Componente principal
// ---------------------------
export default function DirectivoDashboard() {
  const [docs, setDocs] = useState<DocumentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const data = await getAllDocuments();

        // 🧠 Normalizamos los datos para asegurar tipos consistentes
        const normalized = (data ?? []).map((doc) => ({
          ...doc,
          type: doc.type ?? "Desconocido", // 👈 Aseguramos string
          period: doc.period ?? "N/A",
        }));

        setDocs(normalized);
      } catch (error) {
        console.error("Error al obtener documentos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocs();
  }, []);

  // Estadísticas rápidas
  const stats = {
    total: docs.length,
    aprobados: docs.filter((d) => d.status === "aprobado").length,
    observados: docs.filter((d) => d.status === "observado").length,
    pendientes: docs.filter((d) => d.status === "pendiente").length,
  };

  return (
    <DashboardLayout role="directivo" title="Revisión de Documentos">
      {/* Encabezado */}
      <motion.div
        initial={{ opacity: 0, y: -15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">
          Panel Directivo
        </h2>
        <p className="text-gray-600 mt-1">
          Supervisa y aprueba las planificaciones pedagógicas subidas por los
          docentes.
        </p>
      </motion.div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard
          label="Total Documentos"
          value={stats.total}
          color="bg-blue-600"
        />
        <StatCard
          label="Aprobados"
          value={stats.aprobados}
          color="bg-green-600"
        />
        <StatCard
          label="Observados"
          value={stats.observados}
          color="bg-red-600"
        />
        <StatCard
          label="Pendientes"
          value={stats.pendientes}
          color="bg-yellow-500"
        />
      </div>

      {/* Contenido principal */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-600 border-opacity-70"></div>
        </div>
      ) : docs.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white p-10 rounded-xl text-center text-gray-500 shadow-md border border-gray-100"
        >
          <p className="text-lg">No hay documentos registrados aún.</p>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
        >
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {[
                  "Docente",
                  "Documento",
                  "Tipo",
                  "Periodo",
                  "Estado",
                  "Acción",
                ].map((header) => (
                  <th
                    key={header}
                    className="text-left p-4 text-sm font-semibold text-gray-600 uppercase tracking-wide"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {docs.map((d, index) => (
                <motion.tr
                  key={d.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="border-b border-gray-100 hover:bg-gray-50 transition"
                >
                  <td className="p-4 text-gray-800 font-medium">
                    {d.users?.full_name || "—"}
                  </td>
                  <td className="p-4 text-gray-700">{d.title}</td>
                  <td className="p-4 text-gray-600">{d.type}</td>
                  <td className="p-4 text-gray-600">{d.period}</td>
                  <td className="p-4">
                    <StatusBadge status={d.status} />
                  </td>
                  <td className="p-4">
                    <Link
                      href={`/dashboard/directivo/revisar/${d.id}`}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-semibold text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-50 hover:text-blue-700 transition"
                    >
                      Revisar →
                    </Link>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}
    </DashboardLayout>
  );
}

// --------------------------------------------------
// 🔹 COMPONENTES AUXILIARES
// --------------------------------------------------

interface StatCardProps {
  label: string;
  value: number;
  color: string;
}

function StatCard({ label, value, color }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className={`${color} text-white p-5 rounded-xl shadow-md transition-all duration-200`}
    >
      <p className="text-sm opacity-80">{label}</p>
      <h3 className="text-3xl font-bold">{value}</h3>
    </motion.div>
  );
}

function StatusBadge({ status }: { status: DocumentData["status"] }) {
  const variants: Record<DocumentData["status"], string> = {
    aprobado: "bg-green-100 text-green-700 border-green-300",
    observado: "bg-red-100 text-red-700 border-red-300",
    pendiente: "bg-yellow-100 text-yellow-700 border-yellow-300",
  };

  const label = status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

  return (
    <span
      className={`px-3 py-1 text-sm rounded-full border font-medium ${variants[status]}`}
    >
      {label}
    </span>
  );
}
