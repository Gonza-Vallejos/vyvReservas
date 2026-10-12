import React from 'react';
import { Clock, Calendar, Users, MapPin, ChevronRight } from 'lucide-react';

const TripCard = ({ trip, onSelect }) => {
  const {
    origenLocalidad,
    destinoLocalidad,
    horarioSalida,
    fechaViaje,
    precio,
    cantPasajeros,
    MedioTransporte
  } = trip;

  const empresaNombre = MedioTransporte?.Empresa?.nombre || 'V&V Express';

  return (
    <div className="trip-card animate-fade-in" style={cardStyle}>
      <div style={headerStyle}>
        <div style={empresaBadge}>
          <div style={dot} />
          <span style={empresaStyle}>{empresaNombre}</span>
        </div>
        <div style={priceBadge}>
          <span style={currency}>$</span>
          <span style={priceValue}>{precio.toLocaleString('es-AR')}</span>
        </div>
      </div>

      <div style={routeContainer}>
        <div style={locationGroup}>
          <MapPin size={16} color="var(--primary)" />
          <div style={{display:'flex', flexDirection:'column'}}>
            <span style={locationLabel}>Origen</span>
            <span style={locationName}>{origenLocalidad}</span>
          </div>
        </div>
        <div style={connector}>
          <div style={connectorLine} />
          <ChevronRight size={14} color="#cbd5e1" />
        </div>
        <div style={locationGroup}>
          <MapPin size={16} color="var(--accent)" />
          <div style={{display:'flex', flexDirection:'column'}}>
            <span style={locationLabel}>Destino</span>
            <span style={locationName}>{destinoLocalidad}</span>
          </div>
        </div>
      </div>

      <div style={divider} />

      <div style={infoRow}>
        <div style={infoTag}>
          <Calendar size={14} />
          <span>{new Date(fechaViaje).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</span>
        </div>
        <div style={infoTag}>
          <Clock size={14} />
          <span>{horarioSalida.substring(0, 5)} hs</span>
        </div>
        <div style={{...infoTag, background: cantPasajeros < 5 ? '#fee2e2' : '#dcfce7', color: cantPasajeros < 5 ? '#ef4444' : '#166534'}}>
          <Users size={14} />
          <span>{cantPasajeros} lugares</span>
        </div>
      </div>

      <button onClick={() => onSelect(trip)} style={bookButton}>
        Reservar ahora <ChevronRight size={18} />
      </button>

      <style>{`
        .trip-card {
          transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .trip-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 30px 60px -12px rgba(50, 50, 93, 0.25), 0 18px 36px -18px rgba(0, 0, 0, 0.3);
          border-color: var(--primary);
        }
      `}</style>
    </div>
  );
};

// Estilos Premium
const cardStyle = { background: 'white', borderRadius: '28px', padding: '30px', boxShadow: '0 10px 30px -5px rgba(0,0,0,0.05)', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '25px', position: 'relative', overflow: 'hidden' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const empresaBadge = { display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '6px 14px', borderRadius: '100px', border: '1px solid #e2e8f0' };
const dot = { width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' };
const empresaStyle = { fontWeight: '800', fontSize: '0.9rem', color: '#1e293b', fontFamily: 'Outfit, sans-serif' };
const priceBadge = { textAlign: 'right', display: 'flex', alignItems: 'baseline', gap: '2px' };
const currency = { fontSize: '1rem', fontWeight: '700', color: 'var(--primary)' };
const priceValue = { fontSize: '1.8rem', fontWeight: '900', color: 'var(--text-dark)', letterSpacing: '-1px' };

const routeContainer = { display: 'flex', alignItems: 'center', gap: '15px' };
const locationGroup = { display: 'flex', gap: '12px', alignItems: 'flex-start', flex: 1 };
const locationLabel = { fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: '800', color: 'var(--text-muted)', marginBottom: '2px' };
const locationName = { fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-dark)' };
const connector = { display: 'flex', alignItems: 'center', gap: '5px', flex: 0.3 };
const connectorLine = { height: '2px', flex: 1, background: '#f1f5f9', borderRadius: '2px' };

const divider = { height: '1px', background: 'linear-gradient(to right, transparent, #f1f5f9, transparent)' };

const infoRow = { display: 'flex', gap: '12px', flexWrap: 'wrap' };
const infoTag = { display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '8px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-muted)' };

const bookButton = { background: 'var(--primary)', color: 'white', padding: '16px', borderRadius: '18px', fontWeight: '800', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.4)', marginTop: '5px' };

export default TripCard;
