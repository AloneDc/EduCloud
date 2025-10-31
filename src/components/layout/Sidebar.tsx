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
  GraduationCap,
  ClipboardList,
  TrendingUp,
  FileSpreadsheet,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import Logo from "../ui/Logo";
import { motion } from "framer-motion";

export default function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();

  /**
   * 🧭 Menú actualizado con módulos actuales del proyecto EduCloud v2
   */
  const menu = {
    docente: [
      {
        section: "Panel",
        items: [
          {
            label: "Inicio",
            icon: LayoutDashboard,
            href: "/dashboard/docente",
          },
        ],
      },
      {
        section: "Gestión docente",
        items: [
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
            label: "Resumen de asistencia",
            icon: FileSpreadsheet,
            href: "/dashboard/docente/asistencia/resumen",
          },
        ],
      },
      {
        section: "Seguimiento",
        items: [
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
      },
    ],

    directivo: [
      {
        section: "Panel",
        items: [
          {
            label: "Inicio",
            icon: LayoutDashboard,
            href: "/dashboard/directivo",
          },
        ],
      },
      {
        section: "Gestión institucional",
        items: [
          {
            label: "Revisiones pedagógicas",
            icon: ClipboardList,
            href: "/dashboard/directivo/revisiones",
          },
          {
            label: "Gestión de alumnos",
            icon: GraduationCap,
            href: "/dashboard/directivo/alumnos",
          },
          {
            label: "Docentes",
            icon: Users,
            href: "/dashboard/directivo/docentes",
          },
        ],
      },
      {
        section: "Indicadores",
        items: [
          {
            label: "Reportes globales",
            icon: TrendingUp,
            href: "/dashboard/directivo/reportes",
          },
          {
            label: "Notificaciones",
            icon: Bell,
            href: "/dashboard/directivo/notificaciones",
          },
        ],
      },
    ],

    supervisor: [
      {
        section: "Panel",
        items: [
          {
            label: "Inicio",
            icon: LayoutDashboard,
            href: "/dashboard/supervisor",
          },
        ],
      },
      {
        section: "Supervisiones",
        items: [
          {
            label: "Revisiones",
            icon: ClipboardList,
            href: "/dashboard/supervisor/supervisiones",
          },
          {
            label: "Reportes",
            icon: BarChart3,
            href: "/dashboard/supervisor/reportes",
          },
        ],
      },
    ],

    admin: [
      {
        section: "Panel",
        items: [
          {
            label: "Inicio",
            icon: LayoutDashboard,
            href: "/dashboard/admin",
          },
        ],
      },
      {
        section: "Gestión del sistema",
        items: [
          {
            label: "Usuarios",
            icon: Users,
            href: "/dashboard/admin/usuarios",
          },
          {
            label: "Reportes globales",
            icon: BarChart3,
            href: "/dashboard/admin/reportes",
          },
        ],
      },
    ],
  };

  const sections = menu[role as keyof typeof menu] || [];

  return (
    <aside className="w-64 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-950 text-white flex flex-col justify-between shadow-2xl">
      {/* HEADER */}
      <div>
        <div className="p-6 border-b border-blue-700 flex flex-col items-start">
          <Logo />
          <span className="mt-2 text-sm text-blue-200 capitalize bg-blue-700/30 px-3 py-1 rounded-lg">
            {role}
          </span>
        </div>

        {/* NAVIGATION */}
        <nav className="mt-4 px-4 space-y-6">
          {sections.map((section, index) => (
            <div key={index}>
              <h4 className="text-xs font-semibold uppercase text-blue-300 mb-2 ml-2 tracking-wide">
                {section.section}
              </h4>
              <div className="space-y-1">
                {section.items.map(({ label, icon: Icon, href }) => {
                  const active = pathname === href;
                  return (
                    <motion.div
                      key={href}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                    >
                      <Link
                        href={href}
                        className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-all duration-200 ${
                          active
                            ? "bg-blue-700 text-white shadow-md border border-blue-500"
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
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* FOOTER */}
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
