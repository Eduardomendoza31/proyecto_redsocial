// 👉 Mostrar formulario de login
function mostrarLogin() {
  document.getElementById("login").style.display = "block";
  document.getElementById("registro").style.display = "none";
  document.getElementById("botones").style.display = "none";
  document.getElementById("titulo").textContent = "Iniciar Sesión";
  document.getElementById("respuesta").textContent = "";
}

// 👉 Mostrar formulario de registro
function mostrarRegistro() {
  document.getElementById("registro").style.display = "block";
  document.getElementById("login").style.display = "none";
  document.getElementById("botones").style.display = "none";
  document.getElementById("titulo").textContent = "Registro de Usuario";
  document.getElementById("respuesta").textContent = "";
}

// 👉 Enviar formulario de registro
document.getElementById("registro").addEventListener("submit", async function(e) {
  e.preventDefault();

  const formData = new FormData();
  formData.append("nombre", document.getElementById("registroNombre").value);
  formData.append("correo", document.getElementById("registroCorreo").value);
  formData.append("contrasena", document.getElementById("registroContraseña").value);
  formData.append("biografia", document.getElementById("registroBiografia").value);

  const foto = document.getElementById("registroFoto").files[0];
  if (foto) {
    formData.append("foto", foto);
  }

  try {
    const respuesta = await fetch("http://localhost:3000/api/usuarios/registrar", {
      method: "POST",
      body: formData
    });

    const resultado = await respuesta.json();
    document.getElementById("respuesta").textContent = resultado.mensaje;

  } catch (error) {
    document.getElementById("respuesta").textContent = "❌ Error al registrar usuario";
    console.error("Registro error:", error);
  }
});

// 👉 Enviar formulario de login
document.getElementById("login").addEventListener("submit", async function(e) {
  e.preventDefault();

  const datos = {
    correo: document.getElementById("loginCorreo").value,
    contraseña: document.getElementById("loginContraseña").value
  };

  try {
    const respuesta = await fetch("http://localhost:3000/api/usuarios/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos)
    });

    const resultado = await respuesta.json();

    if (respuesta.ok) {
      localStorage.setItem("token", resultado.token);
      localStorage.setItem("usuario", JSON.stringify(resultado.usuario));
      document.getElementById("respuesta").textContent = "Inicio de sesión exitoso 🎉";

      setTimeout(() => {
        window.location.href = "menu.html";

      }, 1500);
    } else {
      document.getElementById("respuesta").textContent = resultado.mensaje || "Credenciales incorrectas";
    }

  } catch (error) {
    document.getElementById("respuesta").textContent = "❌ Error al iniciar sesión";
    console.error("Login error:", error);
  }
});
