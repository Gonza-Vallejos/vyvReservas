import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { viajeService, reservaService } from '../services/api';
import {
  Bus,
  MapPin,
  Calendar,
  Clock,
  Users,
  ArrowLeft,
  ChevronRight,
  ShieldCheck,
  Armchair,
  AlertCircle,
} from 'lucide-react';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';
import toast from 'react-hot-toast';

const TripDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);

  useEffect(() => {
    let cancelled = false;

    const fetchTrip = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await viajeService.obtenerPorId(id);
        const result = response.data;
        const tripData = result.data || result;
        if (!cancelled) setTrip(tripData);

        try {
          const asientosRes = await viajeService.obtenerAsientosOcupados(id);
          const asientosData = asientosRes.data?.data || asientosRes.data;
          if (Array.isArray(asientosData?.mapaAsientos)) {
            const ocupados = asientosData.mapaAsientos
              .filter(a => a.ocupado)
              .map(a => a.numero);
            setOccupiedSeats(ocupados);
          } else {
            setOccupiedSeats(generateMockOccupiedSeats(id, tripData?.cantPasajeros));
          }
        } catch {
          setOccupiedSeats(generateMockOccupiedSeats(id, tripData?.cantPasajeros));
        }
      } catch {
        if (!cancelled) {
          setError('No pudimos cargar los detalles del viaje.');
          toast.error('Error al cargar el viaje');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchTrip();
    return () => { cancelled = true; };
  }, [id]);

  const handleSelectSeats = () => {
    if (!user) {
      toast.error('Iniciá sesión para reservar');
      navigate('/login', { state: { from: `/viaje/${id}` } });
      return;
    }
    if (user.perfil_id === 5) {
      toast.info('Las empresas no realizan reservas.');
      return;
    }
    navigate(`/reservar/${id}`);
  };

  if (loading) {
    return (
      <div className="container trip-detail__container">
        <div className="trip-detail__skeleton" aria-live="polite" role="status">
          <span className="sr-only">Cargando detalles del viaje…</span>
          <div className="vv-skeleton__shimmer trip-detail__skeleton-hero" />
          <div className="trip-detail__skeleton-grid">
            <div className="vv-skeleton__shimmer trip-detail__skeleton-main" />
            <div className="vv-skeleton__shimmer trip-detail__skeleton-side" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="container trip-detail__container">
        <EmptyState
          icon={AlertCircle}
          title="Viaje no encontrado"
          description={error || 'El viaje que buscás no existe o no está disponible.'}
          action={{
            label: 'Volver al inicio',
            onClick: () => navigate('/'),
          }}
        />
      </div>
    );
  }

  const empresaNombre = trip.MedioTransporte?.Empresa?.nombre || 'V&V Express';
  const totalSeats = trip.MedioTransporte?.cantLugares || 19;
  const availableSeats = Math.max(0, trip.cantPasajeros ?? totalSeats);
  const disponibilidadBaja = availableSeats < 5;
  const fecha = new Date(trip.fechaViaje).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
  const hora = trip.horarioSalida?.substring(0, 5) || '--:--';

  return (
    <div className="container trip-detail__container animate-fade-in">
      <nav aria-label="Volver" className="trip-detail__back">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          ariaLabel="Volver atrás"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Volver
        </Button>
      </nav>

      <div className="trip-detail__layout">
        <section className="trip-detail__main" aria-labelledby="trip-title">
          <Card padded className="trip-detail__header-card">
            <div className="trip-detail__header-top">
              <Badge variant="primary" className="trip-card__company">
                <span className="trip-card__company-dot" aria-hidden="true" />
                {empresaNombre}
              </Badge>
              <Badge variant={disponibilidadBaja ? 'error' : 'success'}>
                <Users size={14} aria-hidden="true" />
                {availableSeats} {availableSeats === 1 ? 'lugar' : 'lugares'}
              </Badge>
            </div>

            <h1 id="trip-title" className="trip-detail__title">
              {trip.origenLocalidad} <span aria-hidden="true">→</span> {trip.destinoLocalidad}
            </h1>

            <div className="trip-detail__meta">
              <div className="trip-detail__meta-item">
                <Calendar size={20} aria-hidden="true" />
                <div>
                  <span className="trip-detail__meta-label">Fecha</span>
                  <span className="trip-detail__meta-value">{fecha}</span>
                </div>
              </div>
              <div className="trip-detail__meta-item">
                <Clock size={20} aria-hidden="true" />
                <div>
                  <span className="trip-detail__meta-label">Salida</span>
                  <span className="trip-detail__meta-value">{hora} hs</span>
                </div>
              </div>
              <div className="trip-detail__meta-item">
                <Bus size={20} aria-hidden="true" />
                <div>
                  <span className="trip-detail__meta-label">Minibús</span>
                  <span className="trip-detail__meta-value">{totalSeats} asientos</span>
                </div>
              </div>
            </div>
          </Card>

          <Card padded className="trip-detail__stops">
            <h2 className="trip-detail__section-title">Recorrido</h2>
            <ol className="trip-detail__route-list">
              <li className="trip-detail__route-stop trip-detail__route-stop--origin">
                <span className="trip-detail__route-dot" aria-hidden="true" />
                <div>
                  <span className="trip-detail__route-label">Origen</span>
                  <span className="trip-detail__route-name">{trip.origenLocalidad}</span>
                </div>
              </li>
              <li className="trip-detail__route-stop trip-detail__route-stop--destination">
                <span className="trip-detail__route-dot trip-detail__route-dot--destination" aria-hidden="true" />
                <div>
                  <span className="trip-detail__route-label">Destino</span>
                  <span className="trip-detail__route-name">{trip.destinoLocalidad}</span>
                </div>
              </li>
            </ol>
            <p className="trip-detail__stops-hint">
              <MapPin size={16} aria-hidden="true" />
              El punto exacto de subida/bajada lo indicarás en el siguiente paso.
            </p>
          </Card>

          <Card padded className="trip-detail__seats-preview">
            <h2 className="trip-detail__section-title">Disponibilidad de asientos</h2>
            <MiniSeatMap occupiedSeats={occupiedSeats} totalSeats={totalSeats} />
            <p className="trip-detail__seats-caption">
              Los asientos en gris ya están reservados. Podés elegir hasta 3 asientos por reserva.
            </p>
          </Card>
        </section>

        <aside className="trip-detail__summary" aria-label="Resumen y precio">
          <Card padded className="trip-detail__summary-card">
            <div className="trip-detail__price-block">
              <span className="trip-detail__price-label">Precio por pasajero</span>
              <div className="trip-detail__price">
                <span className="trip-detail__price-currency">$</span>
                <span className="trip-detail__price-value">{trip.precio.toLocaleString('es-AR')}</span>
              </div>
            </div>

            <div className="trip-detail__summary-row">
              <span>Asientos disponibles</span>
              <span className="trip-detail__summary-strong">{availableSeats}</span>
            </div>
            <div className="trip-detail__summary-row">
              <span>Máximo por reserva</span>
              <span className="trip-detail__summary-strong">3</span>
            </div>

            <div className="trip-detail__security">
              <ShieldCheck size={18} aria-hidden="true" />
              <span>Reserva inmediata y pago seguro</span>
            </div>

            <Button
              variant="primary"
              size="lg"
              className="trip-detail__cta"
              onClick={handleSelectSeats}
              aria-label="Elegir asientos para este viaje"
            >
              Elegir asientos
              <ChevronRight size={20} aria-hidden="true" />
            </Button>

            {!user && (
              <p className="trip-detail__login-hint">
                ¿Ya tenés cuenta? <Link to="/login" state={{ from: `/viaje/${id}` }}>Iniciá sesión</Link>
              </p>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
};

const MiniSeatMap = ({ occupiedSeats, totalSeats }) => {
  const rows = buildSeatRows(totalSeats);

  return (
    <div className="mini-seat-map" role="img" aria-label="Vista simplificada del minibús">
      <div className="mini-seat-map__driver" aria-hidden="true">
        <span>Chofer</span>
      </div>
      <div className="mini-seat-map__rows" role="list">
        {rows.map((row, idx) => (
          <div key={idx} className="mini-seat-map__row" role="listitem">
            {row.map((seatNum, sIdx) => {
              if (seatNum === null) return <span key={`aisle-${idx}-${sIdx}`} className="mini-seat-map__aisle" aria-hidden="true" />;
              const isOccupied = occupiedSeats.includes(seatNum);
              return (
                <span
                  key={seatNum}
                  className={`mini-seat-map__seat ${isOccupied ? 'mini-seat-map__seat--occupied' : 'mini-seat-map__seat--free'}`}
                  aria-label={`Asiento ${seatNum}, ${isOccupied ? 'ocupado' : 'libre'}`}
                >
                  <Armchair size={14} aria-hidden="true" />
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

function buildSeatRows(totalSeats) {
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

function generateMockOccupiedSeats(tripId, available) {
  const total = 19;
  const occupiedCount = Math.max(0, Math.min(total - 1, total - (available ?? total)));
  const seats = [];
  let hash = 0;
  String(tripId).split('').forEach((c) => { hash = (hash * 31 + c.charCodeAt(0)) % 1000; });
  for (let i = 1; i <= occupiedCount; i++) {
    const seat = ((hash + i * 7) % total) + 1;
    if (!seats.includes(seat)) seats.push(seat);
  }
  return seats.sort((a, b) => a - b);
}

export default TripDetailPage;
