/**
 * ============================================
 * 📅 Utilidades de Fecha Local
 * ============================================
 * Estas funciones garantizan el manejo correcto
 * de fechas locales (sin desfase UTC), lo cual
 * es vital para el módulo de asistencia.
 *
 * ⚙️ Funciones principales:
 * - Conversión y parseo sin desfase UTC
 * - Formateo en español (largo y corto)
 * - Cálculo de rangos semanales
 * - Validaciones y comparaciones
 * - Operaciones con días
 * ============================================
 */

/* ============================================
   🔹 TIPOS
============================================ */
export type DateInput = Date | string;
export type WeekDay = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Domingo, 6=Sábado

/* ============================================
   🔹 CONVERSIÓN Y PARSEO
============================================ */

/**
 * Convierte una fecha (Date o string) a formato ISO local: YYYY-MM-DD
 * evitando el desfase UTC que ocurre con toISOString().
 *
 * @example
 * toLocalDateString(new Date()) // "2025-10-31"
 * toLocalDateString("2025-10-28T00:00:00") // "2025-10-28"
 */
export function toLocalDateString(dateInput: DateInput): string {
  const date = new Date(dateInput);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().split("T")[0];
}

/**
 * Alias semántico de toLocalDateString
 */
export function toLocalDateISO(dateInput: DateInput): string {
  return toLocalDateString(dateInput);
}

/**
 * Alias adicional para mayor claridad
 */
export function toLocalISO(dateInput: Date): string {
  const local = new Date(
    dateInput.getTime() - dateInput.getTimezoneOffset() * 60000
  );
  return local.toISOString().split("T")[0];
}

/**
 * Convierte un string YYYY-MM-DD a objeto Date (en hora local)
 * SIN usar el constructor Date(string) que asume UTC
 *
 * @example
 * parseLocalDate("2025-10-28") // Date en hora local del 28 de octubre
 */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/* ============================================
   🔹 FORMATEO EN ESPAÑOL
============================================ */

/**
 * Obtiene el nombre del día de la semana en español
 * @example "Lunes", "Martes", etc.
 */
export function getWeekdayName(dateInput: DateInput): string {
  const date =
    typeof dateInput === "string" ? parseLocalDate(dateInput) : dateInput;
  const weekdayIndex = date.getDay();

  return [
    "Domingo",
    "Lunes",
    "Martes",
    "Miércoles",
    "Jueves",
    "Viernes",
    "Sábado",
  ][weekdayIndex];
}

/**
 * Obtiene el nombre corto del día de la semana
 * @example "Lun", "Mar", etc.
 */
export function getShortWeekdayName(dateInput: DateInput): string {
  const date =
    typeof dateInput === "string" ? parseLocalDate(dateInput) : dateInput;
  const weekdayIndex = date.getDay();

  return ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"][weekdayIndex];
}

/**
 * Formatea la fecha en español largo
 * @example "miércoles, 30 de octubre de 2025"
 */
