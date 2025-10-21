"use client";

import { useEffect, useState } from "react";
import {
  UploadCloud,
  FileText,
  Calendar,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { uploadDocument } from "@/lib/documentService";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

interface UploadBoxProps {
  courseId: string;
  onUploadSuccess?: () => Promise<void>;
}

type DocumentType = "Planificación" | "Sesión" | "Informe" | "Evaluación";

interface DocumentMeta {
  title: string;
  type: DocumentType;
  period: string;
  description: string;
}

export default function UploadBox({
  courseId,
  onUploadSuccess,
}: UploadBoxProps) {
  const [file, setFile] = useState<File | null>(null);
  const [courseName, setCourseName] = useState<string>("");
  const [meta, setMeta] = useState<DocumentMeta>({
    title: "",
    type: "Planificación",
    period: "",
    description: "",
  });

  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  // 🔹 Obtener nombre y periodo del curso
  useEffect(() => {
    const fetchCourse = async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("name, period")
        .eq("id", courseId)
        .single();

      if (!error && data) {
        setCourseName(data.name);
        setMeta((prev) => ({ ...prev, period: data.period || "2025-I" }));
      }
    };
    if (courseId) fetchCourse();
  }, [courseId]);

  // 📤 Subir documento
  const handleUpload = async () => {
    if (!file) return setStatus("⚠️ Selecciona un archivo antes de subir.");
    if (!meta.title) return setStatus("⚠️ Agrega un título para el documento.");

    setUploading(true);
    setStatus("⏳ Subiendo documento...");
    setProgress(15);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión.");

      const fileName = `${Date.now()}_${file.name}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("documentos")
        .upload(filePath, file);

      if (uploadError)
        throw new Error(`Error al subir: ${uploadError.message}`);

      setProgress(70);

      const {
        data: { publicUrl },
      } = supabase.storage.from("documentos").getPublicUrl(filePath);

      await uploadDocument(user.id, courseId, {
        title: meta.title,
        type: meta.type,
        period: meta.period,
        description: meta.description,
        file_url: publicUrl,
      });

      setProgress(100);
      setStatus("✅ Documento subido correctamente.");

      if (onUploadSuccess) await onUploadSuccess();

      // 🔄 Reset del formulario
      setTimeout(() => {
        setFile(null);
        setMeta({
          title: "",
          type: "Planificación",
          period: meta.period,
          description: "",
        });
        setProgress(0);
      }, 1200);
    } catch (error: unknown) {
      console.error(error);
      if (error instanceof Error) {
        setStatus("❌ " + error.message);
      } else {
        setStatus("❌ Error desconocido al subir el documento.");
      }
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm mt-6 transition-all">
      <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
        <UploadCloud className="text-blue-600" /> Subir nuevo documento
      </h2>

      {/* Curso y periodo */}
      <div className="mb-4 p-4 bg-gray-50 rounded-lg border text-sm text-gray-700">
        <p className="flex items-center gap-2 mb-1">
          <FileText size={16} className="text-blue-600" />
          <strong>Curso:</strong> {courseName || "Cargando..."}
        </p>
        <p className="flex items-center gap-2">
          <Calendar size={16} className="text-blue-600" />
          <strong>Periodo:</strong> {meta.period}
        </p>
      </div>

      {/* Campos de entrada */}
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Título del documento (ej. Sesión 1 - Energía)"
          value={meta.title}
          onChange={(e) => setMeta({ ...meta, title: e.target.value })}
          className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
        />

        <select
          value={meta.type}
          onChange={(e) =>
            setMeta({ ...meta, type: e.target.value as DocumentType })
          }
          className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
        >
          <option value="Planificación">📘 Planificación</option>
          <option value="Sesión">🗓️ Sesión</option>
          <option value="Evaluación">🧮 Evaluación</option>
          <option value="Informe">🧾 Informe</option>
        </select>

        <textarea
          placeholder="Descripción o notas (opcional)"
          value={meta.description}
          onChange={(e) => setMeta({ ...meta, description: e.target.value })}
          className="w-full border px-4 py-2 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
        />

        {/* Dropzone */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition">
          <UploadCloud className="w-8 h-8 mx-auto text-blue-500" />
          <p className="text-sm mt-2 text-gray-600">
            Arrastra o selecciona un archivo (PDF o DOCX)
          </p>

          <input
            type="file"
            id="fileInput"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          <label
            htmlFor="fileInput"
            className="cursor-pointer inline-block mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Seleccionar archivo
          </label>

          {file && (
            <p className="text-sm text-gray-700 mt-2 font-medium">
              Archivo seleccionado: {file.name}
            </p>
          )}
        </div>

        {/* Barra de progreso */}
        {uploading && (
          <motion.div
            initial={{ width: "0%" }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
            className="h-2 bg-blue-500 rounded-full mt-2"
          />
        )}

        <button
          disabled={!file || uploading}
          onClick={handleUpload}
          className={`w-full py-2 rounded-lg font-semibold text-white transition ${
            uploading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {uploading ? "Subiendo..." : "📤 Subir documento"}
        </button>

        {status && (
          <div
            className={`flex items-center justify-center gap-2 text-sm font-medium mt-3 ${
              status.startsWith("✅")
                ? "text-green-600"
                : status.startsWith("❌")
                ? "text-red-600"
                : "text-gray-600"
            }`}
          >
            {status.startsWith("✅") && <CheckCircle2 size={16} />}
            {status.startsWith("❌") && <AlertTriangle size={16} />}
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
