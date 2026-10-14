import { useState, useEffect, useMemo, useCallback, useId } from 'react';
import { useAuth } from '../context/AuthContext';
import { PROFILES } from '../constants/profiles';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Bus, Users, TrendingUp, Plus, Edit, Trash2, X,
  UserCheck, Truck, Building2, Settings, DollarSign, UserPlus, ShieldCheck,
  BookmarkCheck, ArrowRight, Menu, MapPin, Phone, Mail, IdCard
} from 'lucide-react';
import { viajeService, transporteService, empresaService, reservaService, usuarioService } from '../services/api';
import InteractiveChart from '../components/InteractiveChart';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import InputField from '../components/ui/InputField';
import EmptyState from '../components/ui/EmptyState';
import SkeletonCard from '../components/ui/SkeletonCard';
import toast from 'react-hot-toast';

const formatISODate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const getWeekDays = (anchorDate = new Date()) => {
  const day = anchorDate.getDay();
  const diffToMonday = (day === 0 ? -6 : 1) - day;
  const monday = new Date(anchorDate);
  monday.setDate(anchorDate.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  const labels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      label: labels[i],
      date: d,
      iso: formatISODate(d),
      dayNumber: d.getDate(),
    };
  });
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatTime = (time) => (time ? time.substring(0, 5) : '--:--');

const getProfileId = (u) => u?.Usuario?.perfil_id || u?.perfil_id || null;

const getFullName = (u) => {
  const nombre = u?.Usuario?.nombre || u?.nombre || '';
  const apellido = u?.Usuario?.apellido || u?.apellido || '';
  return `${nombre} ${apellido}`.trim() || 'Sin nombre';
};

const getRoleLabel = (perfilId) => {
  if (perfilId === PROFILES.CHOFER) return 'Chofer';
  if (perfilId === PROFILES.MOSTRADOR) return 'Mostrador';
  if (perfilId === PROFILES.EMPRESA) return 'Dueño';
  if (perfilId === PROFILES.ADMINISTRADOR) return 'Administrador';
  return 'Usuario';
};

const getRoleBadgeVariant = (perfilId) => {
  if (perfilId === PROFILES.CHOFER) return 'primary';
  if (perfilId === PROFILES.MOSTRADOR) return 'accent';
  if (perfilId === PROFILES.EMPRESA || perfilId === PROFILES.ADMINISTRADOR) return 'success';
  return 'default';
};

const WeekDayNav = ({ selected, onSelect }) => {
  const weekDays = getWeekDays();
  const todayIso = formatISODate(new Date());

  return (
    <div className="dashboard-week-nav" role="tablist" aria-label="Días de la semana">
      {weekDays.map((day) => {
        const isSelected = day.iso === selected;
        const isToday = day.iso === todayIso;
        return (
          <button
            key={day.iso}
            type="button"
            role="tab"
            aria-selected={isSelected}
            aria-label={`${day.label} ${day.dayNumber}${isToday ? ' Hoy' : ''}`}
            onClick={() => onSelect(day.iso)}
            className={`dashboard-week-nav__btn ${
              isSelected ? 'dashboard-week-nav__btn--active' : ''
            } ${isToday && !isSelected ? 'dashboard-week-nav__btn--today' : ''}`}
          >
            <span className="dashboard-week-nav__label">{day.label}</span>
            <span className="dashboard-week-nav__number">{day.dayNumber}</span>
            {isToday && <span className="dashboard-week-nav__today">Hoy</span>}
          </button>
        );
      })}
    </div>
  );
};

const SelectField = ({ id, label, value, onChange, required = false, children, placeholder }) => {
  const fallbackId = useId();
  const selectId = id || fallbackId;
  return (
    <div className="dashboard-select-field">
      {label && (
        <label htmlFor={selectId} className="dashboard-select-field__label">
          {label}
          {required && <span className="dashboard-select-field__required" aria-hidden="true">*</span>}
        </label>
      )}
      <div className="dashboard-select-field__wrapper">
        <select
          id={selectId}
          value={value}
          onChange={onChange}
          required={required}
          className="dashboard-select-field__input"
        >
          {placeholder && <option value="">{placeholder}</option>}
          {children}
        </select>
      </div>
    </div>
  );
};

const Modal = ({ children, title, subtitle, onClose, className = '' }) => (
  <div className="dashboard-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
    <Card className={`dashboard-modal-card ${className}`} padded={false} onClick={(e) => e.stopPropagation()}>
      <div className="dashboard-modal-header">
        <div>
          {title && <h2 className="dashboard-modal-title">{title}</h2>}
          {subtitle && <p className="dashboard-modal-subtitle">{subtitle}</p>}
        </div>
        <Button variant="ghost" size="sm" ariaLabel="Cerrar" onClick={onClose} className="dashboard-modal-close">
          <X size={20} />
        </Button>
      </div>
      {children}
    </Card>
  </div>
);

const StatCard = ({ icon: Icon, label, value, variant = 'default' }) => (
  <Card className={`dashboard-stat dashboard-stat--${variant}`}>
    <div className="dashboard-stat__icon" aria-hidden="true">
      <Icon size={24} />
    </div>
    <div>
      <p className="dashboard-stat__label">{label}</p>
      <p className="dashboard-stat__value">{value}</p>
    </div>
  </Card>
);

