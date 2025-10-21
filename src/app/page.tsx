"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { GraduationCap, Cloud, CheckCircle, Shield } from "lucide-react";
import Logo from "@/components/ui/Logo";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-white text-gray-800">
      {/* NAVBAR */}
      <header className="flex justify-between items-center px-8 py-5 shadow-sm bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="text-xl font-bold text-blue-700 tracking-tight">
            EduCloud
          </span>
        </div>

        <nav className="flex gap-6 text-sm font-medium">
          <a href="#features" className="hover:text-blue-600 transition">
            Características
          </a>
          <a href="#benefits" className="hover:text-blue-600 transition">
            Beneficios
          </a>
          <a href="#contact" className="hover:text-blue-600 transition">
            Contacto
          </a>
        </nav>

        <Link
          href="/login"
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md text-sm transition"
        >
          Iniciar sesión
        </Link>
      </header>

      {/* HERO */}
      <section className="flex flex-col items-center text-center py-24 px-8 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Plataforma educativa para la{" "}
            <span className="text-blue-600">gestión digital docente</span>
          </h1>
          <p className="text-gray-600 text-lg mb-8 leading-relaxed">
            EduCloud permite a las instituciones públicas modernizar sus
            procesos pedagógicos, eliminando el uso de papel y garantizando una
            trazabilidad completa de las planificaciones, sesiones e informes
            docentes.
          </p>
          <Link
            href="/login"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 shadow-lg transition"
          >
            Comenzar ahora
          </Link>
        </motion.div>
      </section>

      {/* FEATURES */}
      <section
        id="features"
        className="py-20 bg-white border-t border-gray-100"
      >
        <div className="max-w-6xl mx-auto px-8 text-center">
          <h2 className="text-3xl font-bold mb-12 text-gray-900">
            ¿Qué puedes hacer con EduCloud?
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                icon: <Cloud size={36} className="text-blue-600" />,
                title: "Sube tus planificaciones",
                desc: "Organiza tus documentos pedagógicos en la nube y accede a ellos desde cualquier lugar.",
              },
              {
                icon: <CheckCircle size={36} className="text-blue-600" />,
                title: "Supervisión digital",
                desc: "Los directivos y supervisores pueden revisar, aprobar y dejar observaciones fácilmente.",
              },
              {
                icon: <Shield size={36} className="text-blue-600" />,
                title: "Seguridad y trazabilidad",
                desc: "Todos los archivos cuentan con control de versiones y políticas de acceso seguras.",
              },
            ].map(({ icon, title, desc }) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="p-8 rounded-2xl border border-gray-200 bg-white hover:shadow-lg transition text-center"
              >
                <div className="flex justify-center mb-4">{icon}</div>
                <h3 className="text-lg font-semibold mb-2">{title}</h3>
                <p className="text-gray-600 text-sm">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="benefits" className="py-20 bg-blue-50">
        <div className="max-w-5xl mx-auto text-center px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10">
            Beneficios principales
          </h2>
          <ul className="grid md:grid-cols-2 gap-6 text-left text-gray-700">
            {[
              "Reducción del uso de papel y procesos manuales.",
              "Mayor trazabilidad institucional y control de revisiones.",
              "Supervisión eficiente de docentes por curso o área.",
              "Acceso rápido a la documentación pedagógica.",
              "Plataforma cloud, segura y sostenible.",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-200"
              >
                <CheckCircle className="text-green-600 mt-1" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        id="contact"
        className="bg-blue-900 text-blue-100 py-10 text-center border-t border-blue-800"
      >
        <GraduationCap size={32} className="mx-auto mb-3 text-blue-300" />
        <h3 className="font-semibold text-lg mb-1">EduCloud</h3>
        <p className="text-sm mb-4">
          Plataforma institucional para la gestión pedagógica digital.
        </p>
        <p className="text-xs text-blue-300">
          © 2025 EduCloud — Desarrollado para instituciones públicas del Perú.
        </p>
      </footer>
    </div>
  );
}
