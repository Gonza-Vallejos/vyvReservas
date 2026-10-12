import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Ticket, Calendar, MapPin, ChevronRight, Clock } from 'lucide-react';
import { reservaService } from '../services/api';
import toast from 'react-hot-toast';

const MyReservationsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reservas, setReservas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchReservas = async () => {
      try {
        const response = await reservaService.obtenerPorUsuario();
        const result = response.data;
        setReservas(result.data || []);
      } catch (error) {
        toast.error('Error al cargar tus reservas');
      } finally {
        setLoading(false);
      }
    };

    fetchReservas();
  }, [user, navigate]);

  return (
    <div className="container animate-fade-in" style={{ padding: '60px 20px' }}>
      <div style={headerStyle}>
        <Ticket size={32} color="var(--primary)" />
        <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Mis Reservas</h1>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '100px' }}>Cargando tus viajes...</div>
      ) : reservas.length === 0 ? (
        <div style={emptyContainer}>
          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '20px' }}>Aún no tenés ninguna reserva realizada.</p>
          <button onClick={() => navigate('/')} style={buttonStyle}>Buscar mi primer viaje</button>
        </div>
      ) : (
        <div style={listStyle}>
          {reservas.map(reserva => (
            <div key={reserva.id} style={reservaCard}>
              <div style={statusBadge}>
                {reserva.estado || 'Confirmada'}
              </div>
              <div style={cardBody}>
                <div style={routeInfo}>
                  <div style={locationGroup}>
                    <MapPin size={18} color="var(--primary)" />
                    <div>
                      <span style={locationLabel}>Origen</span>
                      <p style={locationName}>{reserva.viaje?.origenLocalidad || reserva.Viaje?.origenLocalidad || 'Origen'}</p>
                    </div>
                  </div>
                  <div style={divider} />
                  <div style={locationGroup}>
                    <MapPin size={18} color="#ef4444" />
                    <div>
                      <span style={locationLabel}>Destino</span>
                      <p style={locationName}>{reserva.viaje?.destinoLocalidad || reserva.Viaje?.destinoLocalidad || 'Destino'}</p>
                    </div>
                  </div>
                </div>

                <div style={tripDetails}>
                  <div style={detailItem}>
                    <Calendar size={16} />
                    <span>{reserva.viaje?.fechaViaje || reserva.Viaje?.fechaViaje ? new Date(reserva.viaje?.fechaViaje || reserva.Viaje?.fechaViaje).toLocaleDateString('es-AR') : 'Fecha no disp.'}</span>
                  </div>
                  <div style={detailItem}>
                    <Clock size={16} />
                    <span>{(reserva.viaje?.horarioSalida || reserva.Viaje?.horarioSalida)?.substring(0, 5)} hs</span>
                  </div>
                  <div style={detailItem}>
                    <span style={{ fontWeight: '700', color: 'var(--primary)' }}>
                      {(reserva.pasajeros?.length || reserva.Pasajeros?.length || 1)} pasajero(s)
                    </span>
                  </div>
                </div>

                {((reserva.pasajeros || reserva.Pasajeros) && (reserva.pasajeros || reserva.Pasajeros).length > 0) && (
                  <div style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px dashed #e2e8f0' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pasajeros:</span>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                      {(reserva.pasajeros || reserva.Pasajeros).map((p, idx) => (
                        <span key={idx} style={{ background: '#f1f5f9', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '600' }}>
                          {p.nombre} {p.apellido} (DNI: {p.dni})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div style={cardFooter}>
                <span style={{ fontWeight: '700' }}>Total: ${reserva.viaje?.precio || reserva.Viaje?.precio || 0}</span>
                <button style={detailButton}>
                  Ver Comprobante <ChevronRight size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const headerStyle = { display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '40px' };
const emptyContainer = { textAlign: 'center', padding: '100px 20px', background: 'white', borderRadius: '24px', boxShadow: 'var(--shadow-sm)' };
const listStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '25px' };
const reservaCard = { background: 'white', borderRadius: '20px', boxShadow: 'var(--shadow-md)', overflow: 'hidden', position: 'relative', transition: '0.2s' };
const statusBadge = { position: 'absolute', top: '15px', right: '15px', background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' };
const cardBody = { padding: '25px' };
const routeInfo = { display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' };
const locationGroup = { flex: 1 };
const locationLabel = { fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: '700' };
const locationName = { fontSize: '1.1rem', fontWeight: '800', marginTop: '4px' };
const divider = { width: '2px', height: '30px', background: '#f1f5f9' };
const tripDetails = { display: 'flex', gap: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' };
const detailItem = { display: 'flex', alignItems: 'center', gap: '6px' };
const cardFooter = { background: '#f8fafc', padding: '15px 25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9' };
const detailButton = { background: 'none', color: 'var(--primary)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem' };
const buttonStyle = { backgroundColor: 'var(--primary)', color: 'white', padding: '12px 30px', borderRadius: '12px', fontWeight: '700', fontSize: '1rem' };

export default MyReservationsPage;
