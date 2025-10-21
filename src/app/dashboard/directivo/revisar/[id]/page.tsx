"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { getDocumentById } from "@/lib/reviewService";
import ReviewPanel from "@/components/directivo/ReviewPanel";
import { motion } from "framer-motion";

// 🔹 Tipado del documento revisado
interface DocumentDetail {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  status: "pendiente" | "aprobado" | "observado";
  type?: string;
  period?: string;
  users?: {
    full_name: string;
    email: string;
  };
  created_at?: string;
}

export default function RevisarDocumento() {
  const { id } = useParams<{ id: string }>();
  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        const data = await getDocumentById(id);
        setDoc(data);
      } catch (err) {
        console.error("Error al obtener documento:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDoc();
  }, [id]);

  if (loading)
    return (
      <DashboardLayout role="directivo" title="Revisión de Documento">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin h-10 w-10 border-t-4 border-blue-600 rounded-full mb-4"></div>
          <p className="text-gray-600">Cargando documento...</p>
        </div>
      </DashboardLayout>
    );

  if (!doc)
    return (
      <DashboardLayout role="directivo" title="Documento no encontrado">
        <div className="bg-white p-8 rounded-xl shadow text-center text-gray-600">
          <p>No se encontró el documento solicitado.</p>
        </div>
      </DashboardLayout>
    );

  return (
    <DashboardLayout role="directivo" title="Revisión de Documento">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white p-8 rounded-2xl shadow-md border border-gray-100 mb-8"
      >
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{doc.title}</h2>
        {doc.type && (
          <p className="text-sm text-gray-500 mb-1">Tipo: {doc.type}</p>
        )}
        {doc.period && (
          <p className="text-sm text-gray-500 mb-4">Periodo: {doc.period}</p>
        )}

        <p className="text-gray-700 leading-relaxed mb-4">
          {doc.description || "Sin descripción disponible."}
        </p>

        <div className="flex items-center justify-between mt-6">
          <div>
            <p className="text-sm text-gray-500">Subido por:</p>
            <p className="font-medium text-gray-800">
              {doc.users?.full_name || "—"}
            </p>
            <p className="text-xs text-gray-500">{doc.users?.email}</p>
          </div>

          <a
            href={doc.file_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            📄 Ver documento
          </a>
        </div>
      </motion.div>

      {/* Panel de revisión */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <ReviewPanel documentId={id} />
      </motion.div>
    </DashboardLayout>
  );
}
