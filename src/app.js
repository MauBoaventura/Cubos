const express = require("express");
const app = express();
const bodyParser = require("body-parser")

//Body Parser
app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())

//Importa arquivos das rotas
const cadastrar = require("./routes/cadastrar")
const deletar = require("./routes/deletar")
const listar = require("./routes/listar")
const disponivel = require("./routes/disponivel")

//Rotas
app.use("/", cadastrar)
app.use("/", deletar)
app.use("/", listar)
app.use("/list_disp", disponivel)

module.exports = app;