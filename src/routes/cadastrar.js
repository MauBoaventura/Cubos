const express = require("express");
const router = express.Router();

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
var num = 0
var incremen = () => {
    num++;
    return num
};

router.post('/especifico', (req, res) => {
    const DataInicio = req.body.longI;
    const DataFim = req.body.longF;

    //Tratamentos de entrada
    if (DataInicio > DataFim) {
        res.status(400).send("Erro: Data inicio maior que data fim")
    }

    var salvar = {
        day: moment(DataFim).format("DD-MM-YYYY"),
        weekDay: moment(DataFim).format("d"),
        start: moment(DataInicio).format("hh:mm"),
        end: moment(DataFim).format("hh:mm")
    }

    //Inserir no arquivo json

    res.status(201).send(salvar)
})

router.post('/diario', (req, res) => {
    const DataInicio = req.body.longI;
    const DataFim = req.body.longF;

    if (DataInicio > DataFim) {
        res.status(400).send("Erro: Data inicio maior que data fim")
    }

    var salvar = {
        day: "all",
        weekDay: "all",
        start: moment(DataInicio).format("hh:mm"),
        end: moment(DataFim).format("hh:mm")
    }

    //Inserir no arquivo json

    res.status(201).send(salvar)
})
String.prototype.isNumberOfWeek = function(){return /^[0-6]+$/.test(this);}

router.post('/semanal', (req, res) => {
    const DataInicio = req.body.longI;
    const DataFim = req.body.longF;

    if (DataInicio > DataFim) {
        res.status(400).send("Erro: Data inicio maior que data fim")
    }
    if(!req.body.week.isNumberOfWeek()){
        res.status(400).send("Erro: Data inicio maior que data fim")
    }

    var salvar = {
        day: "all",
        weekDay: req.body.week,
        start: moment(DataInicio).format("hh:mm"),
        end: moment(DataFim).format("hh:mm")
    }

    //Inserir no arquivo json

    res.status(201).send(salvar)
})


module.exports = router;