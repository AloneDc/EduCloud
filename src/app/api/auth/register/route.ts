import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function POST(req: Request) {
  try {
    const {
      email,
      password,
      full_name,
      role,
      institution_id,
      institution_name,
      region,
      address,
      nivel_educativo,
    } = await req.json();

    if (!email || !password || !full_name || !role) {
      return NextResponse.json(
        { error: "Faltan campos obligatorios." },
        { status: 400 }
      );
    }

    // 🧩 1️⃣ Crear usuario en Supabase Auth (con Service Role)
    const { data: userData, error: createError } =
      await supabaseServer.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: { full_name, role },
      });

    // Si el usuario ya existe, Supabase lanzará un error 400 con 'User already registered'
    if (createError && !createError.message.includes("already registered")) {
      throw createError;
    }

    // Recuperar ID del usuario (ya sea nuevo o existente)
    const userId =
      userData?.user?.id ||
      (
        await supabaseServer
          .from("users")
          .select("id")
          .eq("email", email)
          .maybeSingle()
      ).data?.id;

    if (!userId) throw new Error("No se pudo obtener el ID del usuario.");

    // 🧩 2️⃣ Crear institución si el rol es directivo
    let finalInstitutionId = institution_id || null;

    if (role === "directivo") {
      if (!institution_name || !region || !address) {
        return NextResponse.json(
          { error: "Faltan datos de la institución." },
          { status: 400 }
        );
      }

      const { data: instData, error: instError } = await supabaseServer
        .from("institutions")
        .insert([
          {
            name: institution_name,
            region,
            address,
          },
        ])
        .select("id")
        .single();

      if (instError) throw instError;
      finalInstitutionId = instData.id;
    }

    // 🧩 3️⃣ Verificar si ya existe el usuario en la tabla `users`
    const { data: existingUser, error: existingError } = await supabaseServer
      .from("users")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (existingError) throw existingError;

    if (existingUser) {
      // 🔄 Si ya existe, solo actualizamos su institución y datos
      const { error: updateError } = await supabaseServer
        .from("users")
        .update({
          full_name,
          email,
          role,
          institution_id: finalInstitutionId,
          nivel_educativo: nivel_educativo || "Primaria",
          active: true,
        })
        .eq("id", userId);

      if (updateError) throw updateError;
    } else {
      // ➕ Si no existe, lo insertamos normalmente
      const { error: insertError } = await supabaseServer.from("users").insert([
        {
          id: userId,
          full_name,
          email,
          role,
          institution_id: finalInstitutionId,
          nivel_educativo: nivel_educativo || "Primaria",
          active: true,
        },
      ]);

      if (insertError) throw insertError;
    }

    // 🧩 4️⃣ Devolver éxito y user_id
    return NextResponse.json({
      success: true,
      user_id: userId,
    });
  } catch (err) {
    console.error("❌ Error en /api/auth/register:", err);
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "object" && err !== null
        ? JSON.stringify(err)
        : "Error interno del servidor.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
