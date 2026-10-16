const usuarioService = require("../services/usuarioService");
const { sendSuccess, sendError } = require("../utils/responseHandler");

// Obtener todos los usuarios
exports.obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await usuarioService.getAll();
    sendSuccess(res, usuarios);
  } catch (error) {
    sendError(res, "Error al obtener los usuarios", 500, error);
  }
};

// Obtener un usuario por ID
exports.obtenerUsuarioPorId = async (req, res) => {
  try {
    const usuario = await usuarioService.getById(req.params.id);
    if (!usuario) {
      return sendError(res, "Usuario no encontrado", 404);
    }
    sendSuccess(res, usuario);
  } catch (error) {
    sendError(res, "Error al obtener el usuario", 500, error);
  }
};

// Crear un nuevo usuario
exports.crearUsuario = async (req, res) => {
  try {
    await usuarioService.create(req.body);
    sendSuccess(res, null, "Usuario registrado. Se envió un email de verificación.", 201);
  } catch (error) {
    sendError(res, "Error al crear el usuario", 500, error);
  }
};

exports.registrarEmpleado = async (req, res) => {
  try {
    const { empresa_id } = req.body;
    await usuarioService.createEmployee(req.body, empresa_id);
    sendSuccess(res, null, "Empleado registrado con éxito", 201);
  } catch (error) {
    console.error("Error al registrar empleado:", error);
    const messages = {
      INVALID_EMPLOYEE_PROFILE: "El perfil del empleado debe ser chofer o mostrador",
      EMPRESA_REQUIRED: "La empresa es obligatoria para registrar un empleado"
    };
    sendError(res, messages[error.message] || "Error al registrar el empleado", 400, error);
  }
};

// Actualizar un usuario existente
exports.actualizarUsuario = async (req, res) => {
  try {
    const requestedId = Number(req.params.id);
    const isPrivileged = ['usuarioAdministrador', 'usuarioEmpresa'].includes(req.usuario?.perfil);
    if (requestedId !== Number(req.usuario?.id) && !isPrivileged) {
      return sendError(res, "No podés modificar los datos de otro usuario", 403);
    }

    const actualizado = await usuarioService.update(req.params.id, req.body);
    if (!actualizado) {
      return sendError(res, "Usuario no encontrado o sin cambios", 404);
    }
    sendSuccess(res, { id: requestedId, ...req.body }, "Usuario actualizado");
  } catch (error) {
    sendError(res, "Error al actualizar el usuario", 500, error);
  }
};

// Eliminar un usuario lógicamente
exports.eliminarUsuario = async (req, res) => {
  try {
    const eliminado = await usuarioService.delete(req.params.id);
    if (!eliminado) {
      return sendError(res, "Usuario no encontrado", 404);
    }
    sendSuccess(res, null, "Usuario eliminado");
  } catch (error) {
    sendError(res, "Error al eliminar el usuario", 500, error);
  }
};

exports.actualizarContrasenia = async (req, res) => {
  const { contraseniaActual, nuevaContrasenia } = req.body;
  const { id } = req.params;

  try {
    const result = await usuarioService.updatePassword(id, contraseniaActual, nuevaContrasenia);
    
    if (result.error === "NOT_FOUND") return sendError(res, "Usuario no encontrado", 404);
    if (result.error === "INVALID_PASSWORD") return sendError(res, "La contraseña actual es incorrecta", 401);

    sendSuccess(res, null, "Contraseña actualizada correctamente");
  } catch (error) {
    sendError(res, "Error del servidor al actualizar contraseña", 500, error);
  }
};

// Obtener TODOS los choferes asociados
exports.obtenerUsuariosChoferAsociados = async (req, res) => {
  try {
    const usuarios = await usuarioService.getChoferesAsociados();
    sendSuccess(res, usuarios);
  } catch (error) {
    sendError(res, "Error al obtener los choferes asociados", 500, error);
  }
};

// Obtener choferes por ID de empresa
exports.obtenerUsuariosChoferPorEmpresa = async (req, res) => {
  try {
    const usuarios = await usuarioService.getChoferesByEmpresa(req.params.id);
    sendSuccess(res, usuarios || []);
  } catch (error) {
    sendError(res, "Error al obtener los choferes de la empresa.", 500, error);
  }
};
