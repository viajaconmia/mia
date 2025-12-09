export function calcularNoches(checkIn: string, checkOut: string) {
  // Convertir a objetos Date
  const fechaInicio = new Date(checkIn);
  const fechaFin = new Date(checkOut);

  // Calcular diferencia en milisegundos
  const diferenciaMs = fechaFin.getTime() - fechaInicio.getTime();

  // Convertir milisegundos a días (1 día = 1000ms * 60s * 60m * 24h)
  const noches = diferenciaMs / (1000 * 60 * 60 * 24);

  return noches;
}

export const calcularEdad = (
  fechaNacimiento: string | undefined
): number | undefined => {
  if (!fechaNacimiento) return undefined;
  const hoy = new Date();
  const fechaNacimientoDate = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - fechaNacimientoDate.getFullYear();
  const mes = hoy.getMonth();
  const dia = hoy.getDate();

  // Ajustar si no ha cumplido años este año
  if (
    mes < fechaNacimientoDate.getMonth() ||
    (mes === fechaNacimientoDate.getMonth() &&
      dia < fechaNacimientoDate.getDate())
  ) {
    edad--;
  }
  return edad;
};
