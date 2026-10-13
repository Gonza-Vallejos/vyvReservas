# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Stack

- **Backend**: Node.js 20 + Express 4 + Sequelize 6 + PostgreSQL 17 (Supabase), with JWT auth, bcrypt, express-validator, nodemailer, Swagger.
- **Web app**: React 19 + Vite 8 + React Router DOM v7 + Axios.
- **Mobile app**: React Native 0.79 + Expo SDK 53 + Expo Router v5 + TypeScript.

## Users

1. **Pasajeros finales** (primary): people searching for inter-city minibus trips and booking/paying for seats.
2. **Empresas de transporte / dueños**: configure minibuses, scheduled trips, employees, and review sales.
3. **Administradores de empresa**: manage users, transport, trips, and reservations within a company.
4. **Mostrador**: counter operators who create reservations and sales in person.
5. **Choferes**: drivers viewing their assigned trips and passenger lists.

## Product Purpose

V&V Reservas lets passengers search, book, and pay for minibus tickets between localities, while transport companies manage fleets, scheduled trips, reservations, and sales through web and mobile interfaces.

## Positioning

A reservation platform built specifically for small/medium minibus transport companies, combining public passenger search and booking with role-based company operations (owner, counter, driver, admin) in one connected system.

## Operating Context

- Trips are searched by origin locality, destination locality, and date.
- Search uses an index on `(fechaViaje, origenLocalidad, destinoLocalidad)`.
- Booking creation and cancellation run inside Sequelize transactions with row-level locking to prevent over-selling the last seat.
- Role-based routing: admins/owners/counter staff are redirected to a dashboard; drivers to a driver panel; clients to search and "My Reservations".
- Auth uses JWT; accounts support email verification and password recovery.
- Sales are recorded in `Ventas` / `DetalleVenta`.
- Soft deletes use `deleted_at` alongside legacy `eliminado` columns.

## Capabilities and Constraints

- **Confirmed roles and IDs**: Administrador (1), Cliente (2), Mostrador (3), Chofer (4), Empresa (5).
- **Confirmed entities**: País → Provincia → Localidad; Usuarios; Perfiles; Empresa; UsuarioEmpresa; MedioTransporte; Viajes; Reservas; Pasajeros; Ventas; DetalleVenta.
- **Constraint**: `MedioTransporte.cantLugares > 0`; `Viajes.cantPasajeros >= 0`.
- **Web app routes**: home/search, login, register, booking, dashboard, driver dashboard, my reservations.
- **Mobile app scope**: tab-based flows for clients, drivers, company admin, and counter (inferred from file structure).
- **Open decision**: exact payment methods and integrations are not documented; current sales tables suggest manual/pending payment recording.
- **Open decision**: whether the public web booking requires upfront payment or just reservation.

## Brand Commitments

- **Name**: V&V Reservas (confirmed by user).
- The current web logo shows "V&V"; memory docs show "VyV Reservas".
- No formal visual identity guide exists; future design work may infer and refresh the identity (confirmed by user).

## Evidence on Hand

- `MEMORY.md`: technical architecture summary after Supabase migration.
- Backend: `back/Reserva_Minubus/` with models, services, migrations, and `supabase_schema.sql`.
- Web frontend: `front/web-app/`.
- Mobile frontend: `front/reservaAPP/`.
- No formal brand assets, user research, or testimonials on hand — future work must not fabricate these.

## Product Principles

1. **Availability first**: seat inventory must be accurate and race-condition safe.
2. **Role-appropriate surfaces**: each user type sees only the actions and data they need.
3. **Multi-channel parity**: core search and reservation capabilities should feel consistent across web and mobile.
4. **Operational trust**: counter staff, drivers, and admins need fast, scannable views for daily operations.

## Accessibility & Inclusion

No product-specific accessibility standard has been established yet. Future surfaces should aim for WCAG 2.1 AA as a baseline.
