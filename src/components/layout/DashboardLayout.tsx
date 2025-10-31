"use client";

import { ReactNode, useState } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { motion, AnimatePresence } from "framer-motion";

interface DashboardLayoutProps {
  children: ReactNode;
  role: string;
  title?: string;
}

export default function DashboardLayout({
  children,
  role,
  title,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50 text-gray-800 transition-colors duration-300">
      {/* ✅ SIDEBAR PERMANENTE EN ESCRITORIO */}
      <aside className="hidden lg:flex w-64 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-950 text-white shadow-2xl flex-col">
        <Sidebar role={role} />
        <div className="mt-auto p-4 border-t border-blue-800 text-xs text-blue-200 text-center">
          <p>© 2025 EduCloud</p>
          <p className="text-[10px]">Transformando la gestión educativa</p>
        </div>
      </aside>

      {/* ✅ SIDEBAR DESLIZABLE EN MÓVIL */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            key="mobile-sidebar"
            initial={{ x: -260, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -260, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-blue-900 via-blue-800 to-blue-950 text-white shadow-2xl flex flex-col lg:hidden"
          >
            <Sidebar role={role} />

            <div className="mt-auto p-4 border-t border-blue-800 text-xs text-blue-200 text-center">
              <p>© 2025 EduCloud</p>
              <p className="text-[10px]">Transformando la gestión educativa</p>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* ✅ OVERLAY OSCURO CUANDO SE ABRE EN MÓVIL */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 lg:hidden"
        ></div>
      )}

      {/* ✅ CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col">
        {/* NAVBAR */}
        <Navbar
          role={role}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
        />

        {/* CONTENIDO */}
        <main className="flex-1 p-6 bg-white/70 rounded-tl-3xl shadow-inner overflow-y-auto">
          <div className="max-w-7xl mx-auto transition-all duration-300">
            {title && (
              <motion.h1
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-2xl font-semibold text-gray-800 mb-6"
              >
                {title}
              </motion.h1>
            )}

            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
