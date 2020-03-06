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
// console.log("Data Fim   : " + moment(DataFim - 100000000).format("DD-MM-YYYY HH:mm:ss [dia da semana: ]d ddd"))
String.prototype.isNumberOfWeek = function () {
    return /^[0-6]+$/.test(this);
}

//Retornar os atendimentos do dia 
const atendimentosDia = (data) => {
    //00:00 da data passada na funcao
    var inicioDoDia = moment(data.format("DD-MM-YYYY"), "DD-MM-YYYY")
    var dataInicio = inicioDoDia

    var finalDodia = moment(data.format("DD-MM-YYYY"), "DD-MM-YYYY")
    finalDodia.add(1, "day")
    var dataFim = finalDodia

    console.log("Dentro da funcao");
    console.log(inicioDoDia.format("[inicio do dia]: DD-MM-YYYY HH:mm:ss [dia da semana: ]d ddd"));
    console.log(finalDodia.format("[final do dia: ]DD-MM-YYYY HH:mm:ss [dia da semana: ]d ddd"));


    //Ler json salvo em data
    let dados;
    try {
        let rawdata = fs.readFileSync("src\\data\\data.json");
        dados = JSON.parse(rawdata);
    } catch (error) {
        dados = {
            "horarios": []
        }
    }

    var atendimento_all = []

    //Filtrando todos atendimentos em um array
    dados.horarios.map(function (horario) {

        //erro de horario.day for "all"
        // let start = moment(horario.day + " " + horario.start,  HH:mm")
        // let end = moment(horario.day + " " + horario.end, "DD-MM-YYYY HH:mm")
        // console.log(horario)
        //Tratando atendimento diarios
        if (horario.day == "all" && horario.weekDay == "all") {
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
                atendimento_all.push(resp)

                weekday_index = weekday_index.add(1, "day")
            }
        } else


            //Tratando atendimento em datas especificas
            if (horario.day != "all") {
                console.log("ESPECIFICO")
                console.log(dataInicio.format("DD-MM-YYYY HH:mm:ss [Dia da semana] d:dddd"));
                console.log(moment(horario.day + " " + horario.end, "DD-MM-YYYY HH:mm").format("DD-MM-YYYY HH:mm:ss [Dia da semana] d:dddd"));
                console.log(dataFim.format("DD-MM-YYYY HH:mm:ss [Dia da semana] d:dddd"));

                //Se a day esta entre o intervalo [dataInicio, dataFim]
                if (moment(horario.day, "DD-MM-YYYY").isBetween(dataInicio, dataFim, null, "[]")) {
                    var resp = {
                        day: horario.day,
                        //Intervalo errado mas é esse o sentido
                        intervals: {
                            start: horario.start,
                            end: horario.end
                        }
                    }
                    atendimento_all.push(resp)
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
                            atendimento_all.push(resp)
                        }

                        weekday_index = weekday_index.add(1, "day")
                    }
                }


        return horario;

    });

    var horariosDisponiveis = []

    var weekday_index = dataInicio.clone();
    console.log("\n\n");

    while (weekday_index < dataFim) {

        //Para cada elemento se retornara os intervalos afim de agrupar por dia
        let intervalos = atendimento_all.map((element) => {
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
    return horariosDisponiveis
}

//Ler arquivo Json
const lerJSON = (dados) => {
    try {
        let rawdata = fs.readFileSync("src\\data\\data.json");
        dados = JSON.parse(rawdata);
    } catch (error) {
        dados = {
            "horarios": []
        }
    }
    return dados
}

const salvaJSON = (dados) => {
    fs.writeFile("src\\data\\data.json", JSON.stringify(dados), function (erro) {
        if (erro) {
            throw erro;
        }
        console.log("Atendimento salvo");
    });

}

//Salvar um atendimento em um dia e horario especificos
router.post('/especifico', (req, res) => {
    const DataInicio = req.body.longI;
    const DataFinal = req.body.longF;

    //Tratamentos de entrada
    if (DataInicio > DataFinal) {
        res.status(400).send("Erro: Data inicio maior que data fim")
    }

    var insere = false;

    //atendimentos do dia 
    let horariosDisponiveis = atendimentosDia(moment.unix(DataInicio))

    //Verifica se o dia todo esta livre
    if (horariosDisponiveis.length == 0) {
        console.log("Pode inserir no dia");
        insere = true
    } else {
        var I = moment.unix(DataInicio)
        var F = moment.unix(DataFinal)
        //Verifica os horarios do dia especifico
        let conflitos = horariosDisponiveis[0].intervals.filter((element) => {
            var intervaloI = moment(horariosDisponiveis[0].day + " " + element.start, "DD-MM-YYYY HH:mm")
            var intervaloF = moment(horariosDisponiveis[0].day + " " + element.end, "DD-MM-YYYY HH:mm")

            // console.log("VERIFICACAO " + intervaloI.format("DD-MM-YYYY HH:mm [Dia da semana] d:dddd"));
            // console.log("VERIFICACAO " + moment.unix(DataInicio).format("DD-MM-YYYY HH:mm [Dia da semana] d:dddd"));
            // console.log("VERIFICACAO " + intervaloF.format("DD-MM-YYYY HH:mm [Dia da semana] d:dddd"));
            // console.log();

            console.log(I.format("DD-MM-YYYY HH:mm"));
            console.log(intervaloI.format("DD-MM-YYYY HH:mm"));
            console.log(F.format("DD-MM-YYYY HH:mm"));
            console.log(intervaloF.format("DD-MM-YYYY HH:mm"));
            console.log()

            //Se os conjuntos forem iguais não insere
            if (I.format("DD-MM-YYYY HH:mm") == intervaloI.format("DD-MM-YYYY HH:mm") && F.format("DD-MM-YYYY HH:mm") == intervaloF.format("DD-MM-YYYY HH:mm")) {
                // console.log("IGUAL")
                return element;
            } else
                //verifica se a data inicio e data fim esta entre os intervalos já existentes
                if ((moment.unix(DataInicio).isBetween(intervaloI, intervaloF, null, "()") || moment.unix(DataFinal).isBetween(intervaloI, intervaloF, null, "()"))) {
                    //Se um dos extremos estiver no meio não salva o atendimento
                    console.log("CONFLITO");
                    return element;
                }
        })
        // console.log("Depois ");

        console.log(conflitos);

        if (conflitos.length == 0) {
            insere = true
        } else {
            insere = false
        }
    }

    if (insere) {
        //Dados a serem salvos
        // console.log("A inserir INICIO " + moment.unix(DataInicio).format("DD-MM-YYYY HH:mm [Dia da semana] d:dddd"));
        // console.log("A inserir FINAL " + moment.unix(DataFinal).format("DD-MM-YYYY HH:mm [Dia da semana] d:dddd"));

        var salvar = {
            id: uuidv1(),
            day: moment.unix(DataFinal).format("DD-MM-YYYY"),
            weekDay: moment.unix(DataFinal).format("d"),
            start: moment.unix(DataInicio).format("HH:mm"),
            end: moment.unix(DataFinal).format("HH:mm")
        }
        
        //Ler json salvo em data
        var dados = lerJSON()

        //Insere na variavel
        dados.horarios.push(salvar)

        //Salva o dado no Json
        salvaJSON(dados)
        res.status(201).send(salvar)

    } else {
        res.status(400).send("Erro: Conflito de horario")
    }
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
        start: moment(DataInicio).format("HH:mm"),
        end: moment(DataFim).format("HH:mm")
    }


    //Ler json salvo em data
    var dados = lerJSON()

    //Insere na variavel
    dados.horarios.push(salvar)

    //Salva o dado no Json
    salvaJSON(dados)

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
        start: moment(DataInicio).format("HH:mm"),
        end: moment(DataFim).format("HH:mm")
    }

    //Ler json salvo em data
    var dados = lerJSON()

    //Insere na variavel
    dados.horarios.push(salvar)

    //Salva o dado no Json
    salvaJSON(dados)

    res.status(201).send(salvar)
})

module.exports = router;