import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { User, Mail, Phone, CreditCard, Lock, Loader2, Sparkles, ArrowLeft, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({ nombre: '', apellido: '', dni: '', telefono: '', email: '', usuario: '', contrasenia: '' });
  const [loading, setLoading] = useState(false);
  const [passRequirements, setPassRequirements] = useState({
    length: false,
    upper: false,
    lower: false,
    number: false,
    special: false
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === 'contrasenia') {
      setPassRequirements({
        length: value.length >= 8 && value.length <= 12,
        upper: /[A-Z]/.test(value),
        lower: /[a-z]/.test(value),
        number: /[0-9]/.test(value),
        special: /[@$!%*?#_.&]/.test(value)
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!Object.values(passRequirements).every(v => v)) {
      toast.error('La contraseña no cumple con los requisitos');
      return;
    }

    setLoading(true);
    const cleanedData = {
      ...formData,
      dni: parseInt(formData.dni.toString().replace(/\D/g, '')),
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

  const Requirement = ({ met, text }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: met ? '#10b981' : '#94a3b8', fontSize: '0.75rem', fontWeight: '600', transition: '0.3s' }}>
      {met ? <Check size={14} strokeWidth={3} /> : <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid #e2e8f0' }} />}
      <span>{text}</span>
    </div>
  );

  return (
    <div style={pageContainer}>
      <Link to="/login" style={backBtn}><ArrowLeft size={18} /> Volver</Link>
      <div className="animate-fade-in" style={registerCard}>
        <div style={headerSection}>
          <div style={logoCircle}><Sparkles size={24} color="white" /></div>
          <h2 style={titleStyle}>Únete a V&V</h2>
          <p style={subtitleStyle}>Tu seguridad es nuestra prioridad.</p>
        </div>

        <form onSubmit={handleSubmit} style={formStyle}>
          <div style={formGrid}>
            <div style={inputGroup}><label style={labelStyle}>Nombre</label><div style={inputWrapper}><User size={18} color="var(--primary)"/><input type="text" name="nombre" placeholder="Juan" onChange={handleChange} style={inputStyle} required /></div></div>
            <div style={inputGroup}><label style={labelStyle}>Apellido</label><div style={inputWrapper}><User size={18} color="var(--primary)"/><input type="text" name="apellido" placeholder="Pérez" onChange={handleChange} style={inputStyle} required /></div></div>
            <div style={inputGroup}><label style={labelStyle}>DNI</label><div style={inputWrapper}><CreditCard size={18} color="var(--primary)"/><input type="text" name="dni" placeholder="Solo números" onChange={handleChange} style={inputStyle} required /></div></div>
            <div style={inputGroup}><label style={labelStyle}>Teléfono</label><div style={inputWrapper}><Phone size={18} color="var(--primary)"/><input type="tel" name="telefono" placeholder="Ej: 3794..." onChange={handleChange} style={inputStyle} required /></div></div>
            <div style={{...inputGroup, gridColumn: 'span 2'}}><label style={labelStyle}>Correo Electrónico</label><div style={inputWrapper}><Mail size={18} color="var(--primary)"/><input type="email" name="email" placeholder="juan@ejemplo.com" onChange={handleChange} style={inputStyle} required /></div></div>
            <div style={inputGroup}><label style={labelStyle}>Usuario</label><div style={inputWrapper}><User size={18} color="var(--primary)"/><input type="text" name="usuario" placeholder="juanperez" onChange={handleChange} style={inputStyle} required /></div></div>
            <div style={inputGroup}>
              <label style={labelStyle}>Contraseña</label>
              <div style={inputWrapper}>
                <Lock size={18} color="var(--primary)"/><input type="password" name="contrasenia" placeholder="••••••••" onChange={handleChange} style={inputStyle} required />
              </div>
            </div>
          </div>
          
          <div style={passValidatorBox}>
            <div style={{ marginBottom: '10px', fontWeight: '800', fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-dark)' }}>Seguridad de contraseña</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <Requirement met={passRequirements.length} text="8-12 caracteres" />
              <Requirement met={passRequirements.upper} text="Una Mayúscula" />
              <Requirement met={passRequirements.lower} text="Una Minúscula" />
              <Requirement met={passRequirements.number} text="Un Número" />
              <Requirement met={passRequirements.special} text="Un Símbolo (@.$!)" />
            </div>
          </div>

          <button type="submit" disabled={loading} style={buttonStyle}>
            {loading ? <Loader2 className="animate-spin" size={22} /> : 'Crear mi cuenta gratuita'}
          </button>
        </form>

        <p style={footerText}>
          ¿Ya eres parte? <Link to="/login" style={loginLink}>Inicia sesión</Link>
        </p>
      </div>
    </div>
  );
};

// Estilos Premium
const pageContainer = { display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: 'radial-gradient(circle at 90% 10%, rgba(37, 99, 235, 0.05) 0%, rgba(255, 255, 255, 1) 90%)', padding: '40px 20px' };
const backBtn = { position: 'absolute', top: '40px', left: '40px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', textDecoration: 'none', fontWeight: '700', fontSize: '0.9rem' };
const registerCard = { background: 'white', padding: '50px 40px', borderRadius: '32px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)', width: '100%', maxWidth: '650px', border: '1px solid #f1f5f9' };
const headerSection = { textAlign: 'center', marginBottom: '40px' };
const logoCircle = { width: '50px', height: '50px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.4)' };
const titleStyle = { fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '-1px', fontFamily: 'Outfit, sans-serif' };
const subtitleStyle = { color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: '500' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '25px' };
const formGrid = { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' };
const inputGroup = { display: 'flex', flexDirection: 'column', gap: '8px' };
const labelStyle = { fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-dark)', textTransform: 'uppercase', letterSpacing: '0.5px' };
const inputWrapper = { display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 18px', background: '#f8fafc', borderRadius: '16px', border: '2px solid transparent', transition: '0.3s ease' };
const inputStyle = { border: 'none', background: 'transparent', width: '100%', outline: 'none', fontSize: '0.95rem', fontWeight: '600' };
const buttonStyle = { background: 'var(--primary)', color: 'white', padding: '16px', borderRadius: '16px', fontWeight: '800', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 10px 20px -5px rgba(37, 99, 235, 0.3)', marginTop: '10px' };
const passValidatorBox = { background: '#f8fafc', padding: '20px', borderRadius: '20px', border: '1px solid #e2e8f0' };
const footerText = { textAlign: 'center', fontSize: '0.95rem', fontWeight: '600', color: 'var(--text-muted)', marginTop: '30px' };
const loginLink = { color: 'var(--primary)', fontWeight: '800', textDecoration: 'none', marginLeft: '5px' };

export default RegisterPage;