export function formatFullSpanishDate(dateInput: DateInput): string {
  const date =
    typeof dateInput === "string"
      ? parseLocalDate(dateInput)
      : new Date(dateInput);

  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Formatea la fecha en español sin año
 * @example "Miércoles 30 de octubre"
 */
export function formatSpanishDateNoYear(dateInput: DateInput): string {
  const date =
    typeof dateInput === "string"
      ? parseLocalDate(dateInput)
      : new Date(dateInput);

  return date.toLocaleDateString("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/**
 * Formatea la fecha en español corto
 * @example "30/10/2025"
 */
export function formatShortSpanishDate(dateInput: DateInput): string {
  const date =
    typeof dateInput === "string"
      ? parseLocalDate(dateInput)
      : new Date(dateInput);

  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

/**
 * Formatea la fecha con día y mes
 * @example "30 Oct"
 */
export function formatDayMonth(dateInput: DateInput): string {
  const date =
    typeof dateInput === "string"
      ? parseLocalDate(dateInput)
      : new Date(dateInput);

  return date.toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short",
  });
}

/* ============================================
   🔹 CÁLCULO DE RANGOS SEMANALES
============================================ */

/**
 * Obtiene la fecha del lunes de la semana actual (en zona local)
 * Devuelve el string YYYY-MM-DD sin desfase UTC.
 *
 * @example
 * // Si hoy es 31/10/2025 (jueves)
 * getMondayOfCurrentWeekLocal() // "2025-10-27"
 */
export function getMondayOfCurrentWeekLocal(): string {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0=Dom, 1=Lun, ...
  const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(today.setDate(diff));
  return toLocalDateString(monday);
}

/**
 * Obtiene el lunes de la semana de cualquier fecha dada
 *
 * @example
 * getMondayOfWeek("2025-10-31") // "2025-10-27"
 */
export function getMondayOfWeek(dateInput: DateInput): string {
  const date =
    typeof dateInput === "string"
      ? parseLocalDate(dateInput)
      : new Date(dateInput);
  const dayOfWeek = date.getDay();
  const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const monday = new Date(date);
  monday.setDate(diff);
  return toLocalDateString(monday);
}

/**
 * Devuelve un array con las fechas (YYYY-MM-DD)
 * de lunes a viernes de la semana correspondiente.
 *
 * @example
 * getWeekDaysRange("2025-10-27")
 * // ["2025-10-27", "2025-10-28", "2025-10-29", "2025-10-30", "2025-10-31"]
 */
export function getWeekDaysRange(mondayDateISO: string): string[] {
  const monday = parseLocalDate(mondayDateISO);
  const days: string[] = [];
  for (let i = 0; i < 5; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    days.push(toLocalDateString(current));
  }
  return days;
}

/**
 * Obtiene todos los días de la semana (domingo a sábado)
 *
 * @example
 * getFullWeekRange("2025-10-27")
 * // Array con 7 fechas desde domingo hasta sábado
 */
export function getFullWeekRange(mondayDateISO: string): string[] {
  const monday = parseLocalDate(mondayDateISO);
  // Retroceder al domingo anterior
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() - 1);

  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(sunday);
    current.setDate(sunday.getDate() + i);
    days.push(toLocalDateString(current));
  }
  return days;
}

/* ============================================
   🔹 VALIDACIONES Y COMPARACIONES
============================================ */

/**
 * Verifica si una fecha es hoy
 */
export function isToday(dateInput: DateInput): boolean {
  const today = toLocalDateString(new Date());
  const compareDate =
    typeof dateInput === "string" ? dateInput : toLocalDateString(dateInput);
  return compareDate === today;
}

/**
 * Verifica si una fecha es un día laborable (Lunes-Viernes)
 */
export function isWeekday(dateInput: DateInput): boolean {
  const date =
    typeof dateInput === "string" ? parseLocalDate(dateInput) : dateInput;
  const day = date.getDay();
  return day >= 1 && day <= 5;
}

/**
 * Verifica si una fecha es fin de semana
 */
export function isWeekend(dateInput: DateInput): boolean {
  const date =
    typeof dateInput === "string" ? parseLocalDate(dateInput) : dateInput;
  const day = date.getDay();
  return day === 0 || day === 6;
}

/**
 * Verifica si una fecha está en el pasado
 */
export function isPast(dateInput: DateInput): boolean {
  const today = toLocalDateString(new Date());
  const compareDate =
    typeof dateInput === "string" ? dateInput : toLocalDateString(dateInput);
  return compareDate < today;
}

/**
 * Verifica si una fecha está en el futuro
 */
export function isFuture(dateInput: DateInput): boolean {
  const today = toLocalDateString(new Date());
  const compareDate =
    typeof dateInput === "string" ? dateInput : toLocalDateString(dateInput);
  return compareDate > today;
}

/**
 * Verifica si dos fechas son el mismo día
 */
export function isSameDay(date1: DateInput, date2: DateInput): boolean {
  const d1 = typeof date1 === "string" ? date1 : toLocalDateString(date1);
  const d2 = typeof date2 === "string" ? date2 : toLocalDateString(date2);
  return d1 === d2;
}

/* ============================================
   🔹 OPERACIONES CON DÍAS
============================================ */

/**
 * Calcula la diferencia en días entre dos fechas
 *
 * @example
 * daysBetween("2025-10-27", "2025-10-31") // 4
 */
