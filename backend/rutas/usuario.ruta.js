const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Usuario = require('../modelos/usuario');
const dotenv = require('dotenv');
const multer = require('multer');
const path = require('path');
const verificarToken = require('../middlewares/verificarToken'); // ✅ Middleware JWT

dotenv.config();

// ✅ Configuración de Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../frontend/img'));
  },
  filename: (req, file, cb) => {
    const nombreUnico = Date.now() + '-' + file.originalname;
    cb(null, nombreUnico);
  }
});
const upload = multer({ storage });

// 📥 Registro
router.post('/registrar', upload.single('foto'), async (req, res) => {
  const { nombre, correo, contrasena, biografia } = req.body;
  const contraseña = contrasena;
  const fotoPerfil = req.file ? `/img/${req.file.filename}` : '';

  try {
    const existente = await Usuario.findOne({ correo });
    if (existente) {
      return res.status(400).json({ mensaje: 'El correo ya está registrado.' });
    }

    const nuevo = new Usuario({
      nombre,
      correo,
      contraseña,
      biografia,
      fotoPerfil,
      solicitudes: [],
      amigos: []
    });

    await nuevo.save();
    res.status(201).json({ mensaje: 'Usuario registrado exitosamente ✅' });
  } catch (error) {
    console.error("❌ Error exacto en registro:", error);
    res.status(500).json({ mensaje: 'Error al registrar el usuario ❌', error });
  }
});

// 🔐 Login
router.post('/login', async (req, res) => {
  const { correo, contraseña } = req.body;

  try {
    const usuario = await Usuario.findOne({ correo });
    if (!usuario) return res.status(400).json({ mensaje: 'Correo o contraseña incorrectos.' });

    const valido = await usuario.compararContraseña(contraseña);
    if (!valido) return res.status(400).json({ mensaje: 'Correo o contraseña incorrectos.' });

    const token = jwt.sign({ id: usuario._id }, process.env.CLAVE_JWT, { expiresIn: '1h' });

    res.json({
      mensaje: 'Inicio de sesión exitoso 🔓',
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        correo: usuario.correo,
        biografia: usuario.biografia || '',
        fotoPerfil: usuario.fotoPerfil || ''
      },
      token
    });
  } catch (error) {
    console.error("❌ Error exacto en login:", error);
    res.status(500).json({ mensaje: 'Error al iniciar sesión ❌', error });
  }
});

// ✏️ Actualizar perfil
router.put('/:id', upload.single('foto'), async (req, res) => {
  const { id } = req.params;
  const { nombre, biografia } = req.body;
  const fotoPerfil = req.file ? `/img/${req.file.filename}` : undefined;

  const nuevosDatos = { nombre, biografia };
  if (fotoPerfil) nuevosDatos.fotoPerfil = fotoPerfil;

  try {
    const actualizado = await Usuario.findByIdAndUpdate(id, nuevosDatos, { new: true });
    if (!actualizado) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    res.json({ mensaje: 'Perfil actualizado correctamente ✅', usuario: actualizado });
  } catch (error) {
    console.error("❌ Error al actualizar perfil:", error);
    res.status(500).json({ mensaje: 'Error al actualizar perfil ❌', error });
  }
});

// 🔍 Buscar por nombre o correo
router.get('/buscar', verificarToken, async (req, res) => {
  const query = req.query.q;
  const miId = req.usuario.id;

  try {
    const usuarios = await Usuario.find({
      $and: [
        {
          $or: [
            { nombre: { $regex: query, $options: 'i' } },
            { correo: { $regex: query, $options: 'i' } }
          ]
        },
        { _id: { $ne: miId } }
      ]
    }).select('nombre correo fotoPerfil');
    res.json({ usuarios });
  } catch (error) {
    res.status(500).json({ mensaje: '❌ Error al buscar usuarios', error });
  }
});

// 📜 Lista general
router.get('/lista', async (req, res) => {
  try {
    const usuarios = await Usuario.find({}, 'nombre correo fotoPerfil');
    res.json({ usuarios });
  } catch (error) {
    res.status(500).json({ mensaje: '❌ Error al obtener usuarios', error });
  }
});

