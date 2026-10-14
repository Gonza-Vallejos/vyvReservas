import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Ticket,
  Calendar,
  MapPin,
  Clock,
  Users,
  Eye,
  CreditCard,
  Download,
  X,
  AlertCircle,
  Loader,
  ArrowRight,
} from 'lucide-react';
import { reservaService } from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import SkeletonCard from '../components/ui/SkeletonCard';
import toast from 'react-hot-toast';

const CANCEL_HOURS_LIMIT = 2;

const getTrip = (reserva) => reserva?.viaje || reserva?.Viaje || {};
const getPassengers = (reserva) => reserva?.pasajeros || reserva?.Pasajeros || [];

const formatCurrency = (value) =>
  Number(value || 0).toLocaleString('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const parseDeparture = (trip) => {
  if (!trip?.fechaViaje) return null;
  const fecha = String(trip.fechaViaje).split('T')[0];
  const [year, month, day] = fecha.split('-').map((n) => parseInt(n, 10));
  if (!year || !month || !day) return null;
  const date = new Date(year, month - 1, day);
  if (trip.horarioSalida) {
    const [hours, minutes] = String(trip.horarioSalida).split(':');
    if (hours && minutes) {
      date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
    }
  }
  return date;
};

const classifyReservation = (reserva) => {
  const trip = getTrip(reserva);
  const departure = parseDeparture(trip);
  const now = new Date();
  const estado = String(reserva?.estado || '').toLowerCase();
  const estadoPago = String(reserva?.estadoPago || '').toLowerCase();

  const isCancelled = estado === 'cancelada';
  const isPaid = estadoPago === 'pagado' || estado === 'pagado' || estado === 'pagada';
  const isPending = estado === 'pendiente' || estadoPago === 'pendiente';
  const isConfirmed = estado === 'confirmada';
  const isPast = departure ? departure <= now : false;
  const needsPayment = isPending || (isConfirmed && !isPaid);

  return { isCancelled, isPaid, isPending, isConfirmed, isPast, departure, needsPayment };
};

const statusBadgeProps = (reserva) => {
  const estado = String(reserva?.estado || '').toLowerCase();
  const estadoPago = String(reserva?.estadoPago || '').toLowerCase();

  if (estado === 'cancelada') return { variant: 'error', label: 'Cancelada' };
  if (estadoPago === 'pagado' || estado === 'pagado' || estado === 'pagada') return { variant: 'success', label: 'Pagada' };
  if (estado === 'pendiente' || estadoPago === 'pendiente') return { variant: 'warning', label: 'Pendiente de pago' };
  if (estado === 'confirmada') return { variant: 'success', label: 'Confirmada' };
  return { variant: 'default', label: reserva?.estado || 'Reserva' };
};

const MyReservationsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [confirmCancel, setConfirmCancel] = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { state: { from: '/mis-reservas' } });
      return;
    }

    let cancelled = false;
    const fetchReservas = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await reservaService.obtenerPorUsuario();
        const data = response.data?.data || response.data || [];
        setReservas(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) {
          setError('No pudimos cargar tus reservas. Intentá de nuevo en unos instantes.');
          toast.error('Error al cargar tus reservas');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchReservas();
    return () => { cancelled = true; };
  }, [user, authLoading, navigate]);

  const grouped = useMemo(() => {
    const upcoming = [];
    const pending = [];
    const history = [];

    reservas.forEach((reserva) => {
      const { isCancelled, isPaid, isPending, isConfirmed, isPast } = classifyReservation(reserva);
      if (isCancelled || isPast) {
        history.push(reserva);
      } else if (isPending) {
        pending.push(reserva);
      } else if (isPaid || isConfirmed) {
        upcoming.push(reserva);
      } else {
        upcoming.push(reserva);
      }
    });

    const sortByDeparture = (a, b, direction = 'asc') => {
      const da = parseDeparture(getTrip(a));
      const db = parseDeparture(getTrip(b));
      if (!da || !db) return 0;
      return direction === 'asc' ? da - db : db - da;
    };

    upcoming.sort((a, b) => sortByDeparture(a, b, 'asc'));
    pending.sort((a, b) => sortByDeparture(a, b, 'asc'));
    history.sort((a, b) => sortByDeparture(a, b, 'desc'));

    return { upcoming, pending, history };
  }, [reservas]);

  const canCancel = (reserva) => {
    const { isCancelled, isPast, departure } = classifyReservation(reserva);
    if (isCancelled || isPast || !departure) return false;
    const limit = new Date(departure.getTime() - CANCEL_HOURS_LIMIT * 60 * 60 * 1000);
    return new Date() <= limit;
  };

  const handlePayment = () => {
    // TODO: integrar con MercadoPago
    toast('Pronto podrás pagar con MercadoPago', { icon: '💳' });
  };

  const handleDownload = () => {
    // TODO: generar boleto PDF
    toast('Descarga de boleto en desarrollo', { icon: '📄' });
  };

  const openCancelDialog = (reserva) => {
    setConfirmCancel(reserva);
  };

  const closeCancelDialog = () => {
    setConfirmCancel(null);
  };

  const handleCancel = async () => {
    if (!confirmCancel) return;
    const id = confirmCancel.id;
    setCancellingId(id);
    closeCancelDialog();
    try {
      await reservaService.cancelar(id);
      toast.success('Reserva cancelada correctamente');
      setReservas((prev) =>
        prev.map((r) =>
          String(r.id) === String(id) ? { ...r, estado: 'Cancelada', estadoPago: 'Cancelada' } : r
        )
      );
    } catch (err) {
      const message = err.response?.data?.mensaje || err.response?.data?.message || 'No se pudo cancelar la reserva';
      toast.error(message);
    } finally {
      setCancellingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="container my-reservations__container">
        <header className="my-reservations__header">
          <div className="my-reservations__header-icon" aria-hidden="true">
            <Ticket size={28} />
          </div>
          <h1 className="my-reservations__title">Mis Reservas</h1>
        </header>
        <div className="my-reservations__skeleton">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container my-reservations__container">
        <EmptyState
          icon={AlertCircle}
          title="No pudimos cargar tus reservas"
          description={error}
          action={{
            label: 'Reintentar',
            onClick: () => window.location.reload(),
          }}
        />
      </div>
    );
  }

  const totalCount = grouped.upcoming.length + grouped.pending.length + grouped.history.length;

  return (
    <div className="container my-reservations__container animate-fade-in">
      <header className="my-reservations__header">
        <div className="my-reservations__header-icon" aria-hidden="true">
          <Ticket size={28} />
        </div>
        <div>
          <h1 className="my-reservations__title">Mis Reservas</h1>
          <p className="my-reservations__subtitle">
            {totalCount === 0
              ? 'Todavía no tenés reservas activas'
              : `Tenés ${totalCount} ${totalCount === 1 ? 'reserva' : 'reservas'} en total`}
          </p>
        </div>
      </header>

      {totalCount === 0 ? (
        <EmptyState
          icon={Ticket}
          title="Aún no tenés reservas"
          description="Cuando reserves tu próximo viaje, vas a encontrarlo acá. Busca pasajes y reservá en segundos."
          action={{
            label: 'Buscar mi primer viaje',
            onClick: () => navigate('/'),
          }}
        />
      ) : (
        <div className="my-reservations__content">
          {grouped.upcoming.length > 0 && (
            <section className="my-reservations__section" aria-labelledby="upcoming-title">
              <h2 id="upcoming-title" className="my-reservations__section-title">
                Próximos confirmados
                <Badge variant="success">{grouped.upcoming.length}</Badge>
              </h2>
              <div className="my-reservations__grid">
                {grouped.upcoming.map((reserva) => (
                  <ReservationCard
                    key={reserva.id}
                    reserva={reserva}
                    onPay={handlePayment}
                    onDownload={handleDownload}
                    onCancel={openCancelDialog}
                    canCancel={canCancel(reserva)}
                    cancellingId={cancellingId}
                  />
                ))}
              </div>
            </section>
          )}

          {grouped.pending.length > 0 && (
            <section className="my-reservations__section" aria-labelledby="pending-title">
              <h2 id="pending-title" className="my-reservations__section-title">
                Pendientes de pago
                <Badge variant="warning">{grouped.pending.length}</Badge>
              </h2>
              <div className="my-reservations__grid">
                {grouped.pending.map((reserva) => (
                  <ReservationCard
                    key={reserva.id}
                    reserva={reserva}
                    onPay={handlePayment}
                    onDownload={handleDownload}
                    onCancel={openCancelDialog}
                    canCancel={canCancel(reserva)}
                    cancellingId={cancellingId}
                  />
                ))}
              </div>
            </section>
          )}

          {grouped.history.length > 0 && (
            <section className="my-reservations__section" aria-labelledby="history-title">
              <h2 id="history-title" className="my-reservations__section-title my-reservations__section-title--muted">
                Finalizados / Cancelados
                <Badge variant="default">{grouped.history.length}</Badge>
              </h2>
              <div className="my-reservations__grid">
                {grouped.history.map((reserva) => (
                  <ReservationCard
                    key={reserva.id}
                    reserva={reserva}
                    onPay={handlePayment}
                    onDownload={handleDownload}
                    onCancel={openCancelDialog}
                    canCancel={false}
                    cancellingId={cancellingId}
                    muted
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {confirmCancel && (
        <CancelDialog
          reserva={confirmCancel}
          onClose={closeCancelDialog}
          onConfirm={handleCancel}
        />
      )}
    </div>
  );
};

const ReservationCard = ({
  reserva,
  onPay,
  onDownload,
  onCancel,
  canCancel,
  cancellingId,
  muted = false,
}) => {
  const navigate = useNavigate();
  const trip = getTrip(reserva);
  const passengers = getPassengers(reserva);
  const { isPaid, needsPayment } = classifyReservation(reserva);
  const status = statusBadgeProps(reserva);
  const departure = parseDeparture(trip);
  const total =
    reserva.total || trip.precio * (passengers.length || 1) || 0;

  const handleViewDetail = () => {
    navigate(`/confirmacion/${reserva.id}`);
  };

  return (
    <Card padded hover={!muted} className={`my-reservations__card ${muted ? 'my-reservations__card--muted' : ''}`}>
      <div className="my-reservations__card-header">
        <Badge variant={status.variant}>{status.label}</Badge>
        {cancellingId === reserva.id && (
          <span className="my-reservations__card-cancelling" aria-live="polite">
            <Loader size={16} aria-hidden="true" className="my-reservations__card-spinner" />
            Cancelando…
          </span>
        )}
      </div>

      <div className="my-reservations__route">
        <div className="my-reservations__location">
          <MapPin size={18} aria-hidden="true" className="my-reservations__location-icon my-reservations__location-icon--origin" />
          <div>
            <span className="my-reservations__location-label">Origen</span>
            <span className="my-reservations__location-name">{trip.origenLocalidad || 'No disponible'}</span>
          </div>
        </div>
        <div className="my-reservations__route-connector" aria-hidden="true">
          <span className="my-reservations__route-line" />
          <ArrowRight size={14} />
          <span className="my-reservations__route-line" />
        </div>
        <div className="my-reservations__location">
          <MapPin size={18} aria-hidden="true" className="my-reservations__location-icon my-reservations__location-icon--destination" />
          <div>
            <span className="my-reservations__location-label">Destino</span>
            <span className="my-reservations__location-name">{trip.destinoLocalidad || 'No disponible'}</span>
          </div>
        </div>
      </div>

      <div className="my-reservations__details">
        <div className="my-reservations__detail">
          <Calendar size={16} aria-hidden="true" />
          <span>
            {departure
              ? departure.toLocaleDateString('es-AR', {
                  weekday: 'short',
                  day: '2-digit',
                  month: 'short',
                })
              : 'Fecha no disp.'}
          </span>
        </div>
        <div className="my-reservations__detail">
          <Clock size={16} aria-hidden="true" />
          <span>{trip.horarioSalida?.substring(0, 5) || '--:--'} hs</span>
        </div>
        <div className="my-reservations__detail">
          <Users size={16} aria-hidden="true" />
          <span>
            {passengers.length} pasajero{passengers.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {passengers.length > 0 && (
        <div className="my-reservations__passengers">
          <span className="my-reservations__passengers-label">Pasajeros</span>
          <div className="my-reservations__passengers-list">
            {passengers.slice(0, 4).map((p, idx) => (
              <span key={idx} className="my-reservations__passenger-chip">
                {p.nombre} {p.apellido}
              </span>
            ))}
            {passengers.length > 4 && (
              <span className="my-reservations__passenger-chip my-reservations__passenger-chip--more">
                +{passengers.length - 4}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="my-reservations__footer">
        <span className="my-reservations__total">
          <span className="my-reservations__total-label">Total</span>
          <span className="my-reservations__total-value">{formatCurrency(total)}</span>
        </span>
        <div className="my-reservations__actions">
          <Button variant="ghost" size="sm" onClick={handleViewDetail} ariaLabel="Ver detalle de la reserva">
            <Eye size={16} aria-hidden="true" />
            Detalle
          </Button>

          {needsPayment && (
            <Button variant="primary" size="sm" onClick={() => onPay()} ariaLabel="Pagar reserva">
              <CreditCard size={16} aria-hidden="true" />
              Pagar
            </Button>
          )}

          {isPaid && (
            <Button variant="secondary" size="sm" onClick={() => onDownload()} ariaLabel="Descargar boleto">
              <Download size={16} aria-hidden="true" />
              Boleto
            </Button>
          )}

          {canCancel && (
            <Button
              variant="secondary"
              size="sm"
              className="my-reservations__cancel-btn"
              onClick={() => onCancel(reserva)}
              ariaLabel="Cancelar reserva"
            >
              <X size={16} aria-hidden="true" />
              Cancelar
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};

const CancelDialog = ({ reserva, onClose, onConfirm }) => {
  const trip = getTrip(reserva);
  const departure = parseDeparture(trip);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <div
      className="my-reservations__modal-overlay"
      role="presentation"
      onClick={onClose}
    >
      <div
        className="my-reservations__modal-card"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cancel-title"
        aria-describedby="cancel-desc"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="my-reservations__modal-icon" aria-hidden="true">
          <AlertCircle size={32} />
        </div>
        <h2 id="cancel-title" className="my-reservations__modal-title">
          ¿Cancelar esta reserva?
        </h2>
        <p id="cancel-desc" className="my-reservations__modal-text">
          Vas a cancelar el viaje de <strong>{trip.origenLocalidad}</strong> a{' '}
          <strong>{trip.destinoLocalidad}</strong>
          {departure && (
            <>
              {' '}
              del{' '}
              <strong>
                {departure.toLocaleDateString('es-AR', {
                  day: '2-digit',
                  month: 'long',
                })}
              </strong>{' '}
              a las <strong>{trip.horarioSalida?.substring(0, 5)} hs</strong>
            </>
          )}
          . Esta acción no se puede deshacer.
        </p>
        <div className="my-reservations__modal-actions">
          <Button variant="secondary" size="md" onClick={onClose}>
            Volver
          </Button>
          <Button variant="primary" size="md" onClick={onConfirm} className="my-reservations__modal-confirm">
            Sí, cancelar reserva
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MyReservationsPage;
