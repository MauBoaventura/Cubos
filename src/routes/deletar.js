const express = require("express");
const router = express.Router();

//Manipular arquivos
const fs = require('fs');

router.delete('/:id', (req, res) => {
    var id = req.params.id
    //Ler json salvo em data
    let rawdata = fs.readFileSync("src\\data\\data.json");
    let dados = JSON.parse(rawdata);

    let msg = removerPorId(dados.horarios, id)

    console.log(msg)
    //Se ocorre um erro uma msg é exibida
    if (msg != undefined) {
        res.status(400).send(msg)
    } else {

        // Inserir novo cadastro no arquivo json
        fs.writeFile("src\\data\\data.json", JSON.stringify(dados), function (erro) {
            if (erro) {
                throw erro;
            }
        });

        res.status(200).send(dados)
    }

})

//Funcao que percorre o array e apaga o id
function removerPorId(array, id) {

    var result = array.filter(function (el) {
        return el.id == id;
    });

    if (result == undefined || result == null || result == "") {
        return "ID não encontrado"

    }
    for (var elemento of result) {
        var index = array.indexOf(elemento);
        array.splice(index, 1);
    }
}

module.exports = router;