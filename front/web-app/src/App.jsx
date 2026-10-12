import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from 'react-router-dom';
import { Bus, User, LogOut, Menu, X, ArrowRight, ShieldCheck } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster, toast } from 'react-hot-toast';
import SearchForm from './components/SearchForm';
import TripCard from './components/TripCard';
import DateSelectorBar from './components/DateSelectorBar';
import BookingPage from './pages/BookingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MyReservationsPage from './pages/MyReservationsPage';
import MinibusLoader from './components/MinibusLoader';
import { viajeService } from './services/api';
import './index.css';

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Si el usuario es Dueño (5), Administrador (1) o Mostrador (3), debe ir directo a su Panel
  useEffect(() => {
    if (user && (user.perfil_id === 5 || user.perfil_id === 1 || user.perfil_id === 3)) {
      navigate('/dashboard', { replace: true });
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
    } catch (error) {
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
      <section style={heroSection}>
        <div className="container">
          <div style={heroBadge}>🚍 Viaja seguro, viaja feliz</div>
          <h1 style={heroTitle}>Reserva tu Minubus <br/><span style={{color: 'var(--accent)'}}>en un clic.</span></h1>
          <p style={heroSubtitle}>Conectamos ciudades con el mejor servicio de transporte de la región.</p>
          <div style={searchContainer}>
            <SearchForm onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {searched && (
        <section className="container animate-fade-in" style={{ padding: '60px 20px' }}>
          {/* Barra de Fechas (Estilo Plataforma 10) */}
          <DateSelectorBar 
            selectedDate={searchParams.fecha} 
            onSelectDate={handleDateChange} 
          />

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '30px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <h2 style={{ fontSize: '1.8rem', fontWeight: '800' }}>
                {loading ? 'Consultando salidas...' : `${trips.length} ${trips.length === 1 ? 'servicio encontrado' : 'servicios encontrados'}`}
              </h2>
              {!loading && trips.length > 0 && <div style={statusDot} />}
            </div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: '600' }}>
              {searchParams.origen} ➔ {searchParams.destino}
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: '700' }}>Buscando salidas disponibles...</div>
            </div>
          ) : trips.length === 0 ? (
            <div style={emptyStateBox} className="animate-fade-in">
              <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>🚐</div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e3a8a', marginBottom: '10px' }}>
                No disponemos de servicios para la fecha indicada
              </h3>
              <p style={{ color: 'var(--text-muted)', maxWidth: '500px', margin: '0 auto 20px auto', fontSize: '0.95rem' }}>
                Para más alternativas, te sugerimos buscar en las fechas anteriores o posteriores desde la barra superior.
              </p>
            </div>
          ) : (
            <div style={resultsGrid}>
              {trips.map(trip => (
                <TripCard 
                  key={trip.id} 
                  trip={trip} 
                  onSelect={(t) => {
                    if (!user) {
                      toast.error('Inicia sesión para reservar');
                      navigate('/login');
                    } else if (user.perfil_id === 5) {
                      toast.info('Las empresas no realizan reservas.');
                    } else {
                      navigate('/booking', { state: { trip: t } });
                    }
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
              {(user?.perfil_id === 1 || user?.perfil_id === 5 || user?.perfil_id === 3) && (
                <Link to="/dashboard" style={panelBadge}><ShieldCheck size={18} /> Panel</Link>
              )}
              
              <div style={userInfoStyle}>
                <div style={avatarStyle}>{user?.nombre?.charAt(0).toUpperCase()}</div>
                <span style={{ fontWeight: '700' }}>{user?.nombre}</span>
              </div>

              <button onClick={handleLogout} style={logoutButtonStyle}><LogOut size={20} /></button>
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
              <Link to="/mis-reservas" onClick={() => setIsMenuOpen(false)} style={mobileNavLink}>Mis Reservas</Link>
              <button onClick={handleLogout} style={{ ...mobileNavLink, color: 'var(--error)', border: 'none', background: 'none', textAlign: 'left' }}>Cerrar Sesión</button>
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
              <Route path="/booking" element={<BookingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/mis-reservas" element={<MyReservationsPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

// Estilos Modernos
const navStyle = { position: 'sticky', top: 0, zIndex: 1000, padding: '15px 0', width: '100%' };
const logoStyle = { display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--primary)', fontWeight: '800', fontSize: '1.6rem' };
const navLinkStyle = { textDecoration: 'none', color: 'var(--text-dark)', fontWeight: '700', fontSize: '0.95rem' };
const primaryBtn = { background: 'var(--primary)', color: 'white', padding: '12px 25px', borderRadius: '14px', textDecoration: 'none', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' };
const panelBadge = { textDecoration: 'none', background: '#1e293b', color: 'white', padding: '8px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700', fontSize: '0.9rem' };

const heroSection = { background: 'radial-gradient(circle at top right, #2563eb, #1e3a8a)', padding: '140px 20px', color: 'white', textAlign: 'center', borderBottomLeftRadius: '60px', borderBottomRightRadius: '60px' };
const heroBadge = { background: 'rgba(255,255,255,0.1)', display: 'inline-block', padding: '8px 20px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: '800', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.2)' };
const heroTitle = { fontSize: '4.2rem', fontWeight: '800', lineHeight: 1.1, marginBottom: '25px', letterSpacing: '-2px' };
const heroSubtitle = { fontSize: '1.3rem', opacity: '0.8', maxWidth: '600px', margin: '0 auto 50px auto' };
const searchContainer = { maxWidth: '1150px', width: '100%', margin: '0 auto', background: 'white', padding: '12px', borderRadius: '32px', boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.35)' };

const resultsGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' };
const statusDot = { width: '12px', height: '12px', background: 'var(--success)', borderRadius: '50%', boxShadow: '0 0 0 4px rgba(16, 185, 129, 0.2)' };

const userInfoStyle = { display: 'flex', alignItems: 'center', gap: '12px', background: 'white', padding: '6px 16px 6px 6px', borderRadius: '50px', border: '1px solid #e2e8f0' };
const avatarStyle = { width: '36px', height: '36px', borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' };
const logoutButtonStyle = { background: '#fee2e2', border: 'none', color: '#ef4444', padding: '10px', borderRadius: '12px' };

const mobileMenu = { position: 'fixed', top: '75px', left: 0, right: 0, bottom: 0, background: 'white', zIndex: 999, padding: '40px', display: 'flex', flexDirection: 'column', gap: '25px' };
const mobileNavLink = { textDecoration: 'none', color: 'var(--text-dark)', fontWeight: '800', fontSize: '1.8rem', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px' };

const emptyStateBox = {
  textAlign: 'center',
  padding: '60px 20px',
  background: '#f8fafc',
  borderRadius: '24px',
  border: '1.5px dashed #cbd5e1',
  maxWidth: '650px',
  margin: '0 auto',
};

export default App;
