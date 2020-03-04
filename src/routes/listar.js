const express = require("express");
const router = express.Router();

//Manipular arquivos
const fs = require('fs');

//Ler do arquivo data.json e retona os atendimentos 
router.get('/all', (req, res) => {
    let rawdata = fs.readFileSync("src\\data\\data.json");
    let dados = JSON.parse(rawdata);
    res.status(200).send(dados.horarios)
})


module.exports = router;