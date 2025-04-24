// ✅ perfil.js - Mostrar y actualizar perfil del usuario con foto

window.onload = () => {
    const usuario = JSON.parse(localStorage.getItem("usuario"));
    const token = localStorage.getItem("token");
  
    if (!usuario || !token) {
      alert("Acceso no autorizado. Inicia sesión primero.");
      window.location.href = "inicio.html";
      return;
    }
  
    document.getElementById("nombre").value = usuario.nombre;
    document.getElementById("correo").value = usuario.correo;
    document.getElementById("biografia").value = usuario.biografia || "";
  
    // ✅ Mostrar la foto de perfil guardada
    const preview = document.getElementById("preview");
    if (usuario.fotoPerfil) {
      preview.src = usuario.fotoPerfil;
    } else {
      preview.src = "img/default.png"; // opcional: una imagen por defecto si no hay foto
    }
  };
  
  // ✅ Vista previa al seleccionar nueva foto
  document.getElementById("foto").addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        document.getElementById("preview").src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  });
  
  // ✅ Cerrar sesión
  document.getElementById("logout").addEventListener("click", () => {
    localStorage.removeItem("token");
    localStorage.removeItem("usuario");
    window.location.href = "inicio.html";
  });
  
  // ✅ Actualizar perfil con nueva foto
  document.getElementById("perfilForm").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const token = localStorage.getItem("token");
    const usuario = JSON.parse(localStorage.getItem("usuario"));
  
    const formData = new FormData();
    formData.append("nombre", document.getElementById("nombre").value);
    formData.append("biografia", document.getElementById("biografia").value);
  
    const file = document.getElementById("foto").files[0];
    if (file) {
      formData.append("foto", file);
    }
  
    try {
      const res = await fetch(`http://localhost:3000/api/usuarios/${usuario.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
  
      const data = await res.json();
  
      if (res.ok) {
        document.getElementById("respuesta").textContent = "✅ Perfil actualizado correctamente.";
        // Actualiza el localStorage con la nueva foto
        localStorage.setItem("usuario", JSON.stringify(data.usuario));
        document.getElementById("preview").src = data.usuario.fotoPerfil;
      } else {
        document.getElementById("respuesta").textContent = data.mensaje || "❌ Error al actualizar.";
      }
    } catch (error) {
      document.getElementById("respuesta").textContent = "❌ Error al conectar con el servidor.";
      console.error(error);
    }
  });
  