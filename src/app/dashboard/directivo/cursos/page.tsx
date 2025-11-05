"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/layout/DashboardLayout";
import {
  BookOpen,
  GraduationCap,
  Users,
  Calendar,
  X,
  Search,
  Filter,
  Archive,
  Edit2,
  Plus,
} from "lucide-react";

interface Teacher {
  full_name: string;
}

interface Course {
  id: string;
  name: string;
  grade: string;
  section: string;
  level: string;
  year: number;
  period: string;
  area: string;
  teacher_id: string;
  archived: boolean;
  teacher?: Teacher;
}

interface Docente {
  id: string;
  full_name: string;
}

interface FormData {
  name: string;
  grade: string;
  section: string;
  level: string;
  year: number;
  period: string;
  area: string;
  teacher_id: string;
}

const INITIAL_FORM_DATA: FormData = {
  name: "",
  grade: "",
  section: "",
  level: "",
  year: new Date().getFullYear(),
  period: "",
  area: "",
  teacher_id: "",
};

const GRADE_OPTIONS = ["1°", "2°", "3°", "4°", "5°", "6°"];
const LEVEL_OPTIONS = ["Primaria", "Secundaria"];
const PERIOD_OPTIONS = [
  "I Bimestre",
  "II Bimestre",
  "III Bimestre",
  "IV Bimestre",
];
const AREA_OPTIONS = [
  "Matemática",
  "Comunicación",
  "Ciencia y Tecnología",
  "Personal Social",
  "Arte y Cultura",
  "Educación Física",
  "Educación Religiosa",
  "Inglés",
];

