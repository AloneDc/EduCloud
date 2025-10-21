"use client";
import { Menu } from "lucide-react";

export default function Navbar({ title }: { title: string }) {
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white shadow-md border-b border-gray-100">
      <div className="flex items-center gap-3">
        <Menu className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-blue-800">{title}</h2>
      </div>

      <div className="flex items-center gap-4 text-sm text-gray-600">
        <span className="font-medium text-blue-700">Bienvenido</span>
        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
          E
        </div>
      </div>
    </header>
  );
}
