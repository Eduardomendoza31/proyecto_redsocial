document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const usuario = JSON.parse(localStorage.getItem("usuario"));
  
    if (!token || !usuario) {
      alert("Acceso no autorizado");
      window.location.href = "inicio.html";
      return;
    }
  
    const contenedor = document.getElementById("listaNotificaciones");
    contenedor.innerHTML = "⌛ Cargando notificaciones...";
  
    try {
        const res = await fetch(`http://localhost:3000/api/usuarios/${usuario.id}/notificaciones`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
      // 🔒 Si la respuesta no es OK, lanza error manual
      if (!res.ok) throw new Error(`Error ${res.status}`);
  
      const data = await res.json();
  
      contenedor.innerHTML = "";
  
      // ✅ Verifica si existen notificaciones antes de acceder a .length
      if (!data.notificaciones || data.notificaciones.length === 0) {
        contenedor.innerHTML = "<p>No tienes notificaciones nuevas.</p>";
      } else {
        data.notificaciones.forEach(noti => {
          const div = document.createElement("div");
          div.className = "notificacion" + (noti.vista ? " vista" : "");
          div.innerHTML = `
            <strong>${noti.vista ? '🔘' : '🔴'}</strong> ${noti.mensaje} <br>
            <small>${new Date(noti.fecha).toLocaleString()}</small>
          `;
          contenedor.appendChild(div);
        });
      }
  
      // 🔄 Marcar como vistas
      await fetch(`http://localhost:3000/api/usuarios/${usuario.id}/notificaciones/vista`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` }
      });
  
    } catch (error) {
      contenedor.innerHTML = "❌ Error al cargar notificaciones.";
      console.error("🔴 Error exacto:", error);
    }
  });
  