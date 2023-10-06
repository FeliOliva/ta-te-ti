"use strict";

let interrumpirReloj = false;
let valorRelleno = "";
let jugador1Button = document.getElementById("jugador1");
let jugador2Button = document.getElementById("jugador2");
let mensajeTurno = document.getElementById("mensajeTurno");
const btnCelda1 = document.getElementById("btnCelda1");
const btnCelda2 = document.getElementById("btnCelda2");
const btnCelda3 = document.getElementById("btnCelda3");
const btnCelda4 = document.getElementById("btnCelda4");
const btnCelda5 = document.getElementById("btnCelda5");
const btnCelda6 = document.getElementById("btnCelda6");
const btnCelda7 = document.getElementById("btnCelda7");
const btnCelda8 = document.getElementById("btnCelda8");
const btnCelda9 = document.getElementById("btnCelda9");
let numeroJugador = 0;
let turnoJugador = 0;
let juegoTerminado = false;
const botones = [
    btnCelda1,
    btnCelda2,
    btnCelda3,
    btnCelda4,
    btnCelda5,
    btnCelda6,
    btnCelda7,
    btnCelda8,
    btnCelda9
];

function resetear() {
    fetch(`http://localhost:3000/resetear`, {
        method: "POST"
    })
    .then((response) => {
        if (!response.ok) {
            throw Error(response.status);
        }
        return response.json(); 
    })
    .then((data) => {
        valorRelleno = "";
        jugador1Button.disabled = false;
        jugador2Button.disabled = false;
        mensajeTurno.textContent = 'Selecciona un jugador';
        numeroJugador = 0;
        turnoJugador = 0;
        juegoTerminado = false;

        botones.forEach(boton => {
            boton.innerHTML = "";
            boton.disabled = false;
        });
    })
    .catch((error) => {
        console.error("Error al resetear el juego:", error);
    });
}


function seleccionarJugador(jugador) {
    if (jugador == 'jugador 1') {
        valorRelleno = "X";
        jugador1Button.disabled = true;
        jugador2Button.disabled = true;
        mensajeTurno.textContent = 'Eres el ' + jugador;
        numeroJugador = 1;
    } else {
        valorRelleno = "O";
        jugador1Button.disabled = true;
        jugador2Button.disabled = true;
        mensajeTurno.textContent = 'Eres el ' + jugador;
        numeroJugador = 2;
    }
    interrumpirReloj = false;
    comenzarReloj();
}

function pintarCelda(idboton) {
    const index = parseInt(idboton) - 1;
    const boton = botones[index];
    if (juegoTerminado) {
        return;
    }
    if (boton.innerHTML === "" && numeroJugador === turnoJugador) {
        boton.innerHTML = valorRelleno;
        boton.disabled = true;

        const jugador = numeroJugador === 1 ? 'jugador 1' : 'jugador 2';
        const dato = {
            "jugador": jugador,
            "botonPintado": index,
        };

        guardarProgreso(dato);
    }
}


function habilitarBotones() {
    botones.forEach((boton) => {
        if (!boton.disabled) {
            boton.disabled = false;
        }
    });
}

function deshabilitarBotones() {
    botones.forEach((boton) => {
        if (!boton.disabled) {
            boton.disabled = true;
        }
    });
}

async function guardarProgreso(dato) {
    await fetch(`http://localhost:3000/guardarprogreso`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(dato),
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("Respuesta:", data);
        })
        .catch((error) => {
            console.error("Error al guardar el progreso:", error);
        });
}

function comenzarReloj() {
    let actualizaInfoServer = setInterval(() => {
        cargarStatus();

        if (juegoTerminado) {
            clearInterval(actualizaInfoServer); 
        }
    }, 500);
}


function cargarStatus() {
    fetch(`http://localhost:3000/obtenerstatus`)
        .then((response) => {
            if (!response.ok) {
                throw Error(response.status);
            }
            return response.json();
        })
        .then((data) => {
            console.log(data);
            turnoJugador = data.turnodel === 'jugador 1' ? 1 : 2;
            
            if (numeroJugador === turnoJugador) {
                mensajeTurno.innerHTML = `Tu turno`;
                habilitarBotones();
            } else {
                mensajeTurno.innerHTML = `Turno del jugador ${turnoJugador}`;
                deshabilitarBotones();
            }
            
            for (let i = 0; i < botones.length; i++) {
                const boton = botones[i];
                
                if (data.progresoPlayer1.includes(i)) {
                    boton.innerHTML = "X";
                    boton.disabled = true;
                } else if (data.progresoPlayer2.includes(i)) {
                    boton.innerHTML = "O";
                    boton.disabled = true;
                } else {
                    boton.innerHTML = "";
                    boton.disabled = false;
                }
            }
            const combinacionesGanadoras = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8], 
                [0, 3, 6], [1, 4, 7], [2, 5, 8], 
                [0, 4, 8], [2, 4, 6] 
            ];
            for (const combinacion of combinacionesGanadoras) {
                const [a, b, c] = combinacion;
    
                if (
                    data.progresoPlayer1.includes(a) &&
                    data.progresoPlayer1.includes(b) &&
                    data.progresoPlayer1.includes(c)
                ) {
                    mensajeTurno.textContent = '¡Jugador 1 gana!';
                    juegoTerminado = true;
                    deshabilitarBotones();
                    return;
                }
    
                if (
                    data.progresoPlayer2.includes(a) &&
                    data.progresoPlayer2.includes(b) &&
                    data.progresoPlayer2.includes(c)
                ) {
                    mensajeTurno.textContent = '¡Jugador 2 gana!';
                    juegoTerminado = true;
                    deshabilitarBotones();
                    return;
                }
            }
    
            if (data.progresoPlayer1.length + data.progresoPlayer2.length === 9) {
                mensajeTurno.textContent = '¡Es un empate!';
                juegoTerminado = true;
                deshabilitarBotones();
                return;
            }
        })
        .catch((error) => {
            console.error("Error al cargar el estado:", error);
        });
}
