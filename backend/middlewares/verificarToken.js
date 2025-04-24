const jwt = require("jsonwebtoken");

function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ mensaje: "Token no enviado" });

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.CLAVE_JWT, (err, usuario) => {
    if (err) return res.status(403).json({ mensaje: "Token inválido" });
    req.usuario = usuario;
    next();
  });
}

module.exports = verificarToken;
