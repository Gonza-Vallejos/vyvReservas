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

async function crearSuperAdmin() {
  try {
    console.log('⏳ Conectando a Supabase...');
    await sequelize.authenticate();
    console.log('✅ Conexión establecida.');

    // 1. Asegurar que existe el perfil de Administrador (ID: 1)
    await sequelize.query(`
      INSERT INTO "Perfiles" (id, tipo, "createdAt", "updatedAt")
      VALUES (1, 'usuarioAdministrador', NOW(), NOW())
      ON CONFLICT (id) DO UPDATE SET tipo = 'usuarioAdministrador';
    `);

    // 2. Definir credenciales del Super Administrador
    const adminData = {
      nombre: 'Super',
      apellido: 'Admin',
      dni: 10000001,
      telefono: '3794000001',
      email: 'admin@vyvreservas.com',
      usuario: 'superadmin',
      passwordPlana: 'Admin123456!',
      perfil_id: 1, // usuarioAdministrador
    };

    const passwordHash = await bcrypt.hash(adminData.passwordPlana, 10);

    // 3. Crear o actualizar el usuario
    const [existente] = await sequelize.query(`
      SELECT id, usuario, email FROM "Usuarios" 
      WHERE usuario = :usuario OR email = :email LIMIT 1;
    `, {
      replacements: { usuario: adminData.usuario, email: adminData.email }
    });

    let userId;

    if (existente.length > 0) {
      userId = existente[0].id;
      await sequelize.query(`
        UPDATE "Usuarios"
        SET contrasenia = :hash,
            perfil_id = :perfil_id,
            verificado = true,
            eliminado = 'no',
            "updatedAt" = NOW()
        WHERE id = :id;
      `, {
        replacements: {
          id: userId,
          hash: passwordHash,
          perfil_id: adminData.perfil_id
        }
      });
      console.log(`✅ Usuario '${adminData.usuario}' ya existía (ID: ${userId}). Se actualizó su contraseña y perfil a Administrador.`);
    } else {
      const [res] = await sequelize.query(`
        INSERT INTO "Usuarios" (
          nombre, apellido, dni, telefono, email, usuario, contrasenia,
          perfil_id, verificado, eliminado, "createdAt", "updatedAt"
        ) VALUES (
          :nombre, :apellido, :dni, :telefono, :email, :usuario, :hash,
          :perfil_id, true, 'no', NOW(), NOW()
        ) RETURNING id;
      `, {
        replacements: {
          nombre: adminData.nombre,
          apellido: adminData.apellido,
          dni: adminData.dni,
          telefono: adminData.telefono,
          email: adminData.email,
          usuario: adminData.usuario,
          hash: passwordHash,
          perfil_id: adminData.perfil_id
        }
      });
      userId = res[0].id;
      console.log(`🎉 Super Administrador creado con éxito (ID: ${userId})!`);
    }

    console.log('\n=========================================');
    console.log('🔑 DATOS DE ACCESO SUPER ADMIN:');
    console.log('   Usuario:     superadmin');
    console.log('   Email:       admin@vyvreservas.com');
    console.log('   Contraseña:  Admin123456!');
    console.log('   Rol:         usuarioAdministrador (ID 1)');
    console.log('=========================================\n');
  } catch (error) {
    console.error('❌ Error al crear el Super Administrador:', error);
  } finally {
    await sequelize.close();
  }
}

crearSuperAdmin();
