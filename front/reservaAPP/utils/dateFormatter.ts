/**
 * Utilidades centralizadas para formatear fechas y horas.
 */

export const formatDate = (fechaISO: string | Date): string => {
  const fecha = typeof fechaISO === "string" ? new Date(fechaISO) : fechaISO;
  const day = String(fecha.getDate()).padStart(2, "0");
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const year = fecha.getFullYear();
  return `${day}/${month}/${year}`;
};

export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(":");
  return `${hours}:${minutes}`;
};

export const formatCurrency = (
  value: number,
  currency: string = "ARS"
): string => {
  return `${currency} ${value.toLocaleString("es-AR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

/**
 * Compara una fecha+hora de viaje contra la fecha/hora actual.
 * Útil para clasificar viajes en futuros/pasados.
 */
export const compareTripDateTime = (
  fechaViaje: string,
  horarioSalida: string
): number => {
  const ahora = new Date();
  const fechaViajeDate = new Date(fechaViaje);

  // Normalizar ambas fechas a medianoche local
  const fechaViajeLimpia = new Date(
    fechaViajeDate.getFullYear(),
    fechaViajeDate.getMonth(),
    fechaViajeDate.getDate()
  );
  const fechaActualLimpia = new Date(
    ahora.getFullYear(),
    ahora.getMonth(),
    ahora.getDate()
  );

  if (fechaActualLimpia.getTime() !== fechaViajeLimpia.getTime()) {
    return fechaViajeLimpia.getTime() - fechaActualLimpia.getTime();
  }

  // Misma fecha: comparar por hora
  const [h, m] = horarioSalida.split(":").map(Number);
  const horaViajeMinutos = h * 60 + m;
  const horaActualMinutos = ahora.getHours() * 60 + ahora.getMinutes();
  return horaViajeMinutos - horaActualMinutos;
};

export const isTripFuture = (
  fechaViaje: string,
  horarioSalida: string
): boolean => compareTripDateTime(fechaViaje, horarioSalida) >= 0;
