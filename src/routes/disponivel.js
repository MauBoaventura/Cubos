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
    let dataInicio = moment.unix(ini)
    console.log(dataInicio.format("DD-MM-YYYY HH:mm [Dia da semana] d:dddd"))
    let dataFim = moment.unix(end)
    console.log(dataFim.format("DD-MM-YYYY HH:mm [Dia da semana] d:dddd"))

    // let dataFim = moment.unix(end) //+23h:59m

    //Ler arquivo data.json
    let rawdata = fs.readFileSync("src\\data\\data.json");
    let dados = JSON.parse(rawdata);

    var resptudo = []

    //Filtrando todos atendimentos em um array
    dados.horarios.map(function (horario) {

        //erro de horario.day for "all"
        // let start = moment(horario.day + " " + horario.start, "DD-MM-YYYY HH:mm")
        // let end = moment(horario.day + " " + horario.end, "DD-MM-YYYY HH:mm")
        // console.log(horario)
        //Tratando atendimento diarios
        if (horario.day == "all" && horario.weekDay == "0123456") {
            //inicia a variavel
            console.log("DIARIO")
            var weekday_index = dataInicio.clone();
            //Como ocorre todo dia, todo atendimento é passado a frente 
            while (weekday_index < dataFim) {

                var resp = {
                    day: weekday_index.format("DD-MM-YYYY"),
                    //Intervalo errado mas é esse o sentido
                    intervals: {
                        start: horario.start,
                        end: horario.end
                    }
                }
                resptudo.push(resp)

                weekday_index = weekday_index.add(1, "day")
            }
        } else


            //Tratando atendimento em datas especificas
            if (horario.day != "all") {
                console.log("ESPECIFICO")
                //Se a day esta entre o intervalo [dataInicio, dataFim]
                if (moment(horario.day, "DD-MM-YYYY").isBetween(dataInicio, dataFim)) {
                    var resp = {
                        day: horario.day,
                        //Intervalo errado mas é esse o sentido
                        intervals: {
                            start: horario.start,
                            end: horario.end
                        }
                    }
                    resptudo.push(resp)
                } else {
                    //Atendimento é descartado
                }
            } else
                //Tratando atendimento semanais
                if (horario.day == "all") {
                    console.log("SEMANAL")

                    var weekday_index = dataInicio.clone();
                    ///necessario adicionar 1 min ao datefim
                    while (weekday_index < dataFim) {

                        //Se o dia da semana que esta sendo iterado for igual um dos dias da semana do atendimento
                        if (horario.weekDay.indexOf(weekday_index.format("d")) > -1) {
                            var resp = {
                                day: weekday_index.format("DD-MM-YYYY"),
                                //Intervalo errado mas é esse o sentido
                                intervals: {
                                    start: horario.start,
                                    end: horario.end
                                }
                            }
                            resptudo.push(resp)
                        }

                        weekday_index = weekday_index.add(1, "day")
                    }
                }


        return horario;

    });
    //    console.log(resptudo)

    //final
    var horariosDisponiveis = []

    var weekday_index = dataInicio.clone();
    console.log("\n\n");

    while (weekday_index < dataFim) {

        //Para cada elemento se retornara os intervalos afim de agrupar por dia
        let intervalos = resptudo.map((element) => {
            if (element.day == weekday_index.format("DD-MM-YYYY")) {
                return element.intervals
            }
        })

        //Filtro de undefined
        intervalos = intervalos.filter(function (element) {
            return element !== undefined;
        });

        // console.log("Intervalos do dia:" + weekday_index.format("DD-MM-YYYY [Dia da semana] d:dddd") + " ");
        // console.log(intervalos);
        if (!intervalos.length == 0) {
            horariosDisponiveis.push({
                day: weekday_index.format("DD-MM-YYYY"),
                intervals: intervalos
            })
        }


        weekday_index = weekday_index.add(1, "day")
    }


    res.status(200).send(horariosDisponiveis)
})


module.exports = router;