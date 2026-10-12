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

          {/* Ilustración SVG estilo Toyota Hiace Commuter Blanca Techo Alto */}
          <div className="minibus-vehicle">
            <svg
              width="230"
              height="105"
              viewBox="0 0 230 105"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                {/* Carrocería Blanco Perlado Toyota Hiace */}
                <linearGradient id="hiaceWhiteGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="20%" stopColor="#f8fafc" />
                  <stop offset="70%" stopColor="#f1f5f9" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>

                {/* Techo alto curvado blanco brillante */}
                <linearGradient id="hiaceRoofGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="35%" stopColor="#ffffff" />
                  <stop offset="85%" stopColor="#f1f5f9" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>

                {/* Vidrios polarizados oscuros con reflejo del atardecer */}
                <linearGradient id="hiaceGlassTint" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#0b1329" />
                  <stop offset="45%" stopColor="#1e293b" />
                  <stop offset="80%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>

                {/* Reflejo cálido del cielo en las ventanillas */}
                <linearGradient id="skyReflection" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="rgba(254, 243, 199, 0.5)" />
                  <stop offset="40%" stopColor="rgba(251, 191, 36, 0.28)" />
                  <stop offset="80%" stopColor="rgba(147, 197, 253, 0.18)" />
                  <stop offset="100%" stopColor="rgba(255, 255, 255, 0.45)" />
                </linearGradient>

                {/* Parrilla y barra cromada Toyota */}
                <linearGradient id="chromeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="45%" stopColor="#cbd5e1" />
                  <stop offset="70%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>

                {/* Óptica delantera moderna */}
                <linearGradient id="headlightGlow" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="65%" stopColor="#fef08a" />
                  <stop offset="100%" stopColor="#facc15" />
                </linearGradient>

                {/* Sombra de suelo */}
                <radialGradient id="hiaceDropShadow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(15, 23, 42, 0.4)" />
                  <stop offset="85%" stopColor="rgba(15, 23, 42, 0.05)" />
                  <stop offset="100%" stopColor="rgba(15, 23, 42, 0)" />
                </radialGradient>

                {/* Llantas de aleación multirrayo Toyota */}
                <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="45%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#64748b" />
                </linearGradient>
              </defs>

              {/* Sombra bajo el vehículo */}
              <ellipse cx="118" cy="94" rx="100" ry="6" fill="url(#hiaceDropShadow)" />

              {/* Pequeña antena negra en el techo */}
              <line x1="168" y1="18" x2="162" y2="10" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" />

              {/* Techo alto curvado aerodinámico (Toyota Hiace Commuter) */}
              <path
                d="M 22 26 
                   C 22 19 32 17 48 16 
                   L 142 16 
                   C 156 16 168 18 178 22 
                   L 185 26 
                   Z"
                fill="url(#hiaceRoofGrad)"
              />

              {/* Carrocería principal blanca perlada */}
              <path
                d="M 22 26
                   L 185 26
                   L 204 45
                   L 221 53
                   C 224 54.5 225 57 225 60
                   L 225 73
                   C 225 76 222 78 218 78
                   L 186 78
                   C 184 68 175 61 164 61
                   C 153 61 144 68 142 78
                   L 84 78
                   C 82 68 73 61 62 61
                   C 51 61 42 68 40 78
                   L 25 78
                   C 22 78 20 75 20 72
                   L 20 30
                   C 20 27 21 26 22 26
                   Z"
                fill="url(#hiaceWhiteGrad)"
                stroke="#cbd5e1"
                strokeWidth="1"
              />

              {/* Zócalo inferior y moldura inferior en tono plata suave */}
              <path d="M 84 75 L 142 75 L 142 78 L 84 78 Z" fill="#cbd5e1" />
              <path d="M 20 74 L 40 74 L 40 78 L 22 78 Z" fill="#cbd5e1" />

              {/* Nervadura horizontal de la carrocería lateral de Hiace */}
              <line x1="22" y1="58" x2="218" y2="58" stroke="#e2e8f0" strokeWidth="1.2" />
              <line x1="22" y1="59" x2="218" y2="59" stroke="#ffffff" strokeWidth="1" />

              {/* Pliegue superior del techo alto */}
              <path
                d="M 24 23 C 35 21 135 21 180 25"
                stroke="#cbd5e1"
                strokeWidth="1.5"
                fill="none"
              />

              {/* FRENTE TOYOTA HIACE */}
              {/* Parrilla frontal trapezoidal con ranuras negras horizontales */}
              <path
                d="M 205 60 L 224 60 C 225 60 225.5 61 225.5 62 L 225.5 73 C 225.5 75 224 76 222 76 L 205 76 Z"
                fill="#1e293b"
              />
              <line x1="208" y1="63" x2="224" y2="63" stroke="#475569" strokeWidth="1.5" />
              <line x1="207" y1="67" x2="224" y2="67" stroke="#475569" strokeWidth="1.5" />
              <line x1="206" y1="71" x2="224" y2="71" stroke="#475569" strokeWidth="1.5" />

              {/* Placa "HIACE" frontal */}
              <rect x="210" y="65" width="12" height="5" rx="1" fill="#0f172a" stroke="#64748b" strokeWidth="0.5" />
              <text x="216" y="68.8" fontSize="2.8" fontWeight="900" fill="#ffffff" textAnchor="middle" fontFamily="sans-serif">HIACE</text>

              {/* Barra cromada superior con logo Toyota */}
              <path
                d="M 203 54 L 222 54 C 223.5 54 224 55 224 57 L 224 59 L 203 59 Z"
                fill="url(#chromeGrad)"
              />
              <ellipse cx="214" cy="56.5" rx="3" ry="1.8" fill="none" stroke="#475569" strokeWidth="0.8" />
              <ellipse cx="214" cy="56.5" rx="1.4" ry="1.4" fill="none" stroke="#475569" strokeWidth="0.6" />

              {/* Óptica delantera moderna con proyector */}
              <path
                d="M 197 46 
                   L 219 53 
                   C 221 53.5 221 55 220 56 
                   L 198 56 
                   Z"
                fill="url(#headlightGlow)"
              />
              <circle cx="210" cy="52" r="2.2" fill="#ffffff" />
              <circle cx="216" cy="54" r="1.5" fill="#ffffff" />

              {/* Luces diurnas verticales LED (DRL) y antiniebla */}
              <rect x="218" y="62" width="2" height="7" rx="1" fill="#06b6d4" opacity="0.9" />
              <circle cx="219" cy="72" r="1.8" fill="#fef08a" />

              {/* VENTANILLAS PANORÁMICAS TINTADAS TOYOTA HIACE */}
              <g>
                {/* Ventanilla trasera panorámica */}
                <path d="M 28 28 L 84 28 L 84 51 L 28 51 Z" fill="url(#hiaceGlassTint)" />
                {/* Ventana de puerta corrediza */}
                <path d="M 87 28 L 138 28 L 138 51 L 87 51 Z" fill="url(#hiaceGlassTint)" />
                {/* Ventana amplia del conductor */}
                <path d="M 141 28 L 175 28 L 175 51 L 141 51 Z" fill="url(#hiaceGlassTint)" />
                {/* Ventilete triangular delantero (típico de Hiace) */}
                <path d="M 177 28 L 184 28 L 198 46 L 177 46 Z" fill="url(#hiaceGlassTint)" />
                {/* Parabrisas frontal inclinado */}
                <path d="M 183 27 L 187 27 L 204 45 L 198 45 Z" fill="url(#hiaceGlassTint)" />

                {/* Reflejo cálido del horizonte solar */}
                <path d="M 30 38 L 194 44 L 192 48 L 30 48 Z" fill="url(#skyReflection)" />
                <path d="M 35 29 L 170 29 L 160 34 L 30 34 Z" fill="rgba(255,255,255,0.4)" />

                {/* Pilares negros de división */}
                <line x1="85.5" y1="28" x2="85.5" y2="51" stroke="#0f172a" strokeWidth="2" />
                <line x1="139.5" y1="28" x2="139.5" y2="51" stroke="#0f172a" strokeWidth="2" />
                <line x1="176" y1="28" x2="176" y2="51" stroke="#0f172a" strokeWidth="2" />
              </g>

              {/* Guía de puerta lateral y manijas cromadas */}
              <line x1="86" y1="51" x2="86" y2="76" stroke="#cbd5e1" strokeWidth="1.2" />
              <line x1="139" y1="51" x2="139" y2="76" stroke="#cbd5e1" strokeWidth="1.2" />
              <rect x="89" y="55" width="5" height="2.5" rx="1" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" />
              <rect x="144" y="55" width="5" height="2.5" rx="1" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" />

              {/* Espejo lateral blanco */}
              <path
                d="M 172 44 L 178 44 C 180 44 182 46 182 48 L 181 52 C 180 54 178 54 175 53 L 171 47 Z"
                fill="#ffffff"
                stroke="#cbd5e1"
                strokeWidth="1"
              />
              <path d="M 168 47 L 172 47" stroke="#1e293b" strokeWidth="2" />

              {/* Luz trasera vertical de freno */}
              <rect x="20" y="36" width="3.5" height="22" rx="1.5" fill="#dc2626" />
              <rect x="20" y="44" width="3.5" height="6" rx="0.5" fill="#fca5a5" />

              {/* Guardabarros redondeados */}
              <path d="M 38 78 C 40 67 49 59 62 59 C 75 59 84 67 86 78 Z" fill="#1e293b" />
              <path d="M 140 78 C 142 67 151 59 164 59 C 177 59 186 67 188 78 Z" fill="#1e293b" />

              {/* RUEDA TRASERA (Llanta de aleación multirrayo Toyota) */}
              <g className="wheel-spin" style={{ transformOrigin: '62px 78px' }}>
                <circle cx="62" cy="78" r="16" fill="#0f172a" />
                <circle cx="62" cy="78" r="14.5" stroke="#1e293b" strokeWidth="2" fill="none" />
                <circle cx="62" cy="78" r="10.5" fill="url(#rimGrad)" />
                <circle cx="62" cy="78" r="8" fill="#1e293b" />
                <line x1="62" y1="68" x2="62" y2="88" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="52" y1="78" x2="72" y2="78" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="55" y1="71" x2="69" y2="85" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="55" y1="85" x2="69" y2="71" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="53.5" y1="74.5" x2="70.5" y2="81.5" stroke="#cbd5e1" strokeWidth="1.2" />
                <line x1="53.5" y1="81.5" x2="70.5" y2="74.5" stroke="#cbd5e1" strokeWidth="1.2" />
                <line x1="58.5" y1="69.5" x2="65.5" y2="86.5" stroke="#cbd5e1" strokeWidth="1.2" />
                <line x1="65.5" y1="69.5" x2="58.5" y2="86.5" stroke="#cbd5e1" strokeWidth="1.2" />
                <circle cx="62" cy="78" r="3.2" fill="url(#chromeGrad)" />
                <circle cx="62" cy="78" r="1.2" fill="#0f172a" />
              </g>

              {/* RUEDA DELANTERA (Llanta de aleación multirrayo Toyota) */}
              <g className="wheel-spin" style={{ transformOrigin: '164px 78px' }}>
                <circle cx="164" cy="78" r="16" fill="#0f172a" />
                <circle cx="164" cy="78" r="14.5" stroke="#1e293b" strokeWidth="2" fill="none" />
                <circle cx="164" cy="78" r="10.5" fill="url(#rimGrad)" />
                <circle cx="164" cy="78" r="8" fill="#1e293b" />
                <line x1="164" y1="68" x2="164" y2="88" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="154" y1="78" x2="174" y2="78" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="157" y1="71" x2="171" y2="85" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="157" y1="85" x2="171" y2="71" stroke="#ffffff" strokeWidth="1.5" />
                <line x1="155.5" y1="74.5" x2="172.5" y2="81.5" stroke="#cbd5e1" strokeWidth="1.2" />
                <line x1="155.5" y1="81.5" x2="172.5" y2="74.5" stroke="#cbd5e1" strokeWidth="1.2" />
                <line x1="160.5" y1="69.5" x2="167.5" y2="86.5" stroke="#cbd5e1" strokeWidth="1.2" />
                <line x1="167.5" y1="69.5" x2="160.5" y2="86.5" stroke="#cbd5e1" strokeWidth="1.2" />
                <circle cx="164" cy="78" r="3.2" fill="url(#chromeGrad)" />
                <circle cx="164" cy="78" r="1.2" fill="#0f172a" />
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
            transform: translateX(-200px) scale(0.92);
            opacity: 0;
          }
          20% {
            transform: translateX(-30px) scale(0.98) rotate(-1.2deg);
            opacity: 1;
          }
          45% {
            transform: translateX(10px) scale(1) translateY(-1.5px) rotate(0.6deg);
          }
          65% {
            transform: translateX(25px) translateY(1px) rotate(-0.4deg);
          }
          80% {
            transform: translateX(55px) translateY(-1px) rotate(0.4deg);
            opacity: 1;
          }
          100% {
            transform: translateX(330px) scale(1.04) rotate(-0.8deg);
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
          width: 420px;
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
  width: '380px',
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
