# MEMORY - Proyecto Reserva Minibús (VyV Reservas)

Documento resumen y memoria técnica del proyecto tras la migración a **Supabase (PostgreSQL)** y aplicación de buenas prácticas.

---

## 1. Arquitectura General del Monorepo

El repositorio está estructurado en tres partes independientes que interactúan entre sí:

* **Backend (`/back/Reserva_Minubus`)**:
  * **Runtime / Framework**: Node.js v20 + Express 4.
  * **Base de Datos & ORM**: **PostgreSQL 17 (Supabase)** administrado mediante Sequelize 6 (`pg` y `pg-hstore`).
  * **Conexión**: Transaction Pooler vía `aws-0-us-east-1.pooler.supabase.com:6543/postgres` con SSL habilitado.
  * **Seguridad & Auth**: JWT (`jsonwebtoken`), hash de contraseñas con `bcrypt`, validaciones con `express-validator`.
  * **Servicios & Utilidades**: `nodemailer` para verificación y recuperación de contraseña, documentación con Swagger (`/api-docs`).

* **Aplicación Móvil (`/front/reservaAPP`)**:
  * **Framework**: React Native (0.79) + Expo SDK 53 con **Expo Router v5** y TypeScript.
  * **Roles / Vistas**: Flujos para Clientes, Choferes, Mostrador y Administradores de Empresa.

* **Aplicación Web (`/front/web-app`)**:
  * **Framework**: React 19 + Vite 8 + React Router DOM v7.
  * **Propósito**: Panel administrativo y portal web para búsqueda y reserva de pasajes. Consume la API REST del backend vía Axios.

---

## 2. Modelo de Datos y Entidades en Supabase (PostgreSQL)

El esquema relacional fue creado y optimizado en Supabase:

```
[País] ──< [Provincia] ──< [Localidad]
                                 │
                                 ▼
[Perfil (Roles)] ──< [Usuarios] ──< [UsuarioEmpresa] >── [Empresa]
                           │                 │               │
                           │                 ▼               ▼
                           │             [Viajes] <─── [MedioTransporte]
                           │                 │
                           ▼                 ▼
                       [Reservas] ───────────┘
                           │
             ┌─────────────┴─────────────┐
             ▼                           ▼
        [Pasajeros]                  [Ventas]
                                         │
                                         ▼
                                   [DetalleVenta]
```

### Tablas y Características:
1. **Perfiles**: Roles base inicializados (Administrador = 1, Cliente = 2, Mostrador = 3, Chofer = 4, Empresa = 5).
2. **Pais, Provincia, Localidad**: Jerarquía geográfica con restricciones `ON DELETE RESTRICT`.
3. **Usuarios**: Usuarios del sistema con campos de verificación y recuperación.
4. **Empresa & usuarioEmpresa**: Vinculación de empleados/choferes con empresas.
5. **MedioTransporte**: Minibuses con restricción `CHECK (cantLugares > 0)`.
6. **Viajes**: Salidas programadas con restricción `CHECK (cantPasajeros >= 0)`.
7. **Reservas**: Registro de reserva vinculado a usuario y viaje.
8. **pasajeros**: Pasajeros asociados a cada reserva con eliminación en cascada.
9. **Ventas & DetalleVenta**: Facturación y detalles de pago.

---

## 3. Mejoras y Buenas Prácticas Aplicadas

1. **Conexión a PostgreSQL (Supabase)**:
   * Instalados drivers `pg` y `pg-hstore`.
   * Actualizado [config.js](file:///Users/gonzalovallejos/Documents/vyv%20reservas%20/back/Reserva_Minubus/config/config.js) para usar `dialect: 'postgres'` y `DATABASE_URL` con SSL.
   * Creado script reproducible [supabase_schema.sql](file:///Users/gonzalovallejos/Documents/vyv%20reservas%20/back/Reserva_Minubus/supabase_schema.sql) y [migrate_supabase.js](file:///Users/gonzalovallejos/Documents/vyv%20reservas%20/back/Reserva_Minubus/migrate_supabase.js).

2. **Transacciones Atómicas y Control de Concurrencia (Race Conditions)**:
   * En [reservaService.js](file:///Users/gonzalovallejos/Documents/vyv%20reservas%20/back/Reserva_Minubus/services/reservaService.js), tanto la **creación** como la **cancelación** de reservas y eliminación de pasajeros se ejecutan dentro de transacciones Sequelize (`sequelize.transaction`).
   * La verificación de disponibilidad utiliza **bloqueo de fila** (`lock: t.LOCK.UPDATE`) para evitar que dos compras simultáneas sobrevendan el último asiento.

3. **Índices de Alto Rendimiento en Supabase**:
   * `idx_viajes_busqueda` sobre `(fechaViaje, origenLocalidad, destinoLocalidad)`.
   * `idx_reservas_usuario` y `idx_reservas_viaje`.
   * `idx_pasajeros_reserva`.

4. **Soft Deletes Mejorados**:
   * Añadida columna `deleted_at TIMESTAMPTZ` en las tablas principales para registrar la fecha y hora exacta de eliminación, manteniendo retrocompatibilidad con la columna `eliminado`.
