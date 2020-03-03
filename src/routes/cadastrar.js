const express = require("express");
const router = express.Router();

//Gerar ids unicos
const uuidv1 = require('uuid/v1')

//Manipular arquivos
const fs = require('fs');

//Uso de Datas
const moment = require("moment")
moment.locale("pt-br");
// 0-Dom;
// 1-Seg;
// 2-Ter;
// 3-Qua;
// 4-Qui;
// 5-Sex;
// 6-Sab
// console.log("Data Fim   : " + moment(DataFim - 100000000).format("DD-MM-YYYY hh:mm:ss [dia da semana: ]d ddd"))
String.prototype.isNumberOfWeek = function () {
    return /^[0-6]+$/.test(this);
}

//Salvar um atendimento em um dia e horario especificos
router.post('/especifico', (req, res) => {
    const DataInicio = req.body.longI;
    const DataFim = req.body.longF;

    //Tratamentos de entrada
    if (DataInicio > DataFim) {
        res.status(400).send("Erro: Data inicio maior que data fim")
    }

    var salvar = {
        id: uuidv1(),
        day: moment(DataFim).format("DD-MM-YYYY"),
        weekDay: moment(DataFim).format("d"),
        start: moment(DataInicio).format("hh:mm"),
        end: moment(DataFim).format("hh:mm")
    }


    //Ler json salvo em data
    let rawdata = fs.readFileSync("src\\data\\data.json");
    let dados = JSON.parse(rawdata);

    //Insere na variavel
    dados.horarios.push(salvar)

    //Inserir novo cadastro no arquivo json
    fs.writeFile("src\\data\\data.json", JSON.stringify(dados), function (erro) {
        if (erro) {
            throw erro;
        }
        console.log("Atendimento salvo");
    });

    res.status(201).send(salvar)
})

//Salvar um atendimento em um horario especificos diariamente
router.post('/diario', (req, res) => {
    const DataInicio = req.body.longI;
    const DataFim = req.body.longF;

    if (DataInicio > DataFim) {
        res.status(400).send("Erro: Data inicio maior que data fim")
    }

    var salvar = {
        id: uuidv1(),
        day: "all",
        weekDay: "all",
        start: moment(DataInicio).format("hh:mm"),
        end: moment(DataFim).format("hh:mm")
    }


    //Ler json salvo em data
    let rawdata = fs.readFileSync("src\\data\\data.json");
    let dados = JSON.parse(rawdata);

    //Insere na variavel
    dados.horarios.push(salvar)

    //Inserir novo cadastro no arquivo json
    fs.writeFile("src\\data\\data.json", JSON.stringify(dados), function (erro) {
        if (erro) {
            throw erro;
        }
        console.log("Atendimento salvo");
    });

    res.status(201).send(salvar)
})

//Salvar um atendimento em um horario especificos em dias da semana especificos
router.post('/semanal', (req, res) => {
    const DataInicio = req.body.longI;
    const DataFim = req.body.longF;

    if (DataInicio > DataFim) {
        res.status(400).send("Erro: Data inicio maior que data fim")
    }
    if (!req.body.week.isNumberOfWeek()) {
        res.status(400).send("Erro: Data inicio maior que data fim")
    }

    var salvar = {
        id: uuidv1(),
        day: "all",
        weekDay: req.body.week,
        start: moment(DataInicio).format("hh:mm"),
        end: moment(DataFim).format("hh:mm")
    }

    //Ler json salvo em data
    let rawdata = fs.readFileSync("src\\data\\data.json");
    let dados = JSON.parse(rawdata);

    //Insere na variavel
    dados.horarios.push(salvar)

    //Inserir novo cadastro no arquivo json
    fs.writeFile("src\\data\\data.json", JSON.stringify(dados), function (erro) {
        if (erro) {
            throw erro;
        }
        console.log("Atendimento salvo");
    });

    res.status(201).send(salvar)
})

module.exports = router;