import React from 'react';
import { Armchair, Circle } from 'lucide-react';

const SeatSelector = ({ totalSeats, selectedSeats, onToggleSeat }) => {
  // Configuración típica de Minibús de 19 asientos
  const rows = [
    { seats: [1, 2], label: 'Fila 1' },
    { seats: [3, 4, 5], label: 'Fila 2' },
    { seats: [6, 7, 8], label: 'Fila 3' },
    { seats: [9, 10, 11], label: 'Fila 4' },
    { seats: [12, 13, 14], label: 'Fila 5' },
    { seats: [15, 16, 17, 18, 19], label: 'Fila Fondo' },
  ];

  return (
    <div style={containerStyle}>
      <h3 style={{ marginBottom: '25px', fontWeight: '800' }}>Seleccioná tus lugares (Máx. 3)</h3>
      
      <div style={busFrame}>
        {/* Frente del vehículo */}
        <div style={frontPart}>
          <div style={steeringWrapper}>
            <div style={steeringDisk}>
              <Circle size={28} color="#64748b" strokeWidth={3} />
            </div>
            <span style={{ fontSize: '0.6rem', color: '#94a3b8', fontWeight: 'bold' }}>CHOFER</span>
          </div>
        </div>

        {/* Asientos */}
        <div style={seatsArea}>
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} style={rowStyle}>
              {row.seats.map((seatNum, seatIdx) => {
                const isSelected = selectedSeats.includes(seatNum);
                const showAisle = rowIndex > 0 && rowIndex < 5 && seatIdx === 1;
                
                return (
                  <React.Fragment key={seatNum}>
                    <button
                      type="button"
                      onClick={() => onToggleSeat(seatNum)}
                      style={{
                        ...seatStyle,
                        backgroundColor: isSelected ? 'var(--primary)' : 'white',
                        borderColor: isSelected ? 'var(--primary)' : '#e2e8f0',
                        color: isSelected ? 'white' : 'var(--text-dark)',
                      }}
                    >
                      <Armchair size={18} />
                      <span style={{ fontSize: '0.7rem' }}>{seatNum}</span>
                    </button>
                    {showAisle && <div style={aisleStyle} />}
                  </React.Fragment>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div style={legendStyle}>
        <div style={legendItem}><div style={{...dot, background: 'white', border: '1px solid #e2e8f0'}}></div><span>Libre</span></div>
        <div style={legendItem}><div style={{...dot, background: 'var(--primary)'}}></div><span>Tu selección</span></div>
      </div>
    </div>
  );
};

const containerStyle = { background: 'white', padding: '24px 16px', borderRadius: '24px', boxShadow: 'var(--shadow-md)', width: '100%', boxSizing: 'border-box', overflowX: 'auto' };
const busFrame = { border: '4px solid #e2e8f0', borderRadius: '40px 40px 20px 20px', padding: '30px 16px', maxWidth: '300px', width: '100%', margin: '0 auto', background: '#f8fafc', boxSizing: 'border-box' };
const frontPart = { borderBottom: '2px dashed #e2e8f0', marginBottom: '30px', paddingBottom: '15px', display: 'flex' };
const steeringWrapper = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' };
const steeringDisk = { width: '40px', height: '40px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const seatsArea = { display: 'flex', flexDirection: 'column', gap: '15px' };
const rowStyle = { display: 'flex', justifyContent: 'center', gap: '10px' };
const aisleStyle = { width: '25px' };
const seatStyle = { width: '42px', height: '42px', borderRadius: '10px', border: '2px solid', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'all 0.2s' };
const legendStyle = { display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '30px' };
const legendItem = { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' };
const dot = { width: '12px', height: '12px', borderRadius: '3px' };

export default SeatSelector;
