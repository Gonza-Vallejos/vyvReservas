import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DEFAULT_TITLE = 'V&V Reservas | Pasajes de Minibus en un Clic';
const DEFAULT_DESC = 'Reservá pasajes de minibus entre localidades de la región de forma rápida, segura y sin complicaciones con V&V Reservas.';

const ROUTE_META = {
  '/': {
    title: 'V&V Reservas | Pasajes de Minibus en un Clic',
    description: 'Encontrá salidas de minibus, elegí tus asientos y viajá seguro. Reservas online en un clic.',
  },
  '/login': {
    title: 'Ingresar a mi cuenta | V&V Reservas',
    description: 'Accedé a tu cuenta de V&V Reservas para gestionar tus viajes, flota o pasajes emitidos.',
  },
  '/register': {
    title: 'Crear Cuenta Gratis | V&V Reservas',
    description: 'Registrate en V&V Reservas y comenzá a viajar de forma fácil, cómoda y segura.',
  },
  '/dashboard': {
    title: 'Panel de Control | V&V Reservas',
    description: 'Panel de gestión para empresas y operadores de transporte de V&V Reservas.',
  },
  '/chofer': {
    title: 'Panel de Chofer | V&V Reservas',
    description: 'Planilla de pasajeros y asignación de salidas para conductores de V&V Reservas.',
  },
  '/mis-reservas': {
    title: 'Mis Reservas | V&V Reservas',
    description: 'Consultá el estado de tus pasajes reservados, boletos y comprobantes de viaje.',
  },
  '/perfil': {
    title: 'Mi Perfil | V&V Reservas',
    description: 'Gestioná tus datos personales y configuración de cuenta en V&V Reservas.',
  },
};

const setMetaTag = (attr, key, content) => {
  if (!content) return;
  let element = document.querySelector(`meta[${attr}="${key}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attr, key);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
};

export const useSEO = ({ title, description, image } = {}) => {
  const location = useLocation();

  useEffect(() => {
    const routeConfig = ROUTE_META[location.pathname] || {};
    const finalTitle = title || routeConfig.title || DEFAULT_TITLE;
    const finalDesc = description || routeConfig.description || DEFAULT_DESC;

    document.title = finalTitle;

    setMetaTag('name', 'description', finalDesc);
    setMetaTag('property', 'og:title', finalTitle);
    setMetaTag('property', 'og:description', finalDesc);
    setMetaTag('property', 'og:url', window.location.href);
    setMetaTag('name', 'twitter:title', finalTitle);
    setMetaTag('name', 'twitter:description', finalDesc);

    if (image) {
      setMetaTag('property', 'og:image', image);
      setMetaTag('name', 'twitter:image', image);
    }
  }, [location.pathname, title, description, image]);
};

/**
 * Componente que sincroniza dinámicamente el título y Open Graph al cambiar de página
 */
export const RouteMetadataWatcher = () => {
  useSEO();
  return null;
};

export default useSEO;
