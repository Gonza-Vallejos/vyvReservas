import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Bus, Users, Calendar, Clock, MapPin, CheckCircle,
  RefreshCw, LogOut, ArrowRight, Search
} from 'lucide-react';
import { viajeService, reservaService } from '../services/api';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import InputField from '../components/ui/InputField';
import toast from 'react-hot-toast';

const getProfileId = (u) => {
  const val = u?.Usuario?.perfil_id ?? u?.Usuario?.perfilId ?? u?.perfil_id ?? u?.perfilId;
  return val != null ? Number(val) : null;
};

const getFullName = (u) => {
  const nombre = u?.Usuario?.nombre || u?.nombre || '';
  const apellido = u?.Usuario?.apellido || u?.apellido || '';
  return `${nombre} ${apellido}`.trim() || 'Sin nombre';
};

const getRoleLabel = (perfilId) => {
  if (perfilId === 4) return 'Chofer';
  if (perfilId === 3) return 'Mostrador';
  if (perfilId === 5) return 'Dueño';
  if (perfilId === 1) return 'Administrador';
  return 'Usuario';
};

const getRoleBadgeVariant = (perfilId) => {
  if (perfilId === 4) return 'primary';
  if (perfilId === 3) return 'accent';
  if (perfilId === 5 || perfilId === 1) return 'success';
  return 'default';
};

const formatTime = (time) => (time ? String(time).substring(0, 5) : '--:--');

