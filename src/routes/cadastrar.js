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

    var finalDodia = moment(data.format("DD-MM-YYYY"), "DD-MM-YYYY")
    finalDodia.add(1, "day")

    var dataInicio = inicioDoDia
    var dataFim = finalDodia

    // console.log("Dentro da funcao");
    // console.log(inicioDoDia.format("[inicio do dia]: DD-MM-YYYY HH:mm:ss [dia da semana: ]d ddd"));
    // console.log(finalDodia.format("[final do dia: ]DD-MM-YYYY HH:mm:ss [dia da semana: ]d ddd"));

    let dados = lerJSON()

    var atendimento_all = []

    //Filtrando todos atendimentos em um array
    dados.horarios.map(function (horario) {

        //erro de horario.day for "all"
        // let start = moment(horario.day + " " + horario.start,  HH:mm")
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
                atendimento_all.push(resp)

                weekday_index = weekday_index.add(1, "day")
            }
        } else


            //Tratando atendimento em datas especificas
            if (horario.day != "all") {
                console.log("ESPECIFICO")
                // console.log(dataInicio.format("DD-MM-YYYY HH:mm:ss [Dia da semana] d:dddd"));
                // console.log(moment(horario.day + " " + horario.end, "DD-MM-YYYY HH:mm").format("DD-MM-YYYY HH:mm:ss [Dia da semana] d:dddd"));
                // console.log(dataFim.format("DD-MM-YYYY HH:mm:ss [Dia da semana] d:dddd"));

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
    // console.log("\n\n");

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
//Verifica se há conflitos de horario no dia
function verificaConflitosHorario(horariosDisponiveis, DataInicio, DataFinal) {

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

        // console.log(I.format("DD-MM-YYYY HH:mm"));
        // console.log(intervaloI.format("DD-MM-YYYY HH:mm"));
        // console.log(F.format("DD-MM-YYYY HH:mm"));
        // console.log(intervaloF.format("DD-MM-YYYY HH:mm"));
        // console.log()

        //Se os conjuntos forem iguais não insere
        if (I.format("DD-MM-YYYY HH:mm") == intervaloI.format("DD-MM-YYYY HH:mm") && F.format("DD-MM-YYYY HH:mm") == intervaloF.format("DD-MM-YYYY HH:mm")) {
            // console.log("IGUAL")
            return element;
        } else
            //verifica se a data inicio e data fim esta entre os intervalos já existentes
            if ((moment.unix(DataInicio).isBetween(intervaloI, intervaloF, null, "()") ||
                    moment.unix(DataFinal).isBetween(intervaloI, intervaloF, null, "()"))) {
                //Se um dos extremos estiver no meio não salva o atendimento
                // console.log("CONFLITO");
                return element;
            } else {
                if (moment.unix(DataInicio).isBefore(intervaloI) &&
                    moment.unix(DataFinal).isAfter(intervaloF)) {
                    return element
                }
            }
    })
    // console.log("Depois ");

    console.log(conflitos);

    if (conflitos.length == 0) {
        return true
    } else {
        return false
    }
}
//Retorna todos os dias especificos
function retornaDiasEspecifico() {
    let dados = lerJSON()

    //Filtrando todos dias especificos
    let retorno = dados.horarios.filter(function (horario) {
        //Tratando atendimento em datas especificas
        if (horario.day != "all") {
            console.log("ESPECIFICO")
            return horario.day
        };
    })

    // retorno = retorno.map((element) => {
    //     return element.day
    // })
    return retorno;
}
//Retorna todos os dias semana
function retornaDiasSemana() {
    let dados = lerJSON()

    //Filtrando todos dias especificos
    let retorno = dados.horarios.filter(function (horario) {
        //Tratando atendimento em datas especificas
        if (horario.day == "all" && horario.weekDay != "0123456") {
            console.log("Semanal")
            return horario.day
        };
    })
    return retorno;
}

//Retorna todos atendimentos diarios
function retornaDiasDiario() {
    let dados = lerJSON()

    //Filtrando todos dias especificos
    let retorno = dados.horarios.filter(function (horario) {
        //Tratando atendimento em datas especificas
        if (horario.day == "all" && horario.weekDay == "0123456") {
            console.log("Semanal")
            return horario.day
        };
    })

    // retorno = retorno.map((element) => {
    //     return element.day
    // })
    return retorno;
}

