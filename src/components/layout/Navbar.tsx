"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Bell, Menu, User, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";

interface NavbarProps {
  role: string;
  onToggleSidebar?: () => void; // Para versión responsive
}

export default function Navbar({ role, onToggleSidebar }: NavbarProps) {
  const [userName, setUserName] = useState<string>("");
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) return;

      // Obtener nombre del usuario desde tu tabla `users`
      const { data: userProfile } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", data.user.id)
        .single();

      setUserName(userProfile?.full_name || "Usuario");
    };

    fetchUserData();
  }, []);

  const roleTitles: Record<string, string> = {
    docente: "Docente",
    directivo: "Directora",
    supervisor: "Supervisor",
    admin: "Administrador",
  };

  const roleGreeting = roleTitles[role] || "Usuario";

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm flex items-center justify-between px-6 py-3">
      {/* LEFT SIDE — LOGO + MENU */}
      <div className="flex items-center gap-4">
        {/* Botón responsive */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg hover:bg-gray-100 transition lg:hidden"
          >
            <Menu size={22} className="text-gray-700" />
          </button>
        )}

        {/* Bienvenida */}
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-gray-800"
        >
          <p className="text-sm text-gray-500">
            Bienvenido{role === "directivo" ? "a" : ""}, {roleGreeting}
          </p>
          <h2 className="text-lg font-semibold text-blue-700">
            {userName || "Cargando..."}
          </h2>
        </motion.div>
      </div>

      {/* RIGHT SIDE — ICONOS */}
      <div className="flex items-center gap-5">
        {/* Notificaciones */}
        <button className="relative hover:bg-gray-100 p-2 rounded-full transition">
          <Bell size={20} className="text-gray-600" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* Usuario */}
        <div className="relative">
          <button
            onClick={() => setShowMenu((prev) => !prev)}
            className="flex items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-full px-3 py-1.5 transition"
          >
            <User size={18} className="text-gray-700" />
            <ChevronDown
              size={16}
              className={`text-gray-600 transition-transform ${
                showMenu ? "rotate-180" : ""
              }`}
            />
          </button>

          {showMenu && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
            >
              <p className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                {userName}
                <br />
                <span className="text-xs text-gray-500 capitalize">
                  {roleGreeting}
                </span>
              </p>
              <button
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/login";
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Cerrar sesión
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </nav>
  );
}
