const express = require("express");
const router = express.Router();

router.delete('/:id', (req, res) =>{
    var id=req.body.id
    //Ler json salvo em data
    let rawdata = fs.readFileSync("src\\data\\data.json");
    let dados = JSON.parse(rawdata);

    //Insere na variavel
    dados.horarios.splice(id)

    //Inserir novo cadastro no arquivo json
    fs.writeFile("src\\data\\data.json", JSON.stringify(dados), function (erro) {
        if (erro) {
            throw erro;
        }
        console.log("Atendimento salvo");
    });

    res.status(201).send(salvar)

} )


module.exports = router;