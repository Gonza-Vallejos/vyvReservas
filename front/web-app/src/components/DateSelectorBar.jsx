import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from './ui/Button';

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

/**
 * Genera un carrusel de 5 días alrededor de la fecha seleccionada.
 */
const DateSelectorBar = ({ selectedDate, onSelectDate }) => {
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

  const formatISO = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

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
    if (nextDate.getTime() < hoy.getTime()) {
      return;
    }
    onSelectDate(formatISO(nextDate));
  };

  return (
    <nav className="date-selector-bar" aria-label="Selector de fecha de viaje">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        pill
        className="date-selector-bar__nav"
        onClick={() => shiftDays(-1)}
        ariaLabel="Día anterior"
      >
        <ChevronLeft size={20} aria-hidden="true" />
      </Button>

      <div className="date-selector-bar__days" role="tablist" aria-label="Días disponibles">
        {days.map((item) => {
          const label = item.isPast
            ? `No disponible`
            : item.isToday
              ? 'Hoy'
              : `${item.dayNumber}/${item.monthNumber}`;

          return (
            <button
              key={item.iso}
              type="button"
              role="tab"
              aria-selected={item.isSelected}
              disabled={item.isPast}
              onClick={() => onSelectDate(item.iso)}
              className={[
                'date-selector-bar__day',
                item.isSelected ? 'date-selector-bar__day--active' : '',
                item.isPast ? 'date-selector-bar__day--past' : '',
              ].filter(Boolean).join(' ')}
              aria-label={item.isPast ? `${item.dayName} ${item.dayNumber}, no disponible` : `${item.dayName} ${item.dayNumber}, ${label}`}
            >
              <span className="date-selector-bar__day-name">{item.dayName} {item.dayNumber}</span>
              <span className="date-selector-bar__day-sub">{label}</span>
            </button>
          );
        })}
      </div>

      <Button
        type="button"
        variant="secondary"
        size="sm"
        pill
        className="date-selector-bar__nav"
        onClick={() => shiftDays(1)}
        ariaLabel="Día siguiente"
      >
        <ChevronRight size={20} aria-hidden="true" />
      </Button>
    </nav>
  );
};

export default DateSelectorBar;
