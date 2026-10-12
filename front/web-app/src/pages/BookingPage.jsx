import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import SeatSelector from '../components/SeatSelector';
import PassengerForm from '../components/PassengerForm';
import { reservaService } from '../services/api';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const BookingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const trip = location.state?.trip;

  const [step, setStep] = useState(1);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [passengers, setPassengers] = useState([]);
  const [loading, setLoading] = useState(false);

  if (!trip) {
    return <div className="container" style={{ padding: '100px 0', textAlign: 'center' }}>No se seleccionó ningún viaje.</div>;
  }

  const handleToggleSeat = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter(s => s !== seatNumber));
      setPassengers(passengers.filter(p => p.seatNumber !== seatNumber));
    } else {
      if (selectedSeats.length >= 3) {
        toast.error('Solo podés reservar hasta 3 asientos por viaje');
        return;
      }
      setSelectedSeats([...selectedSeats, seatNumber]);
      setPassengers([...passengers, {
        seatNumber,
        nombre: '',
        apellido: '',
        dni: '',
        ubicacionOrigen: trip.origenLocalidad,
        ubicacionDestino: trip.destinoLocalidad
      }]);
    }
  };

  const handlePassengerChange = (seatNumber, field, value) => {
    setPassengers(passengers.map(p => 
      p.seatNumber === seatNumber ? { ...p, [field]: value } : p
    ));
  };

  const handleConfirm = async () => {
    if (!user) {
      toast.error('Tenés que iniciar sesión para reservar');
      navigate('/login', { state: { from: location } });
      return;
    }

    // Validar que todos los campos de pasajeros estén completos
    const invalid = passengers.some(p => !p.nombre?.trim() || !p.apellido?.trim() || !p.dni);
    if (invalid) {
      toast.error('Por favor, completá los datos de todos los pasajeros');
      return;
    }

    setLoading(true);
    try {
      // Formatear personas para el backend con casteo de DNI a entero
      const personasData = passengers.map(p => ({
        nombre: p.nombre.trim(),
        apellido: p.apellido.trim(),
        dni: parseInt(p.dni, 10),
        ubicacionOrigen: p.ubicacionOrigen || trip.origenLocalidad,
        ubicacionDestino: p.ubicacionDestino || trip.destinoLocalidad
      }));

      const reservaData = {
        usuarios_id: parseInt(user.id, 10),
        viajes_id: parseInt(trip.id, 10),
        fechaReserva: new Date().toISOString(),
        personas: personasData,
        pasajeros: personasData,
        asientos_reservados: selectedSeats.length
      };

      await reservaService.crear(reservaData);
      toast.success('¡Reserva realizada con éxito!');
      navigate('/mis-reservas');
    } catch (error) {
      const errorMsg = error.response?.data?.mensaje || error.response?.data?.message || (error.response?.data?.errores ? error.response.data.errores.map(e => e.msg).join(', ') : 'Error al procesar la reserva');
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '40px 0' }}>
      <button onClick={() => navigate(-1)} style={backButtonStyle}>
        <ChevronLeft size={20} />
        <span>Volver</span>
      </button>

      <div style={layout}>
        {/* Left Column: Flow */}
        <div style={{ flex: 1 }}>
          {step === 1 ? (
            <div className="animate-fade-in">
              <SeatSelector 
                totalSeats={trip.MedioTransporte?.cantLugares || 19}
                selectedSeats={selectedSeats}
                onToggleSeat={handleToggleSeat}
              />
              <div style={{ marginTop: '30px', textAlign: 'right' }}>
                <button 
                  disabled={selectedSeats.length === 0}
                  onClick={() => setStep(2)} 
                  style={{...mainButton, opacity: selectedSeats.length === 0 ? 0.5 : 1}}
                >
                  Continuar con los Datos
                </button>
              </div>
            </div>
          ) : (
            <div className="animate-fade-in">
              <h3 style={{ marginBottom: '25px', fontWeight: '700' }}>Datos de los Pasajeros</h3>
              {passengers.map(p => (
                <PassengerForm 
                  key={p.seatNumber}
                  passenger={p}
                  onChange={(field, val) => handlePassengerChange(p.seatNumber, field, val)}
                />
              ))}
              <div style={{ marginTop: '30px', display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setStep(1)} style={secondaryButton}>Atrás</button>
                <button onClick={handleConfirm} disabled={loading} style={mainButton}>
                  {loading ? 'Procesando...' : 'Confirmar Reserva'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Summary */}
        <div style={summaryCard}>
          <h3 style={{ marginBottom: '20px', fontWeight: '700' }}>Resumen del Viaje</h3>
          <div style={summaryItem}>
            <span style={label}>Empresa</span>
            <span style={value}>{trip.MedioTransporte?.Empresa?.nombre}</span>
          </div>
          <div style={summaryItem}>
            <span style={label}>Ruta</span>
            <span style={value}>{trip.origenLocalidad} ➜ {trip.destinoLocalidad}</span>
          </div>
          <div style={summaryItem}>
            <span style={label}>Fecha y Hora</span>
            <span style={value}>{new Date(trip.fechaViaje).toLocaleDateString()} - {trip.horarioSalida.substring(0, 5)} hs</span>
          </div>
          <div style={{ ...summaryItem, borderTop: '1px solid #e2e8f0', paddingTop: '15px', marginTop: '10px' }}>
            <span style={{ ...label, fontSize: '1rem', color: 'var(--text-dark)' }}>Total</span>
            <span style={{ ...value, fontSize: '1.4rem', color: 'var(--primary)' }}>
              ARS ${(trip.precio * selectedSeats.length).toLocaleString('es-AR')}
            </span>
          </div>
          
          <div style={securityBadge}>
            <ShieldCheck size={18} color="#059669" />
            <span>Pago seguro y reserva inmediata</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const layout = {
  display: 'flex',
  gap: '40px',
  flexWrap: 'wrap',
  marginTop: '20px'
};

const backButtonStyle = {
  background: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  color: 'var(--text-muted)',
  marginBottom: '20px',
  fontWeight: '600'
};

const summaryCard = {
  width: '350px',
  background: 'white',
  padding: '30px',
  borderRadius: '20px',
  boxShadow: 'var(--shadow-lg)',
  height: 'fit-content',
  position: 'sticky',
  top: '100px'
};

const summaryItem = {
  display: 'flex',
  flexDirection: 'column',
  marginBottom: '15px'
};

const label = {
  fontSize: '0.8rem',
  color: 'var(--text-muted)',
  textTransform: 'uppercase',
  marginBottom: '4px'
};

const value = {
  fontWeight: '600',
  fontSize: '1rem'
};

const mainButton = {
  background: 'var(--primary)',
  color: 'white',
  padding: '14px 30px',
  borderRadius: '12px',
  fontWeight: '700',
  fontSize: '1rem'
};

const secondaryButton = {
  background: 'none',
  border: '2px solid #e2e8f0',
  color: 'var(--text-dark)',
  padding: '12px 30px',
  borderRadius: '12px',
  fontWeight: '600'
};

const securityBadge = {
  marginTop: '30px',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '0.85rem',
  color: '#059669',
  background: '#f0fdf4',
  padding: '10px',
  borderRadius: '10px'
};

export default BookingPage;
