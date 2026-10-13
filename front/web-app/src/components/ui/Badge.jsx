

const Badge = ({ children, variant = 'default', className = '' }) => {
  const classes = ['vv-badge', `vv-badge--${variant}`, className].filter(Boolean).join(' ');
  return <span className={classes}>{children}</span>;
};

export default Badge;
