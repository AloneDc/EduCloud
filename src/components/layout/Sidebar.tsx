"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Users,
  BarChart3,
  Bell,
  LogOut,
  LayoutDashboard,
  CalendarCheck,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Logo from "../ui/Logo";

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();

  const menu = {
    docente: [
      {
        label: "Panel principal",
        icon: LayoutDashboard,
        href: "/dashboard/docente",
      },
      {
        label: "Mis documentos",
        icon: BookOpen,
        href: "/dashboard/docente/documentos",
      },
      {
        label: "Asistencia",
        icon: CalendarCheck,
        href: "/dashboard/docente/asistencia",
      },
      {
        label: "Reportes",
        icon: BarChart3,
        href: "/dashboard/docente/reportes",
      },
      {
        label: "Notificaciones",
        icon: Bell,
        href: "/dashboard/docente/notificaciones",
      },
    ],
    directivo: [
      {
        label: "Panel principal",
        icon: LayoutDashboard,
        href: "/dashboard/directivo",
      },
      {
        label: "Revisiones",
        icon: BookOpen,
        href: "/dashboard/directivo/revisiones",
      },
      { label: "Docentes", icon: Users, href: "/dashboard/directivo/docentes" },
    ],
    supervisor: [
      {
        label: "Panel principal",
        icon: LayoutDashboard,
        href: "/dashboard/supervisor",
      },
      {
        label: "Supervisiones",
        icon: BarChart3,
        href: "/dashboard/supervisor/supervisiones",
      },
    ],
    admin: [
      {
        label: "Panel principal",
        icon: LayoutDashboard,
        href: "/dashboard/admin",
      },
      { label: "Usuarios", icon: Users, href: "/dashboard/admin/usuarios" },
      { label: "Reportes", icon: BarChart3, href: "/dashboard/admin/reportes" },
    ],
  };

  const links = menu[role as keyof typeof menu] || [];

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-950 text-white flex flex-col justify-between shadow-2xl">
      {/* LOGO + ROL */}
      <div>
        <div className="p-6 border-b border-blue-700 flex flex-col items-start">
          <Logo />
          <span className="mt-2 text-sm text-blue-200 capitalize bg-blue-700/30 px-3 py-1 rounded-lg">
            {role}
          </span>
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="mt-4 space-y-1 px-4">
          {links.map(({ label, icon: Icon, href }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                  active
                    ? "bg-blue-700 text-white shadow-md"
                    : "text-blue-100 hover:bg-blue-800 hover:text-white"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${
                    active ? "text-blue-200" : "text-blue-300"
                  }`}
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* FOOTER SECTION */}
      <div className="p-5 border-t border-blue-800 bg-blue-950/50">
        <button
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/login";
          }}
          className="flex items-center gap-2 text-blue-200 hover:text-red-400 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Cerrar sesión</span>
        </button>

        <p className="text-xs text-blue-400 mt-3 text-center opacity-70">
          © 2025 EduCloud <br />
          <span className="text-[10px]">Plataforma educativa</span>
        </p>
      </div>
    </aside>
  );
}
