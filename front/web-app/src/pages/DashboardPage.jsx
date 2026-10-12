import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Bus, Users, TrendingUp, Plus, Edit, Trash2, X, ChevronRight, 
  UserCheck, Truck, Building2, Settings, DollarSign, UserPlus, ShieldCheck, PieChart as PieIcon
} from 'lucide-react';
import { viajeService, transporteService, empresaService, reservaService, usuarioService } from '../services/api';
import InteractiveChart from '../components/InteractiveChart';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('resumen');
  const [loading, setLoading] = useState(true);
  
  // Estados de datos
  const [viajes, setViajes] = useState([]);
  const [vehiculos, setVehiculos] = useState([]);
  const [choferes, setChoferes] = useState([]);
  const [localidades, setLocalidades] = useState([]);
  const [empresas, setEmpresas] = useState([]);
  const [miEmpresa, setMiEmpresa] = useState(null);

  // Estados de modales
  const [showTripModal, setShowTripModal] = useState(false);
  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showPassengersModal, setShowPassengersModal] = useState(false);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [passengers, setPassengers] = useState([]);

  // Estados de formularios
  const [nuevoViaje, setNuevoViaje] = useState({ origenLocalidad: '', destinoLocalidad: '', fechaViaje: '', horarioSalida: '', precio: '', medioTransporte_id: '', usuarioEmpresa_id: '' });
  const [nuevoVehiculo, setNuevoVehiculo] = useState({ nombre: '', patente: '', marca: '', cantLugares: 19 });
  const [nuevoEmpleado, setNuevoEmpleado] = useState({ nombre: '', apellido: '', dni: '', email: '', usuario: '', contrasenia: '', perfil_id: '' });

  const isOwner = user?.perfil_id === 5 || user?.perfil_id === 1;
  const isSecretary = user?.perfil_id === 3;

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const empresaId = user.id_empresa || user.id;
      const [vResponse, lResponse, tResponse, cResponse, eResponse] = await Promise.all([
        viajeService.obtenerPorEmpresa(empresaId),
        viajeService.obtenerLocalidades(),
        transporteService.obtenerPorEmpresa(empresaId),
        empresaService.obtenerUsuarios(empresaId),
        empresaService.listarTodas()
      ]);
      setViajes(vResponse.data.data || []);
      setLocalidades(lResponse.data.data || []);
      setVehiculos(tResponse.data.data || []);
      setEmpresas(eResponse.data.data || []);
      setMiEmpresa(eResponse.data.data?.find(e => e.id === empresaId) || null);
      const todosLosUsuarios = cResponse.data.data || [];
      setChoferes(todosLosUsuarios.filter(u => u.Usuario?.perfil_id === 4 || u.perfil_id === 4));
    } catch (error) { toast.error('Error al cargar datos'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (!user || (user.perfil_id !== 1 && user.perfil_id !== 5 && user.perfil_id !== 3)) {
      navigate('/');
      return;
    }
    fetchData();
  }, [user, navigate]);

  const SidebarItem = ({ id, icon: Icon, label }) => (
    <div 
      onClick={() => setActiveTab(id)} 
      style={{ 
        ...sidebarItemStyle, 
        backgroundColor: activeTab === id ? 'var(--primary)' : 'transparent', 
        color: activeTab === id ? 'white' : 'var(--text-muted)',
        boxShadow: activeTab === id ? '0 10px 15px -3px rgba(37, 99, 235, 0.2)' : 'none'
      }}
    >
      <Icon size={20} /> <span style={{ fontWeight: '700' }}>{label}</span>
    </div>
  );

  return (
    <div style={dashboardContainer}>
      <aside className="glass-effect" style={sidebarStyle}>
        <div style={{ padding: '30px 20px', marginBottom: '10px' }}>
          <h3 style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-1px' }} className="brand">V&V ADMIN</h3>
          <p style={{ fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Sistema de Gestión</p>
        </div>
        <div style={{ padding: '0 10px' }}>
          <SidebarItem id="resumen" icon={LayoutDashboard} label="Resumen" />
          <SidebarItem id="viajes" icon={Bus} label="Viajes" />
          <SidebarItem id="flota" icon={Truck} label="Mi Flota" />
          <SidebarItem id="choferes" icon={Users} label="Personal" />
          {isOwner && <SidebarItem id="estadisticas" icon={TrendingUp} label="Estadísticas" />}
        </div>
        <div style={{ marginTop: 'auto', padding: '20px 10px', borderTop: '1px solid #f1f5f9' }}>
          <SidebarItem id="mi-empresa" icon={Building2} label="Mi Empresa" />
          {isOwner && <SidebarItem id="empresas" icon={Settings} label="Configuración" />}
        </div>
      </aside>

      <main style={mainContentStyle}>
        <header style={headerStyle}>
          <div className="animate-fade-in">
            <h1 style={{ fontSize: '2.2rem', fontWeight: '900', letterSpacing: '-1px' }}>{activeTab.toUpperCase()}</h1>
            <div style={roleBadge}>
              <ShieldCheck size={14} /> 
              <span>{isOwner ? 'Dueño de Empresa' : 'Operador Mostrador'}</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }} className="animate-fade-in">
            {isOwner && <button style={primaryBtn} onClick={() => setShowEmployeeModal(true)}><UserPlus size={20} /> Contratar</button>}
            {isSecretary && (
              <>
                <button style={primaryBtn} onClick={() => setShowTripModal(true)}><Plus size={20} /> Nuevo Viaje</button>
                <button style={secondaryBtn} onClick={() => setShowVehicleModal(true)}><Truck size={20} /> Flota</button>
              </>
            )}
          </div>
        </header>

        {activeTab === 'resumen' && (
          <div className="animate-fade-in">
            <div style={statsGrid}>
              <div style={statCard}><div style={statIcon}><DollarSign color="var(--primary)" /></div><div><p style={statLabel}>Ingresos</p><h4 style={statValue}>$128.400</h4></div></div>
              <div style={{...statCard, background: 'linear-gradient(135deg, #2563eb, #1e3a8a)', color: 'white'}}><div style={{...statIcon, background: 'rgba(255,255,255,0.2)'}}><UserCheck color="white" /></div><div><p style={{...statLabel, color: 'rgba(255,255,255,0.7)'}}>Pasajeros</p><h4 style={statValue}>482</h4></div></div>
              <div style={statCard}><div style={statIcon}><Bus color="var(--primary)" /></div><div><p style={statLabel}>Viajes Activos</p><h4 style={statValue}>{viajes.length}</h4></div></div>
            </div>
            
            <div style={chartRow}>
              <div style={chartContainer}><InteractiveChart options={{ chart:{id:'sales'}, title:{text:'Rendimiento Semanal', style:{fontSize:'16px', fontWeight:'800', fontFamily:'Outfit'}}} } series={[{name:'Ventas', data:[30,45,32,70,55,80,95]}]} type="area" /></div>
              <div style={chartContainer}><InteractiveChart options={{ chart:{id:'routes'}, plotOptions:{bar:{borderRadius:10}}, title:{text:'Rutas Populares', style:{fontWeight:'800', fontFamily:'Outfit'}}} } series={[{name:'Reservas', data:[55,42,30]}]} type="bar" /></div>
            </div>
          </div>
        )}

        {/* Tablas Modernizadas */}
        {(activeTab === 'viajes' || activeTab === 'flota' || activeTab === 'choferes') && (
          <div className="animate-fade-in" style={tableWrapper}>
            <table style={tableStyle}>
              <thead><tr style={thRow}><th style={thStyle}>Detalle</th><th style={thStyle}>Estado / Info</th><th style={thStyle}>Acciones</th></tr></thead>
              <tbody>
                {activeTab === 'viajes' && viajes.map(v => (
                  <tr key={v.id} className="table-row" style={trStyle}>
                    <td style={tdStyle}><div><b style={{fontSize:'1.1rem'}}>{v.origenLocalidad} → {v.destinoLocalidad}</b><p style={{fontSize:'0.8rem', color:'var(--text-muted)'}}>{v.fechaViaje} • {v.horarioSalida}hs</p></div></td>
                    <td style={tdStyle}><button onClick={() => { setSelectedTrip(v); setShowPassengersModal(true); reservaService.obtenerPasajerosPorViaje(v.id).then(r => setPassengers(r.data.data)); }} style={passengerBadge}><Users size={14} /> Ver Pasajeros</button></td>
                    <td style={tdStyle}><button style={iconBtn}><Edit size={18}/></button></td>
                  </tr>
                ))}
                {activeTab === 'flota' && vehiculos.map(veh => (
                  <tr key={veh.id} className="table-row" style={trStyle}>
                    <td style={tdStyle}><b>{veh.nombre}</b><p style={{fontSize:'0.8rem'}}>{veh.marca}</p></td>
                    <td style={tdStyle}><span style={statusBadge}>{veh.patente}</span></td>
                    <td style={tdStyle}><button style={iconBtn}><Edit size={18}/></button></td>
                  </tr>
                ))}
                {activeTab === 'choferes' && choferes.map(ch => (
                  <tr key={ch.id} className="table-row" style={trStyle}>
                    <td style={tdStyle}><b>{ch.Usuario?.nombre || ch.nombre} {ch.Usuario?.apellido || ch.apellido}</b></td>
                    <td style={tdStyle}><span style={{...statusBadge, background:'#dcfce7', color:'#166534'}}>Activo</span></td>
                    <td style={tdStyle}><button style={iconBtn}><Edit size={18}/></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* Reutilización de Modales con Estilo Moderno */}
      {showEmployeeModal && (
        <div style={modalOverlay} className="animate-fade-in">
          <div style={modalContent}>
            <div style={modalHeader}><h2 style={{fontWeight:'900', fontSize:'1.8rem'}}>Contratar Staff</h2><button onClick={() => setShowEmployeeModal(false)} style={closeBtn}><X /></button></div>
            <form onSubmit={async (e) => { e.preventDefault(); try { await usuarioService.registrarEmpleado({ ...nuevoEmpleado, empresa_id: user.id_empresa || user.id }); toast.success('Empleado contratado'); setShowEmployeeModal(false); fetchData(); } catch(e){toast.error('Error')} }} style={modalForm}>
              <div style={formGrid}>
                <div style={field}><label style={label}>Nombre</label><input style={input} onChange={e => setNuevoEmpleado({...nuevoEmpleado, nombre: e.target.value})} required /></div>
                <div style={field}><label style={label}>Apellido</label><input style={input} onChange={e => setNuevoEmpleado({...nuevoEmpleado, apellido: e.target.value})} required /></div>
                <div style={field}><label style={label}>DNI</label><input style={input} onChange={e => setNuevoEmpleado({...nuevoEmpleado, dni: e.target.value})} required /></div>
                <div style={field}><label style={label}>Email</label><input type="email" style={input} onChange={e => setNuevoEmpleado({...nuevoEmpleado, email: e.target.value})} required /></div>
                <div style={{...field, gridColumn:'span 2'}}><label style={label}>Rol</label><select style={input} onChange={e => setNuevoEmpleado({...nuevoEmpleado, perfil_id: e.target.value})} required><option value="">Elegir puesto...</option><option value="4">Chofer de Unidad</option><option value="3">Secretario de Mostrador</option></select></div>
              </div>
              <div style={modalActions}><button type="submit" style={primaryBtn}>Confirmar Contratación</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// Estilos de Nueva Generación
const dashboardContainer = { display: 'flex', minHeight: '100vh', background: '#f8fafc' };
const sidebarStyle = { width: '280px', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh' };
const sidebarItemStyle = { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 20px', borderRadius: '16px', cursor: 'pointer', marginBottom: '8px', transition: '0.3s ease', margin: '0 10px' };
const mainContentStyle = { flex: 1, padding: '50px', overflowY: 'auto' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '50px' };
const roleBadge = { display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', padding: '4px 12px', borderRadius: '50px', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', marginTop: '8px' };
const primaryBtn = { background: 'var(--primary)', color: 'white', padding: '14px 28px', borderRadius: '16px', fontWeight: '800', border: 'none', display: 'flex', alignItems: 'center', gap: '10px', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' };
const secondaryBtn = { background: '#1e293b', color: 'white', padding: '14px 28px', borderRadius: '16px', fontWeight: '800', border: 'none', display: 'flex', alignItems: 'center', gap: '10px' };

const statsGrid = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '25px', marginBottom: '40px' };
const statCard = { background: 'white', padding: '30px', borderRadius: '32px', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid #f1f5f9' };
const statIcon = { width: '50px', height: '50px', borderRadius: '14px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const statValue = { fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px', fontFamily: 'Outfit' };
const statLabel = { fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' };

const chartRow = { display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '25px' };
const chartContainer = { background: 'white', padding: '30px', borderRadius: '32px', boxShadow: 'var(--shadow-md)', border: '1px solid #f1f5f9' };

const tableWrapper = { background: 'white', borderRadius: '32px', boxShadow: 'var(--shadow-md)', overflow: 'hidden', border: '1px solid #f1f5f9' };
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const thRow = { background: '#f8fafc', borderBottom: '1px solid #f1f5f9' };
const thStyle = { padding: '20px 30px', textAlign: 'left', fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' };
const tdStyle = { padding: '25px 30px', borderBottom: '1px solid #f8fafc' };
const trStyle = { transition: '0.2s' };
const iconBtn = { background: '#f1f5f9', border: 'none', padding: '10px', borderRadius: '12px', color: 'var(--primary)' };
const statusBadge = { background: '#f1f5f9', padding: '6px 14px', borderRadius: '100px', fontSize: '0.8rem', fontWeight: '800' };
const passengerBadge = { background: '#dcfce7', color: '#166534', padding: '8px 16px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: '800', border: 'none', display: 'flex', alignItems: 'center', gap: '8px' };

const modalOverlay = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 3000 };
const modalContent = { background: 'white', borderRadius: '40px', width: '100%', maxWidth: '700px', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.25)' };
const modalHeader = { padding: '40px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const closeBtn = { background: '#f1f5f9', border: 'none', padding: '10px', borderRadius: '50%' };
const modalForm = { padding: '40px' };
const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' };
const field = { display: 'flex', flexDirection: 'column', gap: '10px' };
const label = { fontSize: '0.8rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)' };
const input = { padding: '15px 20px', borderRadius: '16px', border: '1px solid #e2e8f0', background: '#f8fafc', fontSize: '1rem', fontWeight: '600' };
const modalActions = { marginTop: '40px', display: 'flex', justifyContent: 'flex-end' };

export default DashboardPage;
