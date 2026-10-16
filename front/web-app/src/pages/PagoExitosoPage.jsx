import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { pagoService } from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import {
  CheckCircle,
  Ticket,
  Calendar,
  MapPin,
  Clock,
  Users,
  ArrowRight,
  Loader,
} from 'lucide-react';
import toast from 'react-hot-toast';

const PagoExitosoPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [pagoData, setPagoData] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Obtener reserva_id de la URL o del sessionStorage
    const urlParams = new URLSearchParams(window.location.search);
    let reservaId = urlParams.get('reserva_id') || sessionStorage.getItem('ultimaReservaId');
    if (!reservaId) {
      const extRef = urlParams.get('external_reference');
      if (extRef) {
        const match = extRef.match(/RESERVA-(\d+)/);
        if (match) reservaId = match[1];
      }
    }

    if (reservaId) {
      sessionStorage.setItem('ultimaReservaId', reservaId);
      const fetchPagoEstado = async () => {
        try {
          const response = await pagoService.obtenerEstado(reservaId);
          const data = response.data?.data || response.data;
          setPagoData(data);
        } catch (err) {
          console.error('Error al obtener estado del pago:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchPagoEstado();
    } else {
      setLoading(false);
    }
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="container confirmation-page__container">
        <div className="confirmation-page__loader" role="status">
          <Loader size={40} className="confirmation-page__loader-icon" />
          <span>Procesando tu pago…</span>
        </div>
      </div>
    );
  }

  const reservaId = sessionStorage.getItem('ultimaReservaId');

  return (
    <div className="container confirmation-page__container animate-fade-in">
      <Card padded className="confirmation-page__status-card">
        <div className="confirmation-page__status confirmation-page__status--paid">
          <div className="confirmation-page__status-icon">
            <CheckCircle size={48} />
          </div>
          <div className="confirmation-page__status-text">
            <h1 className="confirmation-page__status-title">¡Pago confirmado!</h1>
            <p className="confirmation-page__status-subtitle">
              Tu pago fue procesado correctamente. Tu lugar está asegurado.
            </p>
          </div>
        </div>
      </Card>

      {pagoData && (
        <Card padded className="confirmation-page__trip-card">
          <h2 className="confirmation-page__section-title">Resumen del pago</h2>
          <div className="confirmation-page__summary-row">
            <span>Total abonado</span>
            <span className="confirmation-page__summary-total">
              ARS ${(pagoData.total || 0).toLocaleString('es-AR')}
            </span>
          </div>
          <div className="confirmation-page__summary-row">
            <span>Estado</span>
            <span className="confirmation-page__payment-badge confirmation-page__payment-badge--success">
              Pagado
            </span>
          </div>
        </Card>
      )}

      <div className="confirmation-page__actions">
        <Button
          variant="primary"
          size="lg"
          onClick={() => navigate(reservaId ? `/confirmacion/${reservaId}` : '/mis-reservas')}
        >
          <Ticket size={20} />
          Ver mi reserva
        </Button>
        <Link to="/mis-reservas" className="confirmation-page__reservations-link">
          <Users size={18} />
          Ver todas mis reservas
          <ArrowRight size={16} />
        </Link>
        <Link to="/" className="confirmation-page__reservations-link">
          <MapPin size={18} />
          Buscar nuevos viajes
          <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
};

export default PagoExitosoPage;
