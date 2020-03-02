const express = require("express");
//Inicia a aplicação express
const app = require('../src/app');


//Normaliza a porta
function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }
    return false;
}
var port = normalizePort(process.env.PORT || '8888');
//Poe o servidor para rodar ma porta especificada
app.listen(port, function () {
    console.log("Servidor online rodando na porta: " + port);
});