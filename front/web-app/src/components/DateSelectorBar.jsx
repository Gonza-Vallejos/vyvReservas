import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/**
 * Genera un carrusel de 5 a 7 días alrededor de la fecha seleccionada
 */
const DateSelectorBar = ({ selectedDate, onSelectDate }) => {
  // Base date
  const parseBaseDate = (dStr) => {
    if (!dStr) return new Date();
    const parts = dStr.split('-');
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return new Date(dStr);
  };

  const current = parseBaseDate(selectedDate);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Formato YYYY-MM-DD
  const formatISO = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Generamos un rango de 5 días: -2, -1, 0, +1, +2
  const days = [];
  for (let offset = -2; offset <= 2; offset++) {
    const d = new Date(current);
    d.setDate(d.getDate() + offset);
    d.setHours(0, 0, 0, 0);

    const isPast = d.getTime() < hoy.getTime();
    const isToday = d.getTime() === hoy.getTime();
    const isoString = formatISO(d);
    const isSelected = selectedDate === isoString;

    days.push({
      dateObj: d,
      iso: isoString,
      dayName: DIAS_SEMANA[d.getDay()],
      dayNumber: d.getDate(),
      monthNumber: d.getMonth() + 1,
      isPast,
      isToday,
      isSelected,
    });
  }

  const shiftDays = (delta) => {
    const nextDate = new Date(current);
    nextDate.setDate(nextDate.getDate() + delta);
    nextDate.setHours(0, 0, 0, 0);
    // Si la nueva fecha queda antes de hoy, no permitir
    if (nextDate.getTime() < hoy.getTime()) {
      return;
    }
    onSelectDate(formatISO(nextDate));
  };

  return (
    <div style={containerStyle} className="animate-fade-in date-selector-container">
      <button 
        type="button" 
        onClick={() => shiftDays(-1)} 
        style={navBtn}
        title="Día anterior"
        className="date-selector-nav-btn"
      >
        <ChevronLeft size={20} />
      </button>

      <div style={daysGrid}>
        {days.map((item) => {
          return (
            <button
              key={item.iso}
              type="button"
              disabled={item.isPast}
              onClick={() => onSelectDate(item.iso)}
              style={{
                ...dayCardStyle,
                ...(item.isSelected ? activeCardStyle : {}),
                ...(item.isPast ? disabledCardStyle : {}),
              }}
              className={`date-tab-card ${item.isSelected ? 'active' : ''} ${item.isPast ? 'disabled' : ''}`}
            >
              <span style={dayLabel}>
                {item.dayName} {item.dayNumber}
              </span>
              <span style={subLabel}>
                {item.isPast ? 'No disponible' : (item.isToday ? 'Hoy' : `${item.dayNumber}/${item.monthNumber}`)}
              </span>
            </button>
          );
        })}
      </div>

      <button 
        type="button" 
        onClick={() => shiftDays(1)} 
        style={navBtn}
        title="Día siguiente"
        className="date-selector-nav-btn"
      >
        <ChevronRight size={20} />
      </button>

      <style>{`
        .date-tab-card {
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .date-tab-card:not(.disabled):not(.active):hover {
          border-color: var(--primary) !important;
          background: #f8fafc !important;
          transform: translateY(-2px);
        }
        @media (max-width: 640px) {
          .date-tab-card {
            padding: 8px 8px !important;
            min-width: 68px !important;
          }
          .date-selector-container {
            gap: 6px !important;
            margin-bottom: 24px !important;
          }
          .date-selector-nav-btn {
            width: 34px !important;
            height: 34px !important;
          }
        }
      `}</style>
    </div>
  );
};

const containerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '10px',
  marginBottom: '32px',
  width: '100%',
  maxWidth: '100%',
};

const daysGrid = {
  display: 'flex',
  gap: '8px',
  overflowX: 'auto',
  padding: '6px 2px',
  scrollbarWidth: 'none',
  WebkitOverflowScrolling: 'touch',
};

const dayCardStyle = {
  flex: 1,
  minWidth: '85px',
  padding: '12px 18px',
  borderRadius: '16px',
  background: '#ffffff',
  border: '1.5px solid #e2e8f0',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
  cursor: 'pointer',
  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
};

const activeCardStyle = {
  background: '#1e3a8a',
  borderColor: '#1e3a8a',
  color: '#ffffff',
  boxShadow: '0 8px 16px -4px rgba(30, 58, 138, 0.35)',
};

const disabledCardStyle = {
  background: '#f8fafc',
  borderColor: '#f1f5f9',
  opacity: 0.5,
  cursor: 'not-allowed',
};

const dayLabel = {
  fontSize: '0.95rem',
  fontWeight: '800',
  fontFamily: 'Outfit, sans-serif',
};

const subLabel = {
  fontSize: '0.72rem',
  fontWeight: '600',
  opacity: 0.8,
};

const navBtn = {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  background: '#ffffff',
  border: '1px solid #e2e8f0',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: 'var(--text-dark)',
  cursor: 'pointer',
  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  flexShrink: 0,
};

export default DateSelectorBar;