function haConflitoDeHorario(possivelConflitoDeHorario, DataInicio, DataFinal) {
    var I = (DataInicio)
    var F = (DataFinal)
    //Verifica os horarios do dia especifico
    let conflitos = possivelConflitoDeHorario.filter((element) => {
        // console.log("ELEMENT");
        // console.log(element)

        var intervaloI = moment(element.start, "HH:mm")
        var intervaloF = moment(element.end, "HH:mm")
        console.log("VERIFICACAO " + intervaloI.format("DD-MM-YYYY HH:mm [Dia da semana] d:dddd"));
        console.log("VERIFICACAO " + (DataInicio).format("DD-MM-YYYY HH:mm [Dia da semana] d:dddd"));
        console.log("VERIFICACAO " + intervaloF.format("DD-MM-YYYY HH:mm [Dia da semana] d:dddd"));
        console.log();

        // console.log(I.format("DD-MM-YYYY HH:mm"));
        // console.log(intervaloI.format("DD-MM-YYYY HH:mm"));
        // console.log(F.format("DD-MM-YYYY HH:mm"));
        // console.log(intervaloF.format("DD-MM-YYYY HH:mm"));
        // console.log()

        //Se os conjuntos forem iguais não insere
        if (I.format("DD-MM-YYYY HH:mm") == intervaloI.format("DD-MM-YYYY HH:mm") && F.format("DD-MM-YYYY HH:mm") == intervaloF.format("DD-MM-YYYY HH:mm")) {
            console.log("IGUAL")
            return element;
        } else
            //verifica se a data inicio e data fim esta entre os intervalos já existentes
            if (((DataInicio).isBetween(intervaloI, intervaloF, null, "()") ||
                    (DataFinal).isBetween(intervaloI, intervaloF, null, "()"))) {
                //Se um dos extremos estiver no meio não salva o atendimento
                console.log("CONFLITO");
                return element;
            } else {
                if ((DataInicio).isBefore(intervaloI) &&
                    (DataFinal).isAfter(intervaloF)) {
                    console.log("CONFLITO");
                    return element
                }
            }
    })
    // console.log("Depois ");

    // console.log(conflitos);

    if (conflitos.length == 0) {
        return false
    } else {
        return true
    }
}


function haConflitoDeHorarioSemanal(possivelConflitoDeHorario, DataInicio, DataFinal) {
    var I = (DataInicio)
    var F = (DataFinal)
    let conflitos = true
    //Verifica os horarios do dia especifico
    if (possivelConflitoDeHorario != undefined) {
        console.log("possivelConflitoDeHorario");
        console.log(possivelConflitoDeHorario);

        conflitos = possivelConflitoDeHorario.filter((element) => {
            console.log("ELEMENT");
            console.log(element)

            var intervaloI = moment(I.format("DD-MM-YYYY") + " " + element.start, "DD-MM-YYYY HH:mm")
            var intervaloF = moment(F.format("DD-MM-YYYY") + " " + element.end, "DD-MM-YYYY HH:mm")
            console.log("VERIFICACAO " + intervaloI.format("DD-MM-YYYY HH:mm [Dia da semana] d:dddd"));
            console.log("VERIFICACAO " + (DataInicio).format("DD-MM-YYYY HH:mm [Dia da semana] d:dddd"));
            console.log("VERIFICACAO " + intervaloF.format("DD-MM-YYYY HH:mm [Dia da semana] d:dddd"));
            // console.log();

            // console.log(I.format("DD-MM-YYYY HH:mm"));
            // console.log(intervaloI.format("DD-MM-YYYY HH:mm"));
            // console.log(F.format("DD-MM-YYYY HH:mm"));
            // console.log(intervaloF.format("DD-MM-YYYY HH:mm"));
            // console.log()

            //Se os conjuntos forem iguais não insere
            if (I.format("DD-MM-YYYY HH:mm") == intervaloI.format("DD-MM-YYYY HH:mm") && F.format("DD-MM-YYYY HH:mm") == intervaloF.format("DD-MM-YYYY HH:mm")) {
                console.log("IGUAL")
                return element;
            } else
                //verifica se a data inicio e data fim esta entre os intervalos já existentes
                if (((DataInicio).isBetween(intervaloI, intervaloF, null, "()") ||
                        (DataFinal).isBetween(intervaloI, intervaloF, null, "()"))) {
                    //Se um dos extremos estiver no meio não salva o atendimento
                    console.log("CONFLITO");
                    return element;
                } else {
                    if ((DataInicio).isBefore(intervaloI) &&
                        (DataFinal).isAfter(intervaloF)) {
                        console.log("CONFLITO");
                        return element
                    }
                }
        })
        console.log("Depois ");

    }
    console.log("Conflitos");

    console.log(conflitos);

    if (conflitos.length == 0) {
        return false
    } else {
        return true
    }
}

