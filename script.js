const tokenBaserow = "x2G7tb4n7KXM7624ZuSPvnSq3QTayiWV";
const tableId = 618514;
const apiBase = `https://api.baserow.io/api/database/rows/table/${tableId}/?user_field_names=true`;

window.addEventListener('DOMContentLoaded', () => {
  const botonScroll = document.getElementById('scrollBtn');
  const imagenFondo = document.getElementById('imagenLarga');
  botonScroll.addEventListener('click', () => {
    const distancia = imagenFondo.offsetTop + imagenFondo.offsetHeight;
    window.scrollTo({ top: distancia, behavior: 'smooth' });
  });
});

function mostrarImagen(ruta, top, left, width = "200px", height = "auto", rutaTraducida = "") {
  const visor = document.getElementById('visor');
  visor.style.opacity = '0';

  setTimeout(() => {
    visor.style.position = 'absolute';
    visor.style.top = top;
    visor.style.left = left;
    visor.style.transform = 'translate(-50%, -50%)';
    visor.style.zIndex = '99';
    visor.style.display = 'block';

    visor.innerHTML = `
      <div style="position: relative; animation: fadeinImagen 1.2s ease;">
        <img src="${ruta}" style="width:${width}; height:${height}; box-shadow: 0 0 20px rgba(255,0,0,0.6); border: 2px solid white; border-radius: 8px;">
        ${rutaTraducida ? `
<button onclick="mostrarImagen('${rutaTraducida}', '${top}', '${left}', '${width}', '${height}', '${ruta}')"
  style="position: absolute; top: 10px; left: 10px; background-color: crimson; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer;">
  Traducir
</button>
` : ''}
        <button onclick="mostrarFormularioOpinion()" style="position: absolute; top: 10px; right: 10px;">Opinar</button>
        <div id="formOpinion" style="display:none; margin-top:10px;">
          <input type="text" id="textoOpinion" placeholder="Esto me recuerda a..." style="width:90%;">
          <button onclick="guardarOpinion('${ruta}')">Enviar</button>
        </div>
        <div id="opinionesMostradas" style="position: relative;"></div>
      </div>
    `;

    visor.style.opacity = '1';
    cargarOpiniones(ruta);
  }, 300);
}

function mostrarFormularioOpinion() {
  document.getElementById("formOpinion").style.display = "block";
}

function guardarOpinion(rutaImagen) {
  const texto = document.getElementById("textoOpinion").value;
  if (!texto.trim()) return;

  fetch(apiBase, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${tokenBaserow}`
    },
    body: JSON.stringify({
      imagen: rutaImagen,
      opinion: texto
    })
  })
  .then(() => {
    document.getElementById("textoOpinion").value = "";
    cargarOpiniones(rutaImagen);
  })
  .catch(error => {
    console.error("Error al guardar la opinión:", error);
  });
}

function cargarOpiniones(rutaImagen) {
  const contenedor = document.getElementById("opinionesMostradas");
  contenedor.innerHTML = "";

  fetch(apiBase, {
    headers: { "Authorization": `Token ${tokenBaserow}` }
  })
  .then(r => r.json())
  .then(data => {
    const opiniones = data.results || [];
    const filtradas = opiniones.filter(row => row.imagen === rutaImagen);

    filtradas.forEach((row, i) => {
      const texto = row.opinion;
      if (!texto) return;

      const div = document.createElement("div");
      div.textContent = texto;
      div.style.position = "absolute";
      div.style.top = `${10 + i * 40}px`;
      div.style.left = `${10 + (i % 3) * 120}px`;
      div.style.background = "rgba(255,0,0,0.2)";
      div.style.color = "white";
      div.style.padding = "8px";
      div.style.borderLeft = "2px solid red";
      div.style.fontStyle = "italic";
      div.style.width = "200px";
      div.style.zIndex = "100";
      div.style.opacity = "0";
      div.style.transition = "opacity 1s ease";
      contenedor.appendChild(div);
      setTimeout(() => {
        div.style.opacity = "1";
      }, 100);
    });
  })
  .catch(error => {
    console.error("Error al cargar opiniones:", error);
  });
}

function mostrarArchivoCompleto() {
  let contenedor = document.getElementById("archivoRojo");

  if (!contenedor) {
    contenedor = document.createElement("div");
    contenedor.id = "archivoRojo";
    contenedor.style.position = "fixed";
    contenedor.style.bottom = "0";
    contenedor.style.left = "0";
    contenedor.style.width = "100%";
    contenedor.style.maxHeight = "300px";
    contenedor.style.overflowY = "scroll";
    contenedor.style.background = "rgba(0,0,0,0.9)";
    contenedor.style.color = "white";
    contenedor.style.padding = "10px";
    contenedor.style.zIndex = "9999";
    document.body.appendChild(contenedor);
  }

  contenedor.innerHTML = "<strong>📡 Archivo Rojo — Opiniones totales:</strong><br><br>";

  fetch(apiBase, {
    headers: {
      Authorization: `Token ${tokenBaserow}`
    }
  })
  .then(r => r.json())
  .then(data => {
    (data.results || []).forEach((fila, i) => {
      const texto = fila.opinion;
      const imagen = fila.imagen;
      if (!texto || !imagen) return;

      const div = document.createElement("div");
      div.innerHTML = `<strong>${imagen}</strong>: ${texto}`;
      div.style.borderLeft = "2px solid red";
      div.style.marginBottom = "8px";
      div.style.paddingLeft = "8px";
      contenedor.appendChild(div);
    });
  })
  .catch(err => {
    alert("Error al cargar archivo completo: " + err);
  });
}
