import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { viajeService, reservaService } from '../services/api';
import SeatSelector from '../components/SeatSelector';
import PassengerForm from '../components/PassengerForm';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import {
  ChevronLeft,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  Users,
  AlertCircle,
  Check,
  Armchair,
  Loader,
  Navigation,
  Flag,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { PROFILES } from '../constants/profiles';

const STEPS = [
  { id: 1, label: 'Asientos' },
  { id: 2, label: 'Pasajeros' },
  { id: 3, label: 'Confirmar' },
];

const MAX_SEATS = 3;

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [trip, setTrip] = useState(null);
  const [loadingTrip, setLoadingTrip] = useState(true);
  const [tripError, setTripError] = useState(null);
  const [occupiedSeats, setOccupiedSeats] = useState([]);

  const [step, setStep] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [errors, setErrors] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      toast.error('Iniciá sesión para reservar');
      navigate('/login', { state: { from: `/reservar/${id}` } });
      return;
    }
    if (Number(user.perfil_id) === PROFILES.EMPRESA) {
      toast.info('El perfil empresa gestiona la operación. Las reservas se realizan desde una cuenta cliente o mostrador.');
      navigate('/dashboard');
      return;
    }
    if (Number(user.perfil_id) === PROFILES.CHOFER) {
      toast.info('Los choferes gestionan sus viajes desde el panel de chofer.');
      navigate('/chofer');
      return;
    }
  }, [user, navigate, id]);

  useEffect(() => {
    let cancelled = false;
    const fetchTrip = async () => {
      setLoadingTrip(true);
      setTripError(null);
      try {
        const response = await viajeService.obtenerPorId(id);
        const tripData = response.data?.data || response.data;
        if (!cancelled) setTrip(tripData);

        try {
          const asientosRes = await viajeService.obtenerAsientosOcupados(id);
          const asientosData = asientosRes.data?.data || asientosRes.data;
          if (Array.isArray(asientosData?.mapaAsientos)) {
            const ocupados = asientosData.mapaAsientos
              .filter(a => a.ocupado)
              .map(a => a.numero);
            if (!cancelled) setOccupiedSeats(ocupados);
          } else {
            if (!cancelled) setOccupiedSeats(generateMockOccupiedSeats(id, tripData?.cantPasajeros));
          }
        } catch {
          if (!cancelled) setOccupiedSeats(generateMockOccupiedSeats(id, tripData?.cantPasajeros));
        }
      } catch {
        if (!cancelled) {
          setTripError('No pudimos cargar el viaje seleccionado.');
          toast.error('Error al cargar el viaje');
        }
      } finally {
        if (!cancelled) setLoadingTrip(false);
      }
    };

    fetchTrip();
    return () => { cancelled = true; };
  }, [id]);

  const totalPrice = useMemo(() => (trip?.precio || 0) * selectedSeats.length, [trip, selectedSeats]);

  const handleToggleSeat = (seatNumber) => {
    setErrors(prev => ({ ...prev, seats: undefined }));

    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(prev => prev.filter(s => s !== seatNumber));
      setPassengers(prev => prev.filter(p => p.seatNumber !== seatNumber));
    } else {
      if (selectedSeats.length >= MAX_SEATS) {
        toast.error(`Solo podés reservar hasta ${MAX_SEATS} asientos`);
        return;
      }
      setSelectedSeats(prev => [...prev, seatNumber].sort((a, b) => a - b));
      setPassengers(prev => [
        ...prev,
        {
          seatNumber,
          nombre: '',
          apellido: '',
          dni: '',
          ubicacionOrigen: trip?.origenLocalidad || '',
          ubicacionDestino: trip?.destinoLocalidad || '',
        },
      ].sort((a, b) => a.seatNumber - b.seatNumber));
    }
  };

  const handlePassengerChange = (seatNumber, field, value) => {
    setPassengers(prev => prev.map(p =>
      p.seatNumber === seatNumber ? { ...p, [field]: value } : p
    ));
    setFieldErrors(prev => {
      const next = { ...prev };
      delete next[`${seatNumber}-${field}`];
      return next;
    });
  };

  const handleAutofillFirst = () => {
    if (!user || passengers.length === 0) return;
    const [first, ...rest] = passengers;
    setPassengers([
      {
        ...first,
        nombre: user.nombre || first.nombre,
        apellido: user.apellido || first.apellido,
        dni: user.dni ? String(user.dni) : first.dni,
      },
      ...rest,
    ]);
    toast.success('Tus datos fueron cargados');
  };

  const validatePassengers = () => {
    const newFieldErrors = {};
    passengers.forEach((p) => {
      if (!p.nombre.trim()) newFieldErrors[`${p.seatNumber}-nombre`] = 'Ingresá el nombre';
      if (!p.apellido.trim()) newFieldErrors[`${p.seatNumber}-apellido`] = 'Ingresá el apellido';
      if (!p.dni.trim()) newFieldErrors[`${p.seatNumber}-dni`] = 'Ingresá el DNI';
      else if (p.dni.trim().length < 7) newFieldErrors[`${p.seatNumber}-dni`] = 'DNI inválido';
      if (!p.ubicacionOrigen.trim()) newFieldErrors[`${p.seatNumber}-ubicacionOrigen`] = 'Ingresá el punto de subida';
      if (!p.ubicacionDestino.trim()) newFieldErrors[`${p.seatNumber}-ubicacionDestino`] = 'Ingresá el punto de bajada';
    });
    setFieldErrors(newFieldErrors);
    return Object.keys(newFieldErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1) {
      if (selectedSeats.length === 0) {
        setErrors(prev => ({ ...prev, seats: 'Seleccioná al menos un asiento' }));
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!validatePassengers()) {
        toast.error('Revisá los datos de los pasajeros');
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    setStep(prev => Math.max(1, prev - 1));
    setErrors({});
  };

  const handleConfirm = async () => {
    if (!validatePassengers()) {
      setStep(2);
      toast.error('Revisá los datos de los pasajeros');
      return;
    }

    setSubmitting(true);
    try {
      const personasData = passengers.map(p => ({
        nombre: p.nombre.trim(),
        apellido: p.apellido.trim(),
        dni: parseInt(p.dni, 10),
        ubicacionOrigen: p.ubicacionOrigen.trim() || trip.origenLocalidad,
        ubicacionDestino: p.ubicacionDestino.trim() || trip.destinoLocalidad,
      }));

      const reservaData = {
        usuarios_id: parseInt(user.id, 10),
        viajes_id: parseInt(trip.id, 10),
        fechaReserva: new Date().toISOString(),
        personas: personasData,
        pasajeros: personasData,
        asientos_reservados: selectedSeats.length,
      };

      const response = await reservaService.crear(reservaData);
      const created = response.data?.data || response.data;
      const reservaId = created?.id || created?.reservaId;

      toast.success('¡Reserva realizada con éxito!');
      navigate(`/confirmacion/${reservaId || 'nueva'}`, {
        state: { reservation: created, trip, passengers, selectedSeats },
      });
    } catch (error) {
      const backendErrors = error.response?.data?.errores;
      const message = error.response?.data?.mensaje || error.response?.data?.message || 'Error al procesar la reserva';

      if (Array.isArray(backendErrors) && backendErrors.length > 0) {
        const mapped = {};
        backendErrors.forEach((err, idx) => {
          const passenger = passengers[idx];
          if (passenger && err.campo) {
            mapped[`${passenger.seatNumber}-${err.campo}`] = err.msg;
          }
        });
        setFieldErrors(prev => ({ ...prev, ...mapped }));
        setStep(2);
      }

      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingTrip) {
    return (
      <div className="container booking-page__container">
        <div className="booking-page__loader" role="status" aria-live="polite">
          <Loader size={40} className="booking-page__loader-icon" aria-hidden="true" />
          <span>Cargando viaje…</span>
        </div>
      </div>
    );
  }

  if (tripError || !trip) {
    return (
      <div className="container booking-page__container">
        <EmptyState
          icon={AlertCircle}
          title="Viaje no disponible"
          description={tripError || 'El viaje que querés reservar no está disponible.'}
          action={{
            label: 'Buscar otro viaje',
            onClick: () => navigate('/'),
          }}
        />
      </div>
    );
  }

  const empresaNombre = trip.MedioTransporte?.Empresa?.nombre || 'V&V Express';
  const fechaViaje = new Date(trip.fechaViaje).toLocaleDateString('es-AR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  });
  const hora = trip.horarioSalida?.substring(0, 5) || '--:--';

  return (
    <div className="container booking-page__container animate-fade-in">
      <nav aria-label="Volver" className="booking-page__back">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} ariaLabel="Volver atrás">
          <ChevronLeft size={18} aria-hidden="true" />
          Volver
        </Button>
      </nav>

      <StepIndicator currentStep={step} />

      <div className="booking-page__layout">
        <section className="booking-page__main" aria-live="polite">
          {step === 1 && (
            <Card padded className="booking-page__step">
              <SeatSelector
                totalSeats={trip.MedioTransporte?.cantLugares || 19}
                occupiedSeats={occupiedSeats}
                selectedSeats={selectedSeats}
                onToggleSeat={handleToggleSeat}
                maxSeats={MAX_SEATS}
              />
              {errors.seats && (
                <p className="booking-page__step-error" role="alert">
                  <AlertCircle size={16} aria-hidden="true" />
                  {errors.seats}
                </p>
              )}
              <div className="booking-page__actions">
                <Button variant="primary" size="lg" onClick={handleNext} disabled={selectedSeats.length === 0}>
                  Continuar con los datos
                </Button>
              </div>
            </Card>
          )}

          {step === 2 && (
            <Card padded className="booking-page__step">
              <div className="booking-page__step-header">
                <h2 className="booking-page__step-title">Datos de los pasajeros</h2>
                <p className="booking-page__step-subtitle">
                  Completá la información de cada persona que viaja.
                </p>
              </div>

              {passengers.map((p, index) => (
                <PassengerForm
                  key={p.seatNumber}
                  passenger={p}
                  errors={Object.fromEntries(
                    Object.entries(fieldErrors)
                      .filter(([key]) => key.startsWith(`${p.seatNumber}-`))
                      .map(([key, value]) => [key.replace(`${p.seatNumber}-`, ''), value])
                  )}
                  onChange={(field, val) => handlePassengerChange(p.seatNumber, field, val)}
                  showAutofill={index === 0}
                  onAutofill={handleAutofillFirst}
                />
              ))}

              <div className="booking-page__actions booking-page__actions--split">
                <Button variant="secondary" size="lg" onClick={handleBack}>
                  Atrás
                </Button>
                <Button variant="primary" size="lg" onClick={handleNext}>
                  Revisar reserva
                </Button>
              </div>
            </Card>
          )}

          {step === 3 && (
            <Card padded className="booking-page__step">
              <div className="booking-page__step-header">
                <h2 className="booking-page__step-title">Revisá y confirmá</h2>
                <p className="booking-page__step-subtitle">
                  Verificá que todos los datos sean correctos antes de confirmar.
                </p>
              </div>

              <div className="booking-page__review">
                <h3 className="booking-page__review-title">Asientos seleccionados</h3>
                <div className="booking-page__review-seats">
                  {selectedSeats.map(seat => (
                    <Badge key={seat} variant="primary" className="booking-page__review-seat">
                      <Armchair size={14} aria-hidden="true" />
                      Asiento {seat}
                    </Badge>
                  ))}
                </div>

                <h3 className="booking-page__review-title">Pasajeros</h3>
                <ul className="booking-page__passengers-list">
                  {passengers.map(p => (
                    <li key={p.seatNumber} className="booking-page__passenger-item">
                      <div className="booking-page__passenger-main">
                        <span className="booking-page__passenger-name">{p.nombre} {p.apellido}</span>
                        <span className="booking-page__passenger-meta">DNI {p.dni}</span>
                      </div>
                      <div className="booking-page__passenger-stops">
                        <span><Navigation size={14} aria-hidden="true" /> {p.ubicacionOrigen}</span>
                        <span><Flag size={14} aria-hidden="true" /> {p.ubicacionDestino}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="booking-page__actions booking-page__actions--split">
                <Button variant="secondary" size="lg" onClick={handleBack}>
                  Atrás
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleConfirm}
                  loading={submitting}
                  disabled={submitting}
                >
                  {!submitting && <Check size={20} aria-hidden="true" />}
                  Confirmar reserva
                </Button>
              </div>
            </Card>
          )}
        </section>

        <aside className="booking-page__summary" aria-label="Resumen del viaje">
          <Card padded className="booking-page__summary-card">
            <h3 className="booking-page__summary-title">Resumen del viaje</h3>

            <div className="booking-page__summary-item">
              <span className="booking-page__summary-label">Empresa</span>
              <span className="booking-page__summary-value">{empresaNombre}</span>
            </div>

            <div className="booking-page__summary-item">
              <span className="booking-page__summary-label">Ruta</span>
              <span className="booking-page__summary-value">
                <MapPin size={14} aria-hidden="true" /> {trip.origenLocalidad} → {trip.destinoLocalidad}
              </span>
            </div>

            <div className="booking-page__summary-item">
              <span className="booking-page__summary-label">Fecha y hora</span>
              <span className="booking-page__summary-value">
                <Calendar size={14} aria-hidden="true" /> {fechaViaje}
                <br />
                <Clock size={14} aria-hidden="true" /> {hora} hs
              </span>
            </div>

            <div className="booking-page__summary-item">
              <span className="booking-page__summary-label">Pasajeros</span>
              <span className="booking-page__summary-value">
                <Users size={14} aria-hidden="true" /> {selectedSeats.length}
              </span>
            </div>

            <div className="booking-page__summary-total">
              <span>Total</span>
              <span>ARS ${totalPrice.toLocaleString('es-AR')}</span>
            </div>

            <div className="booking-page__security">
              <ShieldCheck size={18} aria-hidden="true" />
              <span>Pago seguro y reserva inmediata</span>
            </div>
          </Card>
        </aside>
      </div>
    </div>
  );
};

const StepIndicator = ({ currentStep }) => (
  <nav aria-label="Progreso de la reserva" className="booking-page__steps">
    <ol className="booking-page__steps-list">
      {STEPS.map((s, idx) => {
        const status = currentStep === s.id ? 'active' : currentStep > s.id ? 'completed' : 'pending';
        return (
          <li key={s.id} className={`booking-page__step-item booking-page__step-item--${status}`} aria-current={status === 'active' ? 'step' : undefined}>
            <span className="booking-page__step-number" aria-hidden="true">
              {status === 'completed' ? <Check size={14} /> : s.id}
            </span>
            <span className="booking-page__step-label">{s.label}</span>
            {idx < STEPS.length - 1 && <span className="booking-page__step-connector" aria-hidden="true" />}
          </li>
        );
      })}
    </ol>
  </nav>
);

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

export default BookingPage;
