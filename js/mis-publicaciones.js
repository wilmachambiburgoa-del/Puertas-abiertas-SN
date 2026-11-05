// js/mis-publicaciones.js - Gestión de casas propias del usuario (Neon)
document.addEventListener("DOMContentLoaded", async function () {
  const cargando = document.getElementById("cargandoMisCasas");
  const vacio = document.getElementById("sinPublicaciones");
  const contenedor = document.getElementById("listaMisCasas");

  if (!window.PA.isLoggedIn()) {
    alert("Debes iniciar sesión para ver tus publicaciones.");
    window.location.href = "login.html";
    return;
  }

  // Refrescar usuario
  await window.PA.getMe();

  async function cargarMisCasas() {
    cargando.classList.remove("hidden");
    vacio.classList.add("hidden");
    contenedor.innerHTML = "";

    try {
      const casas = await window.PA.listMisCasas();

      cargando.classList.add("hidden");

      if (!casas || casas.length === 0) {
        vacio.classList.remove("hidden");
        return;
      }

      casas.forEach(casa => {
        const tarjeta = document.createElement("div");
        tarjeta.className = "bg-white rounded-2xl overflow-hidden border border-gray-200/80 shadow-sm flex flex-col justify-between transition hover:shadow-md";

        const foto = (casa.imagenes && casa.imagenes.length > 0)
          ? casa.imagenes[0]
          : "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600";

        const estadoBadge = casa.activo
          ? '<span class="bg-emerald-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm"><i class="fa-solid fa-circle-check mr-1"></i> Disponible</span>'
          : '<span class="bg-amber-600 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm"><i class="fa-solid fa-lock mr-1"></i> Ya Alquilado</span>';

        const idStr = String(casa.id);

        tarjeta.innerHTML = `
          <div class="relative">
            <img src="${foto}" class="w-full h-44 object-cover" onerror="this.src='https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600'">
            <div class="absolute top-3 left-3 flex gap-2">
              ${estadoBadge}
            </div>
            <span class="absolute top-3 right-3 bg-black/60 text-white text-[11px] px-2.5 py-0.5 rounded-md capitalize font-medium">
              ${casa.tipo || 'casa'}
            </span>
          </div>
          <div class="p-4 flex flex-col flex-1">
            <div class="flex justify-between items-start mb-1">
              <span class="font-bold text-lg text-emerald-700">Bs ${Number(casa.precio).toLocaleString('es-BO')}</span>
              <span class="text-xs text-gray-400">/mes</span>
            </div>
            <h3 class="font-semibold text-gray-900 text-sm mb-1">${casa.titulo || ''}</h3>
            <p class="text-xs text-gray-500 mb-2">
              <i class="fa-solid fa-location-dot text-emerald-600"></i> ${casa.direccion || ''}
            </p>
          </div>

          <div class="border-t border-gray-100 pt-3 mt-3 flex flex-col gap-2 px-4 pb-4">
            <button onclick="alternarEstado('${idStr}', ${casa.activo})"
                    class="w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                      casa.activo 
                        ? 'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200' 
                        : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }">
              <i class="fa-solid ${casa.activo ? 'fa-lock' : 'fa-lock-open'}"></i>
              ${casa.activo ? 'Marcar como Alquilado (Ocultar)' : 'Marcar como Disponible (Mostrar)'}
            </button>

            <button onclick="eliminarPublicacion('${idStr}')"
                    class="w-full py-2 px-3 rounded-xl text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 flex items-center justify-center gap-1.5 transition">
              <i class="fa-solid fa-trash-can"></i> Eliminar anuncio
            </button>
          </div>
        `;
        contenedor.appendChild(tarjeta);
      });
    } catch (err) {
      cargando.classList.add("hidden");
      console.error(err);
      alert("Error al cargar tus publicaciones: " + err.message);
    }
  }

  window.alternarEstado = async function (id, estadoActual) {
    const nuevoEstado = !estadoActual;
    const mensaje = nuevoEstado 
      ? "¿Deseas volver a mostrar este anuncio como Disponible en el catálogo?" 
      : "¿Deseas marcar este anuncio como Alquilado? Se ocultará del catálogo general.";

    if (!confirm(mensaje)) return;

    try {
      await window.PA.toggleActivoCasa(id, nuevoEstado);
      cargarMisCasas();
    } catch (err) {
      alert("Error al actualizar estado: " + err.message);
    }
  };

  window.eliminarPublicacion = async function (id) {
    if (!confirm("¿Estás seguro de eliminar este anuncio definitivamente? Esta acción no se puede deshacer.")) return;

    try {
      await window.PA.deleteCasa(id);
      cargarMisCasas();
    } catch (err) {
      alert("Error al eliminar el anuncio: " + err.message);
    }
  };

  cargarMisCasas();
});
