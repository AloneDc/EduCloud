import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function DashboardLayout({
  children,
  role,
  title,
}: {
  children: ReactNode;
  role: string;
  title: string;
}) {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-blue-50 text-gray-800 transition-colors duration-300">
      {/* SIDEBAR */}
      <aside className="w-64 bg-blue-900 text-white shadow-xl flex flex-col">
        <div className="p-5 border-b border-blue-700">
          <h1 className="text-2xl font-bold tracking-tight">
            Edu<span className="text-blue-300">Cloud</span>
          </h1>
          <p className="text-sm text-blue-200 mt-1 capitalize">{role}</p>
        </div>

        <Sidebar role={role} />

        <div className="mt-auto p-4 border-t border-blue-800 text-xs text-blue-200 text-center">
          <p>© 2025 EduCloud</p>
          <p className="text-[10px]">Transformando la gestión educativa</p>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col">
        <Navbar title={title} />

        <div className="flex-1 p-8 bg-white/80 rounded-tl-3xl shadow-inner overflow-y-auto">
          <div className="max-w-7xl mx-auto transition-all duration-300">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
