import { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import {
  User as UserIcon,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Building2,
  BusFront,
  Ticket,
} from 'lucide-react';
import toast from 'react-hot-toast';

import AuthLayout from '../components/auth/AuthLayout';
import Card from '../components/ui/Card';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';
import { PROFILES } from '../constants/profiles';

const LoginPage = () => {
  const [form, setForm] = useState({ usuario: '', contrasenia: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const next = {};
    if (!form.usuario.trim()) {
      next.usuario = 'Ingresá tu usuario';
    }
    if (!form.contrasenia) {
      next.contrasenia = 'Ingresá tu contraseña';
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const response = await authService.login(form.usuario, form.contrasenia);
      const { success, data } = response.data;
      if (success && data) {
        login(data.usuario, data.token);
        toast.success('¡Bienvenido!');
        const perfilId = Number(data.usuario?.perfil_id);
        // Redirect to where user was before login if it exists
        if (from) {
          navigate(from, { replace: true });
        } else if ([PROFILES.ADMINISTRADOR, PROFILES.EMPRESA, PROFILES.MOSTRADOR].includes(perfilId)) {
          navigate('/dashboard');
        } else if (perfilId === PROFILES.CHOFER) {
          navigate('/chofer');
        } else {
          navigate('/');
        }
      } else {
        toast.error(response.data.message || 'No pudimos iniciar sesión');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Usuario o contraseña incorrectos');
    } finally {
      setLoading(false);
    }
  };

  const passwordToggle = (
    <button
      type="button"
      className="auth-password-toggle"
      onClick={() => setShowPassword((prev) => !prev)}
      aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
      aria-pressed={showPassword}
    >
      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
    </button>
  );

  return (
    <AuthLayout>
      <Card className="auth-card animate-fade-in">
        <header className="auth-header">
          <div className="auth-logo">
            <Lock size={24} aria-hidden="true" />
          </div>
            <h2 className="auth-title">Ingresá a tu espacio V&V</h2>
            <p className="auth-subtitle">Reservá tu viaje o gestioná la operación de tu empresa.</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <InputField
            id="usuario"
            name="usuario"
            label="Usuario"
            type="text"
            value={form.usuario}
            onChange={handleChange}
            placeholder="Ej: gonzalo123"
            icon={UserIcon}
            error={errors.usuario}
            required
            autoComplete="username"
          />

          <InputField
            id="contrasenia"
            name="contrasenia"
            label="Contraseña"
            type={showPassword ? 'text' : 'password'}
            value={form.contrasenia}
            onChange={handleChange}
            placeholder="••••••••"
            icon={Lock}
            rightElement={passwordToggle}
            error={errors.contrasenia}
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="auth-submit"
          >
            {loading ? (
              'Ingresando...'
            ) : (
              <>
                Ingresar a mi cuenta
                <ArrowRight size={20} aria-hidden="true" />
              </>
            )}
          </Button>
          </form>

          <div className="auth-role-guide" aria-label="Acciones según tu perfil">
            <div className="auth-role-guide__title">Cada perfil tiene su espacio</div>
            <div className="auth-role-guide__items">
              <div className="auth-role-guide__item">
                <Ticket size={16} aria-hidden="true" />
                <span><strong>Pasajero</strong> · reserva y paga</span>
              </div>
              <div className="auth-role-guide__item">
                <Building2 size={16} aria-hidden="true" />
                <span><strong>Empresa</strong> · administra viajes y flota</span>
              </div>
              <div className="auth-role-guide__item">
                <BusFront size={16} aria-hidden="true" />
                <span><strong>Chofer</strong> · consulta su recorrido</span>
              </div>
            </div>
          </div>

        <div className="auth-divider" aria-hidden="true">
          <span>o</span>
        </div>

        <p className="auth-footer">
          ¿Eres nuevo por aquí?
          <Link to="/register" className="auth-link">
            Crea una cuenta gratis
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
};

export default LoginPage;
