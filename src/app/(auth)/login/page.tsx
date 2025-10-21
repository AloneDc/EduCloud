"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Intentar login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("❌ Correo o contraseña incorrectos.");
      setLoading(false);
      return;
    }

    const role = data?.user?.user_metadata?.role || "docente";

    // Redirección por rol
    switch (role) {
      case "directivo":
        router.push("/dashboard/directivo");
        break;
      case "supervisor":
        router.push("/dashboard/supervisor");
        break;
      case "admin":
        router.push("/dashboard/admin");
        break;
      default:
        router.push("/dashboard/docente");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-indigo-100 to-blue-200 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-2xl rounded-2xl p-8">
        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-600 text-white w-14 h-14 flex items-center justify-center rounded-full text-2xl font-bold">
            E
          </div>
          <h1 className="mt-3 text-2xl font-bold text-gray-800 tracking-tight">
            EduCloud
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gestión pedagógica digital
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Correo institucional
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="nombre@institucion.edu.pe"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 text-sm px-3 py-2 rounded-lg">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 font-semibold text-white rounded-lg transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 shadow-md"
            }`}
          >
            {loading ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center mt-5 text-sm">
          <p className="text-gray-600">
            ¿No tienes cuenta?{" "}
            <Link
              href="/register"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Regístrate
            </Link>
          </p>
        </div>

        {/* Credenciales de ejemplo */}
        <div className="mt-8 border-t pt-4 text-center text-xs text-gray-400">
          <p>Sistema en desarrollo — Taller de Investigación en Sistemas</p>
        </div>
      </div>
    </div>
  );
}
