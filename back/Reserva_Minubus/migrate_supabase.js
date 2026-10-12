const { Client } = require("pg");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

async function run() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL no está definida en .env");
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Conectado a PostgreSQL de Supabase...");
    const sql = fs.readFileSync(path.join(__dirname, "supabase_schema.sql"), "utf8");
    await client.query(sql);
    console.log("¡Migración y creación de tablas en Supabase exitosa!");
  } catch (err) {
    console.error("Error al aplicar la migración:", err);
  } finally {
    await client.end();
  }
}

run();
