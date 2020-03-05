const express = require("express");
const router = express.Router();

const fs = require('fs')
const moment = require("moment")

router.get('/', (req, res) => {
    //Recebe os dois parametros long {ini, end}
    const {
        ini,
        end
    } = req.query

    //Tranforma datas em obj Moment
    let dataInicio = moment(ini)
    let dataFim = moment(end) //+23h:59m

    //Ler arquivo data.json
    let rawdata = fs.readFileSync("src\\data\\data.json");
    let dados = JSON.parse(rawdata);

    var resptudo = [{
        day: String,
        intervals: [{
            start: String,
            end: String
        }]
    }]
    //Filtrando todos atendimentos em um array
    var datasOcupadas = dados.horarios.map(function (horario) {

        //erro de horario.day for "all"
        // let start = moment(horario.day + " " + horario.start, "DD-MM-YYYY HH:mm")
        // let end = moment(horario.day + " " + horario.end, "DD-MM-YYYY HH:mm")

        //Tratando atendimento diarios
        if (horario.day == "all" && horario.weekday == "all") {
            //inicia a variavel
            var weekday_index = dataInicio;

            //Como ocorre todo dia, todo atendimento é passado a frente 
            while (weekday_index < dataFim) {

                var resp = {
                    day: weekday_index.format("DD-MM-YYYY"),
                    //Intervalo errado mas é esse o sentido
                    intervals: [{
                        start: horario.start,
                        end: horario.end
                    }]
                }
                resptudo.push(resp)

                weekday_index = weekday_index.add(1, "day")
            }
        } // else


        //Tratando atendimento em datas especificas
        if (horario.day != "all") {
            //Se a day esta entre o intervalo [dataInicio, dataFim]
            if (moment(horario.day).isBetween(dataInicio, dataFim)) {
                //Se estiver entre essas datas o atendimento é mantido no array

            } else {
                //Atendimento é descartado
            }
        } // else{
        //Tratando atendimento semanais
        if (horario.day == "all") {

            var weekday_index = dataInicio;
            ///necessario adicionar 1 min ao datefim
            while (weekday_index < dataFim) {

                //Se o dia da semana que esta sendo iterado for igual um dos dias da semana do atendimento
                if (horario.weekday.indexOf(weekday_index.format("d")) > -1) {
                    //Adicona no array
                }

                weekday_index = weekday_index.add(1, "day")
            }
        }


        return horario;

    });
    console.log(datasOcupadas)


















    res.status(200).send("dados.horarios")
})


module.exports = router;