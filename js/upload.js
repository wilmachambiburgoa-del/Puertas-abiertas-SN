// js/upload.js - Lógica de publicación y renderizado del mapa (Neon + API)
document.addEventListener("DOMContentLoaded", async function () {
  const inputFotos = document.getElementById("inputFotos");
  const vistaPrevia = document.getElementById("vistaPrevia");
  const formCasa = document.getElementById("formCasa");
  const btnEnviar = document.getElementById("btnEnviar");
  const btnMiUbicacion = document.getElementById("btnMiUbicacion");
  const inputLat = document.getElementById("latitud");
  const inputLng = document.getElementById("longitud");
  const coordenadasTexto = document.getElementById("coordenadasTexto");
  const inputNombre = document.getElementById("inputNombre");

  if (!window.PA.isLoggedIn()) {
    alert("Debes iniciar sesión para publicar una propiedad.");
    window.location.href = "login.html";
    return;
  }

  const user = await window.PA.getMe() || window.PA.currentUser();
  if (user && user.full_name && inputNombre) {
    inputNombre.value = user.full_name;
  }

  // Coordenadas predeterminadas (Satélite Norte, Warnes, Santa Cruz)
  const latDefault = -17.5855;
  const lngDefault = -63.1612;
  inputLat.value = latDefault;
  inputLng.value = lngDefault;

  // Iconos Leaflet
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });

  const map = L.map("mapaSelector").setView([latDefault, lngDefault], 14);

  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 19,
    attribution: 'Tiles &copy; Esri &mdash; OpenStreetMap contributors'
  }).addTo(map);

  const marker = L.marker([latDefault, lngDefault], { draggable: true }).addTo(map);

  function actualizarCoordenadas(lat, lng) {
    inputLat.value = Number(lat).toFixed(6);
    inputLng.value = Number(lng).toFixed(6);
    coordenadasTexto.textContent = `📍 Coordenadas: ${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
  }

  marker.on("dragend", function () {
    const pos = marker.getLatLng();
    actualizarCoordenadas(pos.lat, pos.lng);
  });

  map.on("click", function (e) {
    marker.setLatLng(e.latlng);
    actualizarCoordenadas(e.latlng.lat, e.latlng.lng);
  });

  if (btnMiUbicacion) {
    btnMiUbicacion.addEventListener("click", function () {
      if (!navigator.geolocation) {
        alert("Tu navegador no soporta geolocalización.");
        return;
      }
      btnMiUbicacion.disabled = true;
      btnMiUbicacion.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Ubicando...';
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          map.setView([lat, lng], 16);
          marker.setLatLng([lat, lng]);
          actualizarCoordenadas(lat, lng);
          btnMiUbicacion.disabled = false;
          btnMiUbicacion.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Usar mi ubicación';
        },
        () => {
          alert("No se pudo obtener tu ubicación.");
          btnMiUbicacion.disabled = false;
          btnMiUbicacion.innerHTML = '<i class="fa-solid fa-location-crosshairs"></i> Usar mi ubicación';
        }
      );
    });
  }

  // Vista previa de fotos
  if (inputFotos) {
    inputFotos.addEventListener("change", function () {
      vistaPrevia.innerHTML = "";
      const archivos = inputFotos.files;
      for (let i = 0; i < archivos.length; i++) {
        const lector = new FileReader();
        lector.onload = function (e) {
          const div = document.createElement("div");
          div.innerHTML = `<img src="${e.target.result}" class="w-full h-24 object-cover rounded-xl border border-emerald-200">`;
          vistaPrevia.appendChild(div);
        };
        lector.readAsDataURL(archivos[i]);
      }
    });
  }

  // Envío del formulario
  formCasa.addEventListener("submit", async function (e) {
    e.preventDefault();

    const archivos = inputFotos.files;
    if (!archivos || archivos.length < 1) {
      alert("Debes seleccionar al menos una foto de la vivienda.");
      return;
    }

    // Límite razonable para base64 / Blob
    if (archivos.length > 6) {
      alert("Máximo 6 fotos por anuncio.");
      return;
    }

    btnEnviar.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Subiendo y publicando...';
    btnEnviar.disabled = true;

    try {
      const imagenesUrls = [];

      for (let i = 0; i < archivos.length; i++) {
        const file = archivos[i];
        // Comprimir un poco si es muy grande (opcional, aquí subimos directo)
        if (file.size > 4 * 1024 * 1024) {
          throw new Error("Una imagen supera los 4 MB. Reduce el tamaño e intenta de nuevo.");
        }
        const url = await window.PA.uploadImage(file);
        imagenesUrls.push(url);
      }

      const formData = new FormData(formCasa);
      const casaData = {
        nombre_dueno: formData.get("nombre"),
        whatsapp: formData.get("whatsapp"),
        titulo: formData.get("titulo"),
        direccion: formData.get("direccion"),
        precio: parseFloat(formData.get("precio")),
        habitaciones: parseInt(formData.get("habitaciones")),
        banos: parseInt(formData.get("banos")),
        tipo: formData.get("tipo"),
        descripcion: formData.get("descripcion"),
        imagenes: imagenesUrls,
        latitud: parseFloat(inputLat.value),
        longitud: parseFloat(inputLng.value)
      };

      await window.PA.createCasa(casaData);
      window.location.href = "mis-publicaciones.html";

    } catch (err) {
      console.error(err);
      alert("Error al publicar: " + err.message);
      btnEnviar.innerHTML = '<i class="fa-solid fa-paper-plane"></i> Publicar anuncio ahora';
      btnEnviar.disabled = false;
    }
  });
});
