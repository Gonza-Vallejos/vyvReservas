import { useRef, useEffect, useCallback } from 'react';
import { Armchair, Circle } from 'lucide-react';
import Badge from './ui/Badge';

const MAX_SEATS = 3;

const SeatSelector = ({ totalSeats = 19, occupiedSeats = [], selectedSeats = [], onToggleSeat, maxSeats = MAX_SEATS }) => {
  const seatRefs = useRef({});
  const rows = buildSeatRows(totalSeats);

  const focusSeat = useCallback((seatNumber) => {
    seatRefs.current[seatNumber]?.focus();
  }, []);

  const findSeatPosition = useCallback((seatNumber) => {
    for (let r = 0; r < rows.length; r++) {
      for (let c = 0; c < rows[r].length; c++) {
        if (rows[r][c] === seatNumber) return { r, c };
      }
    }
    return null;
  }, [rows]);

  const handleKeyDown = useCallback((e, seatNumber) => {
    const pos = findSeatPosition(seatNumber);
    if (!pos) return;

    const getNextSeat = (dr, dc) => {
      let r = pos.r + dr;
      let c = pos.c + dc;
      while (r >= 0 && r < rows.length && c >= 0 && c < rows[r].length) {
        const next = rows[r][c];
        if (next !== null && !occupiedSeats.includes(next)) return next;
        r += dr;
        c += dc;
      }
      return null;
    };

    const directionMap = {
      ArrowRight: [0, 1],
      ArrowLeft: [0, -1],
      ArrowDown: [1, 0],
      ArrowUp: [-1, 0],
    };

    // Enter/Space ya activan onClick del botón nativamente.
    const delta = directionMap[e.key];
    if (!delta) return;

    const nextSeat = getNextSeat(delta[0], delta[1]);
    if (nextSeat !== null) {
      e.preventDefault();
      focusSeat(nextSeat);
    }
  }, [findSeatPosition, focusSeat, occupiedSeats, rows]);

  useEffect(() => {
    // Focus first available seat on mount for keyboard users
    const firstAvailable = rows.flat().find(s => s !== null && !occupiedSeats.includes(s));
    if (firstAvailable !== undefined && selectedSeats.length === 0) {
      // Defer to avoid stealing focus on page load
      const timer = setTimeout(() => seatRefs.current[firstAvailable]?.focus(), 100);
      return () => clearTimeout(timer);
    }
  }, [rows, occupiedSeats, selectedSeats.length]);

  const remainingSelections = maxSeats - selectedSeats.length;

  return (
    <div className="seat-selector">
      <div className="seat-selector__header">
        <div>
          <h2 className="seat-selector__title">Seleccioná tus asientos</h2>
          <p className="seat-selector__subtitle">Máximo {maxSeats} asientos por reserva</p>
        </div>
        <Badge variant={selectedSeats.length === maxSeats ? 'accent' : 'primary'} className="seat-selector__counter">
          {selectedSeats.length}/{maxSeats} seleccionados
        </Badge>
      </div>

      <div
        className="seat-selector__bus"
        role="application"
        aria-label="Mapa de asientos del minibús. Usá las flechas para navegar y Enter para seleccionar."
      >
        <div className="seat-selector__front" aria-hidden="true">
          <div className="seat-selector__steering">
            <Circle size={28} />
            <span>Chofer</span>
          </div>
        </div>

        <div className="seat-selector__rows" role="grid" aria-label="Asientos">
          {rows.map((row, rowIndex) => (
            <div key={rowIndex} className="seat-selector__row" role="row">
              {row.map((seatNum, seatIdx) => {
                if (seatNum === null) {
                  return <span key={`aisle-${rowIndex}-${seatIdx}`} className="seat-selector__aisle" aria-hidden="true" />;
                }
                const isSelected = selectedSeats.includes(seatNum);
                const isOccupied = occupiedSeats.includes(seatNum);
                const label = `Asiento ${seatNum}${isOccupied ? ', ocupado' : isSelected ? ', seleccionado' : ', libre'}`;

                return (
                  <div key={seatNum} role="gridcell">
                    <button
                      ref={(el) => { seatRefs.current[seatNum] = el; }}
                      type="button"
                      tabIndex={isOccupied ? -1 : 0}
                      disabled={isOccupied}
                      aria-pressed={isSelected}
                      aria-label={label}
                      aria-disabled={isOccupied}
                      onClick={() => onToggleSeat(seatNum)}
                      onKeyDown={(e) => handleKeyDown(e, seatNum)}
                      className={[
                        'seat-selector__seat',
                        isSelected ? 'seat-selector__seat--selected' : '',
                        isOccupied ? 'seat-selector__seat--occupied' : 'seat-selector__seat--free',
                      ].join(' ')}
                    >
                      <Armchair size={20} aria-hidden="true" />
                      <span className="seat-selector__seat-number">{seatNum}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="seat-selector__legend" aria-label="Leyenda de asientos">
        <div className="seat-selector__legend-item">
          <span className="seat-selector__legend-box seat-selector__legend-box--free" aria-hidden="true" />
          <span>Libre</span>
        </div>
        <div className="seat-selector__legend-item">
          <span className="seat-selector__legend-box seat-selector__legend-box--selected" aria-hidden="true" />
          <span>Seleccionado</span>
        </div>
        <div className="seat-selector__legend-item">
          <span className="seat-selector__legend-box seat-selector__legend-box--occupied" aria-hidden="true" />
          <span>Ocupado</span>
        </div>
      </div>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {selectedSeats.length > 0
          ? `Seleccionados ${selectedSeats.length} asientos: ${selectedSeats.join(', ')}. Podés elegir ${remainingSelections} más.`
          : 'No seleccionaste ningún asiento.'}
      </div>
    </div>
  );
};

function buildSeatRows(totalSeats) {
  // Layout típico de minibús de 19 asientos
  if (totalSeats <= 19) {
    return [
      [1, null, 2],
      [3, null, 4],
      [5, 6, 7],
      [8, 9, 10],
      [11, 12, 13],
      [14, 15, 16],
      [17, 18, 19].slice(0, Math.max(0, totalSeats - 14)),
    ].filter(r => r.length > 0);
  }

  // Layout genérico para mayores capacidades
  const rows = [[1, null, 2]];
  let seat = 3;
  while (seat <= totalSeats) {
    const remaining = totalSeats - seat + 1;
    if (remaining >= 3) {
      rows.push([seat, seat + 1, seat + 2]);
      seat += 3;
    } else {
      rows.push(Array.from({ length: remaining }, (_, i) => seat + i));
      break;
    }
  }
  return rows;
}

export default SeatSelector;
