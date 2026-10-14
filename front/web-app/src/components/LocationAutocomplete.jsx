import { useEffect, useMemo, useRef, useState } from 'react';
import { MapPin } from 'lucide-react';
import { viajeService } from '../services/api';
import InputField from './ui/InputField';

const normalize = (value) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .trim();

/** Campo reutilizable para localidades existentes en la base de datos. */
const LocationAutocomplete = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  error,
  required = false,
  name,
}) => {
  const [localidades, setLocalidades] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const containerRef = useRef(null);

  useEffect(() => {
    let active = true;
    viajeService.obtenerLocalidades()
      .then((response) => {
        if (!active) return;
        const result = response.data?.data || response.data || [];
        const names = Array.isArray(result)
          ? result.map((item) => typeof item === 'string' ? item : item.nombre).filter(Boolean)
          : [];
        setLocalidades([...new Set(names)].sort((a, b) => a.localeCompare(b, 'es')));
      })
      .catch(() => {
        if (active) setLocalidades([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    const handleOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      active = false;
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const suggestions = useMemo(() => {
    const query = normalize(value);
    if (!query) return localidades.slice(0, 8);

    return localidades
      .map((name) => ({ name, normalized: normalize(name) }))
      .filter(({ normalized }) => normalized.includes(query))
      .sort((a, b) => {
        const aStarts = a.normalized.startsWith(query);
        const bStarts = b.normalized.startsWith(query);
        return Number(bStarts) - Number(aStarts) || a.name.localeCompare(b.name, 'es');
      })
      .slice(0, 8)
      .map(({ name }) => name);
  }, [localidades, value]);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') setOpen(false);
  };

  return (
    <div ref={containerRef} className="vv-location-autocomplete">
      <InputField
        id={id}
        name={name}
        label={label}
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        icon={MapPin}
        error={error}
        required={required}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={open && suggestions.length > 0}
        helper={loading ? 'Cargando localidades…' : undefined}
      />

      {open && suggestions.length > 0 && (
        <ul className="vv-search-form__suggestions" role="listbox" aria-label={`Sugerencias para ${label}`}>
          {suggestions.map((localidad) => (
            <li key={localidad} role="presentation">
              <button
                type="button"
                role="option"
                className="vv-search-form__suggestion"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  onChange(localidad);
                  setOpen(false);
                }}
              >
                <span className="vv-search-form__suggestion-icon" aria-hidden="true">
                  <MapPin size={16} />
                </span>
                <span>{localidad}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationAutocomplete;
