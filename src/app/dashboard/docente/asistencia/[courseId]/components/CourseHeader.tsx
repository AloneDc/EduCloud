"use client";

import type { FC } from "react";
import { motion } from "framer-motion";
import type { Course, Teacher } from "@/types/attendance";

interface CourseHeaderProps {
  course: Course | null;
  teacher: Teacher | null;
  currentDate: Date;
}

const CourseHeader: FC<CourseHeaderProps> = ({
  course,
  teacher,
  currentDate,
}) => {
  const formattedDate = currentDate.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
    >
      <div>
        <h1 className="text-lg font-semibold text-gray-800">
          {course ? course.name : "Cargando curso..."}
        </h1>
        <p className="text-gray-500 text-sm">
          {course?.grade && `${course.grade}°`}{" "}
          {course?.section && ` - ${course.section}`}{" "}
          {course?.level && `(${course.level})`}
        </p>
      </div>

      <div className="text-right">
        <p className="text-gray-700 text-sm">
          👩‍🏫 {teacher?.full_name ?? "Docente"}
        </p>
        <p className="text-gray-500 text-xs">{formattedDate}</p>
      </div>
    </motion.div>
  );
};

export default CourseHeader;
