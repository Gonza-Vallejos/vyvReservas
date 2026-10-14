import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { User as UserIcon, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

import AuthLayout from '../components/auth/AuthLayout';
import Card from '../components/ui/Card';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';

const LoginPage = () => {
  const [form, setForm] = useState({ usuario: '', contrasenia: '' });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
        const perfilId = data.usuario?.perfil_id;
        if (perfilId === 1 || perfilId === 5 || perfilId === 3) navigate('/dashboard');
        else if (perfilId === 4) navigate('/chofer');
        else navigate('/');
      } else {
        toast.error(response.data.message || 'Error de credenciales');
      }
    } catch {
      toast.error('Credenciales inválidas');
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
          <h2 className="auth-title">Hola de nuevo</h2>
          <p className="auth-subtitle">Gestiona tus viajes y reservas con facilidad.</p>
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