export function daysBetween(date1: DateInput, date2: DateInput): number {
  const d1 = typeof date1 === "string" ? parseLocalDate(date1) : date1;
  const d2 = typeof date2 === "string" ? parseLocalDate(date2) : date2;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Agrega o resta días a una fecha
 *
 * @example
 * addDays("2025-10-28", 3) // "2025-10-31"
 * addDays("2025-10-28", -2) // "2025-10-26"
 */
export function addDays(dateInput: DateInput, days: number): string {
  const date =
    typeof dateInput === "string"
      ? parseLocalDate(dateInput)
      : new Date(dateInput);
  date.setDate(date.getDate() + days);
  return toLocalDateString(date);
}

/**
 * Agrega o resta semanas a una fecha
 */
export function addWeeks(dateInput: DateInput, weeks: number): string {
  return addDays(dateInput, weeks * 7);
}

/**
 * Agrega o resta meses a una fecha
 */
export function addMonths(dateInput: DateInput, months: number): string {
  const date =
    typeof dateInput === "string"
      ? parseLocalDate(dateInput)
      : new Date(dateInput);
  date.setMonth(date.getMonth() + months);
  return toLocalDateString(date);
}

/* ============================================
   🔹 RANGOS DE MESES
============================================ */

/**
 * Obtiene el primer día del mes
 *
 * @example
 * getFirstDayOfMonth("2025-10-28") // "2025-10-01"
 */
export function getFirstDayOfMonth(dateInput: DateInput): string {
  const date =
    typeof dateInput === "string"
      ? parseLocalDate(dateInput)
      : new Date(dateInput);
  return toLocalDateString(new Date(date.getFullYear(), date.getMonth(), 1));
}

/**
 * Obtiene el último día del mes
 *
 * @example
 * getLastDayOfMonth("2025-10-28") // "2025-10-31"
 */
export function getLastDayOfMonth(dateInput: DateInput): string {
  const date =
    typeof dateInput === "string"
      ? parseLocalDate(dateInput)
      : new Date(dateInput);
  return toLocalDateString(
    new Date(date.getFullYear(), date.getMonth() + 1, 0)
  );
}

/**
 * Obtiene todos los días del mes
 */
export function getMonthDays(dateInput: DateInput): string[] {
  const firstDay = getFirstDayOfMonth(dateInput);
  const lastDay = getLastDayOfMonth(dateInput);

  const days: string[] = [];
  let current = parseLocalDate(firstDay);
  const end = parseLocalDate(lastDay);

  while (current <= end) {
    days.push(toLocalDateString(current));
    current = new Date(current);
    current.setDate(current.getDate() + 1);
  }

  return days;
}

/* ============================================
   🔹 UTILIDADES ADICIONALES
============================================ */

/**
 * Obtiene el nombre del mes en español
 * @example "Octubre"
 */
export function getMonthName(dateInput: DateInput): string {
  const date =
    typeof dateInput === "string"
      ? parseLocalDate(dateInput)
      : new Date(dateInput);
  return date.toLocaleDateString("es-ES", { month: "long" });
}

/**
 * Obtiene el año de una fecha
 */
export function getYear(dateInput: DateInput): number {
  const date =
    typeof dateInput === "string"
      ? parseLocalDate(dateInput)
      : new Date(dateInput);
  return date.getFullYear();
}

/**
 * Obtiene el mes de una fecha (1-12)
 */
export function getMonth(dateInput: DateInput): number {
  const date =
    typeof dateInput === "string"
      ? parseLocalDate(dateInput)
      : new Date(dateInput);
  return date.getMonth() + 1;
}

/**
 * Obtiene el día del mes (1-31)
 */
export function getDay(dateInput: DateInput): number {
  const date =
    typeof dateInput === "string"
      ? parseLocalDate(dateInput)
      : new Date(dateInput);
  return date.getDate();
}

/**
 * Genera un rango de fechas entre dos fechas
 *
 * @example
 * getDateRange("2025-10-27", "2025-10-31")
 * // ["2025-10-27", "2025-10-28", "2025-10-29", "2025-10-30", "2025-10-31"]
 */
export function getDateRange(
  startDate: DateInput,
  endDate: DateInput
): string[] {
  const start =
    typeof startDate === "string"
      ? parseLocalDate(startDate)
      : new Date(startDate);
  const end =
    typeof endDate === "string" ? parseLocalDate(endDate) : new Date(endDate);

  const dates: string[] = [];
  const current = new Date(start);

  while (current <= end) {
    dates.push(toLocalDateString(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Cuenta los días laborables entre dos fechas
 */
export function countWeekdays(
  startDate: DateInput,
  endDate: DateInput
): number {
  const dates = getDateRange(startDate, endDate);
  return dates.filter((date) => isWeekday(date)).length;
}
