import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Bus, LogOut, Menu, X, ArrowRight, ShieldCheck, UserRound, Ticket, Home as HomeIcon, Building2 } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster, toast } from 'react-hot-toast';
import SearchForm from './components/SearchForm';
import TripCard from './components/TripCard';
import DateSelectorBar from './components/DateSelectorBar';
import EmptyState from './components/ui/EmptyState';
import BookingPage from './pages/BookingPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import PagoExitosoPage from './pages/PagoExitosoPage';
import PagoFallidoPage from './pages/PagoFallidoPage';
import TripDetailPage from './pages/TripDetailPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ChoferDashboardPage from './pages/ChoferDashboardPage';
import MyReservationsPage from './pages/MyReservationsPage';
import ProfilePage from './pages/ProfilePage';
import MinibusLoader from './components/MinibusLoader';
import { viajeService } from './services/api';
import { PROFILES } from './constants/profiles';
import './index.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Si el usuario es Dueño (5), Administrador (1) o Mostrador (3), debe ir directo a su Panel
  useEffect(() => {
    if (user) {
      const perfilId = Number(user.perfil_id);
      // La empresa puede administrar y también navegar el flujo público de
      // reservas; no debe quedar atrapada en el dashboard.
      if (perfilId === PROFILES.ADMINISTRADOR || perfilId === PROFILES.EMPRESA || perfilId === PROFILES.MOSTRADOR) {
        navigate('/dashboard', { replace: true });
      } else if (perfilId === PROFILES.CHOFER) {
        navigate('/chofer', { replace: true });
      }
    }
  }, [user, navigate]);

  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [searchParams, setSearchParams] = useState({
    origen: '',
    destino: '',
    fecha: new Date().toISOString().split('T')[0]
  });

  const ejecutarBusqueda = async (origen, destino, fecha) => {
    setLoading(true);
    setSearched(true);
    try {
      const response = await viajeService.listarDisponibles(origen, destino, fecha);
      const result = response.data;
      const tripsArray = result.data || result;

      if (Array.isArray(tripsArray)) {
        setTrips(tripsArray);
      } else {
        setTrips([]);
      }
    } catch {
      toast.error('Error al conectar con el servidor');
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (criteria) => {
    const fechaSeleccionada = criteria.fecha || new Date().toISOString().split('T')[0];
    const nuevosParams = {
      origen: criteria.origen,
      destino: criteria.destino,
      fecha: fechaSeleccionada
    };
    setSearchParams(nuevosParams);
    ejecutarBusqueda(nuevosParams.origen, nuevosParams.destino, nuevosParams.fecha);
  };

  const handleDateChange = (nuevaFecha) => {
    setSearchParams(prev => ({ ...prev, fecha: nuevaFecha }));
    ejecutarBusqueda(searchParams.origen, searchParams.destino, nuevaFecha);
  };

  return (
    <div className="animate-fade-in">
      <section className="home-hero">
        <div className="container">
          <div className="home-hero__badge">🚍 Viajá seguro, viajá feliz</div>
          <h1 className="home-hero__title">
            Reservá tu próximo viaje <br />
            <span className="home-hero__title-accent">en un clic.</span>
          </h1>
          <p className="home-hero__subtitle">
            Encontrá pasajes de minibus entre localidades de la región de forma rápida, segura y sin complicaciones.
          </p>
          <div className="home-search-wrapper">
            <SearchForm onSearch={handleSearch} isLoading={loading} />
          </div>
        </div>
      </section>

      {searched && (
        <section className="container home-results animate-fade-in">
          <DateSelectorBar
            selectedDate={searchParams.fecha}
            onSelectDate={handleDateChange}
          />

          <div className="home-results__header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 className="home-results__title">
                {loading ? 'Consultando salidas...' : `${trips.length} ${trips.length === 1 ? 'servicio encontrado' : 'servicios encontrados'}`}
              </h2>
              {!loading && trips.length > 0 && <span className="status-dot" aria-hidden="true" />}
            </div>
            <span className="home-results__route">
              {searchParams.origen} ➔ {searchParams.destino}
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>Buscando salidas disponibles...</div>
            </div>
          ) : trips.length === 0 ? (
            <EmptyState
              title="No encontramos servicios para esa fecha"
              description="Te sugerimos buscar en fechas anteriores o posteriores usando la barra de días. También podés cambiar el origen o destino."
              action={{
                label: 'Volver a buscar',
                onClick: () => window.scrollTo({ top: 0, behavior: 'smooth' }),
              }}
            />
          ) : (
            <div className="home-results__grid">
              {trips.map(trip => (
                <TripCard
                  key={trip.id}
                  trip={trip}
                  onSelect={(t) => {
                    navigate(`/viaje/${t.id}`);
                  }}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
};

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/');
    setIsMenuOpen(false);
  };

  const canViewMyReservations = user && [PROFILES.CLIENTE, PROFILES.MOSTRADOR].includes(Number(user.perfil_id));

  return (
    <nav className={`site-navbar ${isMenuOpen ? 'site-navbar--menu-open' : ''}`} aria-label="Navegación principal">
      <div className="site-navbar__inner">
        <Link to="/" className="site-navbar__logo" aria-label="V&V Reservas, ir al inicio">
          <span className="site-navbar__logo-mark"><Bus size={22} /></span>
          <span>V&V</span>
        </Link>

        <div className="site-navbar__desktop desktop-only">
          <Link to="/" className="site-navbar__link">Inicio</Link>
          {user ? (
            <>
              {canViewMyReservations && <Link to="/mis-reservas" className="site-navbar__link">Mis Reservas</Link>}
              {(Number(user?.perfil_id) === PROFILES.ADMINISTRADOR || Number(user?.perfil_id) === PROFILES.EMPRESA || Number(user?.perfil_id) === PROFILES.MOSTRADOR) && (
                <Link to="/dashboard" className="site-navbar__panel"><ShieldCheck size={17} /> Panel</Link>
              )}
              {Number(user?.perfil_id) === PROFILES.CHOFER && (
                <Link to="/chofer" className="site-navbar__panel site-navbar__panel--driver"><Bus size={17} /> Panel Chofer</Link>
              )}

              <Link to="/perfil" className="site-navbar__user" aria-label="Mi perfil">
                <span className="site-navbar__avatar">{user?.nombre?.charAt(0).toUpperCase()}</span>
                <span>{user?.nombre}</span>
              </Link>

              <button onClick={handleLogout} className="site-navbar__logout" aria-label="Cerrar sesión"><LogOut size={18} /></button>
            </>
          ) : (
            <Link to="/login" className="site-navbar__login">Ingresar <ArrowRight size={17} /></Link>
          )}
        </div>

        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="site-navbar__menu mobile-only" aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={isMenuOpen}>
          {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="site-navbar__mobile animate-fade-in">
          <div className="site-navbar__mobile-header">
            <div>
              <span className="site-navbar__mobile-kicker">Navegación</span>
              <strong>Menú principal</strong>
            </div>
            <button
              type="button"
              className="site-navbar__mobile-close"
              onClick={() => setIsMenuOpen(false)}
              aria-label="Cerrar menú"
            >
              <X size={22} />
            </button>
          </div>

          {user ? (
            <>
              <div className="site-navbar__mobile-user">
                <span className="site-navbar__avatar">{user?.nombre?.charAt(0).toUpperCase()}</span>
                <div>
                  <strong>{user?.nombre} {user?.apellido}</strong>
                  <span>{Number(user.perfil_id) === PROFILES.EMPRESA ? 'Empresa' : Number(user.perfil_id) === PROFILES.CHOFER ? 'Chofer' : Number(user.perfil_id) === PROFILES.ADMINISTRADOR ? 'Super administrador' : 'Cuenta personal'}</span>
                </div>
              </div>

              <nav className="site-navbar__mobile-links" aria-label="Opciones de usuario">
                <Link to="/" onClick={() => setIsMenuOpen(false)} className="site-navbar__mobile-link">
                  <HomeIcon size={19} /> <span>Inicio</span>
                </Link>
              {(Number(user?.perfil_id) === PROFILES.ADMINISTRADOR || Number(user?.perfil_id) === PROFILES.EMPRESA || Number(user?.perfil_id) === PROFILES.MOSTRADOR) && (
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="site-navbar__mobile-link site-navbar__mobile-link--accent">
                  <Building2 size={19} /> <span>Panel de gestión</span>
                </Link>
              )}
              {Number(user.perfil_id) === PROFILES.CHOFER && (
                <Link to="/chofer" onClick={() => setIsMenuOpen(false)} className="site-navbar__mobile-link site-navbar__mobile-link--accent">
                  <Bus size={19} /> <span>Panel de chofer</span>
                </Link>
              )}
              <Link to="/perfil" onClick={() => setIsMenuOpen(false)} className="site-navbar__mobile-link">
                <UserRound size={19} /> <span>Mi perfil</span>
              </Link>
              {canViewMyReservations && (
                <Link to="/mis-reservas" onClick={() => setIsMenuOpen(false)} className="site-navbar__mobile-link">
                  <Ticket size={19} /> <span>Mis reservas</span>
                </Link>
              )}
              </nav>
              <button onClick={handleLogout} className="site-navbar__mobile-logout">
                <LogOut size={19} /> Cerrar sesión
              </button>
            </>
          ) : (
            <nav className="site-navbar__mobile-links" aria-label="Opciones de navegación">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="site-navbar__mobile-link">
                <HomeIcon size={19} /> <span>Inicio</span>
              </Link>
              <Link to="/login" onClick={() => setIsMenuOpen(false)} className="site-navbar__mobile-link site-navbar__mobile-link--accent">
                <ArrowRight size={19} /> <span>Ingresar a mi cuenta</span>
              </Link>
            </nav>
          )}
        </div>
      )}
    </nav>
  );
};

function App() {
  const [initialLoading, setInitialLoading] = useState(true);

  return (
    <AuthProvider>
      {initialLoading && <MinibusLoader onFinish={() => setInitialLoading(false)} />}
      <Router>
        <Toaster position="top-center" limit={1} />
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <main style={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/viaje/:id" element={<TripDetailPage />} />
              <Route path="/reservar/:id" element={<BookingPage />} />
              <Route path="/confirmacion/:reservaId" element={<BookingConfirmationPage />} />
              <Route path="/pagos/exitoso" element={<PagoExitosoPage />} />
              <Route path="/pagos/fallido" element={<PagoFallidoPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/chofer" element={<ChoferDashboardPage />} />
              <Route path="/mis-reservas" element={<MyReservationsPage />} />
              <Route path="/perfil" element={<ProfilePage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