//Verificar todos os dias especificos e ver se não conflita os horarios
function verificaConflitosSemana(diasDaSemana, diasEspecificos) {
    //funcao que retorna todos os dias semana
    // let diasEspecificos = retornaDiasEspecifico()
    // console.log("diasdase,ama: " + diasDaSemana);
    // console.log("especifico: " + diasEspecificos);
    if (diasEspecificos != undefined) {
        //Conflitos de horario no mesmo dia da semana
        return possivelConflitoDeHorario = diasEspecificos.filter((element) => {
            console.log("COISO")
            console.log(element.weekDay)
            if (diasDaSemana.indexOf(element.weekDay) > -1) {
                //Elemento esta contido no array logo não se insere o atendimento
                return element;
            }
        })
    }
}function verificaConflitosDia(diasDaSemana, diasEspecificos) {
    //funcao que retorna todos os dias semana
    // let diasEspecificos = retornaDiasEspecifico()
    // console.log("diasdase,ama: " + diasDaSemana);
    // console.log("especifico: " + diasEspecificos);
    if (diasEspecificos != undefined) {
        //Conflitos de horario no mesmo dia da semana
        return possivelConflitoDeHorario = diasEspecificos.filter((element) => {
            console.log("COISO")
            console.log(element.weekDay)
            if (element.weekDay.indexOf(diasDaSemana) > -1) {
                //Elemento esta contido no array logo não se insere o atendimento
                return element;
            }
        })
    }
}
//Ler arquivo Json
function lerJSON(dados) {
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
//Salva arquivo Json
function salvaJSON(dados) {
    fs.writeFile("src\\data\\data.json", JSON.stringify(dados), function (erro) {
        if (erro) {
            throw erro;
        }
        console.log("Atendimento salvo");
    });

}

//Salvar um atendimento em um dia e horario especificos
router.post('/especifico', (req, res) => {
    // const DataInicio = req.body.longI;
    const DataInicio = moment(req.body.data + " " + req.body.HI, "DD-MM-YYYY HH:mm");
    // console.log("Verificação:" + DataInicio == DataInicio1);
    // console.log(DataInicio.format("DD-MM-YYYY HH:mm  ") + DataInicio.valueOf());


    // const DataFinal = req.body.longF;
    const DataFinal = moment(req.body.data + " " + req.body.HF, "DD-MM-YYYY HH:mm");

    var insere = false;

    //Tratamentos de entrada
    if (DataInicio > DataFinal) {
        res.status(400).send("Erro: Data inicio maior que data fim")
    }

    //atendimentos do dia 
    // let horariosDisponiveis = atendimentosDia(moment.unix(DataInicio))
    let horariosDisponiveis = atendimentosDia(DataInicio)

    //Verifica se o dia todo esta livre
    if (horariosDisponiveis.length == 0) {
        console.log("Pode inserir no dia");
        insere = true
    } else {
        //Verifica se há conflitos entre os horarios
        // insere = verificaConflitosHorario(horariosDisponiveis, DataInicio, DataFinal)
        insere = verificaConflitosHorario(horariosDisponiveis, DataInicio.valueOf() / 1000, DataFinal.valueOf() / 1000)
    }

    if (insere) {
        //Dados a serem salvos
        // console.log("A inserir INICIO " + moment.unix(DataInicio).format("DD-MM-YYYY HH:mm [Dia da semana] d:dddd"));
        // console.log("A inserir FINAL " + moment.unix(DataFinal).format("DD-MM-YYYY HH:mm [Dia da semana] d:dddd"));

        var salvar = {
            id: uuidv1(),
            // day: moment.unix(DataFinal).format("DD-MM-YYYY"),
            // weekDay: moment.unix(DataFinal).format("d"),
            // start: moment.unix(DataInicio).format("HH:mm"),
            // end: moment.unix(DataFinal).format("HH:mm")
            day: DataInicio.format("DD-MM-YYYY"),
            weekDay: DataFinal.format("d"),
            start: DataInicio.format("HH:mm"),
            end: DataFinal.format("HH:mm")
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

//Salvar um atendimento em um horario especificos em dias da semana especificos
router.post('/semanal', (req, res) => {
    // const DataInicio = req.body.longI;
    // const DataFim = req.body.longF;
    // const DataInicio = moment(req.body.data + " " + req.body.HI, "DD-MM-YYYY HH:mm");
    // const DataFinal = moment(req.body.data + " " + req.body.HF, "DD-MM-YYYY HH:mm");
    const DataInicio = moment(req.body.HI, "HH:mm");
    const DataFinal = moment(req.body.HF, "HH:mm");

    if (DataInicio > DataFinal) {
        res.status(400).send("Erro: Data inicio maior que data fim")
    } else
    if (!req.body.week.isNumberOfWeek()) {
        res.status(400).send("Erro: week só podem conter numeros de [0-6]")
    } else {
        // Verificar todos os dias especificos e ver se não conflita os horarioss
        possivelConflitoDeHorario = verificaConflitosSemana(req.body.week, retornaDiasEspecifico())
        // Essa variavel contem os dias que podem dar conflito de horario
        // console.log(possivelConflitoDeHorario);

        if (haConflitoDeHorario(possivelConflitoDeHorario, DataInicio, DataFinal)) {
            res.status(400).send("Erro: Conflito de horario com especificos")
        } else {
            //Verificar conflitos entre os semanais
            // Verificar todos os dias semana e ver se não conflita os horarioss
            possivelConflitoDeHorarioSemana = verificaConflitosSemana(req.body.week, retornaDiasSemana())

            if (haConflitoDeHorarioSemanal(possivelConflitoDeHorarioSemana, DataInicio, DataFinal)) {
                res.status(400).send("Erro: Conflito de horario com semana")

            } else {
                console.log("DIARIOOOOOOO");
                possivelConflitoDeHorarioDiario = verificaConflitosDia(req.body.week, retornaDiasDiario())
                console.log(possivelConflitoDeHorarioDiario, req.body.week, retornaDiasDiario());

                if (haConflitoDeHorarioSemanal(possivelConflitoDeHorarioDiario, DataInicio, DataFinal)) {
                    res.status(400).send("Erro: Conflito de horario com diario")

                }


                var salvar = {
                    id: uuidv1(),
                    day: "all",
                    weekDay: req.body.week,
                    start: DataInicio.format("HH:mm"),
                    end: DataFinal.format("HH:mm")
                }

                //Ler json salvo em data
                var dados = lerJSON()

                //Insere na variavel
                dados.horarios.push(salvar)

                //Salva o dado no Json
                salvaJSON(dados)
                res.status(201).send(salvar)
            }
        }

    }
})

//Salvar um atendimento em um horario especificos diariamente
router.post('/diario', (req, res) => {
    // const DataInicio = req.body.longI;
    // const DataFim = req.body.longF;
    const DataInicio = moment(req.body.HI, "HH:mm");
    const DataFinal = moment(req.body.HF, "HH:mm");

    if (DataInicio > DataFinal) {
        res.status(400).send("Erro: Data inicio maior que data fim")
    } else {
        // Verificar todos os dias especificos e ver se não conflita os horarioss
        possivelConflitoDeHorario = verificaConflitosSemana("0123456", retornaDiasEspecifico())
        // Essa variavel contem os dias que podem dar conflito de horario
        // console.log(possivelConflitoDeHorario);

        if (haConflitoDeHorario(possivelConflitoDeHorario, DataInicio, DataFinal)) {
            res.status(400).send("Erro: Conflito de horario com especificos")
        } else {
            //Verificar conflitos entre os semanais
            // Verificar todos os dias semana e ver se não conflita os horarioss
            let possivelConflitoDeHorarioSemana = verificaConflitosSemana("0123456", retornaDiasSemana())

            if (haConflitoDeHorarioSemanal(possivelConflitoDeHorarioSemana, DataInicio, DataFinal)) {
                res.status(400).send("Erro: Conflito de horario com semana")

            } else {
                possivelConflitoDeHorarioDiario = verificaConflitosSemana("0123456", retornaDiasDiario())
                console.log(possivelConflitoDeHorarioDiario)

                if (haConflitoDeHorarioSemanal(possivelConflitoDeHorarioDiario, DataInicio, DataFinal)) {
                    res.status(400).send("Erro: Conflito de horario com diarios")
                } else {

                    var salvar = {
                        id: uuidv1(),
                        day: "all",
                        weekDay: "0123456",
                        // start: moment(DataInicio).format("HH:mm"),
                        // end: moment(DataFim).format("HH:mm")
                        start: DataInicio.format("HH:mm"),
                        end: DataFinal.format("HH:mm")
                    }


                    //Ler json salvo em data
                    var dados = lerJSON()

                    //Insere na variavel
                    dados.horarios.push(salvar)

                    //Salva o dado no Json
                    salvaJSON(dados)
                    res.status(201).send(salvar)
                }
            }
        }
    }
    //Pegar todos os cadastro em dias especificos e verificar se conflita

    //Pegar todos os cadastros semanais e verificar se conflita


    // var salvar = {
    //     id: uuidv1(),
    //     day: "all",
    //     weekDay: "all",
    //     // start: moment(DataInicio).format("HH:mm"),
    //     // end: moment(DataFim).format("HH:mm")
    //     start: DataInicio.format("HH:mm"),
    //     end: DataFinal.format("HH:mm")
    // }


    // //Ler json salvo em data
    // var dados = lerJSON()

    // //Insere na variavel
    // dados.horarios.push(salvar)

    // //Salva o dado no Json
    // salvaJSON(dados)

    // res.status(201).send(salvar)
})

module.exports = router;