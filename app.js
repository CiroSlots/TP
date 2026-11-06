// ===== CÓDIGO =====

function copiarCodigo(boton) {
  navigator.clipboard.writeText("CIROTOP");
  boton.textContent = "✓ COPIADO";
  // a los 1.5 segundos vuelve a decir COPIAR
  setTimeout(() => boton.textContent = "COPIAR", 1500);
}


// ===== LEADERBOARDS =====

// Mis endpoints de la página real. Si este TP lo subo al mismo dominio,
// alcanza con dejar "/api/".
const API = "https://ciroslots.com/api/";

// Acá guardo cuándo termina cada LB para que el timer la pueda leer
const finales = {};

// Por si la API no responde (sin internet o el navegador la bloquea),
// muestro esto con el mismo formato que devuelve mi API.
const ejemplo = {
  prizePool: 300,
  prizes: { 1: 110, 2: 70, 3: 50, 4: 40, 5: 30 },
  endDate: Date.now() + 7 * 24 * 60 * 60 * 1000, // termina en 7 días
  users: [
    { rank: 1, username: "loquito_77", wager: 22310 },
    { rank: 2, username: "bonusHunter", wager: 15420 },
    { rank: 3, username: "elTanque", wager: 12750 },
    { rank: 4, username: "zeusFan", wager: 7640 },
    { rank: 5, username: "piripipi", wager: 1980 }
  ]
};

// async/await porque fetch tarda: espero la respuesta antes de seguir
async function cargarLB(casino) {
  try {
    const respuesta = await fetch(API + casino);
    const datos = await respuesta.json();
    mostrarLB(casino, datos);
  } catch (error) {
    // cae acá si no hay conexión o si el JSON no tiene "users"
    mostrarLB(casino, ejemplo);
  }
}

function mostrarLB(casino, datos) {
  // Los premios vienen como objeto con el puesto de clave: { 1: 110, 2: 70 ... }
  const premios = datos.prizes || {};
  // oro, plata y bronce para el podio, el resto en gris
  const colores = ["#f2cf6b", "#c0c4c8", "#d4824a"];

  document.getElementById(`lb-${casino}-prize`).textContent = "$" + (datos.prizePool || 0);

  let html = "";

  // slice(0, 5) para mostrar solo el top 5
  datos.users.slice(0, 5).forEach((u, i) => {
    const premio = premios[u.rank] ? "$" + premios[u.rank] : "—";
    // sin foto, el avatar son las dos primeras letras del nombre
    const iniciales = u.username.slice(0, 2).toUpperCase();

    html += `
      <div class="fila">
        <span class="pos" style="color:${colores[i] || "#82988a"}">${i + 1}</span>
        <div class="avatar">${iniciales}</div>
        <div>
          <div class="jugador">${u.username}</div>
          <div class="apostado">$${Number(u.wager).toLocaleString("en-US", { minimumFractionDigits: 2 })} apostado</div>
        </div>
        <span class="premio">${premio}</span>
      </div>`;
  });

  // si el string quedó vacío es porque no hay nadie todavía
  document.getElementById(`lb-${casino}-rows`).innerHTML =
    html || '<div class="vacio">Aún no hay jugadores<br>¡Sé el primero!</div>';

  if (datos.endDate) finales[casino] = new Date(datos.endDate);
}

function actualizarTimers() {
  // recorro las LBs que ya cargaron
  for (const casino in finales) {
    const resta = finales[casino] - new Date(); // diferencia en milisegundos
    const timer = document.getElementById(`lb-${casino}-timer`);

    if (resta <= 0) {
      timer.textContent = "Finalizada";
      continue;
    }

    // con % me quedo con lo que sobra, si no las horas serían el total
    const d = Math.floor(resta / 86400000);
    const h = Math.floor(resta / 3600000) % 24;
    const m = Math.floor(resta / 60000) % 60;
    const s = Math.floor(resta / 1000) % 60;

    timer.textContent = `${d}d ${h}h ${m}m ${s}s`;
  }
}


// ===== BLACKJACK =====

let manoJugador = [];
let manoCrupier = [];

// En vez de armar un mazo de 52 cartas, saco una al azar cada vez.
// Hay cuatro 10 porque el 10, J, Q y K valen lo mismo. El 11 es el as.
function sacarCarta() {
  const cartas = [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 10, 10, 11];
  return cartas[Math.floor(Math.random() * cartas.length)];
}

function sumar(mano) {
  let total = 0;
  let ases = 0;

  for (const carta of mano) {
    total += carta;
    if (carta === 11) ases++;
  }

  // si me paso de 21 y tengo un as, ese as pasa a valer 1
  while (total > 21 && ases > 0) {
    total -= 10;
    ases--;
  }

  return total;
}

// Cada carta es un div con la clase "carta"; el 11 lo muestro como "A"
function dibujar(mano, idCartas, idPuntos) {
  document.getElementById(idCartas).innerHTML = mano
    .map(c => `<div class="carta">${c === 11 ? "A" : c}</div>`)
    .join("");
  document.getElementById(idPuntos).textContent = sumar(mano);
}

function mostrarManos() {
  dibujar(manoJugador, "cartasJugador", "puntosJugador");
  dibujar(manoCrupier, "cartasCrupier", "puntosCrupier");
}

// Prendo o apago Pedir y Plantarse según si hay una mano en juego
function botones(activos) {
  document.getElementById("btnPedir").disabled = !activos;
  document.getElementById("btnPlantarse").disabled = !activos;
}

function repartir() {
  manoJugador = [sacarCarta(), sacarCarta()];
  manoCrupier = [sacarCarta()];
  document.getElementById("mensaje").textContent = "¿Pedís o te plantás?";
  botones(true);
  mostrarManos();
}

function pedir() {
  manoJugador.push(sacarCarta());
  mostrarManos();

  if (sumar(manoJugador) > 21) terminar("Te pasaste, perdiste");
}

function plantarse() {
  // regla del casino: el crupier pide hasta llegar a 17
  while (sumar(manoCrupier) < 17) {
    manoCrupier.push(sacarCarta());
  }
  mostrarManos();

  const vos = sumar(manoJugador);
  const crupier = sumar(manoCrupier);

  if (crupier > 21 || vos > crupier) terminar("¡Ganaste!");
  else if (vos < crupier) terminar("Gana la casa");
  else terminar("Empate");
}

function terminar(texto) {
  document.getElementById("mensaje").textContent = texto;
  botones(false);
}


// ===== ARRANQUE =====

cargarLB("winovo");
cargarLB("razed");
setInterval(actualizarTimers, 1000);
