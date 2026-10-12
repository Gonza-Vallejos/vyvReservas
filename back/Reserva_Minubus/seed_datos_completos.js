const { Sequelize } = require('sequelize');
const bcrypt = require('bcrypt');
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

async function seedDataCompleta() {
  try {
    console.log('⏳ Conectando a Supabase...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida.');

    // 1. Asegurar Perfiles básicos
    const perfiles = [
      { id: 1, tipo: 'usuarioAdministrador' },
      { id: 2, tipo: 'usuarioCliente' },
      { id: 3, tipo: 'usuarioMostrador' },
      { id: 4, tipo: 'usuarioChofer' },
      { id: 5, tipo: 'usuarioEmpresa' },
    ];
    for (const p of perfiles) {
      await sequelize.query(
        `INSERT INTO "Perfiles" (id, tipo) VALUES (:id, :tipo) ON CONFLICT (id) DO UPDATE SET tipo = :tipo;`,
        { replacements: p }
      );
    }
    console.log('✅ Perfiles listos (Admin, Cliente, Mostrador, Chofer, Empresa).');

    // 2. Hash de contraseña estándar para pruebas: "123456"
    const passwordHash = await bcrypt.hash('123456', 10);

    // 3. Crear Usuario Empresa (Dueño)
    let [userEmpresaRes] = await sequelize.query(
      `SELECT id FROM "Usuarios" WHERE usuario = 'empresa_vyv' LIMIT 1;`
    );
    let idUserEmpresa;
    if (userEmpresaRes.length === 0) {
      const [res] = await sequelize.query(`
        INSERT INTO "Usuarios" (nombre, apellido, dni, telefono, email, usuario, contrasenia, perfil_id, verificado, eliminado, "createdAt", "updatedAt")
        VALUES ('Gonzalo', 'Vallejos', 35000001, '3794112233', 'empresa@vyvreservas.com', 'empresa_vyv', :hash, 5, true, 'no', NOW(), NOW())
        RETURNING id;
      `, { replacements: { hash: passwordHash } });
      idUserEmpresa = res[0].id;
    } else {
      idUserEmpresa = userEmpresaRes[0].id;
    }

    // 4. Crear Usuario Chofer
    let [choferRes] = await sequelize.query(
      `SELECT id FROM "Usuarios" WHERE usuario = 'chofer_juan' LIMIT 1;`
    );
    let idChofer;
    if (choferRes.length === 0) {
      const [res] = await sequelize.query(`
        INSERT INTO "Usuarios" (nombre, apellido, dni, telefono, email, usuario, contrasenia, perfil_id, verificado, eliminado, "createdAt", "updatedAt")
        VALUES ('Juan', 'Pérez', 35000002, '3794998877', 'chofer.juan@vyvreservas.com', 'chofer_juan', :hash, 4, true, 'no', NOW(), NOW())
        RETURNING id;
      `, { replacements: { hash: passwordHash } });
      idChofer = res[0].id;
    } else {
      idChofer = choferRes[0].id;
    }

    // 5. Crear Usuario Cliente de prueba
    let [clienteRes] = await sequelize.query(
      `SELECT id FROM "Usuarios" WHERE usuario = 'cliente_test' LIMIT 1;`
    );
    if (clienteRes.length === 0) {
      await sequelize.query(`
        INSERT INTO "Usuarios" (nombre, apellido, dni, telefono, email, usuario, contrasenia, perfil_id, verificado, eliminado, "createdAt", "updatedAt")
        VALUES ('Carlos', 'Gómez', 35000003, '3794556677', 'cliente.test@gmail.com', 'cliente_test', :hash, 2, true, 'no', NOW(), NOW());
      `, { replacements: { hash: passwordHash } });
    }
    console.log('✅ Usuarios creados:');
    console.log('   - Empresa: empresa_vyv / 123456');
    console.log('   - Chofer:  chofer_juan / 123456');
    console.log('   - Cliente: cliente_test / 123456');

    // 6. Obtener ID de localidad San Roque o Corrientes
    const [locRes] = await sequelize.query(`SELECT id FROM "Localidad" WHERE nombre ILIKE 'San Roque' LIMIT 1;`);
    const localidadId = locRes.length > 0 ? locRes[0].id : 1;

    // 7. Crear Empresa
    let [empresaRes] = await sequelize.query(
      `SELECT id FROM "Empresa" WHERE cuit = '30-71234567-9' LIMIT 1;`
    );
    let empresaId;
    if (empresaRes.length === 0) {
      const [res] = await sequelize.query(`
        INSERT INTO "Empresa" (nombre, direccion, cuit, telefono, email, localidad_id, eliminado, "createdAt", "updatedAt")
        VALUES ('V&V Reservas Express', 'Av. San Martín 450', '30-71234567-9', '3777450123', 'contacto@vyvreservas.com', :locId, 'no', NOW(), NOW())
        RETURNING id;
      `, { replacements: { locId: localidadId } });
      empresaId = res[0].id;
    } else {
      empresaId = empresaRes[0].id;
    }
    console.log(`✅ Empresa registrada: V&V Reservas Express (ID: ${empresaId})`);

    // 8. Asociar Usuario Empresa y Chofer a la Empresa en usuarioEmpresa
    // Vinculación Dueño
    await sequelize.query(`
      INSERT INTO "usuarioEmpresa" (id_usuario, id_empresa, "createdAt", "updatedAt")
      VALUES (:userId, :empresaId, NOW(), NOW())
      ON CONFLICT DO NOTHING;
    `, { replacements: { userId: idUserEmpresa, empresaId } });

    // Vinculación Chofer
    let [asocChoferRes] = await sequelize.query(`
      SELECT id FROM "usuarioEmpresa" WHERE id_usuario = :userId AND id_empresa = :empresaId LIMIT 1;
    `, { replacements: { userId: idChofer, empresaId } });
    let usuarioEmpresaChoferId;
    if (asocChoferRes.length === 0) {
      const [res] = await sequelize.query(`
        INSERT INTO "usuarioEmpresa" (id_usuario, id_empresa, "createdAt", "updatedAt")
        VALUES (:userId, :empresaId, NOW(), NOW())
        RETURNING id;
      `, { replacements: { userId: idChofer, empresaId } });
      usuarioEmpresaChoferId = res[0].id;
    } else {
      usuarioEmpresaChoferId = asocChoferRes[0].id;
    }
    console.log(`✅ Chofer vinculado a la empresa (usuarioEmpresa ID: ${usuarioEmpresaChoferId})`);

    // 9. Crear Medio de Transporte (Minibús Mercedes-Benz Sprinter de 19 asientos)
    let [transporteRes] = await sequelize.query(
      `SELECT id FROM "MedioTransporte" WHERE patente = 'AF-123-VY' LIMIT 1;`
    );
    let medioTransporteId;
    if (transporteRes.length === 0) {
      const [res] = await sequelize.query(`
        INSERT INTO "MedioTransporte" (nombre, patente, marca, "cantLugares", empresa_id, eliminado, "createdAt", "updatedAt")
        VALUES ('Minibús 01 - Sprinter', 'AF-123-VY', 'Mercedes-Benz Sprinter 516', 19, :empresaId, 'no', NOW(), NOW())
        RETURNING id;
      `, { replacements: { empresaId } });
      medioTransporteId = res[0].id;
    } else {
      medioTransporteId = transporteRes[0].id;
    }
    console.log(`✅ Minibús registrado (ID: ${medioTransporteId}, 19 Asientos)`);

    // 10. Crear Viajes de Prueba para HOY y los próximos días
    // Fecha de hoy y mañana
    const hoy = new Date();
    const fechaHoyStr = hoy.toISOString().split('T')[0];

    const maniana = new Date();
    maniana.setDate(maniana.getDate() + 1);
    const fechaManianaStr = maniana.toISOString().split('T')[0];

    // Viaje 1: San Roque -> Corrientes
    await sequelize.query(`
      INSERT INTO "Viajes" ("origenLocalidad", "destinoLocalidad", "horarioSalida", "fechaViaje", precio, "cantPasajeros", "medioTransporte_id", "usuarioEmpresa_id", eliminado, "createdAt", "updatedAt")
      VALUES ('San Roque', 'Corrientes', '08:00:00', :fechaHoy, 8500, 19, :transporteId, :usuarioEmpresaId, 'no', NOW(), NOW());
    `, { replacements: { fechaHoy: fechaHoyStr, transporteId: medioTransporteId, usuarioEmpresaId: usuarioEmpresaChoferId } });

    // Viaje 2: Corrientes -> San Roque (Vuelta)
    await sequelize.query(`
      INSERT INTO "Viajes" ("origenLocalidad", "destinoLocalidad", "horarioSalida", "fechaViaje", precio, "cantPasajeros", "medioTransporte_id", "usuarioEmpresa_id", eliminado, "createdAt", "updatedAt")
      VALUES ('Corrientes', 'San Roque', '18:30:00', :fechaHoy, 8500, 19, :transporteId, :usuarioEmpresaId, 'no', NOW(), NOW());
    `, { replacements: { fechaHoy: fechaHoyStr, transporteId: medioTransporteId, usuarioEmpresaId: usuarioEmpresaChoferId } });

    // Viaje 3: San Roque -> Goya (Mañana)
    await sequelize.query(`
      INSERT INTO "Viajes" ("origenLocalidad", "destinoLocalidad", "horarioSalida", "fechaViaje", precio, "cantPasajeros", "medioTransporte_id", "usuarioEmpresa_id", eliminado, "createdAt", "updatedAt")
      VALUES ('San Roque', 'Goya', '09:15:00', :fechaManiana, 6500, 19, :transporteId, :usuarioEmpresaId, 'no', NOW(), NOW());
    `, { replacements: { fechaManiana: fechaManianaStr, transporteId: medioTransporteId, usuarioEmpresaId: usuarioEmpresaChoferId } });

    console.log('\n🚌 ¡Viajes creados exitosamente!');
    console.log(`   1. San Roque ➔ Corrientes (08:00 hs) - $8.500 [Fecha: ${fechaHoyStr}]`);
    console.log(`   2. Corrientes ➔ San Roque (18:30 hs) - $8.500 [Fecha: ${fechaHoyStr}]`);
    console.log(`   3. San Roque ➔ Goya (09:15 hs) - $6.500 [Fecha: ${fechaManianaStr}]`);
    console.log('\n✨ Todo listo para probar la búsqueda, selección de asientos y reserva completa.');

  } catch (error) {
    console.error('❌ Error creando datos completos:', error);
  } finally {
    await sequelize.close();
  }
}

seedDataCompleta();
