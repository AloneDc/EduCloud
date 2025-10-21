import { supabase } from "./supabaseClient";

/* ------------------------------------------------------------
 * 🧱 Tipos base
 * ---------------------------------------------------------- */
export interface Review {
  id?: string;
  document_id: string;
  reviewer_id: string;
  comment: string;
  result: "aprobado" | "observado";
  created_at?: string;
}

export interface DocumentWithUser {
  id: string;
  title: string;
  description?: string;
  file_url: string; // ✅ agregado
  type?: string;
  period?: string;
  status: "pendiente" | "aprobado" | "observado";
  created_at?: string;
  users?: {
    full_name: string;
    email: string;
  };
}

/* ------------------------------------------------------------
 * 🔹 Obtener todos los documentos con información del docente
 * ---------------------------------------------------------- */
export async function getAllDocuments(): Promise<DocumentWithUser[]> {
  const { data, error } = await supabase
    .from("documents")
    .select("*, users(full_name, email)")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Error al obtener documentos: ${error.message}`);
  return (data ?? []) as DocumentWithUser[];
}

/* ------------------------------------------------------------
 * 🔹 Obtener documento específico por ID
 * ---------------------------------------------------------- */
export async function getDocumentById(
  id: string
): Promise<DocumentWithUser | null> {
  const { data, error } = await supabase
    .from("documents")
    .select("*, users(full_name, email)")
    .eq("id", id)
    .single();

  if (error) throw new Error(`Error al obtener el documento: ${error.message}`);
  return data as DocumentWithUser;
}

/* ------------------------------------------------------------
 * 🔹 Registrar una revisión y actualizar el estado del documento
 * ---------------------------------------------------------- */
export async function addReview(
  documentId: string,
  reviewerId: string,
  comment: string,
  result: "aprobado" | "observado"
): Promise<void> {
  try {
    // 1️⃣ Insertar la revisión
    const { error: reviewError } = await supabase.from("reviews").insert([
      {
        document_id: documentId,
        reviewer_id: reviewerId,
        comment,
        result,
      },
    ]);

    if (reviewError)
      throw new Error(`Error al registrar revisión: ${reviewError.message}`);

    // 2️⃣ Actualizar el estado del documento
    const { error: updateError } = await supabase
      .from("documents")
      .update({ status: result })
      .eq("id", documentId);

    if (updateError)
      throw new Error(`Error al actualizar documento: ${updateError.message}`);

    // 3️⃣ Obtener información del docente dueño del documento
    const { data: doc, error: fetchError } = await supabase
      .from("documents")
      .select("teacher_id, title")
      .eq("id", documentId)
      .single();

    if (fetchError || !doc) {
      console.warn("⚠️ Documento no encontrado o sin datos del docente.");
      return;
    }

    // 4️⃣ Crear notificación automática
    const { error: notifError } = await supabase.from("notifications").insert([
      {
        user_id: doc.teacher_id,
        title: `Documento ${result === "aprobado" ? "Aprobado" : "Observado"}`,
        message: `Tu documento "${doc.title}" ha sido ${result} por el directivo.`,
        created_at: new Date().toISOString(),
      },
    ]);

    if (notifError)
      console.warn("⚠️ Error al crear notificación:", notifError.message);
  } catch (error: unknown) {
    console.error("❌ Error en el flujo de revisión:", error);
    if (error instanceof Error) throw new Error(error.message);
    throw new Error("Error desconocido durante la revisión del documento.");
  }
}
