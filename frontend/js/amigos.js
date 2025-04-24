window.onload = async () => {
    const token = localStorage.getItem("token");
    const usuario = JSON.parse(localStorage.getItem("usuario"));
  
    if (!token || !usuario) {
      alert("Acceso no autorizado.");
      window.location.href = "inicio.html";
      return;
    }
  
    await cargarSolicitudes(usuario.id, token);
    await cargarAmigos(usuario.id, token);
  };
  
  async function cargarSolicitudes(miId, token) {
    const contenedor = document.getElementById("solicitudes");
    contenedor.innerHTML = "⌛ Cargando solicitudes...";
  
    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${miId}/solicitudes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      contenedor.innerHTML = "";
  
      if (data.solicitudes.length === 0) {
        contenedor.innerHTML = "<p>No tienes solicitudes pendientes.</p>";
      } else {
        data.solicitudes.forEach(soli => {
          const div = document.createElement("div");
          div.classList.add("usuario");
          div.innerHTML = `
            <img src="${soli.fotoPerfil || 'img/default.png'}" alt="Foto" width="40">
            <span>${soli.nombre}</span>
            <button onclick="responderSolicitud('${miId}', '${soli._id}', true)">✅ Aceptar</button>
            <button onclick="responderSolicitud('${miId}', '${soli._id}', false)">❌ Rechazar</button>
          `;
          contenedor.appendChild(div);
        });
      }
    } catch (error) {
      contenedor.innerHTML = "❌ Error al cargar solicitudes.";
      console.error(error);
    }
  }
  
  async function cargarAmigos(miId, token) {
    const contenedor = document.getElementById("amigos");
    contenedor.innerHTML = "⌛ Cargando amigos...";
  
    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${miId}/amigos`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      contenedor.innerHTML = "";
  
      if (data.amigos.length === 0) {
        contenedor.innerHTML = "<p>No tienes amigos todavía.</p>";
      } else {
        data.amigos.forEach(amigo => {
          const div = document.createElement("div");
          div.classList.add("usuario");
          div.innerHTML = `
            <img src="${amigo.fotoPerfil || 'img/default.png'}" alt="Foto" width="40">
            <span>${amigo.nombre}</span>
            <div class="chat-icon">
              <img src="img/chat.png" width="18" />
              <span style="color: green;">Chat</span>
            </div>
          `;
          contenedor.appendChild(div);
        });
      }
    } catch (error) {
      contenedor.innerHTML = "❌ Error al cargar amigos.";
      console.error(error);
    }
  }
  
  async function responderSolicitud(miId, otroId, aceptar) {
    const token = localStorage.getItem("token");
    const accion = aceptar ? "aceptar" : "rechazar";
  
    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${miId}/${accion}/${otroId}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
  
      const data = await res.json();
      alert(data.mensaje || "Solicitud procesada");
      location.reload();
    } catch (error) {
      alert("❌ Error al procesar la solicitud.");
      console.error(error);
    }
  }
  
  // 🔍 Buscar usuarios
  async function buscarUsuarios() {
    const query = document.getElementById("busqueda").value;
    const token = localStorage.getItem("token");
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const contenedor = document.getElementById("resultadosBusqueda");
    contenedor.innerHTML = "🔎 Buscando...";
  
    if (!query.trim()) {
      contenedor.innerHTML = "<p>Escribe un nombre o correo.</p>";
      return;
    }
  
    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/buscar?q=${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
  
      const data = await res.json();
      contenedor.innerHTML = "";
  
      if (data.usuarios.length === 0) {
        contenedor.innerHTML = "<p>No se encontraron usuarios.</p>";
        return;
      }
  
      data.usuarios.forEach(usu => {
        const div = document.createElement("div");
        div.classList.add("usuario");
  
        let contenido = `
          <img src="${usu.fotoPerfil || 'img/default.png'}" alt="Foto" width="40">
          <span>${usu.nombre}</span>
        `;
  
        if (usu.amigo) {
          contenido += `<span style="color: blue;">💬 Ya es tu amigo</span>`;
        } else {
          contenido += `<button onclick="enviarSolicitud('${usuario.id}', '${usu._id}')">➕ Enviar Solicitud</button>`;
        }
  
        div.innerHTML = contenido;
        contenedor.appendChild(div);
      });
  
    } catch (error) {
      contenedor.innerHTML = "❌ Error al buscar.";
      console.error(error);
    }
  }
  
  // 📤 Enviar solicitud
  async function enviarSolicitud(miId, otroId) {
    const token = localStorage.getItem("token");
  
    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${miId}/solicitud/${otroId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
  
      const data = await res.json();
      alert(data.mensaje || "Solicitud enviada");
    } catch (error) {
      alert("❌ Error al enviar solicitud");
      console.error(error);
    }
  }
  