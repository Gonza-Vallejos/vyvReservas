import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Calendar, ArrowRightLeft } from 'lucide-react';
import { viajeService } from '../services/api';

const SearchForm = ({ onSearch }) => {
  const [origen, setOrigen] = useState('');
  const [destino, setDestino] = useState('');
  const [fecha, setFecha] = useState('');
  
  const [localidades, setLocalidades] = useState([]);
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
        if (Array.isArray(locationsArray)) {
          setLocalidades(locationsArray.map(l => l.nombre).filter(Boolean));
        }
      } catch (error) {
        console.warn('Manual mode: Localidades not loaded.');
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

  const handleInputChange = (text, type) => {
    if (type === 'origen') {
      setOrigen(text);
      if (text.length > 1) {
        setSugerenciasOrigen(localidades.filter(l => l.toLowerCase().includes(text.toLowerCase())));
      } else {
        setSugerenciasOrigen([]);
      }
    } else {
      setDestino(text);
      if (text.length > 1) {
        setSugerenciasDestino(localidades.filter(l => l.toLowerCase().includes(text.toLowerCase())));
      } else {
        setSugerenciasDestino([]);
      }
    }
  };

  const swapLocations = () => {
    const temp = origen;
    setOrigen(destino);
    setDestino(temp);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!origen.trim() || !destino.trim()) return;
    onSearch({ origen, destino, fecha });
  };

  return (
    <form onSubmit={handleSubmit} style={formStyle} className="glass-effect">
      <div style={{ flex: 1, position: 'relative' }} ref={origenRef}>
        <div style={inputGroupStyle}>
          <MapPin size={22} color="var(--primary)" />
          <div style={inputWrapper}>
            <label style={labelStyle}>Desde</label>
            <input 
              type="text" 
              placeholder="¿Dónde estás?" 
              value={origen}
              onChange={(e) => handleInputChange(e.target.value, 'origen')}
              style={inputStyle} 
            />
          </div>
        </div>
        {sugerenciasOrigen.length > 0 && (
          <div style={suggestionBoxStyle} className="animate-fade-in">
            {sugerenciasOrigen.slice(0, 5).map((s, i) => (
              <div key={i} onClick={() => { setOrigen(s); setSugerenciasOrigen([]); }} className="suggestion-item" style={suggestionItemStyle}>
                <MapPin size={16} color="var(--secondary)" /> <span>{s}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button type="button" onClick={swapLocations} style={swapBtnStyle}>
        <ArrowRightLeft size={18} />
      </button>
      
      <div style={{ flex: 1, position: 'relative' }} ref={destinoRef}>
        <div style={inputGroupStyle}>
          <MapPin size={22} color="var(--primary)" />
          <div style={inputWrapper}>
            <label style={labelStyle}>Hacia</label>
            <input 
              type="text" 
              placeholder="¿A dónde vas?" 
              value={destino}
              onChange={(e) => handleInputChange(e.target.value, 'destino')}
              style={inputStyle} 
            />
          </div>
        </div>
        {sugerenciasDestino.length > 0 && (
          <div style={suggestionBoxStyle} className="animate-fade-in">
            {sugerenciasDestino.slice(0, 5).map((s, i) => (
              <div key={i} onClick={() => { setDestino(s); setSugerenciasDestino([]); }} className="suggestion-item" style={suggestionItemStyle}>
                <MapPin size={16} color="var(--secondary)" /> <span>{s}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={inputGroupStyle}>
        <Calendar size={22} color="var(--primary)" />
        <div style={inputWrapper}>
          <label style={labelStyle}>Fecha</label>
          <input 
            type="date" 
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            style={inputStyle} 
          />
        </div>
      </div>

      <button type="submit" style={buttonStyle}>
        <Search size={22} />
        <span>Buscar</span>
      </button>

      <style>{`
        .suggestion-item:hover { background-color: #f1f5f9 !important; color: var(--primary) !important; }
        @media (max-width: 768px) {
          form { flex-direction: column; padding: 25px !important; border-radius: 32px !important; gap: 15px !important; }
          div { width: 100% !important; }
          button[type="submit"] { width: 100% !important; margin-top: 10px; }
          button[type="button"] { transform: rotate(90deg); margin: -10px 0; }
        }
      `}</style>
    </form>
  );
};

// Estilos Premium
const formStyle = { background: 'white', padding: '12px', borderRadius: '100px', boxShadow: '0 20px 40px -10px rgba(0,0,0,0.15)', maxWidth: '1100px', margin: '0 auto', display: 'flex', gap: '8px', alignItems: 'center' };
const inputGroupStyle = { display: 'flex', alignItems: 'center', gap: '15px', padding: '12px 25px', background: '#f8fafc', borderRadius: '50px', flex: 1, border: '1px solid #f1f5f9', transition: '0.2s' };
const inputWrapper = { display: 'flex', flexDirection: 'column', flex: 1 };
const labelStyle = { fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.5px', marginBottom: '2px' };
const inputStyle = { border: 'none', background: 'transparent', fontSize: '1rem', width: '100%', outline: 'none', color: 'var(--text-dark)', fontWeight: '700' };
const swapBtnStyle = { background: '#f1f5f9', border: 'none', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', cursor: 'pointer' };
const suggestionBoxStyle = { position: 'absolute', top: '75px', left: '10px', right: '10px', background: '#ffffff', borderRadius: '24px', boxShadow: '0 15px 30px -10px rgba(0, 0, 0, 0.25)', zIndex: 2000, overflow: 'hidden', border: '1px solid #f1f5f9' };
const suggestionItemStyle = { padding: '16px 25px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '15px', fontSize: '1rem', fontWeight: '600', transition: '0.2s' };
const buttonStyle = { backgroundColor: 'var(--primary)', color: 'white', padding: '18px 45px', borderRadius: '100px', fontWeight: '800', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)' };

export default SearchForm;
