import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { User, Mail, Phone, CreditCard, Lock, Sparkles, ArrowLeft, Check, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

import AuthLayout from '../components/auth/AuthLayout';
import Card from '../components/ui/Card';
import InputField from '../components/ui/InputField';
import Button from '../components/ui/Button';

const REQUIREMENTS = [
  { key: 'length', label: '8-12 caracteres' },
  { key: 'upper', label: 'Una mayúscula' },
  { key: 'lower', label: 'Una minúscula' },
  { key: 'number', label: 'Un número' },
  { key: 'special', label: 'Un símbolo (@.$!)' },
];

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
    email: '',
    usuario: '',
    contrasenia: '',
  });
  const [errors, setErrors] = useState({});
  const [passRequirements, setPassRequirements] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const updatePasswordRequirements = (value) => {
    const next = {
      length: value.length >= 8 && value.length <= 12,
      upper: /[A-Z]/.test(value),
      lower: /[a-z]/.test(value),
      number: /[0-9]/.test(value),
      special: /[@$!%*?#_.&]/.test(value),
    };
    setPassRequirements(next);
    return next;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (name === 'contrasenia') {
      const next = updatePasswordRequirements(value);
      if (Object.values(next).every(Boolean)) {
        setErrors((prev) => ({ ...prev, contrasenia: '' }));
      }
    }
  };

  const validate = () => {
    const next = {};
    const { nombre, apellido, dni, telefono, email, usuario, contrasenia } = formData;

    if (!nombre.trim()) next.nombre = 'Ingresá tu nombre';
    else if (nombre.trim().length < 2) next.nombre = 'Mínimo 2 caracteres';

    if (!apellido.trim()) next.apellido = 'Ingresá tu apellido';
    else if (apellido.trim().length < 2) next.apellido = 'Mínimo 2 caracteres';

    const dniClean = dni.toString().replace(/\D/g, '');
    if (!dniClean) next.dni = 'Ingresá tu DNI';
    else if (!/^\d{7,8}$/.test(dniClean)) next.dni = 'DNI inválido (7-8 dígitos)';

    const telClean = telefono.toString().replace(/\D/g, '');
    if (!telClean) next.telefono = 'Ingresá tu teléfono';
    else if (telClean.length < 10) next.telefono = 'Teléfono inválido';

    if (!email.trim()) next.email = 'Ingresá tu correo';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Correo inválido';

    if (!usuario.trim()) next.usuario = 'Ingresá un usuario';
    else if (usuario.trim().length < 3) next.usuario = 'Mínimo 3 caracteres';

    if (!contrasenia) next.contrasenia = 'Ingresá una contraseña';
    else if (!Object.values(passRequirements).every(Boolean)) {
      next.contrasenia = 'La contraseña no cumple los requisitos';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const cleanedData = {
      ...formData,
      dni: parseInt(formData.dni.toString().replace(/\D/g, ''), 10),
      telefono: formData.telefono.toString().replace(/\D/g, ''),
    };

    try {
      await authService.register(cleanedData);
      toast.success('¡Cuenta creada! Verifica tu email.');
      navigate('/login');
    } catch (error) {
      const serverErrors = error.response?.data?.errors;
      toast.error(serverErrors?.[0]?.msg || 'Revisa los datos ingresados');
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
      <Link to="/login" className="auth-back">
        <ArrowLeft size={18} aria-hidden="true" />
        Volver
      </Link>

      <Card className="auth-card auth-card--wide animate-fade-in">
        <header className="auth-header">
          <div className="auth-logo">
            <Sparkles size={24} aria-hidden="true" />
          </div>
          <h2 className="auth-title">Únete a V&V</h2>
          <p className="auth-subtitle">Tu seguridad es nuestra prioridad.</p>
        </header>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          <div className="auth-form-grid">
            <InputField
              id="nombre"
              name="nombre"
              label="Nombre"
              type="text"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Juan"
              icon={User}
              error={errors.nombre}
              required
              autoComplete="given-name"
            />
            <InputField
              id="apellido"
              name="apellido"
              label="Apellido"
              type="text"
              value={formData.apellido}
              onChange={handleChange}
              placeholder="Pérez"
              icon={User}
              error={errors.apellido}
              required
              autoComplete="family-name"
            />
            <InputField
              id="dni"
              name="dni"
              label="DNI"
              type="text"
              inputMode="numeric"
              value={formData.dni}
              onChange={handleChange}
              placeholder="Solo números"
              icon={CreditCard}
              error={errors.dni}
              required
              autoComplete="off"
            />
            <InputField
              id="telefono"
              name="telefono"
              label="Teléfono"
              type="tel"
              inputMode="tel"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Ej: 3794..."
              icon={Phone}
              error={errors.telefono}
              required
              autoComplete="tel"
            />
            <InputField
              id="email"
              name="email"
              label="Correo Electrónico"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="juan@ejemplo.com"
              icon={Mail}
              error={errors.email}
              required
              autoComplete="email"
              className="auth-form-grid__full"
            />
            <InputField
              id="usuario"
              name="usuario"
              label="Usuario"
              type="text"
              value={formData.usuario}
              onChange={handleChange}
              placeholder="juanperez"
              icon={User}
              error={errors.usuario}
              required
              autoComplete="username"
            />
            <InputField
              id="contrasenia"
              name="contrasenia"
              label="Contraseña"
              type={showPassword ? 'text' : 'password'}
              value={formData.contrasenia}
              onChange={handleChange}
              placeholder="••••••••"
              icon={Lock}
              rightElement={passwordToggle}
              error={errors.contrasenia}
              required
              autoComplete="new-password"
            />
          </div>

          <fieldset className="auth-requirements" role="list">
            <legend className="sr-only">Requisitos de contraseña</legend>
            {REQUIREMENTS.map(({ key, label }) => {
              const met = passRequirements[key];
              return (
                <div
                  key={key}
                  className={`auth-requirement ${met ? 'auth-requirement--met' : ''}`}
                  role="listitem"
                >
                  {met ? (
                    <Check size={14} strokeWidth={3} aria-hidden="true" />
                  ) : (
                    <span className="auth-requirement__dot" aria-hidden="true" />
                  )}
                  <span>{label}</span>
                </div>
              );
            })}
          </fieldset>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="auth-submit"
          >
            {loading ? 'Creando cuenta...' : 'Crear mi cuenta gratuita'}
          </Button>
        </form>

        <p className="auth-footer">
          ¿Ya eres parte?
          <Link to="/login" className="auth-link">
            Inicia sesión
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
};

export default RegisterPage;
