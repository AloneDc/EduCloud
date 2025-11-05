import { NextResponse } from "next/server";
import supabaseServer from "@/lib/supabaseServer"; // usa el default import

// 🔹 Marca explícitamente este archivo como módulo de servidor
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// ✅ Handler principal (Next.js lo detecta ahora correctamente)
export async function POST(req: Request) {
  try {
    const { student_id, course_id, director_id } = await req.json();

    if (!student_id || !course_id) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios." },
        { status: 400 }
      );
    }

    // 1️⃣ Actualizar curso del alumno
    const { error: updateError } = await supabaseServer
      .from("students")
      .update({ course_id })
      .eq("id", student_id);

    if (updateError) throw updateError;

    // 2️⃣ Registrar acción en activity_logs
    await supabaseServer.from("activity_logs").insert([
      {
        user_id: director_id,
        action: "asignó alumno a curso",
        target_table: "students",
        target_id: student_id,
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Alumno asignado correctamente al curso.",
    });
  } catch (err: unknown) {
    console.error("❌ Error en /api/students/assign:", err);

    const message =
      err instanceof Error ? err.message : "Error interno del servidor.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// 👇 Exporta algo extra para que Next.js lo reconozca como módulo ESM válido
export const config = {
  api: {
    bodyParser: true,
  },
};
