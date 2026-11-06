// ===== LEADERBOARD =====

// Premios por puesto: la posición 0 del array es el 1er puesto
const premios = {
  winovo: [110, 70, 50, 40, 30],
  razed: [] // completar con los premios de Razed
};

// Por si la API no responde, así la tabla no queda vacía
const jugadoresEjemplo = [
  { username: "loquito_77", wager: 15420 },
  { username: "elTanque", wager: 9870 },
  { username: "bonusHunter", wager: 12750 }
];

// async/await porque fetch tarda: espero la respuesta antes de seguir
async function cargarLeaderboard(casino) {
  const estado = document.getElementById("estado");
  estado.textContent = "Cargando...";

  try {
    const respuesta = await fetch("https://ciroslots.com/api/" + casino);
    const datos = await respuesta.json();
    // la lista de jugadores viene dentro de "users"
    mostrarTabla(datos.users, premios[casino]);
    estado.textContent = "En vivo";
  } catch (error) {
    // si falla la conexión o el JSON no tiene "users", caigo acá
    mostrarTabla(jugadoresEjemplo, premios[casino]);
    estado.textContent = "Sin conexión, datos de ejemplo";
  }
}

function mostrarTabla(jugadores, listaPremios) {
  // ordeno de mayor a menor apostado
  jugadores.sort((a, b) => b.wager - a.wager);

  let html = "<tr><th>#</th><th>Jugador</th><th>Apostado</th><th>Premio</th></tr>";

  for (let i = 0; i < jugadores.length; i++) {
    // si ese puesto no tiene premio, el array da undefined y muestro "-"
    const premio = listaPremios[i] ? "$" + listaPremios[i] : "-";
    html += `<tr>
      <td>${i + 1}</td>
      <td>${jugadores[i].username}</td>
      <td>$${jugadores[i].wager}</td>
      <td>${premio}</td>
    </tr>`;
  }

  document.getElementById("tabla").innerHTML = html;
}


// ===== BLACKJACK =====

let manoJugador = [];
let manoCrupier = [];
let enJuego = false;

// En vez de armar un mazo de 52 cartas, saco una al azar cada vez.
// Las figuras valen 10 y el as arranca valiendo 11.
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

function mostrarManos() {
  document.getElementById("crupier").textContent =
    "Crupier: " + manoCrupier.join(" - ") + " (" + sumar(manoCrupier) + ")";
  document.getElementById("jugador").textContent =
    "Vos: " + manoJugador.join(" - ") + " (" + sumar(manoJugador) + ")";
}

function repartir() {
  manoJugador = [sacarCarta(), sacarCarta()];
  manoCrupier = [sacarCarta()];
  enJuego = true;
  document.getElementById("mensaje").textContent = "";
  mostrarManos();
}

function pedir() {
  if (!enJuego) return; // si la mano terminó, el botón no hace nada

  manoJugador.push(sacarCarta());
  mostrarManos();

  if (sumar(manoJugador) > 21) {
    terminar("Te pasaste, perdiste");
  }
}

function plantarse() {
  if (!enJuego) return;

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
  enJuego = false;
  document.getElementById("mensaje").textContent = texto;
}


// Al abrir la página ya muestro la LB de WinOvo
cargarLeaderboard("winovo");
