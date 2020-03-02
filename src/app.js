const express = require("express");
const app = express();

//Importa arquivos das rotas
const cadastrar = require("./routes/cadastrar")
const deletar = require("./routes/deletar")
const listar = require("./routes/listar")
const disponivel = require("./routes/disponivel")

//Rotas
app.use("/cad", cadastrar)
app.use("/del", deletar)
app.use("/list_all", listar)
app.use("/list_disp", disponivel)

module.exports = app;