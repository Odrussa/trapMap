document.getElementById("menu-toggle").addEventListener("click", function() {
  document.querySelector("nav ul").classList.toggle("show");
});

let provinces = {};

// Carica artisti dal JSON
fetch('artists.json')
  .then(res => res.json())
  .then(data => {
    data.forEach(a => {
      let provName = a.province.trim();
      if(!provinces[provName]) provinces[provName] = [];
      provinces[provName].push(a);
    });
  });

// 🔹 Nuova funzione per aprire la pagina artisti
function apriPaginaArtisti(provincia) {
  window.location.href = `artists.html?province=${encodeURIComponent(provincia)}`;
}

// Collegamento ID (dallo SVG) -> chiave nel JSON
const provinceMap = {
  MILANO: "Milano",
  ROMA: "Roma",
  NAPOLI: "Napoli",
  TRAPANI: "Trapani"
  // aggiungi tutte le altre province qui
};

// Evento click sulle province
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('svg path').forEach(path => {
    path.addEventListener('click', () => {
      const provName = provinceMap[path.id.toUpperCase()];
      if (provName) {
        apriPaginaArtisti(provName); // 🔹 Qui cambia: apre una nuova pagina invece dell’overlay
      } else {
        alert("Nessuna provincia associata a questo ID 😢");
      }
    });
  });
});
