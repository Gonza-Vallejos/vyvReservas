import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Bus, Users, Calendar, Clock, MapPin, CheckCircle, 
  ChevronRight, Phone, AlertCircle, RefreshCw, LogOut, ArrowRight
} from 'lucide-react';
import { viajeService, reservaService } from '../services/api';
import toast from 'react-hot-toast';

const ChoferDashboardPage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [loadingPassengers, setLoadingPassengers] = useState(false);
  const [boardedStatus, setBoardedStatus] = useState({});

  const fetchDriverTrips = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await viajeService.obtenerPorChofer(user.id);
      const tripList = res.data?.data || res.data || [];
      setTrips(tripList);
      if (tripList.length > 0 && !selectedTrip) {
        selectTrip(tripList[0]);
      }
    } catch (error) {
      console.error('Error al cargar viajes del chofer:', error);
      toast.error('Error al cargar tus viajes asignados');
    } finally {
      setLoading(false);
    }
  };

  const selectTrip = async (trip) => {
    setSelectedTrip(trip);
    try {
      setLoadingPassengers(true);
      const res = await reservaService.obtenerPasajerosPorViaje(trip.id);
      const passList = res.data?.data || res.data || [];
      setPassengers(passList);
    } catch (error) {
      console.error('Error al cargar pasajeros:', error);
      toast.error('No se pudieron obtener los pasajeros del viaje');
    } finally {
      setLoadingPassengers(false);
    }
  };

  const toggleBoarding = (pasajeroId) => {
    setBoardedStatus(prev => {
      const next = { ...prev, [pasajeroId]: !prev[pasajeroId] };
      toast.success(next[pasajeroId] ? 'Pasajero abordado ✅' : 'Abordaje desmarcado');
      return next;
    });
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.perfil_id !== 4 && user.perfil_id !== 1 && user.perfil_id !== 5) {
      navigate('/');
      return;
    }
    fetchDriverTrips();
  }, [user]);

  return (
    <div style={pageContainer} className="animate-fade-in">
      {/* Top Banner Chofer */}
      <div style={topBanner}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <div style={badgeChofer}>🚍 PANEL DE CONTROL DE CHOFER</div>
            <h1 style={{ fontSize: '2rem', fontWeight: '900', color: 'white', marginTop: '6px' }}>
              Hola, {user?.nombre} {user?.apellido}
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.9rem', marginTop: '4px' }}>
              Gestioná tus salidas del día y controlá el abordaje de pasajeros.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={fetchDriverTrips} style={actionBtn}>
              <RefreshCw size={18} /> Actualizar
            </button>
            <button onClick={() => { logout(); navigate('/login'); }} style={{ ...actionBtn, background: '#ef4444' }}>
              <LogOut size={18} /> Salir
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ padding: '30px 20px', maxWidth: '1200px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 20px' }}>
            <p style={{ fontSize: '1.2rem', fontWeight: '700', color: 'var(--text-muted)' }}>Cargando viajes asignados...</p>
          </div>
        ) : trips.length === 0 ? (
          <div style={emptyBox}>
            <Bus size={48} color="var(--primary)" />
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginTop: '15px' }}>No tenés viajes asignados</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '8px auto 0 auto' }}>
              Tu empresa te asignará las salidas programadas en las próximas horas.
            </p>
          </div>
        ) : (
          <div style={dashboardGrid}>
            {/* Lista de viajes del chofer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: 'var(--text-dark)', marginBottom: '5px' }}>
                Viajes Asignados ({trips.length})
              </h3>

              {trips.map((trip) => {
                const isSelected = selectedTrip?.id === trip.id;
                return (
                  <div
                    key={trip.id}
                    onClick={() => selectTrip(trip)}
                    style={{
                      ...tripCard,
                      border: isSelected ? '2px solid var(--primary)' : '1px solid #e2e8f0',
                      background: isSelected ? '#eff6ff' : 'white',
                      boxShadow: isSelected ? '0 10px 20px -5px rgba(37, 99, 235, 0.15)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem', fontWeight: '800', color: '#1e3a8a' }}>
                          <span>{trip.origenLocalidad}</span>
                          <ArrowRight size={16} />
                          <span>{trip.destinoLocalidad}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '15px', marginTop: '8px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Calendar size={14} /> {trip.fechaViaje}
                          </span>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Clock size={14} /> {trip.horarioSalida?.substring(0, 5)} hs
                          </span>
                        </div>
                      </div>
                      <ChevronRight size={20} color={isSelected ? 'var(--primary)' : '#94a3b8'} />
                    </div>

                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                      <span style={{ fontWeight: '700', color: '#475569' }}>
                        🚐 {trip.MedioTransporte?.nombre || 'Minibús'} ({trip.MedioTransporte?.patente || 'S/P'})
                      </span>
                      <span style={{ color: 'var(--primary)', fontWeight: '800' }}>
                        {trip.Reservas?.length || 0} reservas
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Manifiesto de Pasajeros del Viaje Seleccionado */}
            <div style={manifestCard}>
              {selectedTrip ? (
                <>
                  <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '20px', marginBottom: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--primary)', textTransform: 'uppercase' }}>
                        MANIFIESTO DE RUTA
                      </span>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '4px 10px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '800' }}>
                        {passengers.length} Pasajeros
                      </span>
                    </div>

                    <h2 style={{ fontSize: '1.5rem', fontWeight: '900', color: '#1e293b', marginTop: '5px' }}>
                      {selectedTrip.origenLocalidad} ➜ {selectedTrip.destinoLocalidad}
                    </h2>

                    <div style={{ display: 'flex', gap: '20px', marginTop: '10px', fontSize: '0.9rem', color: '#64748b' }}>
                      <span><b>Fecha:</b> {selectedTrip.fechaViaje}</span>
                      <span><b>Horario:</b> {selectedTrip.horarioSalida?.substring(0, 5)} hs</span>
                      <span><b>Unidad:</b> {selectedTrip.MedioTransporte?.patente}</span>
                    </div>
                  </div>

                  {loadingPassengers ? (
                    <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0' }}>Cargando lista de pasajeros...</p>
                  ) : passengers.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                      <Users size={36} color="#cbd5e1" style={{ margin: '0 auto 10px auto' }} />
                      <p style={{ fontWeight: '700' }}>No hay pasajeros confirmados para este viaje todavía.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {passengers.map((p, idx) => {
                        const isBoarded = boardedStatus[p.id];
                        return (
                          <div
                            key={p.id || idx}
                            style={{
                              ...passengerRow,
                              background: isBoarded ? '#f0fdf4' : '#f8fafc',
                              borderColor: isBoarded ? '#86efac' : '#e2e8f0',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                              <div style={{ ...seatBadge, background: isBoarded ? '#16a34a' : '#1e3a8a' }}>
                                #{idx + 1}
                              </div>
                              <div>
                                <h4 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>
                                  {p.nombre} {p.apellido}
                                </h4>
                                <p style={{ fontSize: '0.8rem', color: '#64748b', margin: '2px 0 0 0' }}>
                                  DNI: <b>{p.dni}</b>
                                </p>
                                <div style={{ display: 'flex', gap: '12px', marginTop: '4px', fontSize: '0.75rem', color: '#475569' }}>
                                  <span>📍 <b>Sube en:</b> {p.ubicacionOrigen || selectedTrip.origenLocalidad}</span>
                                  <span>🏁 <b>Baja en:</b> {p.ubicacionDestino || selectedTrip.destinoLocalidad}</span>
                                </div>
                              </div>
                            </div>

                            <button
                              onClick={() => toggleBoarding(p.id)}
                              style={{
                                ...checkBtn,
                                background: isBoarded ? '#16a34a' : 'white',
                                color: isBoarded ? 'white' : '#475569',
                                border: isBoarded ? 'none' : '1.5px solid #cbd5e1',
                              }}
                            >
                              <CheckCircle size={18} />
                              <span>{isBoarded ? 'Abordado' : 'Marcar Abordaje'}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Seleccioná un viaje para ver sus pasajeros</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Estilos
const pageContainer = { minHeight: '100vh', background: '#f8fafc' };
const topBanner = { background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)', padding: '40px 20px', color: 'white' };
const badgeChofer = { background: 'rgba(255,255,255,0.15)', display: 'inline-block', padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '800', letterSpacing: '0.5px' };
const actionBtn = { background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '10px 18px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', cursor: 'pointer' };

const dashboardGrid = { display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '25px', alignItems: 'flex-start' };
const tripCard = { padding: '20px', borderRadius: '20px', cursor: 'pointer', transition: 'all 0.2s ease' };
const manifestCard = { background: 'white', padding: '30px', borderRadius: '24px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' };
const emptyBox = { background: 'white', padding: '60px 20px', borderRadius: '24px', textAlign: 'center', border: '1.5px dashed #cbd5e1' };

const passengerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 18px', borderRadius: '16px', border: '1px solid #e2e8f0', transition: 'all 0.2s ease' };
const seatBadge = { width: '38px', height: '38px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '900', fontSize: '0.85rem' };
const checkBtn = { padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '700', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s ease' };

export default ChoferDashboardPage;
