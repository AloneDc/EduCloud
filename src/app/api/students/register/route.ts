import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const { full_name, dni, nivel_educativo, course_id, director_id } =
      await req.json();

    if (!full_name || !dni || !course_id) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios." },
        { status: 400 }
      );
    }

    // 🧩 1️⃣ Verificar si ya existe un alumno con el mismo DNI
    const { data: existingStudent, error: existingError } = await supabaseServer
      .from("students")
      .select("id")
      .eq("dni", dni)
      .maybeSingle();

    if (existingError) throw existingError;

    let studentId = existingStudent?.id;

    if (studentId) {
      // Ya existe: actualizar datos y asignar curso
      const { error: updateError } = await supabaseServer
        .from("students")
        .update({
          full_name,
          nivel_educativo,
          course_id,
          estado: "activo",
        })
        .eq("id", studentId);

      if (updateError) throw updateError;
    } else {
      // Crear nuevo alumno
      const { data: newStudent, error: insertError } = await supabaseServer
        .from("students")
        .insert([
          {
            full_name,
            dni,
            nivel_educativo,
            course_id,
            estado: "activo",
          },
        ])
        .select("id")
        .single();

      if (insertError) throw insertError;
      studentId = newStudent.id;
    }

    // 🧩 2️⃣ Registrar acción en activity_logs
    await supabaseServer.from("activity_logs").insert([
      {
        user_id: director_id,
        action: "matriculó al alumno",
        target_table: "students",
        target_id: studentId,
      },
    ]);

    return NextResponse.json({
      success: true,
      message: "Alumno matriculado correctamente.",
      student_id: studentId,
    });
  } catch (err) {
    console.error("❌ Error en /api/students/register:", err);
    const message =
      err instanceof Error ? err.message : "Error interno del servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
