const express = require("express");
const router = express.Router();

//Uso de Datas
const moment = require("moment")

router.post('/especifico', (req, res) => {
    const DataInicio = req.body.longI;
    const DataFim = req.body.longF;

    console.log("Data Inicio: " + moment(DataInicio).format("DD-MM-YYYY hh:mm:ss"))
    console.log("Data Fim   : " + moment(DataFim).format("DD-MM-YYYY hh:mm:ss"))
    console.log("Data Agora : " + moment().format("DD-MM-YYYY hh:mm:ss"))
    console.log("")


    res.status(201).send(DataInicio + " " + DataFim)
})

router.post('/diario', (req, res) => {
    const operacao = req.body.operacao;

    res.status(201).send(operacao)
})
router.post('/semanal', (req, res) => {
    const operacao = req.body.operacao;

    res.status(201).send(operacao)
})


module.exports = router;