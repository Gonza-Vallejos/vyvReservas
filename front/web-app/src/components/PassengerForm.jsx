import React from 'react';
import { User, CreditCard, MapPin } from 'lucide-react';

const PassengerForm = ({ passenger, onChange }) => {
  return (
    <div style={formCard}>
      <h4 style={titleStyle}>Pasajero - Asiento {passenger.seatNumber}</h4>
      
      <div style={inputGrid}>
        <div style={inputGroup}>
          <label style={labelStyle}>Nombre</label>
          <div style={inputWrapper}>
            <User size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              value={passenger.nombre}
              onChange={(e) => onChange('nombre', e.target.value)}
              placeholder="Ej: Juan" 
              style={inputStyle} 
            />
          </div>
        </div>

        <div style={inputGroup}>
          <label style={labelStyle}>Apellido</label>
          <div style={inputWrapper}>
            <User size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              value={passenger.apellido}
              onChange={(e) => onChange('apellido', e.target.value)}
              placeholder="Ej: Pérez" 
              style={inputStyle} 
            />
          </div>
        </div>

        <div style={inputGroup}>
          <label style={labelStyle}>DNI</label>
          <div style={inputWrapper}>
            <CreditCard size={18} color="var(--text-muted)" />
            <input 
              type="number" 
              value={passenger.dni}
              onChange={(e) => onChange('dni', e.target.value)}
              placeholder="Número de documento" 
              style={inputStyle} 
            />
          </div>
        </div>

        <div style={inputGroup}>
          <label style={labelStyle}>Punto de Subida</label>
          <div style={inputWrapper}>
            <MapPin size={18} color="var(--text-muted)" />
            <input 
              type="text" 
              value={passenger.ubicacionOrigen}
              onChange={(e) => onChange('ubicacionOrigen', e.target.value)}
              placeholder="¿Dónde te buscamos?" 
              style={inputStyle} 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const formCard = {
  background: 'white',
  padding: '20px 16px',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  marginBottom: '20px',
  boxSizing: 'border-box'
};

const titleStyle = {
  fontSize: '1.1rem',
  fontWeight: '700',
  marginBottom: '18px',
  color: 'var(--primary)'
};

const inputGrid = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
  gap: '16px'
};

const inputGroup = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
};

const labelStyle = {
  fontSize: '0.85rem',
  fontWeight: '600',
  color: 'var(--text-muted)'
};

const inputWrapper = {
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  padding: '10px 12px',
  background: '#f8fafc',
  borderRadius: '10px',
  border: '1px solid #e2e8f0'
};

const inputStyle = {
  border: 'none',
  background: 'transparent',
  width: '100%',
  outline: 'none',
  fontSize: '0.95rem'
};

export default PassengerForm;
