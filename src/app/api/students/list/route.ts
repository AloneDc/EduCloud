import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const { nivel_educativo, course_id } = await req.json();

    let query = supabaseServer.from("students").select(`
      id,
      full_name,
      dni,
      nivel_educativo,
      estado,
      course_id,
      courses(name, grade, section)
    `);

    if (nivel_educativo) {
      query = query.eq("nivel_educativo", nivel_educativo);
    }

    if (course_id) {
      query = query.eq("course_id", course_id);
    }

    const { data, error } = await query.order("full_name", { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, students: data });
  } catch (err) {
    console.error("❌ Error en /api/students/list:", err);
    const message =
      err instanceof Error ? err.message : "Error interno del servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
