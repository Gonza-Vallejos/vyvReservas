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

          {/* Ilustración SVG hiperrealista estilo Minibús Sprinter */}
          <div className="minibus-vehicle">
            <svg
              width="210"
              height="95"
              viewBox="0 0 210 95"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Carrocería azul vibrante premium con reflejo */}
                <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="45%" stopColor="#1d4ed8" />
                  <stop offset="100%" stopColor="#1e3a8a" />
                </linearGradient>
                {/* Techo alto característico de Sprinter */}
                <linearGradient id="roofGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="50%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
                {/* Ventanillas polarizadas panorámicas */}
                <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="70%" stopColor="#1e293b" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>
                {/* Reflejo celeste en el vidrio */}
                <linearGradient id="glareGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
                  <stop offset="50%" stopColor="rgba(147,197,253,0.15)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </linearGradient>
                {/* Sombra de suelo realista */}
                <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(15,23,42,0.35)" />
                  <stop offset="100%" stopColor="rgba(15,23,42,0)" />
                </radialGradient>
              </defs>

              {/* Sombra proyectada en el asfalto */}
              <ellipse cx="105" cy="86" rx="90" ry="5.5" fill="url(#shadowGrad)" />

              {/* Techo sobre-elevado tipo Van / Minibús Sprinter */}
              <path
                d="M50 14 C58 12 185 12 192 14 C195 15 196 18 196 22 L46 22 C46 17 48 14 50 14 Z"
                fill="url(#roofGrad)"
              />
              {/* Moldura del techo (aire acondicionado / ventilador) */}
              <rect x="95" y="9" width="45" height="5" rx="2.5" fill="#1e3a8a" />

              {/* Carrocería Principal (Frente con trompa aerodinámica inclinada hacia la derecha) */}
              {/* El minibús mira hacia la DERECHA que es hacia donde avanza */}
              <path
                d="M196 22 
                   L196 66 
                   C196 69 193 71 189 71 
                   L170 71 
                   C168 62 158 55 147 55 
                   C136 55 126 62 124 71 
                   L80 71 
                   C78 62 68 55 57 55 
                   C46 55 36 62 34 71 
                   L20 71 
                   C17 71 15 68 15 65 
                   L15 28 
                   C15 24 18 22 22 22 
                   Z"
                fill="url(#bodyGrad)"
              />

              {/* Frente y capó estilo Sprinter (a la derecha) */}
              <path
                d="M175 22 
                   L188 38 
                   L205 45 
                   C208 46 210 49 210 52 
                   L210 65 
                   C210 69 207 71 203 71 
                   L170 71 
                   C168 62 158 55 147 55 
                   C143 55 140 56 137 58 
                   L175 22 Z"
                fill="url(#bodyGrad)"
              />

              {/* Paragolpes delantero resistente y parrilla */}
              <path
                d="M195 56 L209 56 C210.5 56 211 58 211 60 L211 67 C211 69 209 71 206 71 L185 71 Z"
                fill="#0f172a"
              />
              {/* Parrilla frontal */}
              <rect x="204" y="52" width="6" height="3" rx="1" fill="#334155" />
              <rect x="202" y="56" width="8" height="2" rx="1" fill="#475569" />

              {/* Faro delantero LED dinámico */}
              <path
                d="M198 47 L209 49 C210 49.5 210 52 208 53 L197 53 Z"
                fill="#fef08a"
              />
              <path
                d="M200 48 L208 50 L206 52 L199 52 Z"
                fill="#ffffff"
              />

              {/* Faros auxiliares / DRL */}
              <line x1="202" y1="62" x2="208" y2="62" stroke="#67e8f9" strokeWidth="1.5" strokeLinecap="round" />

              {/* Área acristalada corrida (Vidrios oscurecidos panorámicos de Sprinter) */}
              <rect x="24" y="24" width="168" height="23" rx="3" fill="url(#glassGrad)" />

              {/* Parabrisas frontal inclinado */}
              <path
                d="M170 24 L185 38 L200 44 L175 44 L165 24 Z"
                fill="url(#glassGrad)"
              />
              {/* Reflejo diagonal en el parabrisas */}
              <path
                d="M172 25 L187 38 L182 44 L168 25 Z"
                fill="url(#glareGrad)"
              />

              {/* Separadores de ventanillas y puertas */}
              {/* Ventanilla Conductor */}
              <rect x="155" y="25" width="22" height="21" rx="2" fill="url(#glassGrad)" />
              <line x1="154" y1="24" x2="154" y2="70" stroke="#0f172a" strokeWidth="1.5" />

              {/* Ventanillas de Pasajeros Minibús */}
              <rect x="118" y="25" width="34" height="21" rx="2" fill="url(#glassGrad)" />
              <rect x="80" y="25" width="35" height="21" rx="2" fill="url(#glassGrad)" />
              <rect x="42" y="25" width="35" height="21" rx="2" fill="url(#glassGrad)" />
              <rect x="25" y="25" width="14" height="21" rx="2" fill="url(#glassGrad)" />

              {/* Brillo / reflejo solar corrido en las ventanas */}
              <path
                d="M30 27 L175 27 L168 33 L25 33 Z"
                fill="url(#glareGrad)"
                opacity="0.6"
              />

              {/* Línea de puerta corrediza lateral del minibús */}
              <line x1="116" y1="24" x2="116" y2="69" stroke="#1e3a8a" strokeWidth="1.5" />
              <rect x="113" y="49" width="3" height="6" rx="1.5" fill="#cbd5e1" /> {/* Manija */}

              {/* Manija de puerta del conductor */}
              <rect x="160" y="49" width="4" height="3" rx="1" fill="#cbd5e1" />

              {/* Espejo retrovisor exterior lateral */}
              <path
                d="M182 40 L188 39 C190 39 191 41 191 43 L189 47 C188 48 186 48 184 47 L181 44 Z"
                fill="#0f172a"
              />
              <ellipse cx="186" cy="43" rx="2" ry="3" fill="#64748b" />

              {/* Franja aerodinámica moderna de color naranja / amarillo V&V */}
              <path
                d="M20 54 L190 54 L187 57 L20 57 Z"
                fill="#f59e0b"
              />
              <path
                d="M130 54 L170 54 L167 57 L127 57 Z"
                fill="#fde047"
              />

              {/* Luz trasera de freno vertical (típica de Sprinter) */}
              <rect x="15" y="35" width="3.5" height="18" rx="1.5" fill="#ef4444" />
              <rect x="15" y="44" width="3.5" height="4" rx="0.5" fill="#fca5a5" />

              {/* Guardabarros / Molduras de rueda */}
              <path
                d="M33 71 C35 61 45 54 57 54 C69 54 79 61 81 71 Z"
                fill="#0f172a"
              />
              <path
                d="M123 71 C125 61 135 54 147 54 C159 54 169 61 171 71 Z"
                fill="#0f172a"
              />

              {/* RUEDA TRASERA (con llanta de aleación y disco) */}
              <g className="wheel-spin" style={{ transformOrigin: '57px 71px' }}>
                {/* Neumático */}
                <circle cx="57" cy="71" r="14.5" fill="#0f172a" />
                <circle cx="57" cy="71" r="13" stroke="#1e293b" strokeWidth="2" fill="none" />
                {/* Llanta de aleación */}
                <circle cx="57" cy="71" r="9" fill="#94a3b8" />
                {/* Rayos de llanta */}
                <circle cx="57" cy="71" r="4.5" fill="#475569" />
                <circle cx="57" cy="71" r="2" fill="#0f172a" />
                <line x1="57" y1="62" x2="57" y2="80" stroke="#f1f5f9" strokeWidth="1.8" />
                <line x1="48" y1="71" x2="66" y2="71" stroke="#f1f5f9" strokeWidth="1.8" />
                <line x1="51" y1="65" x2="63" y2="77" stroke="#f1f5f9" strokeWidth="1.8" />
                <line x1="51" y1="77" x2="63" y2="65" stroke="#f1f5f9" strokeWidth="1.8" />
              </g>

              {/* RUEDA DELANTERA */}
              <g className="wheel-spin" style={{ transformOrigin: '147px 71px' }}>
                {/* Neumático */}
                <circle cx="147" cy="71" r="14.5" fill="#0f172a" />
                <circle cx="147" cy="71" r="13" stroke="#1e293b" strokeWidth="2" fill="none" />
                {/* Llanta de aleación */}
                <circle cx="147" cy="71" r="9" fill="#94a3b8" />
                {/* Rayos de llanta */}
                <circle cx="147" cy="71" r="4.5" fill="#475569" />
                <circle cx="147" cy="71" r="2" fill="#0f172a" />
                <line x1="147" y1="62" x2="147" y2="80" stroke="#f1f5f9" strokeWidth="1.8" />
                <line x1="138" y1="71" x2="156" y2="71" stroke="#f1f5f9" strokeWidth="1.8" />
                <line x1="141" y1="65" x2="153" y2="77" stroke="#f1f5f9" strokeWidth="1.8" />
                <line x1="141" y1="77" x2="153" y2="65" stroke="#f1f5f9" strokeWidth="1.8" />
              </g>
            </svg>
          </div>

          {/* Línea de asfalto / carretera con animación rápida */}
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
        /* Animación del minibús: arranca, acelera con balanceo de suspensión y sale a gran velocidad */
        .minibus-vehicle {
          animation: driveAccelerate 1.9s cubic-bezier(0.22, 1, 0.36, 1) forwards;
          will-change: transform;
        }

        @keyframes driveAccelerate {
          0% {
            transform: translateX(-160px) scale(0.92);
            opacity: 0;
          }
          20% {
            transform: translateX(-30px) scale(0.98) rotate(-1.5deg);
            opacity: 1;
          }
          45% {
            transform: translateX(10px) scale(1) translateY(-1.5px) rotate(0.8deg);
          }
          65% {
            transform: translateX(25px) translateY(1px) rotate(-0.5deg);
          }
          80% {
            transform: translateX(50px) translateY(-1px) rotate(0.5deg);
            opacity: 1;
          }
          100% {
            transform: translateX(280px) scale(1.04) rotate(-1deg);
            opacity: 0;
          }
        }

        /* Giro realista continuo de las ruedas */
        .wheel-spin {
          animation: spinWheels 0.25s linear infinite;
        }

        @keyframes spinWheels {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Línea de carretera animada en movimiento continuo rápido */
        .road-line {
          width: 360px;
          height: 3.5px;
          background: repeating-linear-gradient(
            to right,
            #94a3b8 0,
            #94a3b8 22px,
            transparent 22px,
            transparent 38px
          );
          margin-top: -6px;
          animation: roadMove 0.35s linear infinite;
          border-radius: 2px;
        }

        @keyframes roadMove {
          from {
            background-position: 0 0;
          }
          to {
            background-position: -38px 0;
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
