import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { reservaService } from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import {
  CheckCircle,
  AlertCircle,
  Calendar,
  Clock,
  MapPin,
  Users,
  Ticket,
  Download,
  Share2,
  CreditCard,
  Store,
  ArrowRight,
  Loader,
} from 'lucide-react';
import toast from 'react-hot-toast';

const BookingConfirmationPage = () => {
  const { reservaId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const initialReservation = location.state?.reservation;
  const initialTrip = location.state?.trip;
  const initialPassengers = location.state?.passengers;
  const initialSeats = location.state?.selectedSeats;

  const [reservation, setReservation] = useState(() => initialReservation || null);
  const [loading, setLoading] = useState(() => !initialReservation);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login', { state: { from: `/confirmacion/${reservaId}` } });
      return;
    }

    if (initialReservation) return;

    let cancelled = false;
    const fetchReservation = async () => {
      setLoading(true);
      try {
        // TODO: reemplazar por endpoint GET /reserva/:id cuando exista
        const response = await reservaService.obtenerPorUsuario();
        const list = response.data?.data || response.data || [];
        const found = list.find(r => String(r.id) === String(reservaId));
        if (!cancelled) {
          if (found) {
            setReservation(found);
          } else {
            setError('No encontramos la reserva solicitada.');
          }
        }
      } catch {
        if (!cancelled) {
          setError('No pudimos cargar los datos de la reserva.');
          toast.error('Error al cargar la confirmación');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchReservation();
    return () => { cancelled = true; };
  }, [user, navigate, reservaId, initialReservation]);

  const handlePayment = () => {
    // TODO: integrar con MercadoPago
    toast('Pronto podrás pagar con MercadoPago', { icon: '💳' });
  };

  const handleDownload = () => {
    // TODO: generar comprobante PDF
    toast('Descarga de comprobante en desarrollo', { icon: '📄' });
  };

  const handleShare = async () => {
    const shareData = {
      title: 'Mi reserva V&V',
      text: `Reservé mi viaje a ${trip?.destinoLocalidad || 'mi destino'} con V&V Reservas.`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success('Enlace copiado al portapapeles');
      }
    } catch {
      toast.error('No se pudo compartir la reserva');
    }
  };

  if (loading) {
    return (
      <div className="container confirmation-page__container">
        <div className="confirmation-page__loader" role="status" aria-live="polite">
          <Loader size={40} className="confirmation-page__loader-icon" aria-hidden="true" />
          <span>Cargando confirmación…</span>
        </div>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="container confirmation-page__container">
        <EmptyState
          icon={AlertCircle}
          title="Reserva no encontrada"
          description={error || 'No pudimos encontrar la reserva que buscás.'}
          action={{
            label: 'Ir a mis reservas',
            onClick: () => navigate('/mis-reservas'),
          }}
        />
      </div>
    );
  }

  const trip = initialTrip || reservation.viaje || reservation.Viaje || {};
  const passengers = initialPassengers || reservation.pasajeros || reservation.Pasajeros || [];
  const seats = initialSeats || [];
  const isPaid = reservation.estadoPago === 'Pagado' || reservation.estado === 'Pagado';
  const isPending = !isPaid;
  const code = reservation.codigoReserva || reservation.id || reservaId;
  const total = (trip.precio || 0) * (passengers.length || seats.length || 1);

  return (
    <div className="container confirmation-page__container animate-fade-in">
      <div className="confirmation-page__layout">
        <section className="confirmation-page__main">
          <Card padded className="confirmation-page__status-card">
            <div className={`confirmation-page__status confirmation-page__status--${isPaid ? 'paid' : 'pending'}`}>
              <div className="confirmation-page__status-icon" aria-hidden="true">
                {isPaid ? <CheckCircle size={40} /> : <AlertCircle size={40} />}
              </div>
              <div className="confirmation-page__status-text">
                <h1 className="confirmation-page__status-title">
                  {isPaid ? '¡Reserva confirmada y pagada!' : '¡Reserva confirmada!'}
                </h1>
                <p className="confirmation-page__status-subtitle">
                  {isPaid
                    ? 'Tu lugar está asegurado. Guardá tu comprobante.'
                    : 'Tu lugar está reservado. Recordá que tenés 24 hs para abonar.'}
                </p>
              </div>
            </div>

            <div className="confirmation-page__code">
              <span className="confirmation-page__code-label">Código de reserva</span>
              <span className="confirmation-page__code-value">{code}</span>
            </div>
          </Card>

          <Card padded className="confirmation-page__trip-card">
            <h2 className="confirmation-page__section-title">Detalle del viaje</h2>
            <div className="confirmation-page__route">
              <div className="confirmation-page__route-stop">
                <MapPin size={20} aria-hidden="true" />
                <div>
                  <span className="confirmation-page__route-label">Origen</span>
                  <span className="confirmation-page__route-name">{trip.origenLocalidad}</span>
                </div>
              </div>
              <div className="confirmation-page__route-stop">
                <MapPin size={20} aria-hidden="true" />
                <div>
                  <span className="confirmation-page__route-label">Destino</span>
                  <span className="confirmation-page__route-name">{trip.destinoLocalidad}</span>
                </div>
              </div>
            </div>

            <div className="confirmation-page__details">
              <div className="confirmation-page__detail">
                <Calendar size={18} aria-hidden="true" />
                <span>
                  {trip.fechaViaje
                    ? new Date(trip.fechaViaje).toLocaleDateString('es-AR', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                      })
                    : 'Fecha no disponible'}
                </span>
              </div>
              <div className="confirmation-page__detail">
                <Clock size={18} aria-hidden="true" />
                <span>{trip.horarioSalida?.substring(0, 5) || '--:--'} hs</span>
              </div>
              <div className="confirmation-page__detail">
                <Users size={18} aria-hidden="true" />
                <span>{passengers.length} pasajero{passengers.length !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </Card>

          <Card padded className="confirmation-page__passengers-card">
            <h2 className="confirmation-page__section-title">Pasajeros</h2>
            <ul className="confirmation-page__passengers">
              {passengers.map((p, idx) => (
                <li key={idx} className="confirmation-page__passenger">
                  <div className="confirmation-page__passenger-info">
                    <span className="confirmation-page__passenger-name">
                      {p.nombre} {p.apellido}
                    </span>
                    <span className="confirmation-page__passenger-meta">DNI {p.dni}</span>
                  </div>
                  <div className="confirmation-page__passenger-stops">
                    <span>{p.ubicacionOrigen || trip.origenLocalidad}</span>
                    <span>→</span>
                    <span>{p.ubicacionDestino || trip.destinoLocalidad}</span>
                  </div>
                  {seats.length > 0 && (
                    <Badge variant="primary" className="confirmation-page__passenger-seat">
                      Asiento {seats[idx] || '-'}
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        </section>

        <aside className="confirmation-page__summary" aria-label="Resumen y pago">
          <Card padded className="confirmation-page__summary-card">
            <h3 className="confirmation-page__summary-title">Resumen de pago</h3>

            <div className="confirmation-page__summary-row">
              <span>Pasajes ({passengers.length})</span>
              <span>ARS ${total.toLocaleString('es-AR')}</span>
            </div>

            <div className="confirmation-page__summary-row confirmation-page__summary-row--total">
              <span>Total</span>
              <span>ARS ${total.toLocaleString('es-AR')}</span>
            </div>

            <div className="confirmation-page__payment-status">
              <Badge variant={isPaid ? 'success' : 'warning'} className="confirmation-page__payment-badge">
                {isPaid ? 'Pagado' : 'Pendiente de pago'}
              </Badge>
            </div>

            {isPending ? (
              <div className="confirmation-page__payment-actions">
                <Button
                  variant="primary"
                  size="lg"
                  className="confirmation-page__payment-btn"
                  onClick={handlePayment}
                >
                  <CreditCard size={20} aria-hidden="true" />
                  Pagar ahora
                </Button>
                <div className="confirmation-page__offline-payment">
                  <Store size={20} aria-hidden="true" />
                  <div>
                    <span className="confirmation-page__offline-title">Pagar en boletería</span>
                    <p className="confirmation-page__offline-text">
                      Presentá el código <strong>{code}</strong> en cualquier boletería adherida dentro de las 24 hs.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="confirmation-page__paid-actions">
                <Button
                  variant="primary"
                  size="lg"
                  className="confirmation-page__payment-btn"
                  onClick={handleDownload}
                >
                  <Download size={20} aria-hidden="true" />
                  Descargar comprobante
                </Button>
                <Button
                  variant="secondary"
                  size="lg"
                  className="confirmation-page__payment-btn"
                  onClick={handleShare}
                >
                  <Share2 size={20} aria-hidden="true" />
                  Compartir
                </Button>
              </div>
            )}

            <Link to="/mis-reservas" className="confirmation-page__reservations-link">
              <Ticket size={18} aria-hidden="true" />
              Ver mis reservas
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
