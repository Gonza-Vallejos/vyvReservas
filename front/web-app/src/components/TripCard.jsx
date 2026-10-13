import { Clock, Calendar, Users, MapPin, ChevronRight } from 'lucide-react';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';

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
  const disponibilidadBaja = cantPasajeros < 5;

  return (
    <Card className="trip-card" hover padded={false}>
      <article className="trip-card__inner">
        <header className="trip-card__header">
          <Badge variant="primary" className="trip-card__company">
            <span className="trip-card__company-dot" aria-hidden="true" />
            {empresaNombre}
          </Badge>
          <div className="trip-card__price" aria-label={`Precio ${precio.toLocaleString('es-AR')} pesos`}>
            <span className="trip-card__currency">$</span>
            <span className="trip-card__price-value">{precio.toLocaleString('es-AR')}</span>
          </div>
        </header>

        <div className="trip-card__route">
          <div className="trip-card__location">
            <MapPin size={18} className="trip-card__location-icon trip-card__location-icon--origin" aria-hidden="true" />
            <div className="trip-card__location-text">
              <span className="trip-card__location-label">Origen</span>
              <span className="trip-card__location-name">{origenLocalidad}</span>
            </div>
          </div>

          <div className="trip-card__connector" aria-hidden="true">
            <span className="trip-card__connector-line" />
            <ChevronRight size={16} className="trip-card__connector-icon" />
          </div>

          <div className="trip-card__location">
            <MapPin size={18} className="trip-card__location-icon trip-card__location-icon--destination" aria-hidden="true" />
            <div className="trip-card__location-text">
              <span className="trip-card__location-label">Destino</span>
              <span className="trip-card__location-name">{destinoLocalidad}</span>
            </div>
          </div>
        </div>

        <hr className="trip-card__divider" />

        <ul className="trip-card__details">
          <li className="trip-card__detail">
            <Calendar size={16} aria-hidden="true" />
            <span>{new Date(fechaViaje).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}</span>
          </li>
          <li className="trip-card__detail">
            <Clock size={16} aria-hidden="true" />
            <span>{horarioSalida.substring(0, 5)} hs</span>
          </li>
          <li className="trip-card__detail">
            <Badge variant={disponibilidadBaja ? 'error' : 'success'} className="trip-card__availability">
              <Users size={14} aria-hidden="true" />
              <span>{cantPasajeros} lugares</span>
            </Badge>
          </li>
        </ul>

        <Button
          variant="primary"
          size="lg"
          className="trip-card__cta"
          onClick={() => onSelect(trip)}
          aria-label={`Reservar viaje de ${origenLocalidad} a ${destinoLocalidad} por ${precio.toLocaleString('es-AR')} pesos`}
        >
          Reservar ahora
          <ChevronRight size={18} aria-hidden="true" />
        </Button>
      </article>
    </Card>
  );
};

export default TripCard;
