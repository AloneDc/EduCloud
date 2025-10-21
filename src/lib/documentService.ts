import { supabase } from "./supabaseClient";
import JSZip from "jszip";

/* ------------------------------------------------------------
 * 🧱 Tipos base
 * ---------------------------------------------------------- */

/** Representa un documento pedagógico almacenado en Supabase */
export interface Document {
  id: string;
  teacher_id: string;
  course_id: string;
  title: string;
  type: "Planificación" | "Sesión" | "Informe" | "Evaluación";
  period: string;
  description?: string;
  file_url: string;
  status: "pendiente" | "aprobado" | "observado";
  created_at?: string;
  archived_by?: string | null;
}

/* ------------------------------------------------------------
 * 🔹 Utilidad interna para manejo de errores Supabase
 * ---------------------------------------------------------- */
function handleSupabaseError<T>(data: T | null, error: Error | null): T {
  if (error) throw new Error(error.message);
  return (data ?? []) as T;
}

/* ------------------------------------------------------------
 * 🔹 Obtener todos los documentos de un docente
 * ---------------------------------------------------------- */
export async function getDocumentsByUser(
  teacherId: string
): Promise<Document[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("teacher_id", teacherId)
    .order("created_at", { ascending: false });

  return handleSupabaseError<Document[]>(data, error);
}

/* ------------------------------------------------------------
 * 🔹 Obtener documentos por curso específico
 * ---------------------------------------------------------- */
export async function getDocumentsByCourse(
  courseId: string
): Promise<Document[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("course_id", courseId)
    .order("created_at", { ascending: false });

  return handleSupabaseError<Document[]>(data, error);
}

/* ------------------------------------------------------------
 * 🔹 Obtener documentos por mes (según fecha de creación)
 * ---------------------------------------------------------- */
export async function getDocumentsByMonth(
  courseId: string,
  month: number
): Promise<Document[]> {
  const year = new Date().getFullYear();
  const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month).padStart(2, "0")}-31`;

  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("course_id", courseId)
    .gte("created_at", startDate)
    .lte("created_at", endDate)
    .order("created_at", { ascending: false });

  return handleSupabaseError<Document[]>(data, error);
}

/* ------------------------------------------------------------
 * 🔹 Subir nuevo documento (metadatos)
 * ---------------------------------------------------------- */
export async function uploadDocument(
  teacherId: string,
  courseId: string,
  doc: Partial<Document>
): Promise<Document[]> {
  const { data, error } = await supabase
    .from("documents")
    .insert([
      {
        teacher_id: teacherId,
        course_id: courseId,
        title: doc.title,
        type: doc.type,
        period: doc.period,
        description: doc.description || "",
        file_url: doc.file_url,
        status: "pendiente",
        archived_by: null,
      },
    ])
    .select("*");

  return handleSupabaseError<Document[]>(data, error);
}

/* ------------------------------------------------------------
 * 🔹 Eliminar documento por ID
 * ---------------------------------------------------------- */
export async function deleteDocument(documentId: string): Promise<boolean> {
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId);
  if (error) throw new Error(error.message);
  return true;
}

/* ------------------------------------------------------------
 * 🔹 Actualizar estado del documento (aprobado / observado)
 * ---------------------------------------------------------- */
export async function updateDocumentStatus(
  documentId: string,
  newStatus: "pendiente" | "aprobado" | "observado"
): Promise<Document[]> {
  const { data, error } = await supabase
    .from("documents")
    .update({ status: newStatus })
    .eq("id", documentId)
    .select("*");

  return handleSupabaseError<Document[]>(data, error);
}

/* ------------------------------------------------------------
 * 🗃️ Archivar documentos (cuando un docente termina contrato)
 * ---------------------------------------------------------- */
export async function archiveDocumentsByTeacher(
  teacherId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("documents")
    .update({ archived_by: teacherId })
    .eq("teacher_id", teacherId);

  if (error) throw new Error(error.message);
  return true;
}

/* ------------------------------------------------------------
 * 🧾 Obtener documentos archivados (historial institucional)
 * ---------------------------------------------------------- */
export async function getArchivedDocuments(
  courseId: string
): Promise<Document[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("course_id", courseId)
    .not("archived_by", "is", null)
    .order("created_at", { ascending: false });

  return handleSupabaseError<Document[]>(data, error);
}

/* ------------------------------------------------------------
 * 📦 Descargar todos los documentos en ZIP
 * ---------------------------------------------------------- */
export async function downloadAllDocuments(
  documents: Document[]
): Promise<void> {
  if (!documents || documents.length === 0) {
    alert("No hay documentos disponibles para descargar.");
    return;
  }

  try {
    const zip = new JSZip();
    const folder = zip.folder("EduCloud_Respaldo")!;

    for (const doc of documents) {
      const response = await fetch(doc.file_url);
      if (!response.ok) {
        console.warn(`No se pudo descargar el archivo: ${doc.title}`);
        continue;
      }

      const blob = await response.blob();
      const extension = doc.file_url.split(".").pop() || "pdf";
      const subfolder = folder.folder(doc.type) || folder;
      subfolder.file(`${doc.title}.${extension}`, blob);
    }

    const content = await zip.generateAsync({ type: "blob" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `Respaldo_EduCloud_${new Date().getFullYear()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error: unknown) {
    console.error("Error generando ZIP:", error);
    alert("Ocurrió un error al generar el respaldo ZIP.");
  }
}
