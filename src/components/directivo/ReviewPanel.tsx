"use client";

import { useState } from "react";
import { addReview } from "@/lib/reviewService";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

type ReviewStatus = "aprobado" | "observado";

interface ReviewPanelProps {
  documentId: string;
}

export default function ReviewPanel({ documentId }: ReviewPanelProps) {
  const [comment, setComment] = useState("");
  const [result, setResult] = useState<ReviewStatus>("observado");
  const [statusMessage, setStatusMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReview = async () => {
    if (!comment.trim()) {
      setStatusMessage(
        "⚠️ Por favor, escribe una observación antes de guardar."
      );
      return;
    }

    setIsSubmitting(true);
    setStatusMessage("Guardando revisión...");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setStatusMessage("❌ No hay sesión activa.");
      setIsSubmitting(false);
      return;
    }

    try {
      await addReview(documentId, user.id, comment, result);
      setStatusMessage("✅ Revisión guardada correctamente.");
      setComment("");
    } catch (error) {
      console.error(error);
      setStatusMessage("❌ Error al guardar la revisión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
    >
      <h3 className="font-bold text-xl text-gray-800 mb-2">
        Agregar observación
      </h3>
      <p className="text-gray-600 text-sm mb-4">
        Revisa el documento y registra tus observaciones o aprobación.
      </p>

      {/* Textarea */}
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Escribe tus observaciones aquí..."
        className="w-full border border-gray-300 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 rounded-lg px-4 py-2 text-gray-800 placeholder-gray-400 mb-4 transition"
        rows={4}
      />

      {/* Radio buttons */}
      <div className="flex items-center gap-6 mb-6">
        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="result"
            value="aprobado"
            checked={result === "aprobado"}
            onChange={() => setResult("aprobado")}
            className="accent-green-600 h-4 w-4"
          />
          <span className="ml-2 text-green-700 font-medium">Aprobado</span>
        </label>

        <label className="flex items-center cursor-pointer">
          <input
            type="radio"
            name="result"
            value="observado"
            checked={result === "observado"}
            onChange={() => setResult("observado")}
            className="accent-red-600 h-4 w-4"
          />
          <span className="ml-2 text-red-700 font-medium">Observado</span>
        </label>
      </div>

      {/* Submit button */}
      <button
        onClick={handleReview}
        disabled={isSubmitting}
        className={`w-full py-2.5 rounded-lg font-semibold text-white transition ${
          isSubmitting
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        }`}
      >
        {isSubmitting ? "Guardando..." : "Guardar revisión"}
      </button>

      {/* Estado del proceso */}
      {statusMessage && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={`mt-4 text-sm text-center font-medium ${
            statusMessage.startsWith("✅")
              ? "text-green-600"
              : statusMessage.startsWith("❌")
              ? "text-red-600"
              : statusMessage.startsWith("⚠️")
              ? "text-yellow-600"
              : "text-gray-600"
          }`}
        >
          {statusMessage}
        </motion.p>
      )}
    </motion.div>
  );
}
