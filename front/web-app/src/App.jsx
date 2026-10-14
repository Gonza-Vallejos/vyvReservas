import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Bus, LogOut, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster, toast } from 'react-hot-toast';
import SearchForm from './components/SearchForm';
import TripCard from './components/TripCard';
import DateSelectorBar from './components/DateSelectorBar';
import EmptyState from './components/ui/EmptyState';
import BookingPage from './pages/BookingPage';
import BookingConfirmationPage from './pages/BookingConfirmationPage';
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

  return (
    <nav className="glass-effect" style={navStyle}>
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 20px' }}>
        <Link to="/" style={logoStyle}><Bus size={32} /> <span className="brand">V&V</span></Link>

        <div className="desktop-only" style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <Link to="/" style={navLinkStyle}>Inicio</Link>
          {user ? (
            <>
              <Link to="/mis-reservas" style={navLinkStyle}>Mis Reservas</Link>
              {(Number(user?.perfil_id) === PROFILES.ADMINISTRADOR || Number(user?.perfil_id) === PROFILES.EMPRESA || Number(user?.perfil_id) === PROFILES.MOSTRADOR) && (
                <Link to="/dashboard" style={panelBadge}><ShieldCheck size={18} /> Panel</Link>
              )}
              {Number(user?.perfil_id) === PROFILES.CHOFER && (
                <Link to="/chofer" style={{ ...panelBadge, background: '#2563eb' }}><Bus size={18} /> Panel Chofer</Link>
              )}

              <Link to="/perfil" style={userInfoStyle} aria-label="Mi perfil">
                <div style={avatarStyle}>{user?.nombre?.charAt(0).toUpperCase()}</div>
                <span style={{ fontWeight: '700' }}>{user?.nombre}</span>
              </Link>

              <button onClick={handleLogout} style={logoutButtonStyle} aria-label="Cerrar sesión"><LogOut size={20} /></button>
            </>
          ) : (
            <Link to="/login" style={primaryBtn}>Ingresar <ArrowRight size={18} /></Link>
          )}
        </div>

        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="mobile-only" style={{ background: 'none' }}>
          {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="animate-fade-in" style={mobileMenu}>
          <Link to="/" onClick={() => setIsMenuOpen(false)} style={mobileNavLink}>Inicio</Link>
          {user ? (
            <>
              {(Number(user?.perfil_id) === PROFILES.ADMINISTRADOR || Number(user?.perfil_id) === PROFILES.EMPRESA || Number(user?.perfil_id) === PROFILES.MOSTRADOR) && (
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} style={{ ...mobileNavLink, color: 'var(--primary)', fontWeight: '800' }}>Panel Empresa</Link>
              )}
              {Number(user.perfil_id) === PROFILES.CHOFER && (
                <Link to="/chofer" onClick={() => setIsMenuOpen(false)} style={{ ...mobileNavLink, color: 'var(--primary)', fontWeight: '800' }}>Panel Chofer</Link>
              )}
              <Link to="/perfil" onClick={() => setIsMenuOpen(false)} style={mobileNavLink}>Mi Perfil</Link>
              {Number(user.perfil_id) !== PROFILES.CHOFER && (
                <Link to="/mis-reservas" onClick={() => setIsMenuOpen(false)} style={mobileNavLink}>Mis Reservas</Link>
              )}
              <button onClick={handleLogout} style={{ ...mobileNavLink, color: 'var(--error)', border: 'none', background: 'none', textAlign: 'left' }}>Cerrar Sesión ({user?.nombre})</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setIsMenuOpen(false)} style={mobileNavLink}>Ingresar</Link>
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

// Estilos de layout
const navStyle = { position: 'sticky', top: 0, zIndex: 1000, padding: '15px 0', width: '100%' };
const logoStyle = { display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--primary)', fontWeight: '800', fontSize: '1.6rem' };
const navLinkStyle = { textDecoration: 'none', color: 'var(--text-dark)', fontWeight: '700', fontSize: '0.95rem' };
const primaryBtn = { background: 'var(--primary)', color: 'white', padding: '12px 25px', borderRadius: '14px', textDecoration: 'none', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' };
const panelBadge = { textDecoration: 'none', background: '#1e293b', color: 'white', padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.9rem' };

const userInfoStyle = { display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '6px 16px 6px 6px', borderRadius: '50px', border: '1px solid #e2e8f0', textDecoration: 'none', color: 'inherit' };
const avatarStyle = { width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' };
const logoutButtonStyle = { background: '#fee2e2', border: 'none', color: '#ef4444', padding: '10px', borderRadius: '12px' };

const mobileMenu = { position: 'fixed', top: '70px', left: 0, right: 0, bottom: 0, background: 'white', zIndex: 99999, padding: '30px 24px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto' };
const mobileNavLink = { textDecoration: 'none', color: 'var(--text-dark)', fontWeight: '800', fontSize: '1.4rem', borderBottom: '1.5px solid #f1f5f9', paddingBottom: '12px' };

export default App;
