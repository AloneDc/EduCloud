"use client";

import { useState, useEffect, FormEvent, ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabaseClient";

type Role = "docente" | "directivo" | "supervisor" | "";

interface Institution {
  id: string;
  name: string;
}

interface FormValues {
  full_name: string;
  email: string;
  password: string;
  institution_name: string;
  institution_id: string;
  region: string;
  address: string;
  nivel_educativo: string;
}

export default function RegisterPage(): React.ReactElement {
  const router = useRouter();

  const [role, setRole] = useState<Role>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [form, setForm] = useState<FormValues>({
    full_name: "",
    email: "",
    password: "",
    institution_name: "",
    institution_id: "",
    region: "",
    address: "",
    nivel_educativo: "Primaria",
  });

  // 🧩 Obtener instituciones disponibles si el rol es docente
  useEffect(() => {
    if (role === "docente" && institutions.length === 0) {
      void fetchInstitutions();
    }
  }, [role, institutions.length]);

  const fetchInstitutions = async (): Promise<void> => {
    const { data, error } = await supabase
      .from("institutions")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) {
      console.error("Error cargando instituciones:", error.message);
      toast.error("No se pudieron cargar las instituciones.");
      return;
    }

    setInstitutions(data ?? []);
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (loading) return;

    // 🧠 Validaciones
    if (!role) {
      toast.warning("Selecciona un tipo de usuario para continuar.");
      return;
    }

    if (!form.full_name || !form.email || !form.password) {
      toast.warning("Completa todos los campos obligatorios.");
      return;
    }

    if (form.password.length < 8) {
      toast.warning("La contraseña debe tener al menos 8 caracteres.");
      return;
    }

    if (role === "docente" && !form.institution_id) {
      toast.warning("Selecciona tu institución.");
      return;
    }

    if (
      role === "directivo" &&
      (!form.institution_name || !form.region || !form.address)
    ) {
      toast.warning("Completa los datos de la institución.");
      return;
    }

    setLoading(true);

    try {
      // 🧩 1️⃣ Llamar al endpoint interno (usa Service Role Key)
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, role }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("❌ Error en registro:", result.error);
        toast.error(result.error || "Error al registrar usuario.");
        return;
      }

      const userId = result.user_id as string | undefined;
      if (!userId) {
        toast.error("No se pudo obtener el ID del usuario.");
        return;
      }

      // 🧩 2️⃣ Confirmar correo automáticamente
      const confirmEmail = await fetch("/api/auth/confirm-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId }),
      });

      if (!confirmEmail.ok) {
        console.warn("⚠️ No se pudo confirmar automáticamente el correo.");
      }

      // 🧩 3️⃣ Éxito → notificar y redirigir
      toast.success("✅ Registro exitoso. Redirigiendo al login...");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push("/login");
    } catch (error) {
      console.error("❌ Error en el proceso de registro:", error);
      toast.error("Error de conexión con el servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-blue-100 to-indigo-200">
      <div className="bg-white shadow-2xl rounded-2xl w-full max-w-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Registro EduCloud
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Selecciona tu tipo de cuenta y completa los datos necesarios.
          </p>
        </div>

        {/* Selección de rol */}
        <div className="flex justify-center gap-3 mb-6">
          {(["docente", "directivo", "supervisor"] as Role[]).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              className={`px-4 py-2 rounded-lg border text-sm font-semibold transition ${
                role === r
                  ? "bg-blue-600 text-white border-blue-700"
                  : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {role && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Campos comunes */}
            <InputField
              label="Nombre completo *"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="Ej. María Gómez Pérez"
            />

            <InputField
              label="Correo institucional *"
              name="email"
              value={form.email}
              onChange={handleChange}
              type="email"
              placeholder="correo@institucion.edu.pe"
            />

            <InputField
              label="Contraseña *"
              name="password"
              value={form.password}
              onChange={handleChange}
              type="password"
              placeholder="Mínimo 8 caracteres"
            />

            {/* Rol docente */}
            {role === "docente" && (
              <>
                <SelectField
                  label="Nivel educativo *"
                  name="nivel_educativo"
                  value={form.nivel_educativo}
                  onChange={handleChange}
                  options={["Inicial", "Primaria", "Secundaria"]}
                />

                <SelectField
                  label="Selecciona tu institución *"
                  name="institution_id"
                  value={form.institution_id}
                  onChange={handleChange}
                  options={institutions.map((inst) => ({
                    label: inst.name,
                    value: inst.id,
                  }))}
                />
              </>
            )}

            {/* Rol directivo */}
            {role === "directivo" && (
              <div className="pt-2 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">
                  Datos de la institución
                </h3>
                <InputField
                  name="institution_name"
                  value={form.institution_name}
                  onChange={handleChange}
                  placeholder="Nombre de la institución"
                />
                <InputField
                  name="region"
                  value={form.region}
                  onChange={handleChange}
                  placeholder="Región"
                />
                <InputField
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Dirección"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 mt-4 font-semibold text-white rounded-lg transition ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 shadow-md"
              }`}
            >
              {loading ? "Registrando..." : "Registrar usuario"}
            </button>
          </form>
        )}

        <p className="text-center text-sm mt-5 text-gray-600">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Inicia sesión
          </a>
        </p>

        <div className="text-center text-xs text-gray-400 mt-6 border-t pt-3">
          EduCloud © {new Date().getFullYear()} — Gestión pedagógica digital
        </div>
      </div>
    </div>
  );
}

/* 🔹 Componentes tipados */
interface FieldProps {
  label?: string;
  name: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  placeholder?: string;
  type?: string;
  options?: string[] | { label: string; value: string }[];
}

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  type = "text",
}: FieldProps): React.ReactElement {
  return (
    <div>
      {label && (
        <label className="block text-sm text-gray-600 mb-1">{label}</label>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 border rounded-lg"
        placeholder={placeholder}
        required
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options = [],
}: FieldProps): React.ReactElement {
  return (
    <div>
      {label && (
        <label className="block text-sm text-gray-600 mb-1">{label}</label>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-full px-4 py-2 border rounded-lg"
        required
      >
        <option value="">-- Selecciona --</option>
        {options.map((opt) =>
          typeof opt === "string" ? (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ) : (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          )
        )}
      </select>
    </div>
  );
}
