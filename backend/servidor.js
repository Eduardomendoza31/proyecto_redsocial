const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno desde .env
dotenv.config({ path: './backend/.env' });

const app = express();
console.log("🧪 Probando lectura .env:", process.env.MONGO_URI);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Para procesar formularios

// ✅ Servir toda la carpeta frontend (HTML, CSS, JS, imágenes, etc.)
app.use(express.static(path.join(__dirname, '../frontend')));

// ✅ Servir imágenes directamente desde /img (opcional si ya están dentro del frontend)
app.use('/img', express.static(path.join(__dirname, '../frontend/img')));

// 📌 Importar rutas
const rutasUsuario = require('./rutas/usuario.ruta');
const rutasPublicacion = require('./rutas/publicacion.ruta');

// 🛣️ Usar rutas
app.use('/api/usuarios', rutasUsuario);
app.use('/api/publicaciones', rutasPublicacion);

// 🔌 Conexión a MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch(error => console.error('❌ Error al conectar a MongoDB:', error.message));

// 🌐 Ruta de prueba
// Mostrar el archivo inicio.html cuando se entra a la raíz
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/inicio.html'));
});


// 🔁 Redirigir automáticamente a inicio.html cuando se entra a /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/inicio.html'));
});

// 🟢 Iniciar servidor
const PUERTO = process.env.PORT || 3000;
app.listen(PUERTO, () => {
  console.log(`🟢 Servidor corriendo en http://localhost:${PUERTO}`);
});
