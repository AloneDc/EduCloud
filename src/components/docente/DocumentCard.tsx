import { FileText, Clock, CheckCircle, AlertCircle } from "lucide-react";

type Document = {
  id: string;
  title: string;
  type: string;
  period: string;
  status: "pendiente" | "aprobado" | "observado";
};

export default function DocumentCard({ doc }: { doc: Document }) {
  const statusColor =
    doc.status === "pendiente"
      ? "text-yellow-600 bg-yellow-50"
      : doc.status === "aprobado"
      ? "text-green-600 bg-green-50"
      : "text-red-600 bg-red-50";

  const StatusIcon =
    doc.status === "pendiente"
      ? Clock
      : doc.status === "aprobado"
      ? CheckCircle
      : AlertCircle;

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-start justify-between hover:shadow transition">
      <div>
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" /> {doc.title}
        </h3>
        <p className="text-sm text-gray-500">
          {doc.type} – {doc.period}
        </p>
      </div>

      <div
        className={`flex items-center gap-2 px-3 py-1 text-sm rounded-lg ${statusColor}`}
      >
        <StatusIcon className="w-4 h-4" />
        {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
      </div>
    </div>
  );
}
