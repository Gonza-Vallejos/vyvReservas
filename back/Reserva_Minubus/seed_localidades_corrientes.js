const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
  logging: false,
});

const localidadesCorrientes = [
  'Corrientes',
  'San Roque',
  'Goya',
  'Mercedes',
  'Bella Vista',
  'Curuzú Cuatiá',
  'Paso de los Libres',
  'Ituzaingó',
  'Saladas',
  'Santa Lucía',
  'Esquina',
  'Monte Caseros',
  'Santo Tomé',
  'Empedrado',
  'Itatí',
  'San Cosme',
  'Paso de la Patria',
  'Riachuelo',
  'San Luis del Palmar',
  'Mburucuyá',
  'Concepción',
  'Santa Rosa',
  'San Miguel',
  'Chavarría',
  'Yapeyú',
  'Alvear',
  'La Cruz',
  'Gobernador Virasoro',
  'Colonia Liebig',
  'Carlos Pellegrini',
  'Lavalle',
  'San Isidro',
  'Perugorría',
  'Mariano I. Loza',
  'Sauce',
  'Mocoretá',
  'Bonpland',
  'Tapebicuá',
  'Guaviraví',
  'Loreto',
  'Herlitzka',
  'Ramada Paso',
  'Palmar Grande',
  'Lomas de Vallejos',
  'Caá Catí',
  'Berón de Astrada',
  'Itá Ibaté',
  'Villa Olivari',
  'Garruchos',
  'Colonia Libertad',
  'Juan Pujol',
  'Parada Pucheta',
  'Colonia Pando',
  'Colonia Carolina',
  'Cruz de los Milagros',
  'Cecilio Echeverría',
  'Pago de los Deseos',
  'Tatacuá',
  'Tabay',
  'El Sombrero',
  'Tres de Abril',
  'San Antonio'
];

async function seedLocalidades() {
  try {
    console.log('⏳ Conectando a Supabase...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida con éxito.');

    // 1. Asegurar País Argentina
    let [paises] = await sequelize.query(`SELECT id FROM "Pais" WHERE nombre ILIKE 'Argentina' LIMIT 1;`);
    let paisId;
    if (paises.length === 0) {
      const [res] = await sequelize.query(`INSERT INTO "Pais" (nombre) VALUES ('Argentina') RETURNING id;`);
      paisId = res[0].id;
      console.log(`🇦🇷 Creado país Argentina con ID: ${paisId}`);
    } else {
      paisId = paises[0].id;
      console.log(`🇦🇷 País Argentina encontrado con ID: ${paisId}`);
    }

    // 2. Asegurar Provincia Corrientes
    let [provincias] = await sequelize.query(
      `SELECT id FROM "Provincia" WHERE nombre ILIKE 'Corrientes' LIMIT 1;`
    );
    let provinciaId;
    if (provincias.length === 0) {
      const [res] = await sequelize.query(
        `INSERT INTO "Provincia" (nombre, pais_id) VALUES ('Corrientes', :paisId) RETURNING id;`,
        { replacements: { paisId } }
      );
      provinciaId = res[0].id;
      console.log(`📍 Creada provincia Corrientes con ID: ${provinciaId}`);
    } else {
      provinciaId = provincias[0].id;
      console.log(`📍 Provincia Corrientes encontrada con ID: ${provinciaId}`);
    }

    // 3. Cargar Localidades
    console.log(`📦 Verificando e insertando ${localidadesCorrientes.length} localidades...`);
    let insertadas = 0;
    let existentes = 0;

    for (const nombre of localidadesCorrientes) {
      const [existe] = await sequelize.query(
        `SELECT id FROM "Localidad" WHERE nombre ILIKE :nombre AND provincia_id = :provinciaId LIMIT 1;`,
        { replacements: { nombre, provinciaId } }
      );

      if (existe.length === 0) {
        await sequelize.query(
          `INSERT INTO "Localidad" (nombre, provincia_id) VALUES (:nombre, :provinciaId);`,
          { replacements: { nombre, provinciaId } }
        );
        insertadas++;
      } else {
        existentes++;
      }
    }

    console.log(`\n🎉 ¡Carga finalizada con éxito en Supabase!`);
    console.log(`   ➕ Nuevas insertadas: ${insertadas}`);
    console.log(`   ✔️ Ya existentes:     ${existentes}`);
    console.log(`   📍 Total disponibles: ${insertadas + existentes}`);
  } catch (error) {
    console.error('❌ Error en el seeder:', error.message);
  } finally {
    await sequelize.close();
  }
}

seedLocalidades();
