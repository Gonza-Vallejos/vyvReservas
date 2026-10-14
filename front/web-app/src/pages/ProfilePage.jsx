import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import InputField from '../components/ui/InputField';
import {
  User,
  Mail,
  Phone,
  CreditCard,
  Shield,
  Ticket,
  Palette,
  HelpCircle,
  LogOut,
  Edit2,
  Save,
  X,
  Lock,
  Loader,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { usuarioService } from '../services/api';

const roleLabel = (perfilId) => {
  switch (perfilId) {
    case 1:
      return 'Super Administrador';
    case 3:
      return 'Mostrador';
    case 4:
      return 'Chofer';
    case 5:
      return 'Dueño';
    default:
      return 'Pasajero';
  }
};

const roleBadgeVariant = (perfilId) => {
  switch (perfilId) {
    case 1:
    case 5:
      return 'primary';
    case 3:
      return 'accent';
    case 4:
      return 'warning';
    default:
      return 'success';
  }
};

const ProfilePage = () => {
  const { user, loading: authLoading, logout, login } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    telefono: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('/login', { state: { from: '/perfil' } });
    }
  }, [authLoading, navigate, user]);

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/');
  };

  const startEditing = () => {
    setForm({
      nombre: user?.nombre || '',
      apellido: user?.apellido || '',
      dni: user?.dni ? String(user.dni) : '',
      telefono: user?.telefono || '',
    });
    setErrors({});
    setIsEditing(true);
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.nombre.trim()) nextErrors.nombre = 'Ingresá tu nombre';
    if (!form.apellido.trim()) nextErrors.apellido = 'Ingresá tu apellido';
    if (!form.dni.trim()) nextErrors.dni = 'Ingresá tu DNI';
    else if (form.dni.trim().length < 7) nextErrors.dni = 'DNI inválido';
    if (!form.telefono.trim()) nextErrors.telefono = 'Ingresá tu teléfono';
    else if (form.telefono.trim().replace(/\D/g, '').length < 10) {
      nextErrors.telefono = 'Teléfono inválido';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);

    try {
      const payload = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        dni: parseInt(form.dni.trim(), 10),
        telefono: form.telefono.trim(),
      };
      await usuarioService.actualizar(user.id, payload);

      const updatedUser = { ...user, ...payload, dni: String(payload.dni) };
      const token = localStorage.getItem('token');
      if (token) {
        login(updatedUser, token);
      }
      toast.success('Datos guardados correctamente');
      setIsEditing(false);
    } catch (error) {
      const validationErrors = error.response?.data?.errores;
      const message = validationErrors?.[0]?.msg
        || error.response?.data?.message
        || 'No se pudieron guardar los cambios';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setForm({
      nombre: user?.nombre || '',
      apellido: user?.apellido || '',
      dni: user?.dni ? String(user.dni) : '',
      telefono: user?.telefono || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  const handlePasswordPlaceholder = () => {
    toast('El cambio de contraseña estará disponible pronto', { icon: '🔒' });
  };

  const handleHelp = () => {
    window.location.href = 'mailto:ayuda@vyvreservas.com?subject=Consulta%20desde%20la%20app%20web';
  };

  if (authLoading || !user) {
    return (
      <div className="container profile-page__container">
        <div className="profile-page__loader" role="status" aria-live="polite">
          <Loader size={40} className="profile-page__loader-icon" aria-hidden="true" />
          <span>Cargando perfil…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container profile-page__container animate-fade-in">
      <header className="profile-page__header">
        <div className="profile-page__avatar" aria-hidden="true">
          <User size={32} />
        </div>
        <div className="profile-page__header-text">
          <div className="profile-page__name-row">
            <h1 className="profile-page__title">
              {user.nombre} {user.apellido}
            </h1>
            <Badge variant={roleBadgeVariant(user.perfil_id)}>{roleLabel(user.perfil_id)}</Badge>
          </div>
          <p className="profile-page__email">{user.email || 'Correo no disponible'}</p>
        </div>
      </header>

      <div className="profile-page__layout">
        <div className="profile-page__column">
          <Card padded className="profile-page__card">
            <div className="profile-page__card-header">
              <div className="profile-page__card-title">
                <User size={20} aria-hidden="true" />
                <h2>Datos personales</h2>
              </div>
              {!isEditing ? (
                <Button variant="ghost" size="sm" onClick={startEditing} ariaLabel="Editar datos personales">
                  <Edit2 size={16} aria-hidden="true" />
                  Editar
                </Button>
              ) : (
                <div className="profile-page__card-actions">
                  <Button variant="ghost" size="sm" onClick={handleCancelEdit} ariaLabel="Cancelar edición">
                    <X size={16} aria-hidden="true" />
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSave}
                    loading={saving}
                    disabled={saving}
                    ariaLabel="Guardar cambios"
                  >
                    {!saving && <Save size={16} aria-hidden="true" />}
                    Guardar
                  </Button>
                </div>
              )}
            </div>

            <div className="profile-page__form-grid">
              <InputField
                id="nombre"
                label="Nombre"
                value={isEditing ? form.nombre : user?.nombre || ''}
                onChange={handleChange('nombre')}
                disabled={!isEditing || saving}
                error={errors.nombre}
                icon={User}
              />
              <InputField
                id="apellido"
                label="Apellido"
                value={isEditing ? form.apellido : user?.apellido || ''}
                onChange={handleChange('apellido')}
                disabled={!isEditing || saving}
                error={errors.apellido}
                icon={User}
              />
              <InputField
                id="dni"
                label="DNI"
                value={isEditing ? form.dni : user?.dni ? String(user.dni) : ''}
                onChange={handleChange('dni')}
                disabled={!isEditing || saving}
                error={errors.dni}
                icon={CreditCard}
              />
              <InputField
                id="telefono"
                label="Teléfono"
                value={isEditing ? form.telefono : user?.telefono || ''}
                onChange={handleChange('telefono')}
                disabled={!isEditing || saving}
                error={errors.telefono}
                placeholder="Ej: 11 1234 5678"
                icon={Phone}
              />
              <InputField
                id="email"
                label="Correo electrónico"
                type="email"
                value={user.email || ''}
                disabled
                icon={Mail}
              />
            </div>

            {isEditing && (
              <p className="profile-page__placeholder-note">
                Los cambios se guardan en tu cuenta y estarán disponibles en tu próximo inicio de sesión.
              </p>
            )}
          </Card>

          <Card padded className="profile-page__card">
            <div className="profile-page__card-title">
              <Shield size={20} aria-hidden="true" />
              <h2>Seguridad</h2>
            </div>
            <p className="profile-page__card-description">
              Cambiá tu contraseña periódicamente para mantener tu cuenta protegida.
            </p>
            <Button variant="secondary" size="md" onClick={handlePasswordPlaceholder} ariaLabel="Cambiar contraseña">
              <Lock size={18} aria-hidden="true" />
              Cambiar contraseña
            </Button>
          </Card>
        </div>

        <aside className="profile-page__column profile-page__column--aside">
          <Card padded className="profile-page__card">
            <div className="profile-page__card-title">
              <Ticket size={20} aria-hidden="true" />
              <h2>Accesos rápidos</h2>
            </div>
            <nav aria-label="Accesos rápidos del perfil">
              <Link to="/mis-reservas" className="profile-page__quick-link">
                <Ticket size={18} aria-hidden="true" />
                Mis reservas
                <span aria-hidden="true" className="profile-page__quick-link-arrow">→</span>
              </Link>
              <Link to="/" className="profile-page__quick-link">
                <span aria-hidden="true">🚍</span>
                Buscar pasajes
                <span aria-hidden="true" className="profile-page__quick-link-arrow">→</span>
              </Link>
            </nav>
          </Card>

          <Card padded className="profile-page__card">
            <div className="profile-page__card-title">
              <Palette size={20} aria-hidden="true" />
              <h2>Preferencias</h2>
            </div>
            <p className="profile-page__card-description">
              Próximamente podrás personalizar la apariencia y las notificaciones de tu cuenta.
            </p>
          </Card>

          <Card padded className="profile-page__card">
            <div className="profile-page__card-title">
              <HelpCircle size={20} aria-hidden="true" />
              <h2>Ayuda</h2>
            </div>
            <p className="profile-page__card-description">
              ¿Tenés dudas sobre tu reserva, pagos o cancelaciones? Escribinos.
            </p>
            <Button variant="secondary" size="md" onClick={handleHelp} ariaLabel="Contactar soporte">
              <HelpCircle size={18} aria-hidden="true" />
              Contactar soporte
            </Button>
          </Card>

          <Card padded className="profile-page__card profile-page__card--danger">
            <div className="profile-page__card-title">
              <LogOut size={20} aria-hidden="true" />
              <h2>Cerrar sesión</h2>
            </div>
            <p className="profile-page__card-description">
              Salí de tu cuenta de forma segura en este dispositivo.
            </p>
            <Button variant="primary" size="md" className="profile-page__logout-btn" onClick={handleLogout} ariaLabel="Cerrar sesión">
              <LogOut size={18} aria-hidden="true" />
              Cerrar sesión
            </Button>
          </Card>
        </aside>
      </div>
    </div>
  );
};

export default ProfilePage;
