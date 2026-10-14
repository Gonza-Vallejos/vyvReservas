-- Migración VyV Reservas para Supabase (PostgreSQL)

-- 1. Perfiles
CREATE TABLE IF NOT EXISTS "Perfiles" (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(50) NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Ubicación: Pais, Provincia, Localidad
CREATE TABLE IF NOT EXISTS "Pais" (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Provincia" (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  pais_id INT NOT NULL REFERENCES "Pais"(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Localidad" (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  provincia_id INT NOT NULL REFERENCES "Provincia"(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Usuarios
CREATE TABLE IF NOT EXISTS "Usuarios" (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  dni INT UNIQUE NOT NULL,
  telefono VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  usuario VARCHAR(50) UNIQUE NOT NULL,
  contrasenia VARCHAR(255) NOT NULL,
  perfil_id INT NOT NULL REFERENCES "Perfiles"(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  verificado BOOLEAN DEFAULT false,
  "tokenVerificacion" VARCHAR(255),
  "fechaVerificacion" TIMESTAMPTZ,
  "recuperacionToken" VARCHAR(255),
  "recuperacionTokenExpira" TIMESTAMPTZ,
  eliminado VARCHAR(10) DEFAULT 'no',
  deleted_at TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Empresa
CREATE TABLE IF NOT EXISTS "Empresa" (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  direccion VARCHAR(255) NOT NULL,
  cuit VARCHAR(50) UNIQUE NOT NULL,
  telefono VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  localidad_id INT NOT NULL REFERENCES "Localidad"(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  eliminado VARCHAR(10) DEFAULT 'no',
  deleted_at TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 5. UsuarioEmpresa
CREATE TABLE IF NOT EXISTS "usuarioEmpresa" (
  id SERIAL PRIMARY KEY,
  id_usuario INT NOT NULL REFERENCES "Usuarios"(id) ON UPDATE CASCADE ON DELETE CASCADE,
  id_empresa INT NOT NULL REFERENCES "Empresa"(id) ON UPDATE CASCADE ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(id_usuario, id_empresa)
);

-- 6. MedioTransporte
CREATE TABLE IF NOT EXISTS "MedioTransporte" (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  patente VARCHAR(50) UNIQUE NOT NULL,
  marca VARCHAR(100) NOT NULL,
  "cantLugares" INT NOT NULL CHECK ("cantLugares" > 0),
  empresa_id INT NOT NULL REFERENCES "Empresa"(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  eliminado VARCHAR(10) DEFAULT 'no',
  deleted_at TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Viajes
CREATE TABLE IF NOT EXISTS "Viajes" (
  id SERIAL PRIMARY KEY,
  "origenLocalidad" VARCHAR(100) NOT NULL,
  "destinoLocalidad" VARCHAR(100) NOT NULL,
  "horarioSalida" TIME NOT NULL,
  "fechaViaje" DATE NOT NULL,
  precio NUMERIC(10,2) NOT NULL,
  "cantPasajeros" INT NOT NULL CHECK ("cantPasajeros" >= 0),
  "medioTransporte_id" INT NOT NULL REFERENCES "MedioTransporte"(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  "usuarioEmpresa_id" INT NOT NULL REFERENCES "usuarioEmpresa"(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  eliminado VARCHAR(10) DEFAULT 'no',
  deleted_at TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Reservas
CREATE TABLE IF NOT EXISTS "Reservas" (
  id SERIAL PRIMARY KEY,
  "fechaReserva" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  usuarios_id INT NOT NULL REFERENCES "Usuarios"(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  viajes_id INT NOT NULL REFERENCES "Viajes"(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  "idempotencyKey" VARCHAR(255) UNIQUE,
  eliminado VARCHAR(10) DEFAULT 'no',
  deleted_at TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Pasajeros
CREATE TABLE IF NOT EXISTS "pasajeros" (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  dni INT NOT NULL,
  "ubicacionOrigen" VARCHAR(150) NOT NULL,
  "ubicacionDestino" VARCHAR(150) NOT NULL,
  reserva_id INT NOT NULL REFERENCES "Reservas"(id) ON UPDATE CASCADE ON DELETE CASCADE,
  "numeroAsiento" INT,
  eliminado VARCHAR(10) DEFAULT 'no',
  deleted_at TIMESTAMPTZ
);

-- 10. Ventas y DetalleVenta
CREATE TABLE IF NOT EXISTS "Ventas" (
  id SERIAL PRIMARY KEY,
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  "totalVentas" NUMERIC(10,2) NOT NULL,
  reserva_id INT NOT NULL REFERENCES "Reservas"(id) ON UPDATE CASCADE ON DELETE CASCADE,
  eliminado VARCHAR(10) DEFAULT 'no',
  deleted_at TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "DetalleVenta" (
  id SERIAL PRIMARY KEY,
  "formaPago" VARCHAR(50) NOT NULL,
  "subTotal" NUMERIC(10,2) NOT NULL,
  descuento NUMERIC(10,2) DEFAULT 0,
  "precioFinal" NUMERIC(10,2) NOT NULL,
  ventas_id INT NOT NULL REFERENCES "Ventas"(id) ON UPDATE CASCADE ON DELETE CASCADE,
  eliminado VARCHAR(10) DEFAULT 'no',
  deleted_at TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);

-- 11. Pagos (Mercado Pago / Checkout)
CREATE TABLE IF NOT EXISTS "Pagos" (
  id SERIAL PRIMARY KEY,
  reserva_id INT NOT NULL REFERENCES "Reservas"(id) ON UPDATE CASCADE ON DELETE CASCADE,
  monto FLOAT NOT NULL,
  estado VARCHAR(50) NOT NULL DEFAULT 'pendiente',
  mp_preference_id VARCHAR(255),
  mp_payment_id VARCHAR(255),
  mp_external_reference VARCHAR(255),
  mp_init_point TEXT,
  "fechaCreacion" TIMESTAMPTZ DEFAULT NOW(),
  "fechaActualizacion" TIMESTAMPTZ DEFAULT NOW(),
  eliminado VARCHAR(10) DEFAULT 'no'
);

-- 12. WebhookEvents
CREATE TABLE IF NOT EXISTS "WebhookEvents" (
  id SERIAL PRIMARY KEY,
  topic VARCHAR(100) NOT NULL,
  "resourceId" VARCHAR(255) NOT NULL,
  payload JSONB,
  "processedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS webhook_events_topic_resourceId_unique ON "WebhookEvents" (topic, "resourceId");

-- Índices de alto rendimiento
CREATE INDEX IF NOT EXISTS idx_viajes_busqueda ON "Viajes" ("fechaViaje", "origenLocalidad", "destinoLocalidad");
CREATE INDEX IF NOT EXISTS idx_reservas_usuario ON "Reservas" (usuarios_id);
CREATE INDEX IF NOT EXISTS idx_reservas_viaje ON "Reservas" (viajes_id);
CREATE INDEX IF NOT EXISTS idx_pasajeros_reserva ON "pasajeros" (reserva_id);

-- Carga de perfiles base si no existen
INSERT INTO "Perfiles" (id, tipo, "createdAt", "updatedAt") VALUES
  (1, 'usuarioAdministrador', NOW(), NOW()),
  (2, 'usuarioCliente', NOW(), NOW()),
  (3, 'usuarioMostrador', NOW(), NOW()),
  (4, 'usuarioChofer', NOW(), NOW()),
  (5, 'usuarioEmpresa', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

SELECT setval('"Perfiles_id_seq"', (SELECT COALESCE(MAX(id), 1) FROM "Perfiles"));
