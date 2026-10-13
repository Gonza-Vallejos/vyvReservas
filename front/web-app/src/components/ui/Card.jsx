

const Card = ({
  children,
  className = '',
  padded = true,
  hover = false,
  as: Component = 'div',
  ...rest
}) => {
  const classes = [
    'vv-card',
    padded ? 'vv-card--padded' : '',
    hover ? 'vv-card--hover' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Component className={classes} {...rest}>
      {children}
    </Component>
  );
};

export default Card;