export default function GestionCursos() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [docentes, setDocentes] = useState<Docente[]>([]);
  const [institutionId, setInstitutionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterCoursesData();
  }, [courses, searchTerm, filterLevel]);

  const filterCoursesData = () => {
    let filtered = [...courses];

    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.teacher?.full_name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          c.area.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterLevel) {
      filtered = filtered.filter((c) => c.level === filterLevel);
    }

    setFilteredCourses(filtered);
  };

  const fetchData = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      toast.error("No se pudo obtener el usuario actual.");
      return;
    }

    const { data: userData } = await supabase
      .from("users")
      .select("institution_id")
      .eq("id", user.id)
      .single();

    if (!userData?.institution_id) {
      toast.error("No se encontró institución asignada.");
      setLoading(false);
      return;
    }

    setInstitutionId(userData.institution_id);

    const { data: teachers } = await supabase
      .from("users")
      .select("id, full_name")
      .eq("role", "docente")
      .eq("institution_id", userData.institution_id)
      .eq("active", true);

    setDocentes(teachers || []);

    const { data: courseData, error } = await supabase
      .from("courses")
      .select("*, teacher:teacher_id(full_name)")
      .eq("institution_id", userData.institution_id)
      .eq("archived", false)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error al cargar cursos.");
      console.error(error);
    } else {
      setCourses(courseData || []);
    }

    setLoading(false);
  };

  const handleInputChange = (field: keyof FormData, value: string | number) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.area);
      case 2:
        return !!(formData.level && formData.grade && formData.section);
      case 3:
        return !!(formData.teacher_id && formData.period);
      default:
        return true;
    }
  };

  const handleNextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 3));
    } else {
      toast.warning("Por favor completa todos los campos requeridos.");
    }
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateStep(1) || !validateStep(2) || !validateStep(3)) {
      toast.warning("Por favor completa todos los campos obligatorios.");
      return;
    }

    if (!institutionId) {
      toast.error("No se puede crear el curso sin institución.");
      return;
    }

    const { error } = await supabase.from("courses").insert([
      {
        ...formData,
        institution_id: institutionId,
        archived: false,
      },
    ]);

    if (error) {
      if (error.code === "23505") {
        toast.error("Ya existe un curso con esos datos.");
      } else {
        toast.error("Error al crear el curso.");
      }
      console.error(error);
    } else {
      toast.success("✅ Curso creado correctamente.");
      closeModal();
      fetchData();
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setCurrentStep(1);
    setFormData(INITIAL_FORM_DATA);
  };

  const archiveCourse = async (id: string) => {
    const confirm = window.confirm("¿Deseas archivar este curso?");
    if (!confirm) return;

    const { error } = await supabase
      .from("courses")
      .update({ archived: true })
      .eq("id", id);

    if (error) {
      toast.error("Error al archivar el curso.");
    } else {
      toast.success("Curso archivado correctamente.");
      fetchData();
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <BookOpen className="w-6 h-6 text-blue-600" />
              <h4 className="text-lg font-semibold text-gray-800">
                Información del Curso
              </h4>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre del curso <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                placeholder="Ej: Matemática Avanzada"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Área <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.area}
                onChange={(e) => handleInputChange("area", e.target.value)}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">Selecciona un área</option>
                {AREA_OPTIONS.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <GraduationCap className="w-6 h-6 text-blue-600" />
              <h4 className="text-lg font-semibold text-gray-800">
                Nivel y Grado
              </h4>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nivel <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.level}
                onChange={(e) => handleInputChange("level", e.target.value)}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">Selecciona un nivel</option>
                {LEVEL_OPTIONS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grado <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.grade}
                  onChange={(e) => handleInputChange("grade", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                >
                  <option value="">Selecciona</option>
                  {GRADE_OPTIONS.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sección <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.section}
                  onChange={(e) => handleInputChange("section", e.target.value)}
                  className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  placeholder="Ej: A, B, C"
                  maxLength={2}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Año académico
              </label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) =>
                  handleInputChange("year", Number(e.target.value))
                }
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                min={2020}
                max={2030}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-6">
              <Users className="w-6 h-6 text-blue-600" />
              <h4 className="text-lg font-semibold text-gray-800">
                Asignación
              </h4>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Docente titular <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.teacher_id}
                onChange={(e) =>
                  handleInputChange("teacher_id", e.target.value)
                }
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">Selecciona un docente</option>
                {docentes.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Periodo <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.period}
                onChange={(e) => handleInputChange("period", e.target.value)}
                className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">Selecciona un periodo</option>
                {PERIOD_OPTIONS.map((period) => (
                  <option key={period} value={period}>
                    {period}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <h5 className="font-semibold text-gray-800 mb-2">
                Resumen del curso
              </h5>
              <div className="text-sm text-gray-600 space-y-1">
                <p>
                  <strong>Curso:</strong> {formData.name || "—"}
                </p>
                <p>
                  <strong>Área:</strong> {formData.area || "—"}
                </p>
                <p>
                  <strong>Nivel:</strong> {formData.level || "—"}
                </p>
                <p>
                  <strong>Grado y Sección:</strong> {formData.grade} -{" "}
                  {formData.section || "—"}
                </p>
                <p>
                  <strong>Docente:</strong>{" "}
                  {docentes.find((d) => d.id === formData.teacher_id)
                    ?.full_name || "—"}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <DashboardLayout role="directivo" title="Gestión de Cursos">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-800">
              Cursos Académicos
            </h2>
            <p className="text-gray-600 mt-1">
              Gestiona los cursos, grados y asignaciones de docentes
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Nuevo Curso
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-xl shadow border border-gray-100">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre, docente o área..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
                className="border border-gray-300 px-4 py-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">Todos los niveles</option>
                {LEVEL_OPTIONS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Courses List */}
        {loading ? (
          <div className="text-center py-16 bg-white rounded-xl shadow">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-500">Cargando cursos...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="bg-white p-16 rounded-xl text-center border shadow">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">
              {searchTerm || filterLevel
                ? "No se encontraron cursos con esos filtros"
                : "No hay cursos registrados aún"}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredCourses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition border border-gray-100"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-800">
                        {course.name}
                      </h3>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {course.area}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-gray-500 text-xs">Nivel</p>
                        <p className="font-semibold text-gray-800">
                          {course.level}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Grado/Sección</p>
                        <p className="font-semibold text-gray-800">
                          {course.grade} - {course.section}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Periodo</p>
                        <p className="font-semibold text-gray-800">
                          {course.period || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Año</p>
                        <p className="font-semibold text-gray-800">
                          {course.year}
                        </p>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Docente:</span>
                      <span className="font-semibold text-gray-800">
                        {course.teacher?.full_name || "Sin asignar"}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => archiveCourse(course.id)}
                    className="ml-4 px-4 py-2 rounded-lg text-sm font-semibold border border-red-300 text-red-600 hover:bg-red-50 transition flex items-center gap-2"
                  >
                    <Archive className="w-4 h-4" />
                    Archivar
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-800">
                      Crear Nuevo Curso
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Paso {currentStep} de 3
                    </p>
                  </div>
                  <button
                    onClick={closeModal}
                    className="p-2 hover:bg-white rounded-lg transition"
                  >
                    <X className="w-6 h-6 text-gray-500" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 flex gap-2">
                  {[1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`h-2 flex-1 rounded-full transition-all ${
                        step <= currentStep ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Modal Body */}
              <form
                onSubmit={handleCreateCourse}
                className="flex-1 overflow-y-auto px-8 py-6"
              >
                {renderStepContent()}
              </form>

              {/* Modal Footer */}
              <div className="px-8 py-6 border-t bg-gray-50">
                <div className="flex justify-between gap-3">
                  <button
                    type="button"
                    onClick={currentStep === 1 ? closeModal : handlePrevStep}
                    className="px-6 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-100 transition font-medium"
                  >
                    {currentStep === 1 ? "Cancelar" : "Anterior"}
                  </button>

                  {currentStep < 3 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-6 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition font-medium"
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button
                      type="submit"
                      onClick={handleCreateCourse}
                      disabled={loading}
                      className="px-6 py-2.5 rounded-lg bg-green-600 text-white hover:bg-green-700 transition font-medium disabled:opacity-50"
                    >
                      {loading ? "Guardando..." : "Crear Curso"}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
