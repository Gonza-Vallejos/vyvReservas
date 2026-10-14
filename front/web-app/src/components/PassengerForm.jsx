import { User, CreditCard, Navigation, Flag } from 'lucide-react';
import InputField from './ui/InputField';

const PassengerForm = ({ passenger, errors = {}, onChange, showAutofill = false, onAutofill }) => {
  return (
    <fieldset className="passenger-form">
      <legend className="passenger-form__legend">
        <span className="passenger-form__legend-title">
          Pasajero — Asiento {passenger.seatNumber}
        </span>
        {showAutofill && (
          <button
            type="button"
            className="passenger-form__autofill"
            onClick={onAutofill}
            aria-label="Cargar mis datos de usuario en este pasajero"
          >
            Cargar mis datos
          </button>
        )}
      </legend>

      <div className="passenger-form__grid">
        <InputField
          id={`nombre-${passenger.seatNumber}`}
          label="Nombre"
          placeholder="Ej: Juan"
          value={passenger.nombre}
          onChange={(e) => onChange('nombre', e.target.value)}
          icon={User}
          error={errors.nombre}
          required
          autoComplete="given-name"
        />

        <InputField
          id={`apellido-${passenger.seatNumber}`}
          label="Apellido"
          placeholder="Ej: Pérez"
          value={passenger.apellido}
          onChange={(e) => onChange('apellido', e.target.value)}
          icon={User}
          error={errors.apellido}
          required
          autoComplete="family-name"
        />

        <InputField
          id={`dni-${passenger.seatNumber}`}
          label="DNI"
          type="text"
          inputMode="numeric"
          placeholder="Número de documento"
          value={passenger.dni}
          onChange={(e) => onChange('dni', e.target.value.replace(/\D/g, ''))}
          icon={CreditCard}
          error={errors.dni}
          required
          autoComplete="off"
        />

        <InputField
          id={`subida-${passenger.seatNumber}`}
          label="Punto de subida"
          placeholder="¿Dónde te buscamos?"
          value={passenger.ubicacionOrigen}
          onChange={(e) => onChange('ubicacionOrigen', e.target.value)}
          icon={Navigation}
          error={errors.ubicacionOrigen}
          required
          autoComplete="off"
        />

        <InputField
          id={`bajada-${passenger.seatNumber}`}
          label="Punto de bajada"
          placeholder="¿Dónde te dejamos?"
          value={passenger.ubicacionDestino}
          onChange={(e) => onChange('ubicacionDestino', e.target.value)}
          icon={Flag}
          error={errors.ubicacionDestino}
          required
          autoComplete="off"
        />
      </div>
    </fieldset>
  );
};

export default PassengerForm;
