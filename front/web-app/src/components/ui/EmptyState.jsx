import { SearchX } from 'lucide-react';
import Button from './Button';

const EmptyState = ({
  icon: Icon = SearchX,
  title = 'No hay resultados',
  description = 'Probá con otros filtros o fechas.',
  action,
  className = '',
}) => {
  return (
    <div className={`vv-empty ${className}`} role="status" aria-live="polite">
      <div className="vv-empty__icon" aria-hidden="true">
        <Icon size={32} />
      </div>
      <h3 className="vv-empty__title">{title}</h3>
      {description && <p className="vv-empty__description">{description}</p>}
      {action && (
        <Button
          variant={action.variant || 'primary'}
          size={action.size || 'md'}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
