import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const { user_id } = await req.json();
    if (!user_id) {
      return NextResponse.json({ error: "Falta user_id" }, { status: 400 });
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(user_id, {
      email_confirm: true,
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("❌ Error confirmando correo:", err.message);
      return NextResponse.json({ error: err.message }, { status: 500 });
    } else {
      console.error("❌ Error desconocido confirmando correo:", err);
      return NextResponse.json({ error: "Error desconocido" }, { status: 500 });
    }
  }
}
