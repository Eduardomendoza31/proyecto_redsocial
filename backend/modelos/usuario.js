const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  contraseña: { type: String, required: true },
  biografia: { type: String },
  fotoPerfil: { type: String },

  // ✅ Campos para amistad
  solicitudes: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Usuario',
    default: []
  },
  amigos: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Usuario',
    default: []
  },

  // ✅ Campo para notificaciones con "vista" como clave
  notificaciones: [
    {
      mensaje: { type: String },
      vista: { type: Boolean, default: false },  // 👈 corregido aquí
      fecha: { type: Date, default: Date.now }
    }
  ]
});

// 🔐 Encriptar la contraseña antes de guardar
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('contraseña')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.contraseña = await bcrypt.hash(this.contraseña, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// 🔍 Comparar contraseñas para el login
usuarioSchema.methods.compararContraseña = async function (inputContrasena) {
  return bcrypt.compare(inputContrasena, this.contraseña);
};

module.exports = mongoose.model('Usuario', usuarioSchema);
