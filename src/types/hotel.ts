export interface Room {
  id_tipo_cuarto: number;
  cuarto: string;
  id_tarifa: number;
  precio: string;
}

export interface Hotel {
  id_hotel: string;
  hotel: string;
  direccion: string;
  estado: string;
  ciudad: string;
  codigo_postal: string;
  colonia: string;
  menores_de_edad: string;
  precio_persona_extra: string;
  desayuno_incluido: string;
  desayuno_comentarios: string;
  transportacion: string;
  imagenes: string[];
  tipos_cuartos: Room[];
}

export interface Amenity {
  icon: string;
  label: string;
}