// ➕ Enviar solicitud
router.post('/:id/solicitud/:otroId', verificarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    const otro = await Usuario.findById(req.params.otroId);

    if (!usuario || !otro) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    if (!otro.solicitudes) otro.solicitudes = [];
    if (!otro.amigos) otro.amigos = [];

    if (otro.solicitudes.includes(usuario._id) || otro.amigos.includes(usuario._id)) {
      return res.status(400).json({ mensaje: 'Ya enviaste solicitud o ya son amigos' });
    }

    otro.solicitudes.push(usuario._id);
    await otro.save();

    res.json({ mensaje: 'Solicitud enviada ✅' });
  } catch (error) {
    console.error("❌ Error al enviar solicitud:", error);
    res.status(500).json({ mensaje: 'Error al enviar solicitud ❌', error });
  }
});

// 📩 Ver solicitudes
router.get('/:id/solicitudes', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).populate('solicitudes', 'nombre fotoPerfil correo');
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    res.json({ solicitudes: usuario.solicitudes });
  } catch (error) {
    res.status(500).json({ mensaje: '❌ Error al obtener solicitudes', error });
  }
});

// ✅ Ver amigos
router.get('/:id/amigos', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id).populate('amigos', 'nombre fotoPerfil correo');
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    res.json({ amigos: usuario.amigos });
  } catch (error) {
    res.status(500).json({ mensaje: '❌ Error al obtener amigos', error });
  }
});

// ✅ Aceptar solicitud
router.put('/:id/aceptar/:otroId', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    const otro = await Usuario.findById(req.params.otroId);

    if (!usuario || !otro) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    if (!usuario.amigos.includes(otro._id)) usuario.amigos.push(otro._id);
    if (!otro.amigos.includes(usuario._id)) otro.amigos.push(usuario._id);

    usuario.solicitudes = usuario.solicitudes.filter(id => id.toString() !== otro._id.toString());

    await usuario.save();
    await otro.save();

    res.json({ mensaje: 'Solicitud aceptada 🤝' });
  } catch (error) {
    res.status(500).json({ mensaje: '❌ Error al aceptar solicitud', error });
  }
});

// ❌ Rechazar solicitud
router.put('/:id/rechazar/:otroId', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    usuario.solicitudes = usuario.solicitudes.filter(id => id.toString() !== req.params.otroId);
    await usuario.save();

    res.json({ mensaje: 'Solicitud rechazada ❌' });
  } catch (error) {
    res.status(500).json({ mensaje: '❌ Error al rechazar solicitud', error });
  }
});

module.exports = router;
// 🛎️ Agregar una notificación a un usuario
router.post('/:id/notificacion', verificarToken, async (req, res) => {
  const { mensaje } = req.body;
  const { id } = req.params;

  try {
    const usuario = await Usuario.findById(id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    usuario.notificaciones.push({ mensaje });
    await usuario.save();

    res.json({ mensaje: '📬 Notificación guardada', notificaciones: usuario.notificaciones });
  } catch (error) {
    console.error("❌ Error al guardar notificación:", error);
    res.status(500).json({ mensaje: 'Error al guardar notificación ❌', error });
  }
});
// 📬 Obtener todas las notificaciones del usuario
router.get('/:id/notificaciones', verificarToken, async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await Usuario.findById(id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    res.json({ notificaciones: usuario.notificaciones });
  } catch (error) {
    console.error("❌ Error al obtener notificaciones:", error);
    res.status(500).json({ mensaje: 'Error al obtener notificaciones ❌', error });
  }
});
// ✅ Marcar todas las notificaciones como vistas
router.put('/:id/notificaciones/vista', verificarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id);
    if (!usuario) return res.status(404).json({ mensaje: 'Usuario no encontrado' });

    usuario.notificaciones.forEach(noti => noti.leido = true);
    await usuario.save();

    res.json({ mensaje: '✅ Notificaciones marcadas como vistas' });
  } catch (error) {
    console.error("❌ Error al marcar notificaciones:", error);
    res.status(500).json({ mensaje: 'Error al marcar notificaciones ❌', error });
  }
});


