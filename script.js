// =====================================================
//  CIROTOP - script.js
//  Qué hace este archivo:
//   1. Abrir/cerrar el menú en celular
//   2. Traer el leaderboard de Razed desde mi API
//   3. Dibujar el podio (top 3) y la lista (del 4to en adelante)
//   4. Contador regresivo hasta que termina la LB
//   5. Ruleta que elige un slot al azar
//   6. Poner el año actual en el pie
// =====================================================


// -----------------------------------------------------
// 1. MENÚ EN CELULAR
// -----------------------------------------------------

const btnMenu = document.getElementById("btnMenu");
const nav = document.getElementById("nav");

// Al tocar ☰ agrego o saco la clase "abierto" (el CSS lo muestra u oculta)
btnMenu.addEventListener("click", function () {
  nav.classList.toggle("abierto");
});


// -----------------------------------------------------
// 2. DATOS DEL LEADERBOARD
// -----------------------------------------------------

// Mi API en Vercel (/api/razed.js). Ella le pide los datos a Razed
// con mi clave, así la clave no queda visible en el navegador.
const URL_API = "/api/razed";

// Premio de cada puesto (posición 0 = 1er puesto)
const premios = [150, 100, 75, 50, 25];

// Datos de respaldo por si la API no responde
const jugadoresRespaldo = [
  { nombre: "Loquito123", apostado: 15420 },
  { nombre: "ElRey77", apostado: 9800 },
  { nombre: "SlotMaster", apostado: 7350 },
  { nombre: "Tuki_Ros", apostado: 5100 },
  { nombre: "BonusHunter", apostado: 3900 }
];

// Pide los datos a la API ("async" = espera respuestas de internet)
async function cargarLeaderboard() {
  try {
    const respuesta = await fetch(URL_API);   // hago el pedido
    const datos = await respuesta.json();     // lo paso a objeto JS

    // Mi API devuelve la lista en "users" (si usa otro nombre, cambiarlo acá)
    const jugadores = datos.users.map(function (jugador) {
      return {
        nombre: jugador.username,  // nombre en la API
        apostado: jugador.wager    // monto apostado en la API
      };
    });

    mostrarLeaderboard(jugadores);
  } catch (error) {
    // Si falla algo uso los datos de respaldo
    console.log("API no disponible, uso datos de respaldo:", error);
    mostrarLeaderboard(jugadoresRespaldo);
  }
}


// -----------------------------------------------------
// 3. DIBUJAR PODIO Y LISTA
// -----------------------------------------------------

// Pasa un número a formato plata: 15420 -> "$15,420.00"
function formatoPlata(numero) {
  return "$" + Number(numero).toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function mostrarLeaderboard(jugadores) {
  const podio = document.getElementById("podio");
  const lista = document.getElementById("lista");

  // Vacío lo que había antes
  podio.innerHTML = "";
  lista.innerHTML = "";

  // Ordeno de mayor a menor apostado
  jugadores.sort(function (a, b) {
    return b.apostado - a.apostado;
  });

  // Recorro solo los puestos que tienen premio
  for (let i = 0; i < jugadores.length && i < premios.length; i++) {
    const jugador = jugadores[i];
    const puesto = i + 1; // el array empieza en 0, el puesto en 1

    if (puesto <= 3) {
      // ---- TOP 3: tarjeta del podio ----
      const tarjeta = document.createElement("div");
      tarjeta.className = "puesto puesto-" + puesto;
      tarjeta.innerHTML =
        "<div class='numero'>" + puesto + "</div>" +
        "<div class='nombre'>" + jugador.nombre + "</div>" +
        "<div class='apostado'>" + formatoPlata(jugador.apostado) + "</div>" +
        "<div class='premio'>$" + premios[i] + "</div>";

      // Orden visual del podio: 2do - 1ro - 3ro
      // (el 1ro va al medio, los demás se agregan a los costados)
      if (puesto === 2) {
        podio.prepend(tarjeta);      // al principio (izquierda)
      } else {
        podio.appendChild(tarjeta);  // al final (derecha)
      }
    } else {
      // ---- DEL 4TO EN ADELANTE: fila de la lista ----
      const fila = document.createElement("div");
      fila.className = "fila";
      fila.innerHTML =
        "<span class='pos'>#" + puesto + "</span>" +
        "<span>" + jugador.nombre + "</span>" +
        "<span class='apostado'>" + formatoPlata(jugador.apostado) + "</span>" +
        "<span class='premio'>$" + premios[i] + "</span>";
      lista.appendChild(fila);
    }
  }
}

// Muestro la suma de todos los premios en la portada
let total = 0;
for (let i = 0; i < premios.length; i++) {
  total = total + premios[i];
}
document.getElementById("totalPremios").textContent = total;

// Cargo el leaderboard al abrir la página y cada 60 segundos
cargarLeaderboard();
setInterval(cargarLeaderboard, 60000);


// -----------------------------------------------------
// 4. CONTADOR REGRESIVO
// -----------------------------------------------------

// Fecha y hora en que termina la LB
const fechaFin = new Date("2026-12-31T23:59:59");

function actualizarContador() {
  // Milisegundos que faltan (si ya pasó, queda en 0)
  let diferencia = fechaFin - new Date();
  if (diferencia < 0) {
    diferencia = 0;
  }

  // Convierto: 1000 ms = 1 seg, 60 seg = 1 min, 60 min = 1 h, 24 h = 1 día
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  const horas = Math.floor(diferencia / (1000 * 60 * 60)) % 24;
  const minutos = Math.floor(diferencia / (1000 * 60)) % 60;
  const segundos = Math.floor(diferencia / 1000) % 60;

  // padStart(2, "0") muestra 5 como 05
  document.getElementById("dias").textContent = String(dias).padStart(2, "0");
  document.getElementById("horas").textContent = String(horas).padStart(2, "0");
  document.getElementById("minutos").textContent = String(minutos).padStart(2, "0");
  document.getElementById("segundos").textContent = String(segundos).padStart(2, "0");
}

// Una vez al cargar y después cada 1 segundo
actualizarContador();
setInterval(actualizarContador, 1000);


// -----------------------------------------------------
// 5. RULETA DE SLOTS
// -----------------------------------------------------

const slots = [
  "Gates of Olympus",
  "Sweet Bonanza",
  "Sugar Rush",
  "The Dog House",
  "Wanted Dead or a Wild",
  "Big Bass Bonanza",
  "Book of Dead",
  "Fruit Party"
];

const btnGirar = document.getElementById("btnGirar");
const resultadoRuleta = document.getElementById("resultadoRuleta");

btnGirar.addEventListener("click", function () {
  btnGirar.disabled = true;                    // bloqueo el botón mientras gira
  resultadoRuleta.classList.remove("ganador"); // saco la animación anterior

  let vueltas = 0;

  // Cada 100 ms muestro un slot al azar (efecto de que gira)
  const giro = setInterval(function () {
    const numeroAzar = Math.floor(Math.random() * slots.length);
    resultadoRuleta.textContent = slots[numeroAzar];
    vueltas++;

    // A las 20 vueltas frena
    if (vueltas === 20) {
      clearInterval(giro);
      resultadoRuleta.classList.add("ganador"); // animación de festejo
      btnGirar.disabled = false;
    }
  }, 100);
});


// -----------------------------------------------------
// 6. AÑO EN EL PIE
// -----------------------------------------------------

document.getElementById("anio").textContent = new Date().getFullYear();
