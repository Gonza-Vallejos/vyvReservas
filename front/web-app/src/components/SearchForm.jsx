import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Calendar, ArrowRightLeft, X } from 'lucide-react';
import { viajeService } from '../services/api';

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

const SearchForm = ({ onSearch }) => {
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [fecha, setFecha] = useState('');
  
  const [localidades, setLocalidades] = useState(CIUDADES_DEFAULT);
  const [sugerenciasOrigen, setSugerenciasOrigen] = useState([]);
  const [sugerenciasDestino, setSugerenciasDestino] = useState([]);
  
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
          const nombres = locationsArray.map(l => (typeof l === 'string' ? l : l.nombre)).filter(Boolean);
          // Unir con la lista default para tener una lista completa sin duplicados
          const combinadas = Array.from(new Set([...nombres, ...CIUDADES_DEFAULT]));
          setLocalidades(combinadas);
        }
      } catch (error) {
        console.warn('Usando localidades por defecto:', CIUDADES_DEFAULT);
      }
    };
    fetchLocalidades();

    const handleClickOutside = (e) => {
      if (origenRef.current && !origenRef.current.contains(e.target)) setSugerenciasOrigen([]);
      if (destinoRef.current && !destinoRef.current.contains(e.target)) setSugerenciasDestino([]);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      isMounted = false;
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const filtrarCiudades = (query) => {
    if (!query || query.trim().length === 0) return [];
    const q = query.trim().toLowerCase();
    return localidades.filter(l => l.toLowerCase().includes(q));
  };

  const handleInputChange = (text, type) => {
    if (type === 'origen') {
      setOrigen(text);
      setSugerenciasOrigen(filtrarCiudades(text));
    } else {
      setDestino(text);
      setSugerenciasDestino(filtrarCiudades(text));
    }
  };

  const handleFocus = (type) => {
    if (type === 'origen') {
      setSugerenciasOrigen(filtrarCiudades(origen));
    } else {
      setSugerenciasDestino(filtrarCiudades(destino));
    }
  };

  const swapLocations = () => {
    const temp = origen;
    setOrigen(destino);
    setDestino(temp);
    setSugerenciasOrigen([]);
    setSugerenciasDestino([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!origen.trim() || !destino.trim()) return;
    setSugerenciasOrigen([]);
    setSugerenciasDestino([]);
    onSearch({ origen: origen.trim(), destino: destino.trim(), fecha });
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle} className="glass-effect">
      {/* Campo Origen (Espacioso con flex: 1.3) */}
      <div style={{ flex: 1.3, position: 'relative' }} ref={origenRef}>
        <div style={inputGroupStyle} className="search-field-group">
          <div style={iconBox}>
            <MapPin size={22} color="var(--primary)" />
          </div>
          <div style={inputWrapper}>
            <label style={labelStyle}>Ciudad de Origen</label>
            <input 
              type="text" 
              placeholder="Ej: San Roque, Corrientes..." 
              value={origen}
              onFocus={() => handleFocus('origen')}
              onChange={(e) => handleInputChange(e.target.value, 'origen')}
              style={inputStyle} 
              autoComplete="off"
            />
          </div>
          {origen && (
            <button
              type="button"
              onClick={() => { setOrigen(''); setSugerenciasOrigen([]); }}
              style={clearBtn}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Dropdown de Sugerencias para Origen */}
        {sugerenciasOrigen.length > 0 && (
          <div style={suggestionBoxStyle} className="animate-fade-in custom-dropdown">
            <div style={dropdownHeader}>Ciudades coincidentes ({sugerenciasOrigen.length})</div>
            {sugerenciasOrigen.slice(0, 6).map((ciudad, i) => (
              <div 
                key={i} 
                onClick={() => { setOrigen(ciudad); setSugerenciasOrigen([]); }} 
                className="suggestion-item" 
                style={suggestionItemStyle}
              >
                <div style={suggIcon}>
                  <MapPin size={16} color="var(--primary)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{ciudad}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Terminal / Parada disponible</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Botón de Intercambio */}
      <button 
        type="button" 
        onClick={swapLocations} 
        style={swapBtnStyle}
        title="Intercambiar origen y destino"
        className="swap-button"
      >
        <ArrowRightLeft size={18} />
      </button>
      
      {/* Campo Destino (Espacioso con flex: 1.3) */}
      <div style={{ flex: 1.3, position: 'relative' }} ref={destinoRef}>
        <div style={inputGroupStyle} className="search-field-group">
          <div style={iconBox}>
            <MapPin size={22} color="var(--accent)" />
          </div>
          <div style={inputWrapper}>
            <label style={labelStyle}>Ciudad de Destino</label>
            <input 
              type="text" 
              placeholder="Ej: Corrientes, Goya..." 
              value={destino}
              onFocus={() => handleFocus('destino')}
              onChange={(e) => handleInputChange(e.target.value, 'destino')}
              style={inputStyle} 
              autoComplete="off"
            />
          </div>
          {destino && (
            <button
              type="button"
              onClick={() => { setDestino(''); setSugerenciasDestino([]); }}
              style={clearBtn}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Dropdown de Sugerencias para Destino */}
        {sugerenciasDestino.length > 0 && (
          <div style={suggestionBoxStyle} className="animate-fade-in custom-dropdown">
            <div style={dropdownHeader}>Ciudades coincidentes ({sugerenciasDestino.length})</div>
            {sugerenciasDestino.slice(0, 6).map((ciudad, i) => (
              <div 
                key={i} 
                onClick={() => { setDestino(ciudad); setSugerenciasDestino([]); }} 
                className="suggestion-item" 
                style={suggestionItemStyle}
              >
                <div style={suggIcon}>
                  <MapPin size={16} color="var(--accent)" />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: '700', color: 'var(--text-dark)' }}>{ciudad}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Terminal / Parada disponible</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Campo Fecha */}
      <div style={dateGroupStyle} className="search-field-group">
        <div style={iconBox}>
          <Calendar size={22} color="var(--primary)" />
        </div>
        <div style={inputWrapper}>
          <label style={labelStyle}>Fecha de Viaje</label>
          <input 
            type="date" 
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            style={inputStyle} 
          />
        </div>
      </div>

      {/* Botón de Búsqueda */}
      <button type="submit" style={buttonStyle} className="search-submit-btn">
        <Search size={22} />
        <span>Buscar</span>
      </button>

      <style>{`
        .search-field-group:focus-within {
          border-color: var(--primary) !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12) !important;
        }
        .swap-button:hover {
          background: #e2e8f0 !important;
          transform: rotate(180deg);
        }
        .suggestion-item:hover { 
          background-color: #f8fafc !important; 
        }
        .suggestion-item:hover span {
          color: var(--primary) !important;
        }
        .search-submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 25px -5px rgba(37, 99, 235, 0.5) !important;
        }
        @media (max-width: 900px) {
          form { 
            flex-direction: column !important; 
            padding: 24px !important; 
            border-radius: 28px !important; 
            gap: 14px !important; 
          }
          div { width: 100% !important; }
          .swap-button { 
            transform: rotate(90deg) !important; 
            align-self: center !important; 
            margin: -4px 0 !important;
          }
          .search-submit-btn { 
            width: 100% !important; 
            justify-content: center !important; 
            margin-top: 6px !important;
          }
        }
      `}</style>
    </form>
  );
};

// Estilos de Alto Impacto
const formStyle = {
  background: '#ffffff',
  padding: '10px 12px',
  borderRadius: '100px',
  boxShadow: '0 20px 45px -10px rgba(0, 0, 0, 0.12)',
  width: '100%',
  display: 'flex',
  gap: '10px',
  alignItems: 'center',
  position: 'relative',
};

const inputGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '12px 20px',
  background: '#f8fafc',
  borderRadius: '50px',
  border: '1.5px solid #f1f5f9',
  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  minHeight: '62px',
};

const dateGroupStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  padding: '12px 20px',
  background: '#f8fafc',
  borderRadius: '50px',
  border: '1.5px solid #f1f5f9',
  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  minHeight: '62px',
  flex: 0.9,
};

const iconBox = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const inputWrapper = {
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  minWidth: 0,
};

const labelStyle = {
  fontSize: '0.68rem',
  textTransform: 'uppercase',
  fontWeight: '800',
  color: 'var(--text-muted)',
  letterSpacing: '0.5px',
  marginBottom: '2px',
};

const inputStyle = {
  border: 'none',
  background: 'transparent',
  fontSize: '1.05rem',
  width: '100%',
  outline: 'none',
  color: 'var(--text-dark)',
  fontWeight: '700',
  fontFamily: 'Inter, sans-serif',
};

const clearBtn = {
  background: '#e2e8f0',
  border: 'none',
  borderRadius: '50%',
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#64748b',
  cursor: 'pointer',
  flexShrink: 0,
};

const swapBtnStyle = {
  background: '#f1f5f9',
  border: 'none',
  width: '44px',
  height: '44px',
  borderRadius: '50%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--primary)',
  cursor: 'pointer',
  flexShrink: 0,
  transition: 'all 0.3s ease',
};

const suggestionBoxStyle = {
  position: 'absolute',
  top: '72px',
  left: '0',
  right: '0',
  background: '#ffffff',
  borderRadius: '24px',
  boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.2)',
  zIndex: 3000,
  overflow: 'hidden',
  border: '1px solid #e2e8f0',
  maxHeight: '340px',
  overflowY: 'auto',
};

const dropdownHeader = {
  padding: '12px 20px 8px 20px',
  fontSize: '0.72rem',
  fontWeight: '800',
  color: '#94a3b8',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  borderBottom: '1px solid #f1f5f9',
};

const suggestionItemStyle = {
  padding: '14px 20px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  borderBottom: '1px solid #f8fafc',
  transition: 'all 0.15s ease',
};

const suggIcon = {
  width: '32px',
  height: '32px',
  borderRadius: '10px',
  background: '#f1f5f9',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  flexShrink: 0,
};

const buttonStyle = {
  backgroundColor: 'var(--primary)',
  color: 'white',
  padding: '18px 38px',
  borderRadius: '100px',
  fontWeight: '800',
  fontSize: '1.05rem',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  boxShadow: '0 10px 20px -3px rgba(37, 99, 235, 0.4)',
  flexShrink: 0,
  minHeight: '62px',
};

export default SearchForm;
