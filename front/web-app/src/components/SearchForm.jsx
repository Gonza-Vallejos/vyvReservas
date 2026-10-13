import { useEffect, useRef, useState, useCallback } from 'react';
import { Search, MapPin, Calendar, ArrowRightLeft } from 'lucide-react';
import { viajeService } from '../services/api';
import InputField from './ui/InputField';
import Button from './ui/Button';

// Lista base de respaldo para sugerir ciudades incluso si el backend está iniciando
const CIUDADES_DEFAULT = [
  'Corrientes',
  'San Roque',
  'Goya',
  'Mercedes',
  'Bella Vista',
  'Curuzú Cuatiá',
  'Paso de los Libres',
  'Ituzaingó',
  'Saladas',
  'Santa Lucía',
  'Esquina',
  'Monte Caseros',
  'Resistencia',
  'Posadas'
];

const formatISODate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const hoy = () => formatISODate(new Date());

const SearchForm = ({ onSearch, isLoading = false }) => {
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [fecha, setFecha] = useState(hoy());

  const [localidades, setLocalidades] = useState(CIUDADES_DEFAULT);
  const [sugerenciasOrigen, setSugerenciasOrigen] = useState([]);
  const [sugerenciasDestino, setSugerenciasDestino] = useState([]);
  const [errores, setErrores] = useState({});

  const origenRef = useRef(null);
  const destinoRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchLocalidades = async () => {
      try {
        const response = await viajeService.obtenerLocalidades();
        if (!isMounted) return;
        const result = response.data;
        const locationsArray = result.data || result;
        if (Array.isArray(locationsArray) && locationsArray.length > 0) {
          const nombres = locationsArray
            .map((l) => (typeof l === 'string' ? l : l.nombre))
            .filter(Boolean);
          const combinadas = Array.from(new Set([...nombres, ...CIUDADES_DEFAULT]));
          setLocalidades(combinadas);
        }
      } catch {
        console.warn('Usando localidades por defecto:', CIUDADES_DEFAULT);
      }
    };
    fetchLocalidades();

    const handleClickOutside = (e) => {
      if (origenRef.current && !origenRef.current.contains(e.target)) {
        setSugerenciasOrigen([]);
      }
      if (destinoRef.current && !destinoRef.current.contains(e.target)) {
        setSugerenciasDestino([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      isMounted = false;
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filtrarCiudades = useCallback((query) => {
    if (!query || query.trim().length === 0) return [];
    const q = query.trim().toLowerCase();
    return localidades.filter((l) => l.toLowerCase().includes(q));
  }, [localidades]);

  const handleOrigenChange = (e) => {
    const value = e.target.value;
    setOrigen(value);
    setErrores((prev) => ({ ...prev, origen: undefined }));
    setSugerenciasOrigen(filtrarCiudades(value));
  };

  const handleDestinoChange = (e) => {
    const value = e.target.value;
    setDestino(value);
    setErrores((prev) => ({ ...prev, destino: undefined }));
    setSugerenciasDestino(filtrarCiudades(value));
  };

  const handleOrigenFocus = () => {
    setSugerenciasOrigen(filtrarCiudades(origen));
  };

  const handleDestinoFocus = () => {
    setSugerenciasDestino(filtrarCiudades(destino));
  };

  const swapLocations = () => {
    setOrigen(destino);
    setDestino(origen);
    setSugerenciasOrigen([]);
    setSugerenciasDestino([]);
  };

  const seleccionarOrigen = (ciudad) => {
    setOrigen(ciudad);
    setSugerenciasOrigen([]);
  };

  const seleccionarDestino = (ciudad) => {
    setDestino(ciudad);
    setSugerenciasDestino([]);
  };

  const aplicarFechaRapida = (diasDesdeHoy) => {
    const base = new Date();
    base.setDate(base.getDate() + diasDesdeHoy);
    setFecha(formatISODate(base));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nuevosErrores = {};
    if (!origen.trim()) nuevosErrores.origen = 'Ingresá una ciudad de origen';
    if (!destino.trim()) nuevosErrores.destino = 'Ingresá una ciudad de destino';

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setErrores({});
    setSugerenciasOrigen([]);
    setSugerenciasDestino([]);
    onSearch({ origen: origen.trim(), destino: destino.trim(), fecha });
  };

  const renderSugerencias = (items, onSelect, idPrefix) => {
    if (items.length === 0) return null;
    return (
      <ul
        className="vv-search-form__suggestions"
        role="listbox"
        aria-label="Sugerencias de localidades"
      >
        {items.slice(0, 6).map((ciudad, index) => (
          <li key={`${idPrefix}-${index}`} role="presentation">
            <button
              type="button"
              role="option"
              className="vv-search-form__suggestion"
              onClick={() => onSelect(ciudad)}
            >
              <span className="vv-search-form__suggestion-icon" aria-hidden="true">
                <MapPin size={16} />
              </span>
              <span>{ciudad}</span>
            </button>
          </li>
        ))}
      </ul>
    );
  };

  const shortcutToday = hoy();
  const shortcutTomorrow = formatISODate(new Date(new Date().setDate(new Date().getDate() + 1)));
  const shortcutDayAfter = formatISODate(new Date(new Date().setDate(new Date().getDate() + 2)));

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="vv-search-form"
        aria-label="Buscar viajes"
        noValidate
      >
        <div ref={origenRef} className="vv-search-form__field" style={{ position: 'relative' }}>
          <InputField
            label="Origen"
            placeholder="Ej: San Roque, Corrientes..."
            value={origen}
            onChange={handleOrigenChange}
            onFocus={handleOrigenFocus}
            icon={MapPin}
            error={errores.origen}
            clearable
            onClear={() => { setOrigen(''); setSugerenciasOrigen([]); }}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={sugerenciasOrigen.length > 0}
          />
          {renderSugerencias(sugerenciasOrigen, seleccionarOrigen, 'origen')}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="vv-search-form__swap"
          onClick={swapLocations}
          ariaLabel="Intercambiar origen y destino"
          title="Intercambiar origen y destino"
        >
          <ArrowRightLeft size={18} />
        </Button>

        <div ref={destinoRef} className="vv-search-form__field" style={{ position: 'relative' }}>
          <InputField
            label="Destino"
            placeholder="Ej: Corrientes, Goya..."
            value={destino}
            onChange={handleDestinoChange}
            onFocus={handleDestinoFocus}
            icon={MapPin}
            error={errores.destino}
            clearable
            onClear={() => { setDestino(''); setSugerenciasDestino([]); }}
            autoComplete="off"
            aria-autocomplete="list"
            aria-expanded={sugerenciasDestino.length > 0}
          />
          {renderSugerencias(sugerenciasDestino, seleccionarDestino, 'destino')}
        </div>

        <div className="vv-search-form__field">
          <InputField
            label="Fecha"
            type="date"
            value={fecha}
            min={shortcutToday}
            onChange={(e) => setFecha(e.target.value)}
            icon={Calendar}
            required
          />
        </div>

        <Button
          type="submit"
          size="lg"
          pill
          loading={isLoading}
          className="vv-search-form__submit"
        >
          <Search size={20} />
          Buscar viajes
        </Button>
      </form>

      <div className="vv-search-form__shortcuts" aria-label="Atajos de fecha">
        <span className="vv-search-form__shortcuts-label">
          Viajar:
        </span>
        <Button
          variant={fecha === shortcutToday ? 'primary' : 'secondary'}
          size="sm"
          pill
          onClick={() => aplicarFechaRapida(0)}
        >
          Hoy
        </Button>
        <Button
          variant={fecha === shortcutTomorrow ? 'primary' : 'secondary'}
          size="sm"
          pill
          onClick={() => aplicarFechaRapida(1)}
        >
          Mañana
        </Button>
        <Button
          variant={fecha === shortcutDayAfter ? 'primary' : 'secondary'}
          size="sm"
          pill
          onClick={() => aplicarFechaRapida(2)}
        >
          Pasado mañana
        </Button>
      </div>
    </>
  );
};

export default SearchForm;