const DashboardTable = ({ headers, children, caption }) => (
  <div className="table-responsive-container">
    <table className="dashboard-table">
      {caption && <caption className="sr-only">{caption}</caption>}
      <thead>
        <tr>
          {headers.map((h, i) => (
            <th key={i} scope="col">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  </div>
);

const IconButton = ({ icon: Icon, label, onClick, variant = 'default', disabled = false, type = 'button' }) => {
  const variantClass = variant === 'danger' ? 'dashboard-icon-btn--danger' : '';
  return (
    <button
      type={type}
      className={`dashboard-icon-btn ${variantClass}`}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
    >
      <Icon size={18} />
    </button>
  );
};

const SidebarItem = ({ icon: Icon, label, badgeCount, active, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`dashboard-sidebar__item ${active ? 'dashboard-sidebar__item--active' : ''}`}
    aria-current={active ? 'page' : undefined}
  >
    <span className="dashboard-sidebar__item-inner">
      <Icon size={20} aria-hidden="true" />
      <span>{label}</span>
    </span>
    {badgeCount !== undefined && badgeCount > 0 && (
      <span className="dashboard-sidebar__badge">{badgeCount}</span>
    )}
  </button>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('resumen');
  const [loading, setLoading] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const [viajes, setViajes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [choferes, setChoferes] = useState([]);
  const [empleados, setEmpleados] = useState([]);
  const [reservas, setReservas] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [miEmpresa, setMiEmpresa] = useState(null);

  const [showTripModal, setShowTripModal] = useState(false);
  const [showEditTripModal, setShowEditTripModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showPassengersModal, setShowPassengersModal] = useState(false);
  const [showReservaDetailModal, setShowReservaDetailModal] = useState(false);

  const [selectedTrip, setSelectedTrip] = useState(null);
  const [selectedReserva, setSelectedReserva] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [selectedTripDate, setSelectedTripDate] = useState(() => formatISODate(new Date()));

  const [nuevoViaje, setNuevoViaje] = useState({
    origenLocalidad: '',
    destinoLocalidad: '',
    fechaViaje: '',
    horarioSalida: '',
    precio: '',
    medioTransporte_id: '',
    usuarioEmpresa_id: '',
  });
  const [editingTrip, setEditingTrip] = useState({
    id: null,
    origenLocalidad: '',
    destinoLocalidad: '',
    fechaViaje: '',
    horarioSalida: '',
    precio: '',
    medioTransporte_id: '',
    usuarioEmpresa_id: '',
  });
  const [nuevoVehiculo, setNuevoVehiculo] = useState({
    nombre: '',
    patente: '',
    marca: '',
    cantLugares: 19,
  });
  const [nuevoEmpleado, setNuevoEmpleado] = useState({
    nombre: '',
    apellido: '',
    dni: '',
    email: '',
    usuario: '',
    contrasenia: '',
    perfil_id: '',
  });

  const isOwner = user?.perfil_id === 5 || user?.perfil_id === 1;

  const viajesDelDia = useMemo(() => {
    return viajes.filter((v) => {
      const tripDate = String(v.fechaViaje).split('T')[0];
      return tripDate === selectedTripDate;
    });
  }, [viajes, selectedTripDate]);

  const reservasActivas = useMemo(() => reservas.filter((r) => r.eliminado !== 'si'), [reservas]);

  const totalPasajeros = useMemo(() => {
    return reservasActivas.reduce((sum, r) => sum + (r.Pasajeros?.length || r.asientos_reservados || 1), 0);
  }, [reservasActivas]);

  const totalIngresos = useMemo(() => {
    return reservasActivas.reduce((sum, r) => {
      const precio = Number(r.Viaje?.precio) || 0;
      const pasajeros = r.Pasajeros?.length || r.asientos_reservados || 1;
      return sum + precio * pasajeros;
    }, 0);
  }, [reservasActivas]);

  const totalCapacidad = useMemo(
    () => vehiculos.reduce((sum, v) => sum + (Number(v.cantLugares) || 0), 0),
    [vehiculos]
  );

  const ocupacion = totalCapacidad > 0 ? Math.round((totalPasajeros / totalCapacidad) * 100) : 0;

  const weekDays = useMemo(() => getWeekDays(), []);

  const weeklyReservations = useMemo(() => {
    return weekDays.map((day) =>
      reservasActivas.filter((r) => String(r.Viaje?.fechaViaje).split('T')[0] === day.iso).length
    );
  }, [reservasActivas, weekDays]);

  const topRoutes = useMemo(() => {
    const map = {};
    reservasActivas.forEach((r) => {
      const key = `${r.Viaje?.origenLocalidad || 'Origen'} → ${r.Viaje?.destinoLocalidad || 'Destino'}`;
      map[key] = (map[key] || 0) + (r.Pasajeros?.length || 1);
    });
    return Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [reservasActivas]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      let empresaId = user.id_empresa;
      if (!empresaId) {
        try {
          const empRes = await empresaService.obtenerEmpresaDeUsuario(user.id);
          empresaId = empRes.data?.data?.empresa_id || empRes.data?.empresa_id;
        } catch (e) {
          console.warn('No se pudo obtener empresa por usuario:', e);
        }
      }
      if (!empresaId && user.perfil_id === 5) {
        empresaId = user.id;
      }

      const [vRes, tRes, cRes, eRes, rRes, empListRes] = await Promise.allSettled([
        empresaId ? viajeService.obtenerPorEmpresa(empresaId) : Promise.resolve({ data: { data: [] } }),
        empresaId ? transporteService.obtenerPorEmpresa(empresaId) : Promise.resolve({ data: { data: [] } }),
        empresaId ? empresaService.obtenerUsuarios(empresaId) : Promise.resolve({ data: { data: [] } }),
        empresaId ? empresaService.obtenerPorId(empresaId) : Promise.resolve({ data: { data: null } }),
        empresaId ? reservaService.obtenerPorEmpresa(empresaId) : Promise.resolve({ data: { data: [] } }),
        isOwner ? empresaService.listarTodas() : Promise.resolve({ data: { data: [] } }),
      ]);

      if (vRes.status === 'fulfilled') setViajes(vRes.value?.data?.data || vRes.value?.data || []);
      if (tRes.status === 'fulfilled') setVehiculos(tRes.value?.data?.data || tRes.value?.data || []);
      if (eRes.status === 'fulfilled') {
        const data = eRes.value?.data?.data ?? eRes.value?.data;
        setMiEmpresa(data || null);
      }
      if (cRes.status === 'fulfilled') {
        const all = cRes.value?.data?.data || cRes.value?.data || [];
        setEmpleados(all.filter((u) => [3, 4].includes(getProfileId(u))));
        setChoferes(all.filter((u) => getProfileId(u) === 4));
      }
      if (rRes.status === 'fulfilled') setReservas(rRes.value?.data?.data || rRes.value?.data || []);
      if (empListRes.status === 'fulfilled')
        setEmpresas(empListRes.value?.data?.data || empListRes.value?.data || []);
    } catch (error) {
      console.error('Error al cargar datos del dashboard:', error);
      toast.error('Error al cargar datos del panel');
    } finally {
      setLoading(false);
    }
  }, [user, isOwner]);

  useEffect(() => {
    if (!user || (user.perfil_id !== 1 && user.perfil_id !== 5 && user.perfil_id !== 3)) {
      navigate('/');
      return;
    }
    // Carga inicial de datos (fetching asíncrono estándar).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [user, navigate, fetchData]);

  const handleDeleteTrip = async (id, routeLabel) => {
    if (!window.confirm(`¿Estás seguro de eliminar el viaje ${routeLabel}?`)) return;
    try {
      await viajeService.eliminar(id);
      toast.success('Viaje eliminado con éxito');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'No se puede eliminar el viaje');
    }
  };

  const handleCancelReserva = async (id) => {
    if (!window.confirm(`¿Estás seguro de cancelar la reserva #RES-${id}? Los cupos serán reintegrados al viaje.`)) return;
    try {
      await reservaService.cancelar(id);
      toast.success('Reserva cancelada y cupos reintegrados');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al cancelar la reserva');
    }
  };

  const chartCommonOptions = {
    chart: { toolbar: { show: false }, fontFamily: 'Outfit, sans-serif' },
    dataLabels: { enabled: false },
    grid: { borderColor: 'var(--border-light)' },
    tooltip: { theme: 'dark' },
  };

  return (
    <div className="dashboard-page">
      <style>{`
        .dashboard-page { display: flex; min-height: 100vh; background: var(--background); color: var(--text-dark); }
        .dashboard-sidebar { width: 280px; border-right: 1px solid var(--border); display: flex; flex-direction: column; position: sticky; top: 0; height: 100vh; background: var(--glass); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); z-index: 100; }
        .dashboard-sidebar__brand { padding: var(--space-6) var(--space-5); margin-bottom: var(--space-2); display: flex; justify-content: space-between; align-items: center; gap: var(--space-3); }
        .dashboard-sidebar__brand-text h3 { font-size: var(--text-2xl); font-weight: 900; color: var(--color-primary); letter-spacing: -1px; line-height: 1; }
        .dashboard-sidebar__brand-text p { font-size: 0.7rem; font-weight: 800; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
        .dashboard-sidebar__nav { flex: 1; overflow-y: auto; padding: 0 var(--space-3); }
        .dashboard-sidebar__item { width: 100%; display: flex; align-items: center; justify-content: space-between; gap: var(--space-3); padding: var(--space-3) var(--space-4); border-radius: var(--radius-3); background: transparent; color: var(--text-muted); border: none; font-weight: 700; font-size: var(--text-sm); font-family: var(--font-body); transition: background-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease; margin-bottom: var(--space-2); }
        .dashboard-sidebar__item-inner { display: flex; align-items: center; gap: var(--space-3); }
        .dashboard-sidebar__item:hover:not(.dashboard-sidebar__item--active) { background: var(--surface-hover); color: var(--color-text); }
        .dashboard-sidebar__item--active { background: var(--color-primary); color: #ffffff; box-shadow: var(--shadow-md); }
        .dashboard-sidebar__item--active .dashboard-sidebar__badge { background: rgba(255,255,255,0.25); color: #ffffff; }
        .dashboard-sidebar__badge { background: var(--surface-hover); color: var(--text-muted); padding: 2px 8px; border-radius: var(--radius-pill); font-size: 0.75rem; font-weight: 800; }
        .dashboard-sidebar__footer { margin-top: auto; padding: var(--space-5) var(--space-3); border-top: 1px solid var(--border-light); }
        .dashboard-main { flex: 1; padding: var(--space-8) var(--space-10); overflow-y: auto; min-width: 0; }
        .dashboard-mobile-topbar { display: none; align-items: center; justify-content: space-between; margin-bottom: var(--space-5); padding-bottom: var(--space-3); border-bottom: 1px solid var(--border); }
        .dashboard-active-tab-badge { background: var(--color-primary); color: #ffffff; padding: 6px 14px; border-radius: var(--radius-pill); font-size: 0.75rem; font-weight: 900; letter-spacing: 0.5px; text-transform: uppercase; }
        .dashboard-header { display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-5); margin-bottom: var(--space-8); flex-wrap: wrap; }
        .dashboard-title { font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 900; color: var(--color-text); letter-spacing: -1px; text-transform: capitalize; }
        .dashboard-role-badge { display: inline-flex; align-items: center; gap: var(--space-2); background: var(--surface-hover); color: var(--text-muted); padding: 4px 12px; border-radius: var(--radius-pill); font-size: var(--text-xs); font-weight: 800; margin-top: var(--space-2); }
        .dashboard-actions { display: flex; gap: var(--space-3); flex-wrap: wrap; }
        .dashboard-tab { display: flex; flex-direction: column; gap: var(--space-6); }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-5); }
        .dashboard-stat { display: flex; align-items: center; gap: var(--space-4); }
        .dashboard-stat__icon { width: 52px; height: 52px; border-radius: var(--radius-3); background: var(--primary-light); color: var(--color-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .dashboard-stat--success .dashboard-stat__icon { background: var(--success-bg); color: var(--success); }
        .dashboard-stat--accent .dashboard-stat__icon { background: var(--accent-bg); color: var(--accent); }
        .dashboard-stat--primary .dashboard-stat__icon { background: var(--primary-light); color: var(--color-primary-dark); }
        .dashboard-stat__label { font-size: var(--text-xs); font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px; }
        .dashboard-stat__value { font-size: var(--text-2xl); font-weight: 900; color: var(--color-text); font-family: var(--font-heading); letter-spacing: -0.5px; line-height: 1.2; }

        .chart-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-5); }
        .dashboard-chart-card { display: flex; flex-direction: column; gap: var(--space-3); }
        .dashboard-chart-card__title { font-size: var(--text-lg); font-weight: 800; color: var(--color-text); }

        .table-card { overflow: hidden; }
        .dashboard-table { width: 100%; min-width: 640px; border-collapse: collapse; }
        .dashboard-table caption { text-align: left; font-size: var(--text-xs); font-weight: 800; text-transform: uppercase; color: var(--text-muted); padding: var(--space-4) var(--space-5); }
        .dashboard-table th { padding: var(--space-4) var(--space-5); text-align: left; font-size: var(--text-xs); font-weight: 800; text-transform: uppercase; color: var(--text-muted); background: var(--surface-hover); border-bottom: 1px solid var(--border); white-space: nowrap; }
        .dashboard-table td { padding: var(--space-4) var(--space-5); border-bottom: 1px solid var(--border-light); vertical-align: middle; }
        .dashboard-table tbody tr { transition: background-color 0.15s ease; }
        .dashboard-table tbody tr:hover { background: var(--surface-hover); }
        .dashboard-table tbody tr:last-child td { border-bottom: none; }
        .dashboard-table__title { font-weight: 800; color: var(--color-text); line-height: 1.3; margin-bottom: 2px; }
        .dashboard-table__text { font-size: var(--text-sm); color: var(--text-muted); font-weight: 600; }
        .dashboard-actions-cell { display: flex; align-items: center; gap: var(--space-2); flex-wrap: wrap; }

        .dashboard-week-nav { display: flex; gap: var(--space-3); padding: var(--space-5) var(--space-5) 0; overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .dashboard-week-nav__btn { display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 64px; padding: var(--space-3) var(--space-2); border-radius: var(--radius-3); border: 1.5px solid var(--border); background: var(--color-surface); color: var(--color-text); cursor: pointer; font-family: var(--font-heading); transition: all 0.2s ease; box-shadow: var(--shadow-xs); }
        .dashboard-week-nav__btn:hover:not(.dashboard-week-nav__btn--active) { border-color: var(--color-primary); background: var(--surface-hover); transform: translateY(-2px); box-shadow: var(--shadow-sm); }
        .dashboard-week-nav__btn:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
        .dashboard-week-nav__btn--active { background: var(--color-primary); border-color: var(--color-primary); color: #ffffff; box-shadow: 0 8px 16px -4px rgba(37, 99, 235, 0.3); }
        .dashboard-week-nav__btn--today:not(.dashboard-week-nav__btn--active) { border-color: var(--color-primary); color: var(--color-primary); background: var(--primary-light); }
        .dashboard-week-nav__label { font-size: 0.75rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .dashboard-week-nav__number { font-size: var(--text-xl); font-weight: 900; line-height: 1; }
        .dashboard-week-nav__today { font-size: 0.65rem; font-weight: 800; margin-top: 2px; }

        .dashboard-icon-btn { display: inline-flex; align-items: center; justify-content: center; width: 40px; height: 40px; border-radius: var(--radius-2); background: var(--surface-hover); color: var(--color-primary); border: none; cursor: pointer; transition: background-color 0.2s ease, color 0.2s ease, transform 0.15s ease; }
        .dashboard-icon-btn:hover { background: var(--color-border); color: var(--color-primary-dark); }
        .dashboard-icon-btn:focus-visible { outline: 2px solid var(--color-primary); outline-offset: 2px; }
        .dashboard-icon-btn--danger { color: var(--color-error); }
        .dashboard-icon-btn--danger:hover { background: var(--error-bg); color: #b91c1c; }

        .dashboard-modal-overlay { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 3000; padding: var(--space-4); }
        .dashboard-modal-card { width: 100%; max-width: 700px; max-height: 90vh; overflow: hidden; display: flex; flex-direction: column; }
        .dashboard-modal-card--wide { max-width: 850px; }
        .dashboard-modal-header { padding: var(--space-5) var(--space-6); border-bottom: 1px solid var(--border-light); display: flex; justify-content: space-between; align-items: flex-start; gap: var(--space-4); }
        .dashboard-modal-title { font-size: var(--text-2xl); font-weight: 900; color: var(--color-text); line-height: 1.2; }
        .dashboard-modal-subtitle { font-size: var(--text-sm); color: var(--text-muted); margin-top: var(--space-1); }
        .dashboard-modal-close { flex-shrink: 0; }
        .dashboard-modal-body { padding: var(--space-6); overflow-y: auto; }
        .dashboard-modal-form { display: flex; flex-direction: column; gap: var(--space-5); padding: var(--space-6); overflow-y: auto; max-height: calc(90vh - 80px); }
        .dashboard-modal-actions { display: flex; justify-content: flex-end; gap: var(--space-3); flex-wrap: wrap; margin-top: var(--space-2); }
        .dashboard-modal-actions--split { justify-content: space-between; }

        .dashboard-form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: var(--space-4); }
        .dashboard-form-grid-full { grid-column: 1 / -1; }

        .dashboard-select-field { display: flex; flex-direction: column; gap: var(--space-2); }
        .dashboard-select-field__label { font-size: var(--text-sm); font-weight: 600; color: var(--color-text); }
        .dashboard-select-field__required { color: var(--color-error); margin-left: 2px; }
        .dashboard-select-field__wrapper { position: relative; display: flex; align-items: center; width: 100%; background: var(--color-surface); border: 1.5px solid var(--color-border); border-radius: var(--radius-3); padding: 0 14px; min-height: 56px; transition: border-color 0.2s ease, box-shadow 0.2s ease; }
        .dashboard-select-field__wrapper:focus-within { border-color: var(--color-primary); box-shadow: var(--shadow-focus); }
        .dashboard-select-field__input { flex: 1; min-width: 0; border: none; background: transparent; font-size: var(--text-base); color: var(--color-text); font-weight: 600; outline: none; padding: 12px 0; cursor: pointer; }
        .dashboard-select-field__input option { color: var(--color-text); }

        .dashboard-passenger-list { display: flex; flex-direction: column; gap: var(--space-3); }
        .dashboard-passenger-item { display: flex; justify-content: space-between; align-items: center; gap: var(--space-4); flex-wrap: wrap; }
        .dashboard-passenger-main { display: flex; align-items: center; gap: var(--space-3); }
        .dashboard-passenger-avatar { width: 36px; height: 36px; border-radius: 50%; background: var(--color-primary); color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: var(--text-sm); }
        .dashboard-passenger-name { font-weight: 800; color: var(--color-text); }
        .dashboard-passenger-meta { font-size: var(--text-sm); color: var(--text-muted); font-weight: 600; }
        .dashboard-passenger-stops { display: flex; flex-direction: column; gap: 2px; font-size: var(--text-sm); color: var(--text-muted); font-weight: 600; text-align: right; }

        .dashboard-reservation-detail { display: flex; flex-direction: column; gap: var(--space-5); }
        .dashboard-reservation-route { display: flex; flex-direction: column; gap: var(--space-4); }
        .dashboard-reservation-route-header { display: flex; justify-content: space-between; align-items: center; gap: var(--space-3); flex-wrap: wrap; }
        .dashboard-reservation-route-title { display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-xl); font-weight: 900; color: var(--color-text); }
        .dashboard-reservation-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: var(--space-4); }
        .dashboard-detail-label { display: block; font-size: var(--text-xs); font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: var(--space-1); }
        .dashboard-detail-price { color: var(--color-success); }
        .dashboard-detail-section-title { font-size: var(--text-base); font-weight: 800; text-transform: uppercase; color: var(--text-muted); letter-spacing: 0.5px; }
        .dashboard-detail-sublabel { display: block; font-size: var(--text-sm); color: var(--text-muted); margin-top: 2px; }

        .dashboard-company-header { display: flex; align-items: center; gap: var(--space-4); margin-bottom: var(--space-6); }
        .dashboard-company-logo { width: 64px; height: 64px; border-radius: var(--radius-3); background: var(--primary-light); color: var(--color-primary); display: flex; align-items: center; justify-content: center; }
        .dashboard-company-name { font-size: var(--text-2xl); font-weight: 900; color: var(--color-text); }
        .dashboard-company-meta { font-size: var(--text-sm); color: var(--text-muted); font-weight: 700; }
        .dashboard-company-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-4); }
        .dashboard-company-item { display: flex; align-items: flex-start; gap: var(--space-3); padding: var(--space-4); background: var(--surface-hover); border-radius: var(--radius-3); }
        .dashboard-company-item svg { color: var(--color-primary); flex-shrink: 0; margin-top: 2px; }
        .dashboard-company-item span { display: block; font-size: var(--text-xs); font-weight: 800; text-transform: uppercase; color: var(--text-muted); margin-bottom: 2px; }
        .dashboard-company-item b { font-size: var(--text-base); color: var(--color-text); font-weight: 800; }

        .skeleton-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: var(--space-5); margin-bottom: var(--space-8); }

        @media (max-width: 960px) {
          .dashboard-main { padding: var(--space-5) var(--space-4); }
          .dashboard-header { flex-direction: column; align-items: flex-start; }
          .dashboard-actions { width: 100%; }
          .dashboard-actions .vv-button { flex: 1 1 auto; }
          .chart-row { grid-template-columns: 1fr; }
          .dashboard-reservation-grid { grid-template-columns: 1fr; }
          .dashboard-passenger-stops { text-align: left; }
        }

        @media (max-width: 768px) {
          .dashboard-sidebar { position: fixed; top: 0; left: -300px; width: 280px; height: 100vh; z-index: 10000; background: var(--color-surface); box-shadow: 10px 0 25px rgba(0,0,0,0.15); transition: left 0.3s cubic-bezier(0.16,1,0.3,1); }
          .dashboard-sidebar.open { left: 0; }
          .dashboard-backdrop { position: fixed; inset: 0; background: rgba(15,23,42,0.5); backdrop-filter: blur(4px); z-index: 9999; }
          .dashboard-mobile-topbar { display: flex; }
          .dashboard-main { width: 100%; overflow-x: hidden; }
          .dashboard-actions { flex-direction: column; }
          .dashboard-actions .vv-button { width: 100%; justify-content: center; }
          .dashboard-modal-card { max-width: 95%; }
          .dashboard-modal-form { padding: var(--space-5) var(--space-4); }
          .dashboard-form-grid { grid-template-columns: 1fr; }
          .dashboard-modal-actions { flex-direction: column-reverse; }
          .dashboard-modal-actions .vv-button { width: 100%; justify-content: center; }
          .dashboard-modal-actions--split { flex-direction: column-reverse; gap: var(--space-3); }
        }
      `}</style>

      {mobileSidebarOpen && (
        <div className="dashboard-backdrop" onClick={() => setMobileSidebarOpen(false)} aria-hidden="true" />
      )}

      <aside className={`dashboard-sidebar ${mobileSidebarOpen ? 'open' : ''}`}>
        <div className="dashboard-sidebar__brand">
          <div className="dashboard-sidebar__brand-text">
            <h3>V&V ADMIN</h3>
            <p>Sistema de Gestión</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            ariaLabel="Cerrar menú"
            onClick={() => setMobileSidebarOpen(false)}
            className="mobile-only dashboard-sidebar__close"
          >
            <X size={20} />
          </Button>
        </div>
        <div className="dashboard-sidebar__nav">
          <SidebarItem id="resumen" icon={LayoutDashboard} label="Resumen" active={activeTab === 'resumen'} onClick={() => { setActiveTab('resumen'); setMobileSidebarOpen(false); }} />
          <SidebarItem id="viajes" icon={Bus} label="Viajes" badgeCount={viajes.length} active={activeTab === 'viajes'} onClick={() => { setActiveTab('viajes'); setMobileSidebarOpen(false); }} />
          <SidebarItem id="reservas" icon={BookmarkCheck} label="Reservas" badgeCount={reservas.length} active={activeTab === 'reservas'} onClick={() => { setActiveTab('reservas'); setMobileSidebarOpen(false); }} />
          <SidebarItem id="flota" icon={Truck} label="Mi Flota" badgeCount={vehiculos.length} active={activeTab === 'flota'} onClick={() => { setActiveTab('flota'); setMobileSidebarOpen(false); }} />
          <SidebarItem id="choferes" icon={Users} label="Personal" badgeCount={empleados.length} active={activeTab === 'choferes'} onClick={() => { setActiveTab('choferes'); setMobileSidebarOpen(false); }} />
          {isOwner && <SidebarItem id="estadisticas" icon={TrendingUp} label="Estadísticas" active={activeTab === 'estadisticas'} onClick={() => { setActiveTab('estadisticas'); setMobileSidebarOpen(false); }} />}
        </div>
        <div className="dashboard-sidebar__footer">
          <SidebarItem id="mi-empresa" icon={Building2} label="Mi Empresa" active={activeTab === 'mi-empresa'} onClick={() => { setActiveTab('mi-empresa'); setMobileSidebarOpen(false); }} />
          {isOwner && <SidebarItem id="empresas" icon={Settings} label="Configuración" active={activeTab === 'empresas'} onClick={() => { setActiveTab('empresas'); setMobileSidebarOpen(false); }} />}
        </div>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-mobile-topbar mobile-only">
          <Button variant="secondary" size="sm" onClick={() => setMobileSidebarOpen(true)} ariaLabel="Abrir menú">
            <Menu size={20} />
            <span>Pestañas / Menú</span>
          </Button>
          <span className="dashboard-active-tab-badge">{activeTab}</span>
        </div>

        <header className="dashboard-header">
          <div className="animate-fade-in">
            <h1 className="dashboard-title">{activeTab}</h1>
            <div className="dashboard-role-badge">
              <ShieldCheck size={14} aria-hidden="true" />
              <span>{isOwner ? 'Dueño de Empresa' : 'Operador Mostrador'}</span>
            </div>
          </div>
          <div className="dashboard-actions animate-fade-in">
            <Button onClick={() => setShowTripModal(true)}>
              <Plus size={20} /> Nuevo Viaje
            </Button>
            <Button variant="secondary" onClick={() => setShowVehicleModal(true)}>
              <Truck size={20} /> Nueva Unidad
            </Button>
            {isOwner && (
              <Button variant="primary" onClick={() => setShowEmployeeModal(true)}>
                <UserPlus size={20} /> Contratar
              </Button>
            )}
            <Button variant="secondary" onClick={() => navigate('/chofer')}>
              <Bus size={20} /> Chofer
            </Button>
          </div>
        </header>

        {loading ? (
          <div className="animate-fade-in">
            <div className="skeleton-grid">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
            <div className="chart-row">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'resumen' && (
              <div className="animate-fade-in dashboard-tab">
                <div className="stats-grid">
                  <StatCard icon={DollarSign} label="Ingresos estimados" value={formatCurrency(totalIngresos)} />
                  <StatCard icon={UserCheck} label="Pasajeros" value={totalPasajeros.toLocaleString('es-AR')} variant="success" />
                  <StatCard icon={Bus} label="Viajes activos" value={viajes.length} variant="accent" />
                  <StatCard icon={BookmarkCheck} label="Reservas activas" value={reservasActivas.length} variant="primary" />
                </div>
                <div className="chart-row">
                  <Card className="dashboard-chart-card">
                    <h3 className="dashboard-chart-card__title">Reservas por día (semana actual)</h3>
                    <InteractiveChart
                      options={{
                        ...chartCommonOptions,
                        chart: { ...chartCommonOptions.chart, id: 'weekly-reservations' },
                        xaxis: { categories: weekDays.map((d) => d.label), labels: { style: { colors: 'var(--text-muted)' } } },
                        yaxis: { labels: { style: { colors: 'var(--text-muted)' } } },
                        colors: ['var(--color-primary)'],
                      }}
                      series={[{ name: 'Reservas', data: weeklyReservations }]}
                      type="area"
                      height={320}
                    />
                  </Card>
                  <Card className="dashboard-chart-card">
                    <h3 className="dashboard-chart-card__title">Rutas más reservadas</h3>
                    <InteractiveChart
                      options={{
                        ...chartCommonOptions,
                        chart: { ...chartCommonOptions.chart, id: 'top-routes' },
                        xaxis: { categories: topRoutes.map((r) => r[0]), labels: { style: { colors: 'var(--text-muted)' } } },
                        yaxis: { labels: { style: { colors: 'var(--text-muted)' } } },
                        plotOptions: { bar: { borderRadius: 8 } },
                        colors: ['var(--color-accent)'],
                      }}
                      series={[{ name: 'Pasajeros', data: topRoutes.map((r) => r[1]) }]}
                      type="bar"
                      height={320}
                    />
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'viajes' && (
              <div className="animate-fade-in dashboard-tab">
                <Card className="table-card" padded={false}>
                  <WeekDayNav selected={selectedTripDate} onSelect={setSelectedTripDate} />
                  {viajesDelDia.length === 0 ? (
                    <div style={{ padding: 'var(--space-5)' }}>
                      <EmptyState
                        icon={Bus}
                        title="No hay viajes para este día"
                        description="Seleccioná otra fecha o creá un nuevo viaje desde el botón superior."
                        action={{ label: 'Nuevo viaje', onClick: () => setShowTripModal(true) }}
                      />
                    </div>
                  ) : (
                    <DashboardTable
                      headers={['Ruta', 'Fecha y hora', 'Unidad / Chofer', 'Pasajeros', 'Acciones']}
                      caption="Viajes del día seleccionado"
                    >
                      {viajesDelDia.map((v) => {
                        const vehicle = v.MedioTransporte || vehiculos.find((ve) => ve.id === v.medioTransporte_id);
                        const driver = v.UsuarioEmpresa || empleados.find((e) => e.id === v.usuarioEmpresa_id);
                        const passengerCount = v.cantPasajeros ?? v.Pasajeros?.length ?? 0;
                        return (
                          <tr key={v.id}>
                            <td>
                              <div className="dashboard-table__title">
                                {v.origenLocalidad} → {v.destinoLocalidad}
                              </div>
                              <div className="dashboard-table__text">{formatCurrency(v.precio)}</div>
                            </td>
                            <td>
                              <div className="dashboard-table__title">{formatTime(v.horarioSalida)} hs</div>
                              <div className="dashboard-table__text">{v.fechaViaje}</div>
                            </td>
                            <td>
                              <div className="dashboard-table__title">{vehicle?.nombre || 'Sin unidad'}</div>
                              <div className="dashboard-table__text">{getFullName(driver) || 'Sin chofer'}</div>
                            </td>
                            <td>
                              <Badge variant="primary">
                                {passengerCount} pasajero{passengerCount !== 1 ? 's' : ''}
                              </Badge>
                            </td>
                            <td>
                              <div className="dashboard-actions-cell">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedTrip(v);
                                    setShowPassengersModal(true);
                                    reservaService.obtenerPasajerosPorViaje(v.id).then((r) => setPassengers(r.data?.data || []));
                                  }}
                                  ariaLabel="Ver pasajeros"
                                >
                                  <Users size={16} /> Pasajeros
                                </Button>
                                <IconButton
                                  icon={Edit}
                                  label="Editar viaje"
                                  onClick={() => {
                                    setEditingTrip({
                                      id: v.id,
                                      origenLocalidad: v.origenLocalidad,
                                      destinoLocalidad: v.destinoLocalidad,
                                      fechaViaje: v.fechaViaje,
                                      horarioSalida: v.horarioSalida?.substring(0, 5) || '',
                                      precio: v.precio,
                                      medioTransporte_id: v.medioTransporte_id || v.MedioTransporte?.id || '',
                                      usuarioEmpresa_id: v.usuarioEmpresa_id || '',
                                    });
                                    setShowEditTripModal(true);
                                  }}
                                />
                                <IconButton
                                  icon={Trash2}
                                  label="Eliminar viaje"
                                  variant="danger"
                                  onClick={() => handleDeleteTrip(v.id, `${v.origenLocalidad} → ${v.destinoLocalidad}`)}
                                />
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </DashboardTable>
                  )}
                </Card>
              </div>
            )}

            {activeTab === 'reservas' && (
              <div className="animate-fade-in dashboard-tab">
                <Card className="table-card" padded={false}>
                  {reservas.length === 0 ? (
                    <EmptyState
                      icon={BookmarkCheck}
                      title="No hay reservas registradas"
                      description="Todavía no se realizaron reservas para esta empresa."
                    />
                  ) : (
                    <DashboardTable
                      headers={['Reserva / Viaje', 'Cliente', 'Pasajeros', 'Estado', 'Acciones']}
                      caption="Listado de reservas"
                    >
                      {reservas.map((res) => {
                        const cantPasajeros = res.Pasajeros?.length || res.asientos_reservados || 1;
                        const clienteNombre = res.Usuario
                          ? `${res.Usuario.nombre} ${res.Usuario.apellido}`
                          : 'Cliente';
                        const cancelada = res.eliminado === 'si';
                        return (
                          <tr key={res.id}>
                            <td>
                              <div className="dashboard-table__title">
                                #{res.id} · {res.Viaje?.origenLocalidad} → {res.Viaje?.destinoLocalidad}
                              </div>
                              <div className="dashboard-table__text">
                                {res.Viaje?.fechaViaje} · {formatTime(res.Viaje?.horarioSalida)} hs
                              </div>
                            </td>
                            <td>
                              <div className="dashboard-table__title">{clienteNombre}</div>
                              <div className="dashboard-table__text">{res.Usuario?.telefono || 'Sin teléfono'}</div>
                            </td>
                            <td>
                              <Badge variant="primary">
                                {cantPasajeros} pasajero{cantPasajeros !== 1 ? 's' : ''}
                              </Badge>
                            </td>
                            <td>
                              <Badge variant={cancelada ? 'error' : 'success'}>
                                {cancelada ? 'Cancelada' : 'Confirmada'}
                              </Badge>
                            </td>
                            <td>
                              <div className="dashboard-actions-cell">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedReserva(res);
                                    setShowReservaDetailModal(true);
                                  }}
                                  ariaLabel="Ver detalle de reserva"
                                >
                                  <BookmarkCheck size={16} /> Detalle
                                </Button>
                                {!cancelada && (
                                  <IconButton
                                    icon={Trash2}
                                    label="Cancelar reserva"
                                    variant="danger"
                                    onClick={() => handleCancelReserva(res.id)}
                                  />
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </DashboardTable>
                  )}
                </Card>
              </div>
            )}

            {activeTab === 'flota' && (
              <div className="animate-fade-in dashboard-tab">
                <Card className="table-card" padded={false}>
                  {vehiculos.length === 0 ? (
                    <EmptyState
                      icon={Truck}
                      title="No hay unidades registradas"
                      description="Agregá tu primer minibús para poder crear viajes."
                      action={{ label: 'Nueva unidad', onClick: () => setShowVehicleModal(true) }}
                    />
                  ) : (
                    <DashboardTable headers={['Unidad', 'Patente / Capacidad', 'Estado', 'Acciones']} caption="Flota de vehículos">
                      {vehiculos.map((veh) => (
                        <tr key={veh.id}>
                          <td>
                            <div className="dashboard-table__title">{veh.nombre}</div>
                            <div className="dashboard-table__text">{veh.marca}</div>
                          </td>
                          <td>
                            <div className="dashboard-table__title">{veh.patente}</div>
                            <div className="dashboard-table__text">{veh.cantLugares} asientos</div>
                          </td>
                          <td>
                            <Badge variant="success">Activo</Badge>
                          </td>
                          <td>
                            <IconButton
                              icon={Edit}
                              label="Editar unidad"
                              onClick={() => toast('Edición de unidades próximamente')}
                            />
                          </td>
                        </tr>
                      ))}
                    </DashboardTable>
                  )}
                </Card>
              </div>
            )}

            {activeTab === 'choferes' && (
              <div className="animate-fade-in dashboard-tab">
                <Card className="table-card" padded={false}>
                  {empleados.length === 0 ? (
                    <EmptyState
                      icon={Users}
                      title="No hay personal registrado"
                      description="Contratá choferes o secretarios de mostrador para tu empresa."
                      action={{ label: 'Contratar personal', onClick: () => setShowEmployeeModal(true) }}
                    />
                  ) : (
                    <DashboardTable headers={['Nombre', 'Documento', 'Rol', 'Estado', 'Acciones']} caption="Personal de la empresa">
                      {empleados.map((emp) => {
                        const perfilId = getProfileId(emp);
                        return (
                          <tr key={emp.id}>
                            <td>
                              <div className="dashboard-table__title">{getFullName(emp)}</div>
                              <div className="dashboard-table__text">{emp.Usuario?.email || emp.email || ''}</div>
                            </td>
                            <td>
                              <div className="dashboard-table__title">{emp.Usuario?.dni || emp.dni || 'S/D'}</div>
                            </td>
                            <td>
                              <Badge variant={getRoleBadgeVariant(perfilId)}>{getRoleLabel(perfilId)}</Badge>
                            </td>
                            <td>
                              <Badge variant="success">Activo</Badge>
                            </td>
                            <td>
                              <IconButton
                                icon={Edit}
                                label="Editar personal"
                                onClick={() => toast('Edición de personal próximamente')}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </DashboardTable>
                  )}
                </Card>
              </div>
            )}

            {activeTab === 'estadisticas' && (
              <div className="animate-fade-in dashboard-tab">
                <div className="stats-grid">
                  <StatCard icon={Users} label="Ocupación estimada" value={`${ocupacion}%`} variant="primary" />
                  <StatCard icon={DollarSign} label="Ingresos estimados" value={formatCurrency(totalIngresos)} />
                  <StatCard icon={Bus} label="Viajes activos" value={viajes.length} variant="accent" />
                  <StatCard icon={BookmarkCheck} label="Reservas activas" value={reservasActivas.length} variant="success" />
                </div>
                <div className="chart-row">
                  <Card className="dashboard-chart-card">
                    <h3 className="dashboard-chart-card__title">Reservas por día (semana actual)</h3>
                    <InteractiveChart
                      options={{
                        ...chartCommonOptions,
                        chart: { ...chartCommonOptions.chart, id: 'stats-weekly' },
                        xaxis: { categories: weekDays.map((d) => d.label), labels: { style: { colors: 'var(--text-muted)' } } },
                        yaxis: { labels: { style: { colors: 'var(--text-muted)' } } },
                        colors: ['var(--color-primary)'],
                      }}
                      series={[{ name: 'Reservas', data: weeklyReservations }]}
                      type="area"
                      height={320}
                    />
                  </Card>
                  <Card className="dashboard-chart-card">
                    <h3 className="dashboard-chart-card__title">Rutas más populares</h3>
                    <InteractiveChart
                      options={{
                        ...chartCommonOptions,
                        chart: { ...chartCommonOptions.chart, id: 'stats-routes' },
                        xaxis: { categories: topRoutes.map((r) => r[0]), labels: { style: { colors: 'var(--text-muted)' } } },
                        yaxis: { labels: { style: { colors: 'var(--text-muted)' } } },
                        plotOptions: { bar: { borderRadius: 8 } },
                        colors: ['var(--color-accent)'],
                      }}
                      series={[{ name: 'Pasajeros', data: topRoutes.map((r) => r[1]) }]}
                      type="bar"
                      height={320}
                    />
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'mi-empresa' && (
              <div className="animate-fade-in dashboard-tab">
                {miEmpresa ? (
                  <Card>
                    <div className="dashboard-company-header">
                      <div className="dashboard-company-logo">
                        <Building2 size={32} aria-hidden="true" />
                      </div>
                      <div>
                        <h2 className="dashboard-company-name">{miEmpresa.nombre}</h2>
                        <p className="dashboard-company-meta">CUIT: {miEmpresa.cuit || 'S/C'}</p>
                      </div>
                    </div>
                    <div className="dashboard-company-grid">
                      <div className="dashboard-company-item">
                        <MapPin size={18} aria-hidden="true" />
                        <div>
                          <span>Dirección</span>
                          <b>{miEmpresa.direccion || 'S/D'}</b>
                        </div>
                      </div>
                      <div className="dashboard-company-item">
                        <Phone size={18} aria-hidden="true" />
                        <div>
                          <span>Teléfono</span>
                          <b>{miEmpresa.telefono || 'S/D'}</b>
                        </div>
                      </div>
                      <div className="dashboard-company-item">
                        <Mail size={18} aria-hidden="true" />
                        <div>
                          <span>Email</span>
                          <b>{miEmpresa.email || 'S/D'}</b>
                        </div>
                      </div>
                      <div className="dashboard-company-item">
                        <IdCard size={18} aria-hidden="true" />
                        <div>
                          <span>Localidad</span>
                          <b>{miEmpresa.Localidad?.nombre || 'S/D'}</b>
                        </div>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <EmptyState
                    icon={Building2}
                    title="No hay datos de la empresa"
                    description="Todavía no se cargó la información de tu empresa."
                  />
                )}
              </div>
            )}

            {activeTab === 'empresas' && isOwner && (
              <div className="animate-fade-in dashboard-tab">
                <Card className="table-card" padded={false}>
                  {empresas.length === 0 ? (
                    <EmptyState
                      icon={Building2}
                      title="No hay empresas registradas"
                      description="No se encontraron otras empresas en el sistema."
                    />
                  ) : (
                    <DashboardTable headers={['Nombre', 'CUIT', 'Contacto', 'Estado']} caption="Empresas registradas">
                      {empresas.map((emp) => (
                        <tr key={emp.id}>
                          <td>
                            <div className="dashboard-table__title">{emp.nombre}</div>
                            <div className="dashboard-table__text">{emp.direccion}</div>
                          </td>
                          <td>
                            <div className="dashboard-table__title">{emp.cuit}</div>
                          </td>
                          <td>
                            <div className="dashboard-table__title">{emp.telefono}</div>
                            <div className="dashboard-table__text">{emp.email}</div>
                          </td>
                          <td>
                            <Badge variant={emp.eliminado === 'si' ? 'error' : 'success'}>
                              {emp.eliminado === 'si' ? 'Inactiva' : 'Activa'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </DashboardTable>
                  )}
                </Card>
              </div>
            )}
          </>
        )}
      </main>

      {showEmployeeModal && (
        <Modal
          title="Contratar personal"
          subtitle="Completá los datos del nuevo empleado."
          onClose={() => setShowEmployeeModal(false)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const empId = user.id_empresa || miEmpresa?.id || user.id;
                await usuarioService.registrarEmpleado({ ...nuevoEmpleado, empresa_id: empId });
                toast.success('¡Empleado contratado y registrado!');
                setShowEmployeeModal(false);
                setNuevoEmpleado({
                  nombre: '',
                  apellido: '',
                  dni: '',
                  email: '',
                  usuario: '',
                  contrasenia: '',
                  perfil_id: '',
                });
                fetchData();
              } catch (err) {
                toast.error(err.response?.data?.message || 'Error al registrar empleado');
              }
            }}
            className="dashboard-modal-form"
          >
            <div className="dashboard-form-grid">
              <InputField
                label="Nombre"
                value={nuevoEmpleado.nombre}
                onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, nombre: e.target.value })}
                required
              />
              <InputField
                label="Apellido"
                value={nuevoEmpleado.apellido}
                onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, apellido: e.target.value })}
                required
              />
              <InputField
                label="DNI"
                type="number"
                value={nuevoEmpleado.dni}
                onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, dni: e.target.value })}
                required
              />
              <InputField
                label="Email"
                type="email"
                value={nuevoEmpleado.email}
                onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, email: e.target.value })}
                required
              />
              <InputField
                label="Usuario (acceso)"
                value={nuevoEmpleado.usuario}
                placeholder="Opcional (se autogenera)"
                onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, usuario: e.target.value })}
              />
              <InputField
                label="Contraseña"
                type="password"
                value={nuevoEmpleado.contrasenia}
                placeholder="Por defecto 123456"
                onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, contrasenia: e.target.value })}
              />
              <div className="dashboard-form-grid-full">
                <SelectField
                  label="Rol"
                  value={nuevoEmpleado.perfil_id}
                  onChange={(e) => setNuevoEmpleado({ ...nuevoEmpleado, perfil_id: e.target.value })}
                  required
                  placeholder="Elegir puesto..."
                >
                  <option value="4">Chofer de unidad</option>
                  <option value="3">Secretario de mostrador</option>
                </SelectField>
              </div>
            </div>
            <div className="dashboard-modal-actions">
              <Button type="button" variant="secondary" onClick={() => setShowEmployeeModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Confirmar contratación</Button>
            </div>
          </form>
        </Modal>
      )}

      {showTripModal && (
        <Modal title="Crear nuevo viaje" subtitle="Programá un servicio y asigná unidad y chofer." onClose={() => setShowTripModal(false)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const choferId = nuevoViaje.usuarioEmpresa_id || choferes[0]?.usuarioEmpresa_id || user.id;
                const vehiculoId = nuevoViaje.medioTransporte_id || vehiculos[0]?.id;
                if (!vehiculoId) {
                  toast.error('Primero debés registrar un minibús en la flota');
                  return;
                }
                await viajeService.crear({
                  ...nuevoViaje,
                  usuarioEmpresa_id: parseInt(choferId, 10),
                  medioTransporte_id: parseInt(vehiculoId, 10),
                  precio: parseFloat(nuevoViaje.precio),
                });
                toast.success('¡Viaje creado con éxito!');
                setShowTripModal(false);
                setNuevoViaje({
                  origenLocalidad: '',
                  destinoLocalidad: '',
                  fechaViaje: '',
                  horarioSalida: '',
                  precio: '',
                  medioTransporte_id: '',
                  usuarioEmpresa_id: '',
                });
                fetchData();
              } catch (err) {
                toast.error(err.response?.data?.message || 'Error al crear el viaje');
              }
            }}
            className="dashboard-modal-form"
          >
            <div className="dashboard-form-grid">
              <InputField
                label="Origen"
                value={nuevoViaje.origenLocalidad}
                placeholder="Ej: San Roque"
                onChange={(e) => setNuevoViaje({ ...nuevoViaje, origenLocalidad: e.target.value })}
                required
              />
              <InputField
                label="Destino"
                value={nuevoViaje.destinoLocalidad}
                placeholder="Ej: Corrientes"
                onChange={(e) => setNuevoViaje({ ...nuevoViaje, destinoLocalidad: e.target.value })}
                required
              />
              <InputField
                label="Fecha"
                type="date"
                value={nuevoViaje.fechaViaje}
                onChange={(e) => setNuevoViaje({ ...nuevoViaje, fechaViaje: e.target.value })}
                required
              />
              <InputField
                label="Horario de salida"
                type="time"
                value={nuevoViaje.horarioSalida}
                onChange={(e) => setNuevoViaje({ ...nuevoViaje, horarioSalida: e.target.value })}
                required
              />
              <InputField
                label="Precio ($)"
                type="number"
                step="0.01"
                value={nuevoViaje.precio}
                placeholder="Ej: 8500"
                onChange={(e) => setNuevoViaje({ ...nuevoViaje, precio: e.target.value })}
                required
              />
              <SelectField
                label="Minibús / Vehículo"
                value={nuevoViaje.medioTransporte_id}
                onChange={(e) => setNuevoViaje({ ...nuevoViaje, medioTransporte_id: e.target.value })}
                required
                placeholder="Seleccionar unidad..."
              >
                {vehiculos.map((veh) => (
                  <option key={veh.id} value={veh.id}>
                    {veh.nombre} - {veh.patente}
                  </option>
                ))}
              </SelectField>
              <div className="dashboard-form-grid-full">
                <SelectField
                  label="Chofer asignado"
                  value={nuevoViaje.usuarioEmpresa_id}
                  onChange={(e) => setNuevoViaje({ ...nuevoViaje, usuarioEmpresa_id: e.target.value })}
                  required
                  placeholder="Seleccionar chofer..."
                >
                  {choferes.map((ch) => (
                    <option key={ch.usuarioEmpresa_id} value={ch.usuarioEmpresa_id}>
                      {getFullName(ch)}
                    </option>
                  ))}
                </SelectField>
              </div>
            </div>
            <div className="dashboard-modal-actions">
              <Button type="button" variant="secondary" onClick={() => setShowTripModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Publicar viaje</Button>
            </div>
          </form>
        </Modal>
      )}

      {showVehicleModal && (
        <Modal title="Añadir a la flota" subtitle="Registrá una nueva unidad disponible." onClose={() => setShowVehicleModal(false)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const empId = user.id_empresa || miEmpresa?.id || user.id;
                await transporteService.crear({
                  ...nuevoVehiculo,
                  empresa_id: parseInt(empId, 10),
                  cantLugares: parseInt(nuevoVehiculo.cantLugares, 10),
                });
                toast.success('¡Vehículo agregado a la flota!');
                setShowVehicleModal(false);
                setNuevoVehiculo({ nombre: '', patente: '', marca: '', cantLugares: 19 });
                fetchData();
              } catch (err) {
                toast.error(err.response?.data?.message || 'Error al agregar vehículo');
              }
            }}
            className="dashboard-modal-form"
          >
            <div className="dashboard-form-grid">
              <InputField
                label="Nombre / Unidad"
                value={nuevoVehiculo.nombre}
                placeholder="Ej: Minibús Sprinter #01"
                onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, nombre: e.target.value })}
                required
              />
              <InputField
                label="Marca / Modelo"
                value={nuevoVehiculo.marca}
                placeholder="Ej: Mercedes-Benz Sprinter"
                onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, marca: e.target.value })}
                required
              />
              <InputField
                label="Patente"
                value={nuevoVehiculo.patente}
                placeholder="Ej: AF-123-VY"
                onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, patente: e.target.value })}
                required
              />
              <InputField
                label="Capacidad de asientos"
                type="number"
                value={nuevoVehiculo.cantLugares}
                onChange={(e) => setNuevoVehiculo({ ...nuevoVehiculo, cantLugares: e.target.value })}
                required
              />
            </div>
            <div className="dashboard-modal-actions">
              <Button type="button" variant="secondary" onClick={() => setShowVehicleModal(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar vehículo</Button>
            </div>
          </form>
        </Modal>
      )}

      {showPassengersModal && selectedTrip && (
        <Modal
          title={`Pasajeros - ${selectedTrip.origenLocalidad} → ${selectedTrip.destinoLocalidad}`}
          onClose={() => setShowPassengersModal(false)}
        >
          <div className="dashboard-modal-body">
            {passengers.length === 0 ? (
              <EmptyState
                icon={Users}
                title="No hay pasajeros"
                description="Todavía no hay pasajeros anotados en este viaje."
              />
            ) : (
              <div className="dashboard-passenger-list">
                {passengers.map((p, i) => (
                  <Card key={i} className="dashboard-passenger-item" hover>
                    <div>
                      <div className="dashboard-passenger-name">
                        {p.nombre} {p.apellido}
                      </div>
                      <div className="dashboard-passenger-meta">
                        DNI: {p.dni} · Subida: {p.ubicacionOrigen || selectedTrip.origenLocalidad} → Bajada:{" "}
                        {p.ubicacionDestino || selectedTrip.destinoLocalidad}
                      </div>
                    </div>
                    <Badge variant="success">Confirmado</Badge>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}

      {showEditTripModal && (
        <Modal
          title={`Editar viaje #${editingTrip.id}`}
          subtitle="Modificá los datos del servicio o reasigná la unidad y el chofer."
          onClose={() => setShowEditTripModal(false)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                const choferId = editingTrip.usuarioEmpresa_id || choferes[0]?.usuarioEmpresa_id || user.id;
                const vehiculoId = editingTrip.medioTransporte_id || vehiculos[0]?.id;
                await viajeService.actualizar(editingTrip.id, {
                  ...editingTrip,
                  usuarioEmpresa_id: parseInt(choferId, 10),
                  medioTransporte_id: parseInt(vehiculoId, 10),
                  precio: parseFloat(editingTrip.precio),
                });
                toast.success('¡Viaje actualizado correctamente!');
                setShowEditTripModal(false);
                fetchData();
              } catch (err) {
                toast.error(err.response?.data?.message || 'Error al actualizar el viaje');
              }
            }}
            className="dashboard-modal-form"
          >
            <div className="dashboard-form-grid">
              <InputField
                label="Origen"
                value={editingTrip.origenLocalidad}
                onChange={(e) => setEditingTrip({ ...editingTrip, origenLocalidad: e.target.value })}
                required
              />
              <InputField
                label="Destino"
                value={editingTrip.destinoLocalidad}
                onChange={(e) => setEditingTrip({ ...editingTrip, destinoLocalidad: e.target.value })}
                required
              />
              <InputField
                label="Fecha"
                type="date"
                value={editingTrip.fechaViaje}
                onChange={(e) => setEditingTrip({ ...editingTrip, fechaViaje: e.target.value })}
                required
              />
              <InputField
                label="Horario de salida"
                type="time"
                value={editingTrip.horarioSalida}
                onChange={(e) => setEditingTrip({ ...editingTrip, horarioSalida: e.target.value })}
                required
              />
              <InputField
                label="Precio ($)"
                type="number"
                step="0.01"
                value={editingTrip.precio}
                onChange={(e) => setEditingTrip({ ...editingTrip, precio: e.target.value })}
                required
              />
              <SelectField
                label="Minibús / Vehículo"
                value={editingTrip.medioTransporte_id}
                onChange={(e) => setEditingTrip({ ...editingTrip, medioTransporte_id: e.target.value })}
                required
                placeholder="Seleccionar unidad..."
              >
                {vehiculos.map((veh) => (
                  <option key={veh.id} value={veh.id}>
                    {veh.nombre} - {veh.patente}
                  </option>
                ))}
              </SelectField>
              <div className="dashboard-form-grid-full">
                <SelectField
                  label="Chofer asignado"
                  value={editingTrip.usuarioEmpresa_id}
                  onChange={(e) => setEditingTrip({ ...editingTrip, usuarioEmpresa_id: e.target.value })}
                  required
                  placeholder="Seleccionar chofer..."
                >
                  {choferes.map((ch) => (
                    <option key={ch.usuarioEmpresa_id} value={ch.usuarioEmpresa_id}>
                      {getFullName(ch)}
                    </option>
                  ))}
                </SelectField>
              </div>
            </div>
            <div className="dashboard-modal-actions dashboard-modal-actions--split">
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  if (!window.confirm('¿Seguro que deseas eliminar este viaje? Esta acción no se puede deshacer.')) return;
                  try {
                    await viajeService.eliminar(editingTrip.id);
                    toast.success('Viaje eliminado con éxito');
                    setShowEditTripModal(false);
                    fetchData();
                  } catch (err) {
                    toast.error(err.response?.data?.message || 'No se puede eliminar el viaje porque tiene reservas asociadas.');
                  }
                }}
              >
                <Trash2 size={18} /> Eliminar viaje
              </Button>
              <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
                <Button type="button" variant="secondary" onClick={() => setShowEditTripModal(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Guardar cambios</Button>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {showReservaDetailModal && selectedReserva && (
        <Modal
          title={`Reserva #${selectedReserva.id}`}
          subtitle="Detalle completo del viaje y pasajeros."
          onClose={() => setShowReservaDetailModal(false)}
          className="dashboard-modal-card--wide"
        >
          <div className="dashboard-modal-body">
            <div className="dashboard-reservation-detail">
              <Card padded>
                <div className="dashboard-reservation-route">
                  <div className="dashboard-reservation-route-header">
                    <div className="dashboard-reservation-route-title">
                      <span>{selectedReserva.Viaje?.origenLocalidad}</span>
                      <ArrowRight size={18} aria-hidden="true" />
                      <span>{selectedReserva.Viaje?.destinoLocalidad}</span>
                    </div>
                    <Badge variant={selectedReserva.eliminado === 'si' ? 'error' : 'success'}>
                      {selectedReserva.eliminado === 'si' ? 'Cancelada' : 'Confirmada'}
                    </Badge>
                  </div>
                  <div className="dashboard-reservation-grid">
                    <div>
                      <span className="dashboard-detail-label">Fecha y hora</span>
                      <b>
                        {selectedReserva.Viaje?.fechaViaje} · {formatTime(selectedReserva.Viaje?.horarioSalida)} hs
                      </b>
                    </div>
                    <div>
                      <span className="dashboard-detail-label">Unidad asignada</span>
                      <b>
                        {selectedReserva.Viaje?.MedioTransporte?.nombre || 'Minibús'} ({selectedReserva.Viaje?.MedioTransporte?.patente || 'S/P'})
                      </b>
                    </div>
                    <div>
                      <span className="dashboard-detail-label">Tarifa unitaria</span>
                      <b className="dashboard-detail-price">{formatCurrency(selectedReserva.Viaje?.precio)}</b>
                    </div>
                  </div>
                </div>
              </Card>

              <h3 className="dashboard-detail-section-title">Datos del titular</h3>
              <Card padded>
                <div className="dashboard-reservation-grid">
                  <div>
                    <span className="dashboard-detail-label">Cliente</span>
                    <b>
                      {selectedReserva.Usuario?.nombre} {selectedReserva.Usuario?.apellido}
                    </b>
                  </div>
                  <div>
                    <span className="dashboard-detail-label">DNI</span>
                    <b>{selectedReserva.Usuario?.dni || 'S/D'}</b>
                  </div>
                  <div>
                    <span className="dashboard-detail-label">Contacto</span>
                    <b>{selectedReserva.Usuario?.telefono || 'Sin teléfono'}</b>
                    <span className="dashboard-detail-sublabel">{selectedReserva.Usuario?.email}</span>
                  </div>
                </div>
              </Card>

              <h3 className="dashboard-detail-section-title">
                Pasajeros registrados ({selectedReserva.Pasajeros?.length || 0})
              </h3>
              {!selectedReserva.Pasajeros || selectedReserva.Pasajeros.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Sin pasajeros detallados"
                  description="No hay detalle individual de pasajeros cargado en esta reserva."
                />
              ) : (
                <div className="dashboard-passenger-list">
                  {selectedReserva.Pasajeros.map((pasajero, idx) => (
                    <Card key={pasajero.id || idx} className="dashboard-passenger-item" hover>
                      <div className="dashboard-passenger-main">
                        <div className="dashboard-passenger-avatar">{idx + 1}</div>
                        <div>
                          <div className="dashboard-passenger-name">
                            {pasajero.nombre} {pasajero.apellido}
                          </div>
                          <div className="dashboard-passenger-meta">DNI: {pasajero.dni}</div>
                        </div>
                      </div>
                      <div className="dashboard-passenger-stops">
                        <span>Sube: {pasajero.ubicacionOrigen || selectedReserva.Viaje?.origenLocalidad}</span>
                        <span>Baja: {pasajero.ubicacionDestino || selectedReserva.Viaje?.destinoLocalidad}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              <div className="dashboard-modal-actions">
                <Button onClick={() => setShowReservaDetailModal(false)}>Cerrar detalle</Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DashboardPage;
