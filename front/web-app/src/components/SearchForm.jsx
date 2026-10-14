import { useState } from 'react';
import { Search, Calendar, ArrowRightLeft } from 'lucide-react';
import InputField from './ui/InputField';
import Button from './ui/Button';
import LocationAutocomplete from './LocationAutocomplete';

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
  const [errores, setErrores] = useState({});

  const swapLocations = () => {
    setOrigen(destino);
    setDestino(origen);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const nuevosErrores = {};
    if (!origen.trim()) nuevosErrores.origen = 'Ingresá una localidad de origen';
    if (!destino.trim()) nuevosErrores.destino = 'Ingresá una localidad de destino';

    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }

    setErrores({});
    onSearch({ origen: origen.trim(), destino: destino.trim(), fecha });
  };

  return (
    <form onSubmit={handleSubmit} className="vv-search-form" aria-label="Buscar viajes" noValidate>
      <LocationAutocomplete
        id="busqueda-origen"
        name="origen"
        label="Origen"
        placeholder="Ej: San Roque, Corrientes..."
        value={origen}
        onChange={(value) => {
          setOrigen(value);
          setErrores((prev) => ({ ...prev, origen: undefined }));
        }}
        error={errores.origen}
        required
      />

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

      <LocationAutocomplete
        id="busqueda-destino"
        name="destino"
        label="Destino"
        placeholder="Ej: Corrientes, Goya..."
        value={destino}
        onChange={(value) => {
          setDestino(value);
          setErrores((prev) => ({ ...prev, destino: undefined }));
        }}
        error={errores.destino}
        required
      />

      <div className="vv-search-form__field">
        <InputField
          id="busqueda-fecha"
          label="Fecha"
          type="date"
          value={fecha}
          min={hoy()}
          onChange={(event) => setFecha(event.target.value)}
          icon={Calendar}
          required
        />
      </div>

      <Button type="submit" size="lg" pill loading={isLoading} className="vv-search-form__submit">
        <Search size={20} />
        Buscar viajes
      </Button>
    </form>
  );
};

export default SearchForm;
