// ✅ publicaciones.js - Mostrar y crear publicaciones con comentarios y "chócale"
document.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const token = localStorage.getItem("token");
  
    if (!usuario || !token) {
      alert("Acceso no autorizado. Inicia sesión primero.");
      window.location.href = "inicio.html";
      return;
    }
  
    document.getElementById("nombreUsuario").textContent = usuario.nombre;
    cargarPublicaciones();
  
    const form = document.getElementById("formPublicacion");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const formData = new FormData();
      formData.append("texto", document.getElementById("texto").value);
      formData.append("autor", usuario.id);
  
      const imagen = document.getElementById("imagen").files[0];
      if (imagen) {
        formData.append("imagen", imagen);
      }
  
      try {
        const res = await fetch("http://localhost:3000/api/publicaciones", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
  
        const data = await res.json();
        if (res.ok) {
          form.reset();
          cargarPublicaciones();
        } else {
          alert(data.mensaje || "❌ Error al publicar");
        }
      } catch (error) {
        alert("❌ Error al conectar al servidor");
        console.error(error);
      }
    });
  });
  
  // 📄 Cargar publicaciones
  async function cargarPublicaciones() {
    const contenedor = document.getElementById("listaPublicaciones");
    contenedor.innerHTML = "⌛ Cargando publicaciones...";
  
    try {
      const res = await fetch("http://localhost:3000/api/publicaciones");
      const data = await res.json();
  
      contenedor.innerHTML = "";
      data.publicaciones.forEach((pub) => {
        const div = document.createElement("div");
        div.classList.add("publicacion");
  
        const comentariosHTML = (pub.comentarios || [])
  .map((c) => `
    <p>
      <strong>${c.usuario?.nombre || 'Anónimo'}:</strong> ${c.texto}<br>
      <button onclick="darLikeComentario('${pub._id}', '${c._id}')">👍 (${c.likes || 0})</button>
    </p>
  `).join('');

  
        div.innerHTML = `
          <div class="info">
            <strong>${pub.autor?.nombre || "Anónimo"}</strong>
            <p>${pub.texto}</p>
            ${
              pub.imagen
                ? `<img src="${pub.imagen}" alt="Publicación" class="img-pub">`
                : ""
            }
          </div>
          <div class="acciones">
            <button onclick="darChocale('${pub._id}')">🤜 Chócale (${pub.likes || 0})</button>
          </div>
          <div class="comentarios">
            <input type="text" placeholder="Escribe un comentario..." id="comentario-${pub._id}">
            <button onclick="comentar('${pub._id}')">💬 Comentar</button>
          </div>
          <div class="lista-comentarios">${comentariosHTML}</div>
        `;
  
        contenedor.appendChild(div);
      });
    } catch (error) {
      contenedor.innerHTML = "❌ Error al cargar publicaciones.";
      console.error(error);
    }
  }
  
  // 👍 Chócale (me gusta)
  async function darChocale(id) {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`http://localhost:3000/api/publicaciones/${id}/like`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });
      await res.json();
      cargarPublicaciones();
    } catch (error) {
      console.error("❌ Error al dar like", error);
    }
  }
  
  // 💬 Agregar comentario
  async function comentar(id) {
    const token = localStorage.getItem("token");
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const input = document.getElementById(`comentario-${id}`);
    const texto = input.value;
  
    if (!texto.trim()) return alert("Escribe algo!");
  
    try {
      const res = await fetch(`http://localhost:3000/api/publicaciones/${id}/comentarios`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ usuarioId: usuario.id, texto }),
      });
  
      const data = await res.json();
      if (res.ok) {
        input.value = "";
        cargarPublicaciones();
      } else {
        alert(data.mensaje || "❌ Error al comentar");
      }
    } catch (error) {
      console.error("❌ Error al comentar", error);
    }
  }
  
  // 👍 Like a comentario
  async function darLikeComentario(idPublicacion, idComentario) {
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(
        `http://localhost:3000/api/publicaciones/${idPublicacion}/comentarios/${idComentario}/like`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      await res.json();
      cargarPublicaciones();
    } catch (error) {
      console.error("❌ Error al dar like al comentario", error);
    }
  }
  