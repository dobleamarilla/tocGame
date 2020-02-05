const TIPO_SALIDA_DINERO = 1;
const TIPO_ENTRADA_DINERO = 2;

async function nuevaSalidaDinero(cantidad, concepto) {
    let fecha = new Date();
    let nombreTrabajador = (await getTrabajadorActivo()).nombre;
    let nombreTienda = (await getParametros()).nombreTienda;
    let cajaActual = 0;

    getCurrentCaja().then(idCaja => {
        if (idCaja !== null) {
            db.movimientos.put({
                timestamp: fecha,
                tipo: TIPO_SALIDA_DINERO,
                valor: cantidad,
                idCaja: idCaja,
                concepto: concepto
            }).then(function () {
                $('#botonConfirmarSalida').attr('disabled', false);
                $("#modalSalidaDinero").modal('hide');
                imprimirSalidaDinero({
                    cantidad: cantidad,
                    fecha: fecha,
                    nombreTrabajador: nombreTrabajador,
                    nombreTienda: nombreTienda,
                    concepto: concepto
                });
                notificacion('Salida de dinero OK!', 'success');
            }).catch(err => {
                console.log(err);
                notificacion('Error en getCurrentCaja - nuevaSalidaDinero', 'error');
            });
        }
        else {
            console.log("Error en nuevaSalidaDinero");
            notificacion('No hay una caja abierta', 'error');
        }
    });
}

async function nuevaEntradaDinero(cantidad) {
    let fecha = new Date();
    let nombreTrabajador = (await getTrabajadorActivo()).nombre;
    let nombreTienda = (await getParametros()).nombreTienda;
    let cajaActual = 0;

    getCurrentCaja().then(idCaja => {
        if (idCaja !== null) {
            db.movimientos.put({
                timestamp: fecha,
                tipo: TIPO_ENTRADA_DINERO,
                valor: cantidad,
                idCaja: idCaja
            }).then(function () {
                $('#botonConfirmarEntrada').attr('disabled', false);
                $("#modalEntradaDinero").modal('hide');
                imprimirEntradaDinero({
                    cantidad: cantidad,
                    fecha: fecha,
                    nombreTrabajador: nombreTrabajador,
                    nombreTienda: nombreTienda,
                    cajaActual: cajaActual
                });
                notificacion('Entrada de dinero OK!', 'success');
            }).catch(err => {
                console.log(err);
                notificacion('Error en getCurrentCaja - nuevaEntradaDinero', 'error');
            });
        }
        else {
            console.log("Error en nuevaEntradaDinero");
            notificacion('No hay una caja abierta', 'error');
        }
    });
}

function recuentoCajaCierre(idCaja) { //idTicket, timestamp, total, cesta, tarjeta, idCaja, idTrabajador
    var devolver = new Promise((dev, rej) => {
        db.tickets.where('idCaja').equals(idCaja).toArray().then(arrayTickets => {
            if (arrayTickets.length > 0) {

                var totalVendido = 0; /* EFECTIVO + TARJETA */
                var totalEfectivo = 0;
                var totalTarjeta = 0;
                var numeroClientes = arrayTickets.length;

                for (let i = 0; i < arrayTickets.length; i++) {
                    if (arrayTickets[i].tarjeta) {
                        totalVendido += arrayTickets[i].total;
                        totalTarjeta += arrayTickets[i].total;
                    }
                    else {
                        if (!arrayTickets[i].tarjeta) {
                            totalVendido += arrayTickets[i].total;
                            totalEfectivo += arrayTickets[i].total;
                        }
                    }
                }
                dev({
                    totalVendido: totalVendido,
                    totalEfectivo: totalEfectivo,
                    totalTarjeta: totalTarjeta,
                    numeroClientes: numeroClientes
                });
            }
            else {
                dev({
                    totalVendido: 0,
                    totalEfectivo: 0,
                    totalTarjeta: 0,
                    numeroClientes: 0
                });
            }
        }).catch(err => {
            console.log(err);
            notificacion('Error 147', 'error');
        });
    });
    return devolver;
}
/* VALORES ABSOLUTOS */
function recuentoSalidasDinero(idCaja) {
    var devolver = new Promise((dev, rej) => {
        db.movimientos.where({ tipo: TIPO_SALIDA_DINERO, idCaja: idCaja }).toArray(arraySalidas => {
            let sumatorio = 0;
            for (let i = 0; i < arraySalidas.length; i++) {
                sumatorio += arraySalidas[i].valor;
            }
            dev(sumatorio);
        }).catch(err => {
            console.log(err);
            notificacion('Error en recuento de salida dinero', 'error');
            dev(null);
        });
    });
    return devolver;
}
/* VALORES ABSOLUTOS */
function recuentoEntradasDinero(idCaja) {
    var devolver = new Promise((dev, rej) => {
        db.movimientos.where({ tipo: TIPO_ENTRADA_DINERO, idCaja: idCaja }).toArray(arrayEntradas => {
            let sumatorio = 0;
            for (let i = 0; i < arrayEntradas.length; i++) {
                sumatorio += arrayEntradas[i].valor;
            }
            dev(sumatorio);
        }).catch(err => {
            console.log(err);
            notificacion('Error en recuento de entrada dinero', 'error');
            dev(null);
        });
    });
    return devolver;
}