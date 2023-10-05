const express = require("express");
const fs = require("fs");
const morgan = require("morgan");
const cors = require("cors");

const app = express();

app.use(cors());

app.use(express.json());
app.use(morgan("dev"));


app.get("/", (req, res) => {
    res.json({
        Grupo: "DRF",
        API: "Juego Ta-Te-Ti",
        Status: "Servidor Funcionando",
    });
});



let estadoJuego = {
    progresoPlayer1: [],
    progresoPlayer2: [],
    turnodel: "jugador 1",
};

app.post("/guardarprogreso", (req, respuesta) => {
    const jugador = req.body.jugador;
    const botonPintado = req.body.botonPintado;

    if (jugador == "jugador 1") {
        estadoJuego.progresoPlayer1.push(botonPintado);
        estadoJuego.turnodel = "jugador 2";
    } else {
        estadoJuego.progresoPlayer2.push(botonPintado);
        estadoJuego.turnodel = "jugador 1";
    }

    respuesta.json({
        mensajeservidor: "Datos Guardados",
        turno: estadoJuego.turnodel,
    });
});

app.get("/obtenerstatus", (req, res) => {
    res.json(estadoJuego);
});




app.listen(3000, () => {
    console.log("Servidor iniciado en el puerto 3000");
});