const ChoferDashboardPage = () => {
  const { user, logout, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [loadingPassengers, setLoadingPassengers] = useState(false);
  const [boardedStatus, setBoardedStatus] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDriverTrips = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await viajeService.obtenerPorChofer(user.id);
      const tripList = res.data?.data || res.data || [];
      setTrips(Array.isArray(tripList) ? tripList : []);
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
    setSearchQuery('');
    try {
      setLoadingPassengers(true);
      const res = await reservaService.obtenerPasajerosPorViaje(trip.id);
      const passList = res.data?.data || res.data || [];
      setPassengers(Array.isArray(passList) ? passList : []);
    } catch (error) {
      console.error('Error al cargar pasajeros:', error);
      toast.error('No se pudieron obtener los pasajeros del viaje');
      setPassengers([]);
    } finally {
      setLoadingPassengers(false);
    }
  };

  const toggleBoarding = (pasajeroId) => {
    setBoardedStatus((prev) => {
      const next = { ...prev, [pasajeroId]: !prev[pasajeroId] };
      toast.success(next[pasajeroId] ? 'Pasajero abordado' : 'Abordaje desmarcado');
      return next;
    });
  };

  const boardedCount = useMemo(
    () => passengers.filter((p) => boardedStatus[p.id]).length,
    [passengers, boardedStatus]
  );

  const filteredPassengers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return passengers;
    return passengers.filter((p) => {
      const fullName = `${p.nombre || ''} ${p.apellido || ''} ${p.dni || ''}`.toLowerCase();
      return fullName.includes(query);
    });
  }, [passengers, searchQuery]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    const perfilId = getProfileId(user);
    if (perfilId !== 4 && perfilId !== 1 && perfilId !== 5) {
      navigate('/');
      return;
    }
    // Carga inicial de viajes asignados (fetching asíncrono estándar).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchDriverTrips();
    // selectedTrip is intentionally omitido para no reiniciar la selección en re-renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, navigate]);

  if (!user) return null;

  const perfilId = getProfileId(user);
  const progressPercent = passengers.length > 0 ? Math.round((boardedCount / passengers.length) * 100) : 0;

  return (
    <main className="chofer-dashboard animate-fade-in">
      <header className="chofer-dashboard__hero">
        <div className="container chofer-dashboard__hero-inner">
          <div>
            <Badge variant="primary" className="chofer-dashboard__badge">
              <Bus size={14} aria-hidden="true" />
              Panel de chofer
            </Badge>
            <h1 className="chofer-dashboard__title">
              Hola, {getFullName(user)}
            </h1>
            <p className="chofer-dashboard__subtitle">
              Gestioná tus salidas del día y controlá el abordaje de pasajeros.
            </p>
          </div>
          <div className="chofer-dashboard__actions">
            <Badge variant={getRoleBadgeVariant(perfilId)}>
              {getRoleLabel(perfilId)}
            </Badge>
            <Button
              variant="secondary"
              size="md"
              className="chofer-dashboard__btn--outline"
              onClick={fetchDriverTrips}
              ariaLabel="Actualizar lista de viajes"
            >
              <RefreshCw size={18} aria-hidden="true" />
              Actualizar
            </Button>
            <Button
              variant="secondary"
              size="md"
              className="chofer-dashboard__btn--outline"
              onClick={handleLogout}
              ariaLabel="Cerrar sesión"
            >
              <LogOut size={18} aria-hidden="true" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <section className="container chofer-dashboard__container">
        {loading ? (
          <div className="chofer-dashboard__loader" role="status" aria-live="polite">
            <RefreshCw size={40} className="chofer-dashboard__loader-icon" aria-hidden="true" />
            <p>Cargando viajes asignados...</p>
          </div>
        ) : trips.length === 0 ? (
          <EmptyState
            icon={Bus}
            title="No tenés viajes asignados"
            description="Tu empresa te asignará las salidas programadas en las próximas horas."
          />
        ) : (
          <div className="chofer-dashboard__layout">
            {/* Lista de viajes */}
            <section className="chofer-dashboard__column" aria-labelledby="chofer-trips-title">
              <div className="chofer-dashboard__section-header">
                <h2 id="chofer-trips-title" className="chofer-dashboard__section-title">
                  Viajes asignados
                </h2>
                <span className="chofer-dashboard__count">{trips.length} encontrados</span>
              </div>

              <div className="chofer-dashboard__trips" role="list">
                {trips.map((trip) => {
                  const isSelected = selectedTrip?.id === trip.id;
                  const passengerCount = trip.Reservas?.length || 0;
                  return (
                    <Card
                      key={trip.id}
                      as="button"
                      className={`chofer-dashboard__trip-card ${
                        isSelected ? 'chofer-dashboard__trip-card--selected' : ''
                      }`}
                      onClick={() => selectTrip(trip)}
                      aria-label={`Seleccionar viaje de ${trip.origenLocalidad} a ${trip.destinoLocalidad} el ${trip.fechaViaje} a las ${formatTime(trip.horarioSalida)}`}
                      aria-current={isSelected ? 'true' : undefined}
                      role="listitem"
                    >
                      <div className="chofer-dashboard__trip-route">
                        <span>{trip.origenLocalidad}</span>
                        <ArrowRight size={18} className="chofer-dashboard__route-arrow" aria-hidden="true" />
                        <span>{trip.destinoLocalidad}</span>
                      </div>

                      <div className="chofer-dashboard__trip-details">
                        <span className="chofer-dashboard__trip-detail">
                          <Calendar size={14} aria-hidden="true" />
                          {trip.fechaViaje}
                        </span>
                        <span className="chofer-dashboard__trip-detail">
                          <Clock size={14} aria-hidden="true" />
                          {formatTime(trip.horarioSalida)} hs
                        </span>
                      </div>

                      <div className="chofer-dashboard__trip-footer">
                        <span className="chofer-dashboard__trip-vehicle">
                          <Bus size={14} aria-hidden="true" />
                          {trip.MedioTransporte?.nombre || 'Unidad'} ({trip.MedioTransporte?.patente || 'S/P'})
                        </span>
                        <Badge variant={passengerCount > 0 ? 'success' : 'default'}>
                          <Users size={12} aria-hidden="true" />
                          {passengerCount} {passengerCount === 1 ? 'pasajero' : 'pasajeros'}
                        </Badge>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </section>

            {/* Manifiesto de pasajeros */}
            <Card className="chofer-dashboard__manifest" aria-labelledby="chofer-manifest-title">
              {selectedTrip ? (
                <>
                  <div className="chofer-dashboard__manifest-header">
                    <div className="chofer-dashboard__manifest-title-group">
                      <span id="chofer-manifest-title" className="chofer-dashboard__manifest-label">
                        Manifiesto de ruta
                      </span>
                      <h2 className="chofer-dashboard__manifest-route">
                        {selectedTrip.origenLocalidad}
                        <ArrowRight size={22} className="chofer-dashboard__route-arrow" aria-hidden="true" />
                        {selectedTrip.destinoLocalidad}
                      </h2>
                      <div className="chofer-dashboard__manifest-meta">
                        <span>
                          <Calendar size={14} aria-hidden="true" />
                          {selectedTrip.fechaViaje}
                        </span>
                        <span>
                          <Clock size={14} aria-hidden="true" />
                          {formatTime(selectedTrip.horarioSalida)} hs
                        </span>
                        <span>
                          <Bus size={14} aria-hidden="true" />
                          {selectedTrip.MedioTransporte?.patente || 'S/P'}
                        </span>
                      </div>
                    </div>
                    <Badge variant="primary">
                      {passengers.length} {passengers.length === 1 ? 'pasajero' : 'pasajeros'}
                    </Badge>
                  </div>

                  {passengers.length > 0 && (
                    <div className="chofer-dashboard__progress">
                      <span>Abordaje</span>
                      <div
                        className="chofer-dashboard__progress-bar"
                        role="progressbar"
                        aria-valuenow={boardedCount}
                        aria-valuemin={0}
                        aria-valuemax={passengers.length}
                        aria-label={`${boardedCount} de ${passengers.length} pasajeros abordados`}
                      >
                        <div
                          className="chofer-dashboard__progress-fill"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                      <span aria-hidden="true">
                        {boardedCount}/{passengers.length}
                      </span>
                    </div>
                  )}

                  {passengers.length > 0 && (
                    <InputField
                      id="passenger-search"
                      placeholder="Buscar pasajero por nombre o DNI"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      icon={Search}
                      ariaLabel="Buscar pasajero por nombre o DNI"
                    />
                  )}

                  {loadingPassengers ? (
                    <div className="chofer-dashboard__loader" role="status" aria-live="polite">
                      <RefreshCw size={32} className="chofer-dashboard__loader-icon" aria-hidden="true" />
                      <p>Cargando lista de pasajeros...</p>
                    </div>
                  ) : passengers.length === 0 ? (
                    <div className="chofer-dashboard__empty-manifest">
                      <div className="chofer-dashboard__empty-manifest-icon" aria-hidden="true">
                        <Users size={32} />
                      </div>
                      <p className="chofer-dashboard__empty-manifest-title">No hay pasajeros confirmados</p>
                      <p>Todavía no hay reservas para este viaje.</p>
                    </div>
                  ) : filteredPassengers.length === 0 ? (
                    <EmptyState
                      icon={Search}
                      title="No se encontraron pasajeros"
                      description="Probá con otro nombre o DNI."
                    />
                  ) : (
                    <ul className="chofer-dashboard__passengers" aria-label={`Pasajeros del viaje a ${selectedTrip.destinoLocalidad}`}>
                      {filteredPassengers.map((p, idx) => {
                        const isBoarded = boardedStatus[p.id];
                        const originalIndex = passengers.findIndex((orig) => orig.id === p.id);
                        const displayIndex = originalIndex >= 0 ? originalIndex : idx;
                        return (
                          <li
                            key={p.id || idx}
                            className={`chofer-dashboard__passenger ${
                              isBoarded ? 'chofer-dashboard__passenger--boarded' : ''
                            }`}
                          >
                            <div className="chofer-dashboard__passenger-info">
                              <span className="chofer-dashboard__passenger-number" aria-hidden="true">
                                #{displayIndex + 1}
                              </span>
                              <div className="chofer-dashboard__passenger-text">
                                <span className="chofer-dashboard__passenger-name">
                                  {p.nombre} {p.apellido}
                                </span>
                                <span className="chofer-dashboard__passenger-meta">
                                  DNI: {p.dni || 'S/D'}
                                </span>
                                <span className="chofer-dashboard__passenger-stops">
                                  <span>
                                    <MapPin size={12} className="chofer-dashboard__pin--origin" aria-hidden="true" />
                                    <b>Sube:</b> {p.ubicacionOrigen || selectedTrip.origenLocalidad}
                                  </span>
                                  <span>
                                    <MapPin size={12} className="chofer-dashboard__pin--destination" aria-hidden="true" />
                                    <b>Baja:</b> {p.ubicacionDestino || selectedTrip.destinoLocalidad}
                                  </span>
                                </span>
                              </div>
                            </div>

                            <Button
                              variant={isBoarded ? 'success' : 'secondary'}
                              size="sm"
                              className="chofer-dashboard__passenger-board-btn"
                              onClick={() => toggleBoarding(p.id)}
                              ariaLabel={
                                isBoarded
                                  ? `Desmarcar abordaje de ${p.nombre} ${p.apellido}`
                                  : `Marcar abordaje de ${p.nombre} ${p.apellido}`
                              }
                            >
                              <CheckCircle size={16} aria-hidden="true" />
                              {isBoarded ? 'Abordado' : 'Marcar abordaje'}
                            </Button>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </>
              ) : (
                <div className="chofer-dashboard__empty-manifest">
                  <div className="chofer-dashboard__empty-manifest-icon" aria-hidden="true">
                    <Bus size={32} />
                  </div>
                  <p className="chofer-dashboard__empty-manifest-title">Seleccioná un viaje</p>
                  <p>Elegí una salida para ver su lista de pasajeros.</p>
                </div>
              )}
            </Card>
          </div>
        )}
      </section>
    </main>
  );
};

export default ChoferDashboardPage;
