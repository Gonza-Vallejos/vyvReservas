import { Link } from 'react-router-dom';
import { Bus, ShieldCheck, Clock, CreditCard, MapPin, ArrowRight } from 'lucide-react';
import AuthVehicle from './AuthVehicle';

const AuthLayout = ({ children, passwordVisible = false }) => {
  return (
    <div className="auth-layout">
      <aside className="auth-brand desktop-only">
        <div className="auth-brand__content">
          <div className="auth-brand__header">
            <div className="auth-brand__logo">
              <Bus size={32} aria-hidden="true" />
            </div>
            <h1 className="auth-brand__title">V&V Reservas</h1>
          </div>
          <p className="auth-brand__lead">
             Todo tu viaje, en un solo lugar.
          </p>

          <ul className="auth-brand__values">
            <li>
              <Clock size={20} aria-hidden="true" />
              <span>Reservá en segundos</span>
            </li>
            <li>
              <ShieldCheck size={20} aria-hidden="true" />
              <span>Datos protegidos</span>
            </li>
            <li>
              <CreditCard size={20} aria-hidden="true" />
              <span>Pagos seguros</span>
            </li>
          </ul>

          <AuthVehicle eyesClosed={passwordVisible} />

          <div className="auth-brand__scene" aria-hidden="true">
            <div className="auth-brand__scene-label">Una plataforma, todos tus recorridos</div>
            <div className="auth-brand__route">
              <span><MapPin size={16} /> Origen</span>
              <i />
              <ArrowRight size={18} />
              <i />
              <span><MapPin size={16} /> Destino</span>
            </div>
            <div className="auth-brand__scene-meta">Reservas · Flota · Operación</div>
          </div>
        </div>

        <div className="auth-brand__footer">
          <span className="vv-badge vv-badge--default">Pasajeros · Empresas · Choferes</span>
          <span className="auth-brand__copyright">© {new Date().getFullYear()} V&V Reservas</span>
        </div>
      </aside>

      <main className="auth-form-panel">
        <Link to="/" className="auth-mobile-logo mobile-only" aria-label="Volver al inicio">
          <Bus size={24} aria-hidden="true" />
          <span>V&V Reservas</span>
        </Link>
        {children}
      </main>
    </div>
  );
};

export default AuthLayout;
