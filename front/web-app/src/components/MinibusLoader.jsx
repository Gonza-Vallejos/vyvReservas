import React, { useEffect, useState } from 'react';

const MinibusLoader = ({ onFinish }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Después de 1.8 segundos comienza la salida suave
    const timer = setTimeout(() => {
      setExiting(true);
    }, 1800);

    // Al completar la transición (2.2s total), desmonta el loader
    const finishTimer = setTimeout(() => {
      if (onFinish) onFinish();
    }, 2200);

    return () => {
      clearTimeout(timer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      style={{
        ...overlayStyle,
        opacity: exiting ? 0 : 1,
        visibility: exiting ? 'hidden' : 'visible',
        transition: 'opacity 0.4s ease, visibility 0.4s ease',
      }}
    >
      <div style={contentWrapper}>
        {/* Pista / Camino con animación */}
        <div style={sceneContainer}>
          {/* Nubes de humo / velocidad */}
          <div className="speed-lines" />

          {/* Ilustración SVG moderna del Minibús */}
          <div className="minibus-vehicle">
            <svg
              width="150"
              height="75"
              viewBox="0 0 150 75"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
                <linearGradient id="windowGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#dbeafe" />
                  <stop offset="100%" stopColor="#93c5fd" />
                </linearGradient>
              </defs>

              {/* Chasis principal del minibús */}
              <path
                d="M10 52H140C142 52 144 50 144 47V32C144 26 139 21 133 21H38C30 21 20 28 15 35L8 44C7 46 7 49 9 51C9.5 51.7 10.2 52 10 52Z"
                fill="url(#bodyGrad)"
              />

              {/* Franja de velocidad lateral en acento ámbar */}
              <path
                d="M18 42H143V45H16L18 42Z"
                fill="#f59e0b"
              />

              {/* Ventanas modernas con reflejo */}
              {/* Parabrisas frontal */}
              <path
                d="M18 35L26 25H38V37H16L18 35Z"
                fill="url(#windowGrad)"
              />
              {/* Ventana pasajero 1 */}
              <rect x="43" y="25" width="22" height="12" rx="3" fill="url(#windowGrad)" />
              {/* Ventana pasajero 2 */}
              <rect x="70" y="25" width="22" height="12" rx="3" fill="url(#windowGrad)" />
              {/* Ventana pasajero 3 */}
              <rect x="97" y="25" width="22" height="12" rx="3" fill="url(#windowGrad)" />
              {/* Ventana trasera */}
              <rect x="124" y="25" width="14" height="12" rx="3" fill="url(#windowGrad)" />

              {/* Luces delanteras (proyector LED) */}
              <path
                d="M7 45L1 47L7 49V45Z"
                fill="#fef08a"
              />
              <circle cx="9" cy="47" r="2.5" fill="#fef08a" />

              {/* Luz trasera */}
              <rect x="142" y="38" width="3" height="7" rx="1.5" fill="#ef4444" />

              {/* Ruedas con animación de giro y llantas */}
              {/* Rueda delantera */}
              <g className="wheel-spin" style={{ transformOrigin: '36px 54px' }}>
                <circle cx="36" cy="54" r="13" fill="#1e293b" />
                <circle cx="36" cy="54" r="8" fill="#94a3b8" />
                <circle cx="36" cy="54" r="3.5" fill="#0f172a" />
                <line x1="36" y1="46" x2="36" y2="62" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="28" y1="54" x2="44" y2="54" stroke="#cbd5e1" strokeWidth="1.5" />
              </g>

              {/* Rueda trasera */}
              <g className="wheel-spin" style={{ transformOrigin: '115px 54px' }}>
                <circle cx="115" cy="54" r="13" fill="#1e293b" />
                <circle cx="115" cy="54" r="8" fill="#94a3b8" />
                <circle cx="115" cy="54" r="3.5" fill="#0f172a" />
                <line x1="115" y1="46" x2="115" y2="62" stroke="#cbd5e1" strokeWidth="1.5" />
                <line x1="107" y1="54" x2="123" y2="54" stroke="#cbd5e1" strokeWidth="1.5" />
              </g>

              {/* Sombra suave debajo del minibús */}
              <ellipse cx="75" cy="69" rx="60" ry="3.5" fill="rgba(15, 23, 42, 0.2)" />
            </svg>
          </div>

          {/* Línea de asfalto / carretera */}
          <div className="road-line" />
        </div>

        {/* Marca y texto de carga */}
        <div style={brandBox}>
          <h2 style={brandTitle}>
            V&V <span style={{ color: 'var(--accent)' }}>Reservas</span>
          </h2>
          <p style={brandSubtitle}>Preparando tu próximo viaje...</p>
        </div>
      </div>

      <style>{`
        /* Animación del minibús: acelera y avanza hacia la derecha */
        .minibus-vehicle {
          animation: driveAccelerate 1.8s cubic-bezier(0.25, 1, 0.5, 1) forwards;
          will-change: transform;
        }

        @keyframes driveAccelerate {
          0% {
            transform: translateX(-140px) scale(0.9);
            opacity: 0;
          }
          25% {
            transform: translateX(-20px) scale(1);
            opacity: 1;
          }
          60% {
            transform: translateX(10px) translateY(-2px);
          }
          75% {
            transform: translateX(25px) translateY(1px);
          }
          100% {
            transform: translateX(220px) scale(1.05);
            opacity: 0;
          }
        }

        /* Giro ultra rápido de las ruedas */
        .wheel-spin {
          animation: spinWheels 0.3s linear infinite;
        }

        @keyframes spinWheels {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Línea de carretera animada en movimiento continuo */
        .road-line {
          width: 320px;
          height: 3px;
          background: repeating-linear-gradient(
            to right,
            #cbd5e1 0,
            #cbd5e1 20px,
            transparent 20px,
            transparent 35px
          );
          margin-top: -6px;
          animation: roadMove 0.4s linear infinite;
          border-radius: 2px;
        }

        @keyframes roadMove {
          from {
            background-position: 0 0;
          }
          to {
            background-position: -35px 0;
          }
        }
      `}</style>
    </div>
  );
};

const overlayStyle = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: '#f8fafc',
  zIndex: 99999,
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
};

const contentWrapper = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '24px',
};

const sceneContainer = {
  width: '320px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  overflow: 'hidden',
  padding: '20px 0',
};

const brandBox = {
  textAlign: 'center',
};

const brandTitle = {
  fontSize: '2rem',
  fontWeight: '900',
  color: 'var(--primary)',
  letterSpacing: '-1px',
  margin: 0,
};

const brandSubtitle = {
  fontSize: '0.9rem',
  color: 'var(--text-muted)',
  fontWeight: '600',
  marginTop: '6px',
};

export default MinibusLoader;
