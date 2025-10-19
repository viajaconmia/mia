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
