// =====================================================
//  CIROSLOTS - script.js
//  Cosas que hace este archivo:
//   1. Abrir/cerrar el menú en celular
//   2. Traer el leaderboard de Razed desde mi API y mostrarlo
//   3. Contador regresivo hasta que termina la LB
//   4. Ruleta que elige un slot al azar
//   5. Poner el año actual en el pie de página
// =====================================================


// -----------------------------------------------------
// 1. MENÚ EN CELULAR
// -----------------------------------------------------

// Busco el botón ☰ y el menú por su id
const btnMenu = document.getElementById("btnMenu");
const nav = document.getElementById("nav");

// Cuando hago click en el botón, agrego o saco la clase "abierto"
// (toggle = si la tiene la saca, si no la tiene la pone)
btnMenu.addEventListener("click", function () {
  nav.classList.toggle("abierto");
});


// -----------------------------------------------------
// 2. LEADERBOARD DE RAZED (con mi API)
// -----------------------------------------------------

// Dirección de mi API. Es un archivo en /api/razed.js en Vercel
// que le pide los datos a Razed con mi clave (así la clave no queda
// visible en el navegador).
const URL_API = "/api/razed";

// Premios para cada puesto (el 1ro gana 150, el 2do 100, etc.)
const premios = [150, 100, 75, 50, 25];

// Datos de respaldo: se usan solo si la API no responde
// (por ejemplo si abro el index.html sin internet)
const jugadoresRespaldo = [
  { nombre: "Loquito123", apostado: 15420 },
  { nombre: "ElRey77", apostado: 9800 },
  { nombre: "SlotMaster", apostado: 7350 },
  { nombre: "Tuki_Ros", apostado: 5100 },
  { nombre: "BonusHunter", apostado: 3900 }
];

// Función que le pide los datos a la API
// "async" significa que la función espera respuestas de internet
async function cargarLeaderboard() {
  try {
    // fetch hace el pedido a la API y "await" espera la respuesta
    const respuesta = await fetch(URL_API);

    // Convierto la respuesta a JSON (objeto de JavaScript)
    const datos = await respuesta.json();

    // Mi API devuelve la lista dentro de "users"
    // (si la tuya usa otro nombre, cambialo acá)
    const lista = datos.users;

    // Paso cada jugador al formato que usa mi tabla: { nombre, apostado }
    // map recorre la lista y devuelve una lista nueva
    const jugadores = lista.map(function (jugador) {
      return {
        nombre: jugador.username,  // nombre del jugador en la API
        apostado: jugador.wager    // monto apostado en la API
      };
    });

    mostrarLeaderboard(jugadores);
  } catch (error) {
    // Si algo falla (sin internet, API caída, etc.) uso los datos de respaldo
    console.log("No se pudo cargar la API, uso datos de respaldo:", error);
    mostrarLeaderboard(jugadoresRespaldo);
  }
}

// Función que dibuja la tabla con la lista de jugadores que recibe
function mostrarLeaderboard(jugadores) {
  // Busco el <tbody> donde van las filas y lo vacío
  const cuerpoTabla = document.getElementById("cuerpoTabla");
  cuerpoTabla.innerHTML = "";

  // Ordeno los jugadores de mayor a menor según lo apostado
  jugadores.sort(function (a, b) {
    return b.apostado - a.apostado;
  });

  // Muestro solo los que tienen premio (top 5)
  for (let i = 0; i < jugadores.length && i < premios.length; i++) {
    // Creo una fila nueva
    const fila = document.createElement("tr");

    // Si es el primero (posición 0) le pongo la clase dorada
    if (i === 0) {
      fila.classList.add("primero");
    }

    // Lleno la fila con los datos (i + 1 porque el array empieza en 0)
    // toFixed(2) deja el número con 2 decimales
    fila.innerHTML =
      "<td>#" + (i + 1) + "</td>" +
      "<td>" + jugadores[i].nombre + "</td>" +
      "<td>$" + Number(jugadores[i].apostado).toFixed(2) + "</td>" +
      "<td>$" + premios[i] + "</td>";

    // Agrego la fila a la tabla
    cuerpoTabla.appendChild(fila);
  }
}

// Cargo la tabla apenas abre la página...
cargarLeaderboard();

// ...y la vuelvo a cargar cada 60 segundos para que esté actualizada
setInterval(cargarLeaderboard, 60000);


// -----------------------------------------------------
// 3. CONTADOR REGRESIVO
// -----------------------------------------------------

// Fecha en que termina la leaderboard
const fechaFin = new Date("2026-12-31T23:59:59");

// Función que calcula cuánto falta y lo muestra
function actualizarContador() {
  const ahora = new Date();

  // Diferencia en milisegundos entre el final y ahora
  let diferencia = fechaFin - ahora;

  // Si ya terminó, dejo todo en 0
  if (diferencia < 0) {
    diferencia = 0;
  }

  // Paso los milisegundos a días, horas, minutos y segundos
  // (1000 ms = 1 seg, 60 seg = 1 min, 60 min = 1 hora, 24 horas = 1 día)
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
  const horas = Math.floor(diferencia / (1000 * 60 * 60)) % 24;
  const minutos = Math.floor(diferencia / (1000 * 60)) % 60;
  const segundos = Math.floor(diferencia / 1000) % 60;

  // Muestro los números en el HTML
  // padStart(2, "0") hace que el 5 se vea como 05
  document.getElementById("dias").textContent = String(dias).padStart(2, "0");
  document.getElementById("horas").textContent = String(horas).padStart(2, "0");
  document.getElementById("minutos").textContent = String(minutos).padStart(2, "0");
  document.getElementById("segundos").textContent = String(segundos).padStart(2, "0");
}

// Lo ejecuto una vez apenas carga la página...
actualizarContador();

// ...y después cada 1 segundo (1000 ms) para que se actualice solo
setInterval(actualizarContador, 1000);


// -----------------------------------------------------
// 4. RULETA DE SLOTS
// -----------------------------------------------------

// Lista de slots que puede elegir la ruleta
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

// Cuando toco GIRAR...
btnGirar.addEventListener("click", function () {
  // Desactivo el botón para que no lo toquen mientras gira
  btnGirar.disabled = true;

  let vueltas = 0; // cuento cuántas veces cambió el nombre

  // Cada 100 ms muestro un slot al azar (efecto de que está girando)
  const giro = setInterval(function () {
    // Número al azar entre 0 y la cantidad de slots - 1
    const numeroAzar = Math.floor(Math.random() * slots.length);
    resultadoRuleta.textContent = slots[numeroAzar];

    vueltas++;

    // Cuando llega a 20 vueltas, frena
    if (vueltas === 20) {
      clearInterval(giro);        // corto el intervalo
      btnGirar.disabled = false;  // vuelvo a activar el botón
    }
  }, 100);
});


// -----------------------------------------------------
// 5. AÑO EN EL PIE DE PÁGINA
// -----------------------------------------------------

// Pongo el año actual automáticamente (así no lo tengo que cambiar a mano)
document.getElementById("anio").textContent = new Date().getFullYear();
