-- ==============================================================================
-- MIGRACIÓN SUPABASE: Asientos, Pagos, Idempotencia y Webhooks
-- ==============================================================================

-- 1. Agregar columna numeroAsiento a la tabla pasajeros
ALTER TABLE "pasajeros" 
ADD COLUMN IF NOT EXISTS "numeroAsiento" INT;

-- 2. Agregar columna idempotencyKey a la tabla Reservas
ALTER TABLE "Reservas" 
ADD COLUMN IF NOT EXISTS "idempotencyKey" VARCHAR(255) UNIQUE;

-- 3. Crear tabla Pagos (Mercado Pago y Pasarela de Pagos)
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

-- 4. Crear tabla WebhookEvents para idempotencia de eventos de pago
CREATE TABLE IF NOT EXISTS "WebhookEvents" (
  id SERIAL PRIMARY KEY,
  topic VARCHAR(100) NOT NULL,
  "resourceId" VARCHAR(255) NOT NULL,
  payload JSONB,
  "processedAt" TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ DEFAULT NOW()
);
CREATE UNIQUE INDEX IF NOT EXISTS webhook_events_topic_resourceId_unique 
ON "WebhookEvents" (topic, "resourceId");

-- 5. Registrar las migraciones en SequelizeMeta para mantener sincronía
CREATE TABLE IF NOT EXISTS "SequelizeMeta" (name VARCHAR(255) PRIMARY KEY);
INSERT INTO "SequelizeMeta" (name) VALUES 
  ('20251014120000-add-numero-asiento-pasajeros.js'),
  ('20251014130000-create-pagos.js'),
  ('20251014140000-add-idempotency-to-reservas.js'),
  ('20251014141000-create-webhook-events.js')
ON CONFLICT (name) DO NOTHING;
