const { Client } = require("pg");
require("dotenv").config();

async function migrar() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ ERROR: DATABASE_URL no está definida en el archivo .env");
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    console.log("🔌 Conectando a la base de datos...");
    await client.connect();
    console.log("✅ Conectado exitosamente.");

    // 1. Asegurar tabla de control de SequelizeMeta
    await client.query(`
      CREATE TABLE IF NOT EXISTS "SequelizeMeta" (
        name VARCHAR(255) PRIMARY KEY
      );
    `);

    // 2. Columna numeroAsiento en pasajeros
    console.log("⏳ Verificando columna numeroAsiento en pasajeros...");
    await client.query(`
      ALTER TABLE "pasajeros" 
      ADD COLUMN IF NOT EXISTS "numeroAsiento" INT;
    `);
    await client.query(`
      INSERT INTO "SequelizeMeta" (name) 
      VALUES ('20251014120000-add-numero-asiento-pasajeros.js')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log("✅ Columna 'numeroAsiento' en 'pasajeros' lista.");

    // 3. Columna idempotencyKey en Reservas
    console.log("⏳ Verificando columna idempotencyKey en Reservas...");
    await client.query(`
      ALTER TABLE "Reservas" 
      ADD COLUMN IF NOT EXISTS "idempotencyKey" VARCHAR(255) UNIQUE;
    `);
    await client.query(`
      INSERT INTO "SequelizeMeta" (name) 
      VALUES ('20251014140000-add-idempotency-to-reservas.js')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log("✅ Columna 'idempotencyKey' en 'Reservas' lista.");

    // 4. Tabla Pagos
    console.log("⏳ Verificando tabla Pagos...");
    await client.query(`
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
    `);
    await client.query(`
      INSERT INTO "SequelizeMeta" (name) 
      VALUES ('20251014130000-create-pagos.js')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log("✅ Tabla 'Pagos' lista.");

    // 5. Tabla WebhookEvents
    console.log("⏳ Verificando tabla WebhookEvents...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS "WebhookEvents" (
        id SERIAL PRIMARY KEY,
        topic VARCHAR(100) NOT NULL,
        "resourceId" VARCHAR(255) NOT NULL,
        payload JSONB,
        "processedAt" TIMESTAMPTZ,
        "createdAt" TIMESTAMPTZ DEFAULT NOW(),
        "updatedAt" TIMESTAMPTZ DEFAULT NOW()
      );
    `);
    await client.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS webhook_events_topic_resourceId_unique 
      ON "WebhookEvents" (topic, "resourceId");
    `);
    await client.query(`
      INSERT INTO "SequelizeMeta" (name) 
      VALUES ('20251014141000-create-webhook-events.js')
      ON CONFLICT (name) DO NOTHING;
    `);
    console.log("✅ Tabla 'WebhookEvents' lista.");

    console.log("\n🎉 ¡Todas las migraciones pendientes fueron aplicadas y registradas con éxito!");
  } catch (err) {
    console.error("❌ Error al aplicar las migraciones:", err);
  } finally {
    await client.end();
  }
}

migrar();
