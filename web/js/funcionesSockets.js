/* ESTA FUNCIÓN HAY QUE CAMBIARLA DE NOMBRE, NO HACE LO QUE DICE, CARGA TODO */
function cargarTecladoSockets(arraySubmenus, arrayTeclas, arrayArticulos, arrayTrabajadores, arrayFamilias, arrayPromociones, arrayClientes, arrayParametrosTicket) {
    //1 - Limpiar teclado.
    clearKeyboard().then(function (res) {
        var submenus = [];
        var arrayTeclado = [];
        var tablaTeclado = [];
        var articulos = [];
        for (let i = 0; i < arraySubmenus.length; i++) {
            submenus.push({ id: i, idPadre: 0, nombre: arraySubmenus[i].nomMenu, idTeclado: i, color: arraySubmenus[i].color });
        }
        db.submenus.bulkPut(submenus).then(function (lastKey) {
            console.log("Submenus insertados!");
            for (let i = 0; i < submenus.length; i++) {
                arrayTeclado = [];
                for (let j = 0; j < arrayTeclas.length; j++) {
                    if (submenus[i].nombre == arrayTeclas[j].nomMenu) {
                        arrayTeclado.push({ id: arrayTeclas[j].idArticle, posicion: (arrayTeclas[j].pos + 1), color: traductorColor(arrayTeclas[j].color) });
                    }
                }
                tablaTeclado.push({ id: i, arrayTeclado: arrayTeclado });
            }
            db.teclado.bulkPut(tablaTeclado).then(jeje => {
                for (let i = 0; i < arrayArticulos.length; i++) {
                    articulos.push({ id: arrayArticulos[i].id, nombre: arrayArticulos[i].nombre, precio: arrayArticulos[i].precioConIva, iva: conversorIva(arrayArticulos[i].tipoIva), aPeso: Number(arrayArticulos[i].aPeso), familia: arrayArticulos[i].familia });
                }
                db.articulos.bulkPut(articulos).then(function (lastKey) {
                    db.trabajadores.bulkPut(arrayTrabajadores).then(function (x) {
                        db.familias.bulkPut(arrayFamilias).then(function () {
                            db.promociones.bulkPut(arrayPromociones).then(x => {
                                db.clientes.bulkPut(arrayClientes).then(function () {
                                    db.parametrosTicket.bulkPut(arrayParametrosTicket).then(function(){
                                        loading.setAttribute("class", "centradoTotal hide");
                                        $("#modalFichajes").modal('show');
                                        console.log("¡CARGA COMPLETA 100% OK!");
                                        //iniciarToc();
                                    }).catch(err=>{
                                        console.log(err);
                                        notificacion('Error al insertar parametros de ticket', 'error');
                                    });
                                }).catch(err => {
                                    console.log(err);
                                    notificacion('Error al insertar clientes finales', 'error');
                                });
                            }).catch(err => {
                                console.log(err);
                                notificacion('Error al insertar promociones', 'error');
                            });
                        }).catch(err => {
                            console.log("Error al insertar familias");
                            console.log(err);
                            notificacion('Error al insertar familias', 'error');
                        });
                    }).catch(Dexie.BulkError, function (e) {
                        console.log("Error al insertar trabajadores");
                    });
                }).catch(Dexie.BulkError, function (e) {
                    // Explicitely catching the bulkAdd() operation makes those successful
                    // additions commit despite that there were errors.
                    console.error("Error al insertar articulos");
                });
            }).catch(Dexie.BulkError, function (e) {
                console.log("Error: Fallo al crear el teaclado 789");
                notificacion('Error: Fallo al crear el teaclado 789', 'error');
            });
        }).catch(Dexie.BulkError, function (e) {
            console.error("Error: Fallo al insertar los submenús");
            notificacion('Error: Fallo al insertar los submenús', 'error');
        });
    });
    //db.submenus.put({id: 0, idPadre: 0, nombre: "0 Cafeteria", idTeclado: 0, color: "FFFFF"});
}

function clearKeyboard() {
    var devolver = new Promise((dev, rej) => {
        db.teclado.clear().then(function () {
            db.submenus.clear().then(function () {
                db.articulos.clear().then(function () {
                    dev(1);
                }).catch(err => {
                    dev(0);
                });
            }).catch(error => {
                console.log(err);
                dev(0);
            });
        }).catch(error => {
            console.log(err);
            dev(0);
        });
    });
    return devolver;
}
function traductorColor(data) {
    var colorAntiguo = parseInt(data);
    switch (colorAntiguo) {
        case 1245152: return '12E0E0'; break;
        case 1215231: return '128AFF'; break;
        case 9079520: return '8A8AE0'; break;
        case 16776978: return 'FFFF12'; break;
        case 16747232: return 'FF8AE0'; break;
        case 16777184: return 'FFFFE0'; break;
        case -2147483633: return 'BDC6DA'; break;
        case 1244946: return '12FF12'; break;
        case 16769279: return 'FFE0FF'; break;
        case 16769248: return 'FFE0E0'; break;
        case 16716543: return 'FF12FF'; break;
        case 16777098: return 'FFFF8A'; break;
        case 9109386: return '8AFF8A'; break;
        case 14684690: return 'E01212'; break;
        case 14715410: return 'E08A12'; break;
        default: return 'f9d8d8';
    }
}

function insertarPromociones(arrayPromociones) {
    var auxPromos = [];
    var arrayArticulosAgregarPrincipal = [];
    var auxPrincipal = [];
    var auxSecundario = [];

    for (let i = 0; i < arrayPromociones.lenght; i++) { //RECORRO PROMOCIONES
        auxPrincipal = [];
        if (arrayPromociones[i].secundario === -1) { //No hay secundario
            if (arrayPromociones[i].principal.substring(0, 2) === 'F_') { //Comprobar si es familia de productos
                auxPrincipal = getArticulosFamiliares(FAMILIA, unidadesNecesarias); //UnidadesNecesarias para cada uno de los articulos de la familia.
            }
            else {
                auxPrincipal.push({});
            }
        }
        else {

        }

        auxPromos.push({ id: arrayPromociones[i].id, articulosNecesarios: auxPrincipal });
    }
}