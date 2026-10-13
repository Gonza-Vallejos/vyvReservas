

const SkeletonBlock = ({ width, height = '1em', className = '' }) => (
  <div
    className={`vv-skeleton__shimmer ${className}`}
    style={{ width, height }}
    aria-hidden="true"
  />
);

const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`vv-skeleton ${className}`} aria-busy="true" aria-label="Cargando contenido">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <SkeletonBlock width="40%" height="16px" />
          <SkeletonBlock width="24%" height="28px" />
        </div>
        <SkeletonBlock width="100%" height="12px" />
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <SkeletonBlock width="28%" height="28px" />
          <SkeletonBlock width="28%" height="28px" />
          <SkeletonBlock width="28%" height="28px" />
        </div>
        <SkeletonBlock width="100%" height="48px" style={{ borderRadius: '12px' }} />
      </div>
    </div>
  );
};

export default SkeletonCard;
