const mongoose = require("mongoose");

const comentarioSchema = new mongoose.Schema({
  usuario: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true
  },
  texto: {
    type: String,
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  likes: {
    type: Number,
    default: 0
  }
});

const publicacionSchema = new mongoose.Schema({
  texto: {
    type: String,
    required: true
  },
  imagen: {
    type: String
  },
  autor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Usuario",
    required: true
  },
  fecha: {
    type: Date,
    default: Date.now
  },
  likes: {
    type: Number,
    default: 0
  },
  comentarios: [comentarioSchema]
});

module.exports = mongoose.model("Publicacion", publicacionSchema);
