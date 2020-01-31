const TIPO_SALIDA_DINERO = 1;
const TIPO_ENTRADA_DINERO = 2;

async function nuevaSalidaDinero(cantidad) {
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
                idCaja: idCaja
            }).then(function () {
                $('#botonConfirmarSalida').attr('disabled', false);
                $("#modalSalidaDinero").modal('hide');
                imprimirSalidaDinero({
                    cantidad: cantidad,
                    fecha: fecha,
                    nombreTrabajador: nombreTrabajador,
                    nombreTienda: nombreTienda,
                    cajaActual: cajaActual
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