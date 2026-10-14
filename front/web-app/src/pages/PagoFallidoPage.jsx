import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pagoService } from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import {
  XCircle,
  RefreshCw,
  Home,
  Ticket,
  AlertCircle,
  Loader,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PagoFallidoPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const reservaId = sessionStorage.getItem('ultimaReservaId');

  const handleReintentar = async () => {
    if (!reservaId) {
      toast.error('No encontramos la reserva');
      return;
    }

    try {
      const response = await pagoService.obtenerEstado(reservaId);
      const estado = response.data?.data || response.data;

      if (estado?.pagado) {
        toast.success('¡El pago ya está confirmado!');
        navigate(`/confirmacion/${reservaId}`);
        return;
      }

      // Crear nueva preferencia de pago
      const prefResponse = await pagoService.crearPreferencia(reservaId);
      const { initPoint } = prefResponse.data?.data || prefResponse.data || {};

      if (initPoint) {
        window.location.href = initPoint;
      } else {
        toast.error('No se pudo generar el link de pago');
      }
    } catch (err) {
      console.error('Error al reintentar pago:', err);
      toast.error('Error al intentar novamente');
    }
  };

  return (
    <div className="container confirmation-page__container animate-fade-in">
      <Card padded className="confirmation-page__status-card">
        <div className="confirmation-page__status confirmation-page__status--pending">
          <div className="confirmation-page__status-icon">
            <XCircle size={48} />
          </div>
          <div className="confirmation-page__status-text">
            <h1 className="confirmation-page__status-title">Pago no completado</h1>
            <p className="confirmation-page__status-subtitle">
              El pago no se completó. Podés reintentar o volver al inicio.
            </p>
          </div>
        </div>
      </Card>

      <Card padded className="confirmation-page__trip-card">
        <div className="confirmation-page__offline-payment" style={{ marginTop: 0 }}>
          <AlertCircle size={24} />
          <div>
            <span className="confirmation-page__offline-title">¿Qué pasó?</span>
            <p className="confirmation-page__offline-text">
              El pago puede haber sido cancelado, rechazado o expiró el tiempo de espera.
              Tu lugar sigue reservado y podés reintentar el pago cuando quieras.
            </p>
          </div>
        </div>
      </Card>

      <div className="confirmation-page__actions">
        {reservaId && (
          <Button variant="primary" size="lg" onClick={handleReintentar}>
            <RefreshCw size={20} />
            Reintentar pago
          </Button>
        )}

        <Link
          to={reservaId ? `/confirmacion/${reservaId}` : '/mis-reservas'}
          className="confirmation-page__reservations-link"
        >
          <Ticket size={18} />
          Ver mi reserva
        </Link>

        <Link to="/" className="confirmation-page__reservations-link">
          <Home size={18} />
          Volver al inicio
        </Link>
      </div>
    </div>
  );
};

export default PagoFallidoPage;
