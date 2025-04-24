const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Publicacion = require('../modelos/publicacion');
const Usuario = require('../modelos/usuario');
const verificarToken = require('../middlewares/verificarToken');

// 📸 Configurar Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../frontend/img'));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// 🔄 Obtener todas las publicaciones
router.get('/', async (req, res) => {
  try {
    const publicaciones = await Publicacion.find()
      .populate('autor', 'nombre fotoPerfil')
      .populate('comentarios.usuario', 'nombre')
      .sort({ fecha: -1 });

    res.json({ publicaciones });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al obtener publicaciones ❌', error });
  }
});

// 📤 Crear publicación
router.post('/', verificarToken, upload.single('imagen'), async (req, res) => {
  const { texto } = req.body;
  const autor = req.usuario.id;
  const imagen = req.file ? `/img/${req.file.filename}` : '';

  try {
    const nuevaPublicacion = new Publicacion({ texto, imagen, autor });
    await nuevaPublicacion.save();

    res.status(201).json({ mensaje: 'Publicación creada ✅', publicacion: nuevaPublicacion });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al crear publicación ❌', error });
  }
});

// 🫰 Dar like a publicación con notificación
router.put('/:id/like', verificarToken, async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    const publicacion = await Publicacion.findById(req.params.id).populate('autor');

    if (!publicacion) return res.status(404).json({ mensaje: 'Publicación no encontrada' });

    publicacion.likes = (publicacion.likes || 0) + 1;
    await publicacion.save();

    // 🔔 Notificar al autor si no es él mismo
    if (publicacion.autor._id.toString() !== usuarioId) {
      const autor = await Usuario.findById(publicacion.autor._id);
      const quien = await Usuario.findById(usuarioId);

      autor.notificaciones.push({
        mensaje: `${quien.nombre} le dio like a tu publicación`,
        leido: false
      });

      await autor.save();
    }

    res.json({ mensaje: 'Like agregado 👍', publicacion });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al dar like ❌', error });
  }
});

// 💬 Comentar publicación con notificación
router.post('/:id/comentarios', verificarToken, async (req, res) => {
  const { texto } = req.body;
  const usuarioId = req.usuario.id;

  try {
    const publicacion = await Publicacion.findById(req.params.id).populate('autor');
    if (!publicacion) return res.status(404).json({ mensaje: 'Publicación no encontrada' });

    publicacion.comentarios.push({ usuario: usuarioId, texto });
    await publicacion.save();

    // 🔔 Notificar si no comenta en su propia publicación
    if (publicacion.autor._id.toString() !== usuarioId) {
      const autor = await Usuario.findById(publicacion.autor._id);
      const comentador = await Usuario.findById(usuarioId);

      autor.notificaciones.push({
        mensaje: `${comentador.nombre} comentó tu publicación`,
        leido: false
      });

      await autor.save();
    }

    res.json({ mensaje: 'Comentario agregado 💬', publicacion });
  } catch (error) {
    res.status(500).json({ mensaje: 'Error al comentar ❌', error });
  }
});

// ❤️ Dar like a un comentario
router.put('/:idPublicacion/comentarios/:idComentario/like', async (req, res) => {
  try {
    const publicacion = await Publicacion.findById(req.params.idPublicacion);
    if (!publicacion) return res.status(404).json({ mensaje: "Publicación no encontrada" });

    const comentario = publicacion.comentarios.id(req.params.idComentario);
    if (!comentario) return res.status(404).json({ mensaje: "Comentario no encontrado" });

    comentario.likes = (comentario.likes || 0) + 1;
    await publicacion.save();

    res.json({ mensaje: "Like al comentario agregado 👍", publicacion });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al dar like al comentario", error });
  }
});

module.exports = router;
