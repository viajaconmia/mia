import React, { useState, useEffect } from "react";
import {
  Search,
  Hotel,
  ArrowLeft,
  Filter,
  ChevronDown,
  ChevronUp,
  Shield as Child,
} from "lucide-react";
import { fetchHoteles } from "../hooks/useFetch";
import HotelCard from "../components/HotelComponent";
import ProtectedRoute from "../middleware/ProtectedRoute";

interface Hotel {
  id_hotel: string;
  nombre: string;
  id_cadena: number;
  correo: string;
  telefono: string;
  rfc: string;
  razon_social: string;
  direccion: string;
  latitud: string;
  longitud: string;
  convenio: string;
  descripcion: string;
  calificacion: number | null;
  tipo_hospedaje: string;
  cuenta_de_deposito: string;
  Estado: string;
  Ciudad_Zona: string;
  NoktosQ: number | null;
  NoktosQQ: number | null;
  MenoresEdad: string;
  PaxExtraPersona: string;
  DesayunoIncluido: string;
  DesayunoComentarios: string;
  DesayunoPrecioPorPersona: string;
  tiene_transportacion: string;
  Transportacion: string;
  TransportacionComentarios: string;
  acepta_mascotas: string;
  mascotas: string;
  salones: string;
  URLImagenHotel: string;
  URLImagenHotelQ: string;
  URLImagenHotelQQ: string;
  Activo: number;
  Comentarios: string;
  Id_Sepomex: number | null;
  CodigoPostal: string;
  Id_hotel_excel: number;
  Colonia: string;
  tipo_negociacion: string;
  vigencia_convenio: string; // ISO date string
  hay_convenio: string;
  comentario_vigencia: string;
  tipo_pago: string;
  disponibilidad_precio: string;
  contacto_convenio: string;
  contacto_recepcion: string;
  iva: string;
  ish: string;
  otros_impuestos: string;
  otros_impuestos_porcentaje: string;
  comentario_pago: string;
  precio_sencilla: string;
  costo_sencilla: string;
  desayuno_sencilla: number;
  precio_doble: string;
  costo_doble: string;
  precio_persona_extra: string;
  desayuno_doble: number;
  pais: string;
  score_operaciones: number | null;
}

export const HotelSearchPage = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [displayedHotels, setDisplayedHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [states, setStates] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await fetchHoteles();
      console.log("Hotels data:", data);
      setHotels(data);

      if (error) throw error;

      setHotels(data || []);

      // Initially show only 3 random hotels
      const randomHotels = [...(data || [])]
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      setFilteredHotels(data || []);
      setDisplayedHotels(randomHotels);

      // Extract unique values for filters
      const uniqueStates = [
        ...new Set(
          data?.map((hotel: Hotel) => hotel.Estado.toUpperCase()) || []
        ),
      ];
      const uniqueCities = [
        ...new Set(
          data?.map((hotel: Hotel) => hotel.Ciudad_Zona.toUpperCase()) || []
        ),
      ];
      const uniqueBrands = [
        ...new Set(
          data?.map((hotel: Hotel) => hotel.nombre.toUpperCase()) || []
        ),
      ];

      setStates(uniqueStates.sort() as string[]);
      setCities(uniqueCities.sort() as string[]);
      setBrands(uniqueBrands.sort() as string[]);
    } catch (error) {
      console.error("Error fetching hotels:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasSearched) {
      filterHotels();
    }
  }, [searchTerm, selectedState, selectedCity, selectedBrand, hasSearched]);

  const filterHotels = () => {
    let filtered = [...hotels];

    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();

      filtered = filtered.filter(
        (hotel) =>
          hotel?.nombre?.toLowerCase().includes(searchLower) ||
          hotel?.Ciudad_Zona?.toLowerCase().includes(searchLower) ||
          hotel?.Estado?.toLowerCase().includes(searchLower)
      );
    }

    // State filter
    if (selectedState) {
      filtered = filtered.filter((hotel) => hotel.Estado === selectedState);
    }

    // City filter
    if (selectedCity) {
      filtered = filtered.filter((hotel) => hotel.Ciudad_Zona === selectedCity);
    }

    // Brand filter
    if (selectedBrand) {
      filtered = filtered.filter((hotel) => hotel.nombre === selectedBrand);
    }

    setDisplayedHotels(filtered);
  };

  const handleSearch = () => {
    setHasSearched(true);
    filterHotels();
  };

  const handleReserveClick = (hotel: Hotel) => {
    // Store hotel data in session storage
    sessionStorage.setItem("selectedHotel", JSON.stringify(hotel));
    // Update the URL without reloading
    window.history.pushState({}, "", "/manual-reservation");
    // Update the current page state
    window.dispatchEvent(new Event("popstate"));
    // Force a page reload to ensure proper state update
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Section */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">
              Buscar Hoteles
            </h1>

            {/* Search Bar */}
            <div className="relative mb-6">
              <input
                pattern="^[^<>]*$"
                type="text"
                placeholder="Buscar por marca, ciudad o estado..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
              <Search className="w-6 h-6 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2" />
            </div>

            {/* Filters Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>{showFilters ? "Ocultar filtros" : "Mostrar filtros"}</span>
              {showFilters ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>

            {/* Filters */}
            {showFilters && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
                {/* State Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <select
                    value={selectedState}
                    onChange={(e) => setSelectedState(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Todos los estados</option>
                    {states.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </div>

                {/* City Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ciudad
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Todas las ciudades</option>
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Brand Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marca
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  >
                    <option value="">Todas las marcas</option>
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Search Button */}
            <button
              onClick={handleSearch}
              className="mt-6 w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-4 rounded-xl hover:bg-blue-700 transition-colors"
            >
              <Search className="w-5 h-5" />
              <span>Buscar Hoteles</span>
            </button>
          </div>
        </div>

        {/* Results Section */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin" />
          </div>
        ) : displayedHotels.length > 0 ? (
          <>
            {!hasSearched && (
              <div className="text-white text-center mb-8">
                <h2 className="text-2xl font-bold mb-2">Hoteles Destacados</h2>
                <p>Explora algunos de nuestros hoteles más populares</p>
              </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedHotels.map((hotel) => (
                <HotelCard
                  hotel={hotel}
                  onReserve={() => handleReserveClick(hotel)}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white/10 backdrop-blur-sm rounded-xl">
            <Hotel className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <p className="text-white/80 text-lg">
              No se encontraron hoteles con los filtros seleccionados
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
