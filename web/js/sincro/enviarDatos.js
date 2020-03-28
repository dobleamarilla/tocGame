async function enviarTickets(arrayTicket) {
    var devolver = new Promise((dev, rej) => {
        for (let i = 0; i < arrayTicket.length; i++) {
            db.parametros.toArray().then(infoParams => {
                let infoTicket = arrayTicket[i];
                let database = infoParams[0].database;
                let nombreTabla = `[V_Venut_${infoTicket.timestamp.getFullYear()}-${limpiarMes(infoTicket.timestamp)}]`;
                let licencia = infoParams[0].licencia;
                let codigoTienda = infoParams[0].codigoTienda;
                if (!modoDesarrollador) {
                    let auxObjeto = {
                        codigoTienda: codigoTienda,
                        idDependienta: infoTicket.idTrabajador,
                        idTicket: infoTicket.idTicket,
                        tipoVenta: 'V',
                        cesta: modificarCestaEnviarTicket(infoTicket),
                        nombreTabla: nombreTabla,
                        fecha: formatearFecha(infoTicket.timestamp),
                        database: database,
                        licencia: licencia
                    };
                    socket.emit('guardar-ticket', auxObjeto);
                    console.log(auxObjeto);
                    dev(true);
                }
                else {
                    notificacion('¡Modo desarrollador activado!', 'warning');
                    dev(false);
                }
            }).catch(err => {
                console.log(err);
                notificacion('Error en get parametros en enviarTicket()', 'error');
            });
            infoTicket = [];
        }
        dev(true);
    });
    return devolver;
}

async function enviarCajas(arrayCajas) {
    var devolver = new Promise((dev, rej) => {
        db.parametros.toArray().then(infoParams => {
            let auxObjeto = {
                codigoTienda: infoParams[0].codigoTienda,
                database: infoParams[0].database,
                arrayCajas: arrayCajas
            };
            if (arrayCajas.length > 0) {
                socket.emit('guardar-caja', auxObjeto);
                dev(true);
            }
            else {
                dev(false);
            }
        }).catch(err => {
            console.log(err);
            notificacion('Error en enviarCajas 1', 'error');
            dev(false);
        });
    });
    return devolver;
}

async function enviarMovimientos(arrayMovimientos) {
    console.log(6969);
    var devolver = new Promise((dev, rej) => {
        db.parametros.toArray().then(infoParams => {
            let auxObjeto = {
                codigoTienda: infoParams[0].codigoTienda,
                database: infoParams[0].database,
                arrayMovimientos: arrayMovimientos
            };
            if (arrayMovimientos.length > 0) {
                socket.emit('guardar-movimientos', auxObjeto);
                console.log(auxObjeto);
                dev(true);
            }
            else {
                dev(false);
            }
        }).catch(err => {
            console.log(err);
            notificacion('Error en enviarMovimientos 1', 'error');
            dev(false);
        });
    });
    return devolver;
}

async function socketFichaje(infoFichaje, tipo) {
    db.parametros.toArray().then(info => {
        var enviarObjeto =
        {
            database: info[0].database,
            infoFichaje: infoFichaje,
            tipo: tipo,
            nombreTienda: info.nombreTienda,
            idTienda: info.codigoTienda
        };
        socket.emit('guardarFichajes', enviarObjeto);
    }).catch(err => {
        console.log(err);
        notificacion('Error en enviar fichaje', 'error');
    });
}

function limpiarMes(date) {
    var month = date.getMonth() + 1;
    return month < 10 ? '0' + month : '' + month;
}

function formatearFecha(fecha) {
    //yyyy-mm-dd hh:mi:ss (120 MSSQL)
    var devolverString = '';
    var month = `${fecha.getMonth() + 1}`;
    var day = `${fecha.getDate()}`;
    var hours = `${fecha.getHours()}`;
    var minutes = `${fecha.getMinutes()}`;
    var seconds = `${fecha.getSeconds()}`;

    if (month.length === 1) {
        month = '0' + month;
    }
    if (day.length === 1) {
        day = '0' + day;
    }
    if (hours.length === 1) {
        hours = '0' + hours;
    }
    if (minutes.length === 1) {
        minutes = '0' + minutes;
    }
    if (seconds.length === 1) {
        seconds = '0' + seconds;
    }

    devolverString = `${fecha.getFullYear()}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return devolverString;
}

function modificarCestaEnviarTicket(infoTicket) /* Esta función limpia las promociones y deja en la cesta los precios reales de los productos */ {
    for (let i = 0; i < infoTicket.cesta.length; i++) {
        if (infoTicket.cesta[i].promocion === 1) {
            if (infoTicket.cesta[i].infoArticulosPromo.tipoPromo === 'individual') {
                infoTicket.cesta.push({
                    idArticulo: infoTicket.cesta[i].infoArticulosPromo.idPrincipal,
                    nombreArticulo: 'nuncaSeVe',
                    unidades: infoTicket.cesta[i].infoArticulosPromo.cantidadPrincipal,
                    subtotal: infoTicket.cesta[i].infoArticulosPromo.subtotalPrincipal,
                    promocion: -1,
                    tipoIva: {},
                    activo: false,
                    idLinea: -1
                });
            }
            else {
                if (infoTicket.cesta[i].infoArticulosPromo.tipoPromo === 'combo') {
                    infoTicket.cesta.push({
                        idArticulo: infoTicket.cesta[i].infoArticulosPromo.idPrincipal,
                        nombreArticulo: 'nuncaSeVe',
                        unidades: infoTicket.cesta[i].infoArticulosPromo.cantidadPrincipal,
                        subtotal: infoTicket.cesta[i].infoArticulosPromo.subtotalPrincipal,
                        promocion: -1,
                        tipoIva: {},
                        activo: false,
                        idLinea: -1
                    });
                    infoTicket.cesta.push({
                        idArticulo: infoTicket.cesta[i].infoArticulosPromo.idSecundario,
                        nombreArticulo: 'nuncaSeVe',
                        unidades: infoTicket.cesta[i].infoArticulosPromo.cantidadSecundario,
                        subtotal: infoTicket.cesta[i].infoArticulosPromo.subtotalSecundario,
                        promocion: -1,
                        tipoIva: {},
                        activo: false,
                        idLinea: -1
                    });
                }
                else {
                    console.log("Error, buscar traza en modificarCestaEnviarTicket()");
                    notificacion('Error al enviar el ticket al servidor', 'error');
                }
            }
            infoTicket.cesta.splice(i, 1);
        }
    }
    return infoTicket.cesta;
}