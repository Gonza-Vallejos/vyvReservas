import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';
import { Lock, User as UserIcon, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
  const [usuario, setUsuario] = useState('');
  const [contrasenia, setContrasenia] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await authService.login(usuario, contrasenia);
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
    } catch (error) {
      toast.error('Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageContainer}>
      <div className="animate-fade-in" style={loginCard}>
        <div style={headerSection}>
          <div style={logoCircle}><Lock size={24} color="white" /></div>
          <h2 style={titleStyle}>Hola de nuevo</h2>
          <p style={subtitleStyle}>Gestiona tus viajes y reservas con facilidad.</p>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={inputGroup}>
            <label style={labelStyle}>Usuario</label>
            <div style={inputWrapper} className="input-focus">
              <UserIcon size={18} color="var(--primary)" />
              <input 
                type="text" 
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Ej: gonzalo123" 
                style={inputStyle} 
                required
              />
            </div>
          </div>

          <div style={inputGroup}>
            <label style={labelStyle}>Contraseña</label>
            <div style={inputWrapper}>
              <Lock size={18} color="var(--primary)" />
              <input 
                type="password" 
                value={contrasenia}
                onChange={(e) => setContrasenia(e.target.value)}
                placeholder="••••••••" 
                style={inputStyle} 
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? <Loader2 className="animate-spin" size={22} /> : (
              <>Ingresar a mi cuenta <ArrowRight size={20} /></>
            )}
          </button>
        </form>

        <div style={dividerContainer}>
          <div style={dividerLine} />
          <span style={dividerText}>o</span>
          <div style={dividerLine} />
        </div>

        <p style={footerText}>
          ¿Eres nuevo por aquí? <Link to="/register" style={registerLink}>Crea una cuenta gratis</Link>
        </p>
      </div>
    </div>
  );
};

// Estilos Premium
const pageContainer = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', background: 'radial-gradient(circle at 10% 20%, rgba(37, 99, 235, 0.05) 0%, rgba(255, 255, 255, 1) 90%)', padding: '20px' };
const loginCard = { background: 'white', padding: '50px 40px', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '440px', border: '1px solid #f1f5f9' };
const headerSection = { textAlign: 'center', marginBottom: '40px' };
const logoCircle = { width: '50px', height: '50px', background: 'var(--primary)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)' };
const titleStyle = { fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '-1px', fontFamily: 'Outfit, sans-serif' };
const subtitleStyle = { color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '22px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px' };
const inputWrapper = { display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 18px', background: '#f8fafc', borderRadius: '16px', border: '2px solid transparent', transition: '0.3s ease' };
const inputStyle = { border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '1rem', fontWeight: '600' };
const buttonStyle = { background: 'var(--primary)', color: 'white', padding: '16px', borderRadius: '16px', fontWeight: '800', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.3)', marginTop: '10px' };

const dividerContainer = { display: 'flex', alignItems: 'center', gap: '15px', margin: '30px 0', opacity: '0.5' };
const dividerLine = { height: '1px', flex: 1, background: '#e2e8f0' };
const dividerText = { fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase' };

const footerText = { textAlign: 'center', fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-muted)' };
const registerLink = { color: 'var(--primary)', fontWeight: '800', textDecoration: 'none', marginLeft: '5px' };

export default LoginPage;
