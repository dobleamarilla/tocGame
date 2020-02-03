function getCurrentCaja() {
    var devolver = new Promise((dev, rej) => {
        db.currentCaja.toArray().then(info => {
            if (info[0].idCaja !== -1) {
                dev(info[0].idCaja);
            } else {
                dev(null);
            }
        }).catch(err => {
            console.log(err);
            dev(null);
        });
    });
    return devolver;
}

function getInfoArticulo(arrayArticulos, idToSearch) {
    for (let i = 0; i < arrayArticulos.length; i++) {
        if (arrayArticulos[i].id == idToSearch) {
            return { nombre: arrayArticulos[i].nombre, precio: arrayArticulos[i].precio, sumable: arrayArticulos[i].aPeso };
        }
    }
    return false;
}

function getHoraUnix() {
    return Math.floor(+new Date() / 1000);
}

function getTrabajadorActivo() {
    var devolver = new Promise((dev, rej) => {
        db.activo.toArray().then(info => {
            if (info.length === 1) {
                db.trabajadores.get(info[0].idTrabajador, res => {
                    return res;
                }).then(infoTrabajador => {
                    dev(infoTrabajador);
                }).catch(err => {
                    console.log(err);
                    dev(false);
                });
            } else {
                dev(false);
            }
        }).catch(err => {
            console.log(err);
            dev(false);
        });
    });
    return devolver;
}
function getParametros() {
    var devolver = new Promise((dev, rej) => {
        db.parametros.toArray().then(data => {
            if (data) {
                dev(data[0]);
            }
            else {
                dev(null);
            }
        }).catch(err => {
            console.log(err);
            dev(null);
        });
    });
    return devolver;
}

function getFichados() {
    var devolver = new Promise((dev, rej) => {
        db.fichajes.where('fichado').equals(1).toArray().then(data => {
            dev({ todoOK: true, data: data });
        }).catch(err => {
            console.log(err);
            dev({ todoOK: false });
        });
    });
    return devolver;
}

function getInfoCaja(idCaja) {
    var devolver = new Promise((dev, rej) => {
        db.cajas.get(idCaja).then(data => {
            dev(data);
        }).catch(err => {
            console.log(err);
            dev(null);
        });
    });
    return devolver;
}
function getTotalTarjetaCaja(idCaja)
{
    var devolver = new Promise((dev, rej) => {
        db.tickets.where('idCaja').equals(1).toArray().then(data => {
            let suma = 0;
            for(let i = 0; i < data.length; i++)
            {
                suma += data[i].total;
            }
            dev(suma);
        }).catch(err => {
            console.log(err);
            dev(null);
        });
    });
    return devolver;
}
// function getNombreTrabajadorApertura(idCaja) {
//     var devolver = new Promise((dev, rej) => {
//         db.cajas.where('id').equals(idCaja).toArray().then(data => {
//             db.trabajadores.where("idTrabajador").equals(data[0].inicioDependenta).toArray().then(info => {
//                 dev(info[0].nombre);
//             }).catch(err => {
//                 console.log(err);
//                 notificacion('Error en db.trabajadores de getNombreTrabajadorCierre', 'error');
//                 dev(null);
//             });
//         }).catch(err => {
//             console.log(err);
//             dev(null);
//         });
//     });
//     return devolver;
// }