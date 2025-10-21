"use client";

import { useEffect, useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  getDocumentsByCourse,
  deleteDocument,
  downloadAllDocuments,
  Document, // ✅ Importamos el tipo directamente desde documentService
} from "@/lib/documentService";
import UploadBox from "@/components/docente/UploadBox";
import { motion } from "framer-motion";
import {
  Eye,
  Trash2,
  UploadCloud,
  FolderOpen,
  Calendar,
  ChevronDown,
  ChevronUp,
  FileText,
  Download,
  Filter,
} from "lucide-react";

const TYPES = ["Todos", "Planificación", "Sesión", "Informe", "Evaluación"];
const STATUS = ["Todos", "pendiente", "aprobado", "observado"];
const MONTHS = [
  "Todos",
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

export default function CursoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const [courseId, setCourseId] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("Todos");
  const [filterStatus, setFilterStatus] = useState("Todos");
  const [filterMonth, setFilterMonth] = useState("Todos");

  // ✅ Unwrap del param (Next.js 14)
  useEffect(() => {
    (async () => {
      const unwrapped = await params;
      setCourseId(unwrapped.id);
    })();
  }, [params]);

  // 🔹 Cargar documentos
  const fetchDocuments = async (id: string) => {
    try {
      setLoading(true);
      const docs = await getDocumentsByCourse(id);
      setDocuments(docs ?? []);
    } catch (error) {
      console.error("Error cargando documentos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) fetchDocuments(courseId);
  }, [courseId]);

  // 🗑️ Eliminar documento
  const handleDelete = async (id: string) => {
    if (confirm("¿Eliminar este documento?")) {
      await deleteDocument(id);
      fetchDocuments(courseId);
    }
  };

  // 📦 Descargar todos los documentos
  const handleDownloadAll = async () => {
    if (documents.length === 0) {
      alert("No hay documentos para descargar.");
      return;
    }
    await downloadAllDocuments(documents);
  };

  // 🧠 Filtrado avanzado
  const filteredDocs = documents.filter((d) => {
    const matchesType = filterType === "Todos" || d.type === filterType;
    const matchesStatus = filterStatus === "Todos" || d.status === filterStatus;
    const matchesMonth =
      filterMonth === "Todos" ||
      new Date(d.created_at!).getMonth() + 1 === MONTHS.indexOf(filterMonth);
    return matchesType && matchesStatus && matchesMonth;
  });

  // 🗂️ Agrupación por periodo > mes
  const groupedByPeriod: Record<string, Record<string, Document[]>> = {};
  filteredDocs.forEach((doc) => {
    const period = doc.period || "Sin periodo";
    const month = new Date(doc.created_at || "").toLocaleString("es-ES", {
      month: "long",
    });
    if (!groupedByPeriod[period]) groupedByPeriod[period] = {};
    if (!groupedByPeriod[period][month]) groupedByPeriod[period][month] = [];
    groupedByPeriod[period][month].push(doc);
  });

  return (
    <DashboardLayout role="docente" title="Gestión de Documentos">
      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
              📘 Documentos del Curso
            </h2>
            <p className="text-gray-500 text-sm">
              Administra tus documentos, filtra por tipo o estado, y descarga tu
              respaldo completo.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowUploader(!showUploader)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition"
            >
              <UploadCloud size={18} />
              {showUploader ? "Cerrar carga" : "Subir documento"}
            </button>

            <button
              onClick={handleDownloadAll}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg shadow transition"
            >
              <Download size={18} /> Descargar todo
            </button>
          </div>
        </div>

        {/* UPLOAD BOX */}
        {showUploader && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <UploadBox
              courseId={courseId}
              onUploadSuccess={() => fetchDocuments(courseId)}
            />
          </motion.div>
        )}

        {/* FILTROS */}
        <div className="bg-white p-4 rounded-xl shadow-sm border mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <Filter size={16} className="text-blue-600" />
            <span className="font-semibold text-gray-700">Filtros:</span>

            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="border rounded-lg px-3 py-1 text-sm"
            >
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-lg px-3 py-1 text-sm"
            >
              {STATUS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>

            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="border rounded-lg px-3 py-1 text-sm"
            >
              {MONTHS.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="text-center py-10 text-gray-500">
            <Calendar className="mx-auto mb-3 text-blue-500 animate-pulse" />
            Cargando documentos...
          </div>
        )}

        {/* SIN DOCUMENTOS */}
        {!loading && filteredDocs.length === 0 && (
          <div className="text-center py-16 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <FolderOpen className="mx-auto text-blue-500 mb-4" size={48} />
            <p className="text-gray-700 font-semibold">
              No se encontraron documentos con los filtros seleccionados.
            </p>
          </div>
        )}

        {/* AGRUPACIÓN VISUAL */}
        {!loading &&
          Object.keys(groupedByPeriod).map((period) => (
            <motion.div
              key={period}
              className="mb-8 border border-gray-200 rounded-2xl shadow-sm overflow-hidden bg-white"
            >
              <button
                onClick={() => setExpanded(expanded === period ? null : period)}
                className="w-full flex justify-between items-center px-6 py-4 bg-gray-100 hover:bg-gray-200 transition"
              >
                <span className="font-semibold text-gray-700 flex items-center gap-2">
                  <Calendar size={18} className="text-blue-600" />
                  Periodo: {period}
                </span>
                {expanded === period ? <ChevronUp /> : <ChevronDown />}
              </button>

              {expanded === period && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6 space-y-8"
                >
                  {Object.keys(groupedByPeriod[period]).map((month) => (
                    <div key={month}>
                      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FileText className="text-blue-500" size={16} />
                        {month.charAt(0).toUpperCase() + month.slice(1)}
                      </h3>
                      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {groupedByPeriod[period][month].map((doc) => (
                          <motion.div
                            key={doc.id}
                            whileHover={{ scale: 1.02 }}
                            className="border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition flex flex-col"
                          >
                            <div className="relative aspect-[4/3] bg-gray-50 border border-gray-200 rounded-lg mb-3 overflow-hidden">
                              <iframe
                                src={doc.file_url}
                                className="w-full h-full rounded-lg"
                                loading="lazy"
                              />
                            </div>

                            <div className="flex-grow">
                              <h4 className="font-semibold text-blue-700 text-sm mb-1">
                                {doc.title}
                              </h4>
                              <p className="text-gray-500 text-xs mb-2 capitalize">
                                {doc.type} •{" "}
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    doc.status === "aprobado"
                                      ? "bg-green-100 text-green-700"
                                      : doc.status === "observado"
                                      ? "bg-red-100 text-red-700"
                                      : "bg-yellow-100 text-yellow-700"
                                  }`}
                                >
                                  {doc.status}
                                </span>
                              </p>
                            </div>

                            <div className="flex justify-between items-center mt-2">
                              <a
                                href={doc.file_url}
                                target="_blank"
                                className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                              >
                                <Eye size={15} /> Ver
                              </a>
                              <button
                                onClick={() => handleDelete(doc.id)}
                                className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                              >
                                <Trash2 size={15} /> Eliminar
                              </button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </motion.div>
          ))}
      </div>
    </DashboardLayout>
  );
}
