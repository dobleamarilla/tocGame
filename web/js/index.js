'use strict'

function startDB() {
    db = new Dexie('tocGame');
    db.version(1).stores({
        cesta: '++idLinea, idArticulo, nombreArticulo, unidades, subtotal, promocion, activo, tiposIva',
        tickets: '++idTicket, timestamp, total, cesta, tarjeta, idCaja, idTrabajador, tiposIva, enviado',
        parametrosTicket: 'nombreDato, valorDato',
        articulos: 'id, nombre, precio, iva, aPeso, familia, precioBase',
        teclado: 'id, arrayTeclado',
        trabajadores: 'idTrabajador, nombre, nombreCorto',
        fichajes: 'idTrabajador, nombre, inicio, final, activo, fichado',
        promociones: 'id, fechaInicio, fechaFinal, principal, cantidadPrincipal, secundario, cantidadSecundario, precioFinal',
        menus: 'id, nombre, color',
        submenus: 'id, idPadre, nombre, idTeclado, color',
        parametros: 'licencia, nombreEmpresa, database, nombreTienda',
        cajas: '++id, inicioTime, finalTime, inicioDependenta, finalDependenta, totalApertura, totalCierre, descuadre, recaudado, abierta, enviado',
        movimientos: '++id, timestamp, tipo, valor, idCaja, concepto',
        clientes: 'id, nombre, tarjetaCliente',
        familias: 'nombre, padre',
        activo: 'idTrabajador',
        currentCaja: 'idCaja'
    });

    const COEFICIENTE_IVA_4 = 0.04;
    const COEFICIENTE_IVA_10 = 0.10;
    const COEFICIENTE_IVA_21 = 0.21;

    const COEFICIENTE2_IVA_4 = 1.04;
    const COEFICIENTE2_IVA_10 = 1.10;
    const COEFICIENTE2_IVA_21 = 1.21;

    var aux = initVueTocGame();

    vueSetCaja = aux.caja;
    vueFichajes = aux.fichajes;
    vuePeso = aux.peso;
    vuePanelInferior = aux.panelInferior;
    vueSalidaDinero = aux.salidaDinero;
    vueEntradaDinero = aux.entradaDinero;
    vueTicketMedio = aux.ticketMedio;

    comprobarConfiguracion().then((res) => {
        if (res) {
            iniciarToc();
        } else {
            installWizard();
        }
    });
}

function redondearPrecio(precio) /* REDONDEA AL SEGUNDO DECIMAL */ {
    return Math.round(precio * 100) / 100;
}

function abrirMenuPrincipal() {
    $('#modalMenuPrincipal').modal('show');
}

function abrirMenuFichajes() {
    $('#modalMenuPrincipal').modal('hide');
    vueFichajes.verFichados();
    $('#modalFichajes').modal('show');
}

function abrirModalTeclado() {
    botonFichar.setAttribute('class', 'btn btn-default');
    campoNombreTeclado.focus();
}

function loadingToc() {
    getCurrentCaja().then(idCaja => {
        currentCaja = idCaja;
        actualizarCesta();
        imprimirTeclado(0); //Faltan comprobaciones de existencia de teclados y cargar automáticamente el primero.
        clickMenu(0);
        vueTicketMedio.actualizarTicketMedio();
    });
}

function iniciarToc() {
    fichados().then(infoFichados => {
        if (infoFichados !== null) {
            comprobarCaja().then(res => {
                if (res === 'ABIERTA') {
                    loadingToc();
                } else {
                    if (res === 'CERRADA') {
                        $('#modalSetCaja').modal('show');
                    } else {
                        if (res === 'ERROR') {
                            /* CONTACTAR CON UN TÉCNICO */
                        }
                    }
                }
            });
        }
        else {
            $('#modalFichajes').modal('show');
        }
    });
}

function desfichar(idTrabajador) {
    var devolver = new Promise((dev, rev) => {
        db.fichajes.update(idTrabajador, { activo: 0, fichado: 0, final: new Date() }).then(function (res) {
            dev(true);
        }).catch(err => {
            console.log(err);
            dev(false);
        });
    });
    return devolver;
}

function comprobarCaja() {
    var devolver = new Promise((dev, rej) => {
        db.cajas.where('abierta').equals(1).toArray(data => {
            if (data.length === 1) {
                dev('ABIERTA');
            } else {
                if (data.length === 0) {
                    dev('CERRADA');
                } else {
                    console.log("Error, hay más de una caja abierta");
                    notificacion('Error. Hay más de una caja abierta, contacte con un técnico', 'error');
                    dev('ERROR');
                }
            }
        }).catch(err => {
            console.log(err);
            notificacion('Error en comprobarCaja()', 'error');
            dev('ERROR');
        });
    });
    return devolver;
}

function fichados() /* DEVUELVE null si no hay nadie, DEVUELVE array de fichados si hay alguien  'idTrabajador, nombre, inicio, final, activo, fichado'*/ {
    var devolver = new Promise(function (dev, rej) {
        db.fichajes.toArray().then(data => {
            if (data.length > 0) {
                var aux = null;
                for (let i = 0; i < data.length; i++) {
                    if (data[i].fichado === 1) {
                        aux = data;
                        break;
                    }
                }
                dev(aux);
            } else {
                dev(null);
            }
        }).catch(err => {
            console.log(err);
            notificacion('Error en fichados()');
            dev(null);
        });
    });
    return devolver;
}

function getTipoSetCaja() { //Tipo 1 = Abrir, Tipo 2 = Cerrar
    if (currentCaja === null) {
        return 1;
    }
    else {
        return 2;
    }
}
function setCaja() { //Tipo 1 = Abrir, Tipo 2 = Cerrar
    var tipo = getTipoSetCaja();
    if (tipo === 1) {
        setAbrirCaja();
    }
    else {
        if (tipo === 2) {
            vueSetCaja.tipo = 2;
            $('#modalSetCaja').modal('show');
            //setCerrarCaja();
        }
    }
}

function setAbrirCaja() {
    db.cajas.put({
        inicioTime: new Date(),
        finalTime: null,
        inicioDependenta: null,
        finalDependenta: null,
        totalApertura: vueSetCaja.getTotal,
        totalCierre: null,
        descuadre: null,
        recaudado: null,
        abierta: 1 //1 ABIERTA, 0 CERRADA
    }).then(function () {
        db.cajas.orderBy('id').last().then(data => {
            setCurrentCaja(data.id).then(res => {
                if (res) {
                    loadingToc();
                    notificacion('¡INICIO CAJA OK!');
                    $('#modalSetCaja').modal('hide');
                }
                else {
                    try {
                        throw "Error en setCurrentCaja";
                    } catch (err) {
                        console.log(err)
                        notificacion(err, 'error');
                    }
                }
            });
        }).catch(err => {
            console.log(err);
            notificacion('Error. No se puede establecer el ID de la caja actual');
        });
    }).catch(err => {
        console.log(err);
        notificacion('Error 154', 'error');
    });
}

function confirmarCierre() {
    confirm("¿Estás segur@ de cerrar la caja?")
    {
        setCerrarCaja();
    }
}

async function setCerrarCaja() { //Al cerrar, establecer currentCaja = null y vueSetCaja.tipo = 1

    var idCaja = await getCurrentCaja();
    var fechaFin = new Date();
    if (idCaja !== null) {
        var infoCierre = await recuentoCajaCierre(idCaja);
        var infoTrabajadorActivo = await getTrabajadorActivo();
        var datosCaja = await getInfoCaja(idCaja);
        //var totalTarjeta = await getTotalTarjetaCaja(idCaja); //FALTA
        let auxVueSetCaja = vueSetCaja;
        let totalEfectivoDependientas = vueSetCaja.getTotal;
        let totalEfectivoCajaActualDependientas = totalEfectivoDependientas - (datosCaja.totalApertura);

        if (infoTrabajadorActivo !== false) {
            // await db.cajas.where('id').equals(idCaja).modify(function (caja) {
            //     caja.abierta = 0;
            //     caja.finalDependenta = infoTrabajadorActivo.idTrabajador;
            //     caja.finalTime = fechaFin;
            //     caja.descuadre = (caja.totalApertura + 0 + totalEfectivoCajaActualDependientas) - (infoCierre.totalEfectivo);
            //     caja.recaudado = infoCierre.totalEfectivo - caja.descuadre - caja.totalApertura; //En efectivo real nuevo, es decir, sin contar inicio apertura
            //     caja.totalCierre = infoCierre.totalVendido - caja.descuadre;

            // }).catch(err => {
            //     console.log(err);
            //     notificacion('Error en setCerrarCaja modify cajas', 'error');
            // });

            let recuentoSalidas = await recuentoSalidasDinero(idCaja);
            let recuentoEntradas = await recuentoEntradasDinero(idCaja);

            if (recuentoSalidas === null && recuentoEntradas === null) {
                recuentoSalidas = 0;
                recuentoEntradas = 0;
            }

            var _calaixFet = redondearPrecio(totalEfectivoDependientas - datosCaja.totalApertura + recuentoSalidas - recuentoEntradas);
            var _nombreTrabajador = (await getTrabajadorActivo()).nombre;
            var _descuadre = redondearPrecio(totalEfectivoDependientas - datosCaja.totalApertura + recuentoSalidas - recuentoEntradas - infoCierre.totalEfectivo);
            var _nClientes = infoCierre.numeroClientes;
            var _recaudado = redondearPrecio(infoCierre.totalEfectivo + infoCierre.totalTarjeta + _descuadre);
            var _arrayMovimientos = await db.movimientos.where('idCaja').equals(idCaja).toArray();
            var _nombreTienda = (await getParametros()).nombreTienda;
            var _fechaInicio = datosCaja.inicioTime;

            var _totalSalidas = -recuentoSalidas;
            var _totalEntradas = recuentoEntradas;
            var _cInicioCaja = datosCaja.totalApertura;
            var _cFinalCaja = redondearPrecio(datosCaja.totalApertura + recuentoEntradas + infoCierre.totalEfectivo - recuentoSalidas + _descuadre);

            var infoTicketCierre = {
                calaixFet: _calaixFet,
                nombreTrabajador: _nombreTrabajador,
                descuadre: _descuadre,
                nClientes: _nClientes,
                recaudado: _recaudado,
                arrayMovimientos: _arrayMovimientos,
                nombreTienda: _nombreTienda,
                fechaInicio: datosCaja.inicioTime,
                fechaFinal: fechaFin,
                totalSalidas: _totalSalidas,
                totalEntradas: _totalEntradas,
                cInicioCaja: _cInicioCaja,
                cFinalCaja: _cFinalCaja

            };
            await db.cajas.where('id').equals(idCaja).modify(function (caja) {
                caja.abierta = 0;
                caja.finalDependenta = infoTrabajadorActivo.idTrabajador;
                caja.finalTime = fechaFin;
                caja.descuadre = infoTicketCierre.descuadre;
                caja.recaudado = infoTicketCierre.recaudado;
                caja.totalCierre = infoTicketCierre.cFinalCaja;

            }).catch(err => {
                console.log(err);
                notificacion('Error en setCerrarCaja modify cajas', 'error');
            });

            console.log("totalEfectivoDependientas: ", totalEfectivoDependientas, "totalTarjeta: ", infoCierre.totalTarjeta, "recuentoSalidas: ", recuentoSalidas, "recuentoEntradas: ", recuentoEntradas, "datosCaja.totalApertura: ", datosCaja.totalApertura);
            console.log(infoTicketCierre);
            imprimirTickerCierreCaja(infoTicketCierre);
            setCurrentCaja(null).then(res => {
                if (res) {
                    auxVueSetCaja.tipo = 1;
                    notificacion('Caja cerrada', 'success');
                    //location.reload();
                }
                else {
                    console.log('Error en setCurrentCaja() 4567');
                    notificacion('Error en setCurrentCaja()', 'error');
                }
            });
        }
        else {
            notificacion('No hay trabajador activo', 'error');
            console.log(infoTrabajadorActivo);
        }
    }
    else {
        console.log('No hay caja para cerrar');
        notificacion('No hay caja abierta para poder cerrar', 'error');
    }

}

function abrirModalSalidaDinero() {
    $("#modalSalidaDinero").modal('show');
}
function abrirModalEntradaDinero() {
    $("#modalEntradaDinero").modal('show');
}

function restarUnidad(x) {
    switch (x) {
        case 0:
            document.getElementById('unidadesUnCentimo').innerHTML = parseInt(document.getElementById('unidadesUnCentimo').innerHTML) - 1;
            break;
        case 1:
            document.getElementById('unidadesDosCentimos').innerHTML = parseInt(document.getElementById('unidadesDosCentimos').innerHTML) - 1;
            break;
        case 2:
            document.getElementById('unidadesCincoCentimos').innerHTML = parseInt(document.getElementById('unidadesCincoCentimos').innerHTML) - 1;
            break;
        case 3:
            document.getElementById('unidadesDiezCentimos').innerHTML = parseInt(document.getElementById('unidadesDiezCentimos').innerHTML) - 1;
            break;
        case 4:
            document.getElementById('unidadesVeinteCentimos').innerHTML = parseInt(document.getElementById('unidadesVeinteCentimos').innerHTML) - 1;
            break;
        case 5:
            document.getElementById('unidadesCincuentaCentimos').innerHTML = parseInt(document.getElementById('unidadesCincuentaCentimos').innerHTML) - 1;
            break;
        case 6:
            document.getElementById('unidadesUnEuro').innerHTML = parseInt(document.getElementById('unidadesUnEuro').innerHTML) - 1;
            break;
        case 7:
            document.getElementById('unidadesDosEuros').innerHTML = parseInt(document.getElementById('unidadesDosEuros').innerHTML) - 1;
            break;
        case 8:
            document.getElementById('unidadesCincoEuros').innerHTML = parseInt(document.getElementById('unidadesCincoEuros').innerHTML) - 1;
            break;
        case 9:
            document.getElementById('unidadesDiezEuros').innerHTML = parseInt(document.getElementById('unidadesDiezEuros').innerHTML) - 1;
            break;
        case 10:
            document.getElementById('unidadesVeinteEuros').innerHTML = parseInt(document.getElementById('unidadesVeinteEuros').innerHTML) - 1;
            break;
        case 11:
            document.getElementById('unidadesCincuentaEuros').innerHTML = parseInt(document.getElementById('unidadesCincuentaEuros').innerHTML) - 1;
            break;
        case 12:
            document.getElementById('unidadesCienEuros').innerHTML = parseInt(document.getElementById('unidadesCienEuros').innerHTML) - 1;
            break;
    }
}

function restarUnidadCierre(x) {
    switch (x) {
        case 0:
            document.getElementById('unidadesUnCentimoCierre').innerHTML = parseInt(document.getElementById('unidadesUnCentimoCierre').innerHTML) - 1;
            break;
        case 1:
            document.getElementById('unidadesDosCentimosCierre').innerHTML = parseInt(document.getElementById('unidadesDosCentimosCierre').innerHTML) - 1;
            break;
        case 2:
            document.getElementById('unidadesCincoCentimosCierre').innerHTML = parseInt(document.getElementById('unidadesCincoCentimosCierre').innerHTML) - 1;
            break;
        case 3:
            document.getElementById('unidadesDiezCentimosCierre').innerHTML = parseInt(document.getElementById('unidadesDiezCentimosCierre').innerHTML) - 1;
            break;
        case 4:
            document.getElementById('unidadesVeinteCentimosCierre').innerHTML = parseInt(document.getElementById('unidadesVeinteCentimosCierre').innerHTML) - 1;
            break;
        case 5:
            document.getElementById('unidadesCincuentaCentimosCierre').innerHTML = parseInt(document.getElementById('unidadesCincuentaCentimosCierre').innerHTML) - 1;
            break;
        case 6:
            document.getElementById('unidadesUnEuroCierre').innerHTML = parseInt(document.getElementById('unidadesUnEuroCierre').innerHTML) - 1;
            break;
        case 7:
            document.getElementById('unidadesDosEurosCierre').innerHTML = parseInt(document.getElementById('unidadesDosEurosCierre').innerHTML) - 1;
            break;
        case 8:
            document.getElementById('unidadesCincoEurosCierre').innerHTML = parseInt(document.getElementById('unidadesCincoEurosCierre').innerHTML) - 1;
            break;
        case 9:
            document.getElementById('unidadesDiezEurosCierre').innerHTML = parseInt(document.getElementById('unidadesDiezEurosCierre').innerHTML) - 1;
            break;
        case 10:
            document.getElementById('unidadesVeinteEurosCierre').innerHTML = parseInt(document.getElementById('unidadesVeinteEurosCierre').innerHTML) - 1;
            break;
        case 11:
            document.getElementById('unidadesCincuentaEurosCierre').innerHTML = parseInt(document.getElementById('unidadesCincuentaEurosCierre').innerHTML) - 1;
            break;
        case 12:
            document.getElementById('unidadesCienEurosCierre').innerHTML = parseInt(document.getElementById('unidadesCienEurosCierre').innerHTML) - 1;
            break;
    }
}

function sumarUnidadCierre(x) {
    switch (x) {
        case 0:
            document.getElementById('unidadesUnCentimoCierre').innerHTML = parseInt(document.getElementById('unidadesUnCentimoCierre').innerHTML) + 1;
            break;
        case 1:
            document.getElementById('unidadesDosCentimosCierre').innerHTML = parseInt(document.getElementById('unidadesDosCentimosCierre').innerHTML) + 1;
            break;
        case 2:
            document.getElementById('unidadesCincoCentimosCierre').innerHTML = parseInt(document.getElementById('unidadesCincoCentimosCierre').innerHTML) + 1;
            break;
        case 3:
            document.getElementById('unidadesDiezCentimosCierre').innerHTML = parseInt(document.getElementById('unidadesDiezCentimosCierre').innerHTML) + 1;
            break;
        case 4:
            document.getElementById('unidadesVeinteCentimosCierre').innerHTML = parseInt(document.getElementById('unidadesVeinteCentimosCierre').innerHTML) + 1;
            break;
        case 5:
            document.getElementById('unidadesCincuentaCentimosCierre').innerHTML = parseInt(document.getElementById('unidadesCincuentaCentimosCierre').innerHTML) + 1;
            break;
        case 6:
            document.getElementById('unidadesUnEuroCierre').innerHTML = parseInt(document.getElementById('unidadesUnEuroCierre').innerHTML) + 1;
            break;
        case 7:
            document.getElementById('unidadesDosEurosCierre').innerHTML = parseInt(document.getElementById('unidadesDosEurosCierre').innerHTML) + 1;
            break;
        case 8:
            document.getElementById('unidadesCincoEurosCierre').innerHTML = parseInt(document.getElementById('unidadesCincoEurosCierre').innerHTML) + 1;
            break;
        case 9:
            document.getElementById('unidadesDiezEurosCierre').innerHTML = parseInt(document.getElementById('unidadesDiezEurosCierre').innerHTML) + 1;
            break;
        case 10:
            document.getElementById('unidadesVeinteEurosCierre').innerHTML = parseInt(document.getElementById('unidadesVeinteEurosCierre').innerHTML) + 1;
            break;
        case 11:
            document.getElementById('unidadesCincuentaEurosCierre').innerHTML = parseInt(document.getElementById('unidadesCincuentaEurosCierre').innerHTML) + 1;
            break;
        case 12:
            document.getElementById('unidadesCienEurosCierre').innerHTML = parseInt(document.getElementById('unidadesCienEurosCierre').innerHTML) + 1;
            break;
    }
}

function modalCerrarCaja() { //CREO QUE HAY QUE BORRAR
    $('#modalCierreCaja').modal('show');
}


function ivaCorrecto(iva) {
    let ivaOk = Number(iva);
    switch (ivaOk) {
        case 4:
            return true;
            break;
        case 10:
            return true;
            break;
        case 21:
            return true;
            break;
        default:
            return false;
            break;
    }
}

function conversorIva(iva) {
    let ivaOk = Number(iva);
    switch (ivaOk) {
        case 1:
            return 4;
            break;
        case 2:
            return 10;
            break;
        case 3:
            return 21;
            break;
        default:
            return 0;
            break;
    }
}

function ficharTrabajador(idTrabajador) {
    var devolver = new Promise((dev, rej) => {
        db.trabajadores.where('idTrabajador').equals(idTrabajador).toArray().then(data => {
            if (data.length === 1) {
                db.fichajes.put({
                    idTrabajador: data[0].idTrabajador,
                    nombre: data[0].nombre,
                    inicio: new Date(),
                    final: null,
                    activo: 1,
                    fichado: 1
                }).then(function () {
                    dev(true);
                }).catch(err => {
                    console.log(err);
                    notificacion('Error en ficharTrabajador() JS', 'error');
                    dev(false);
                });
            } else {
                console.log('Error, no existe este ID');
                dev(false);
            }
        }).catch(err => {
            console.log(err);
            notificacion('Error en Where trabajadores', 'error');
            dev(false);
        });
    });
    return devolver;
}

function nuevoArticulo(idArticulo, nombreArticulo, precioArticulo, ivaArticulo) {
    if (ivaCorrecto(ivaArticulo)) {
        db.articulos.put({ id: idArticulo, nombre: nombreArticulo, precio: Number(precioArticulo), iva: ivaArticulo }).then(function () {
            console.log("Articulo agregado correctamente");
        });
    } else {
        alert("Error");
        console.log(`IVA incorrecto en id(${idArticulo}) nombre(${nombreArticulo})`);
    }
}
function construirObjetoIvas(idArticulo, unidades) {
    var devolver = new Promise((dev, rej) => {
        db.articulos.get(idArticulo).then(data => {
            let base1 = 0, base2 = 0, base3 = 0;
            let valor1 = 0, valor2 = 0, valor3 = 0;
            let importe1 = 0, importe2 = 0, importe3 = 0;

            switch (data.iva) {
                case 1: base1 = (data.precio / 1.04) * unidades; valor1 = (data.precio / 1.04) * 0.04 * unidades; importe1 = data.precio * unidades; break;
                case 2: base2 = (data.precio / 1.10) * unidades; valor2 = (data.precio / 1.10) * 0.10 * unidades; importe2 = data.precio * unidades; break;
                case 3: base3 = (data.precio / 1.21) * unidades; valor3 = (data.precio / 1.21) * 0.21 * unidades; importe3 = data.precio * unidades; break;
                default: break;
            }

            dev({
                base1: redondearPrecio(base1),
                base2: redondearPrecio(base2),
                base3: redondearPrecio(base3),
                valorIva1: redondearPrecio(valor1),
                valorIva2: redondearPrecio(valor2),
                valorIva3: redondearPrecio(valor3),
                importe1: redondearPrecio(importe1),
                importe2: redondearPrecio(importe2),
                importe3: redondearPrecio(importe3)
            });
        }).catch(err => {
            console.log(err);
            notificacion('Error al construirObjetoIva()', 'error');
            dev(null);
        });
    });
    return devolver;
}

async function addItemCesta(idArticulo, nombreArticulo, precio, sumable, idBoton, gramos = false) //id, nombre, precio, iva, aPeso
{
    /* SAGRADO: SUMABLE ES NORMAL, NO SUMABLE ES A PESO */
    $('#' + idBoton).attr('disabled', true);
    if (sumable || gramos !== false) {
        var res = await db.cesta.get({ idArticulo: idArticulo });
        if (res) {
            let uds = res.unidades + 1;
            let subt = res.subtotal + precio;
            if (!gramos) //PRODUCTO NORMAL
            {
                let updated = await db.cesta.update(res.idLinea, { unidades: uds, subtotal: redondearPrecio(subt), activo: false, tipoIva: await construirObjetoIvas(idArticulo, uds) });
                if (updated) {
                    await buscarOfertas();

                }
                else {
                    notificacion('La cesta no se ha actualizado', 'error');
                }
            }
            else  //PRODUCTO A PESO
            {
                await db.cesta.put({ idArticulo: idArticulo, nombreArticulo: nombreArticulo, unidades: 1, subtotal: precio * (gramos / 1000), promocion: -1, activo: false, tipoIva: await construirObjetoIvas(idArticulo, 1) }).catch(err => {
                    console.log(err);
                    notificacion('Error 456', 'error');
                });
            }
        }
        else {
            if (!gramos) {
                await db.cesta.put({ idArticulo: idArticulo, nombreArticulo: nombreArticulo, unidades: 1, subtotal: precio, promocion: -1, activo: false, tipoIva: await construirObjetoIvas(idArticulo, 1) }).catch(err => {
                    notificacion('Error 2431', 'error');
                    console.log(err);
                });
                await buscarOfertas();
            }
            else {
                await db.cesta.put({ idArticulo: idArticulo, nombreArticulo: nombreArticulo, unidades: 1, subtotal: precio * (gramos / 1000), promocion: -1, activo: false, tipoIva: await construirObjetoIvas(idArticulo, 1) }).catch(err => {
                    console.log(err);
                    notificacion('Error 4566', 'error');
                });
            }
        }
        await actualizarCesta();
    }
    else //Va por peso
    {
        cosaParaPeso = { idArticulo: idArticulo, nombreArticulo: nombreArticulo, precio: precio, sumable: sumable, idBoton: idBoton };
        vuePeso.cosaParaPeso = cosaParaPeso;
        console.log(vuePeso.cosaParaPeso);
        $('#modalAPeso').modal('show');
    }
    $('#' + idBoton).attr('disabled', false);
}

function borrarItemCesta(idArticulo) {

}

function vaciarCesta() {
    db.cesta.clear().then(function () {
        actualizarCesta();
    });
}

function abrirModalClientes() {
    db.clientes.toArray().then(info => {
        // var str = '';
        // for (let i = 0; i < info.length; i++) {
        //     str += '<option data-subtext="' + info[i].nombre + '" value="' + info[i].id + '">' + info[i].nombre + '</option>';
        // }

        // document.getElementById('selectClientes').innerHTML += str;
        // $("#selectClientes").selectpicker('refresh');
        // $("#modalClientes").modal();
    }).catch(err => {
        console.log(err);
        notificacion('Error al cargar clientes', 'error');
    })
}

async function actualizarCesta() {
    var lista = (await db.cesta.toArray()).reverse();
    let outHTML = '';
    let sumaTotal = 0.0;
    for (var key in lista) {
        outHTML += '<tr><td>' + lista[key].nombreArticulo + '</td> <td>' + lista[key].unidades + '</td> <td>' + lista[key].subtotal.toFixed(2) + '</td> </tr>';
        sumaTotal += lista[key].subtotal;
    }

    lista = [];
    imprimirTotalCesta(sumaTotal);
    //listaCesta.innerHTML = outHTML;
    vuePanelInferior.actualizarCesta();
}

function imprimirTicketReal(idTicket) {
    //idTicket, timestamp, total, cesta, tarjeta
    var enviarArray = [];
    db.tickets.where('idTicket').equals(idTicket).toArray(lista => {
        for (let i = 0; i < lista[0].cesta.length; i++) {
            enviarArray.push({ cantidad: lista[0].cesta[i].unidades, articuloNombre: lista[0].cesta[i].nombreArticulo, importe: lista[0].cesta[i].subtotal });
        }
        db.parametrosTicket.toArray().then(data => {
            imprimirEscpos({ numFactura: lista[0].idTicket, arrayCompra: enviarArray, total: lista[0].total, visa: lista[0].tarjeta, tiposIva: lista[0].tiposIva, cabecera: data[0].valorDato, pie: data[1].valorDato });
        }).catch(err => {
            console.log(err);
            notificacion('Error al obtener parametros de ticket', 'error');
        });
    });
}

function fichadoYActivo() {
    var devolver = new Promise((dev, rej) => {
        db.activo.toArray().then(res => {
            if (res.length === 1 && vueFichajes.fichados.length > 0) {
                dev(true);
            } else {
                dev(false);
            }
        }).catch(err => {
            console.log(err);
            notificacion('Error en fichadoYActivo catch', 'error');
            dev(false);
        });
    });
    return devolver;
}

function pagarConTarjeta() {
    //var idTicket = generarIdTicket();
    var time = new Date();
    //var stringTime = `${time.getDate()}/${time.getMonth()}/${time.getFullYear()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;

    fichadoYActivo().then(res22 => {
        if (res22) {
            db.cesta.toArray(lista => {
                if (lista) {
                    if (lista.length > 0) {
                        if (1 == 1) //emitirPagoDatafono()) //Se envía la señal al datáfono, si todo es correcto, devuelve true. ESTO DEBERÁ SER UNA PROMESA, POR LO QUE MÁS ADELANTE HABRÁ QUE CAMBIAR LA ESTRUCTURA DE ACCESO A ESTA FUNCIÓN
                        {
                            db.activo.toArray().then(res => {
                                if (res.length === 1) {
                                    db.tickets.put({ timestamp: time, total: Number(totalCesta.innerHTML), cesta: lista, tarjeta: true, idCaja: currentCaja, idTrabajador: res[0].idTrabajador, tiposIva: calcularBasesTicket(lista) }).then(idTicket => {
                                        vaciarCesta();
                                        notificacion('¡Ticket creado!', 'success');
                                        $('#modalPago').modal('hide');
                                        vueTicketMedio.actualizarTicketMedio();
                                    });
                                } else {
                                    console.log('Error #66');
                                }
                            }).catch(err => {
                                console.log(err);
                                notificacion('Error #55');
                            });
                        } else {
                            notificacion('Error al pagar con datáfono', 'error');
                        }
                    } else {
                        notificacion('Error. ¡No hay nada en la cesta!', 'error');
                    }
                } else {
                    notificacion('Error al cargar la cesta desde pagar()', 'error');
                }
            });
        } else {
            notificacion('¡Es necesario fichar antes cobrar!', 'warning');
        }
    });
}

function calcularBasesTicket(cesta) {
    let base1 = 0, base2 = 0, base3 = 0;
    let valor1 = 0, valor2 = 0, valor3 = 0;
    let importe1 = 0, importe2 = 0, importe3 = 0;

    for (let i = 0; i < cesta.length; i++) {
        base1 += cesta[i].tipoIva.base1;
        base2 += cesta[i].tipoIva.base2;
        base3 += cesta[i].tipoIva.base3;

        valor1 += cesta[i].tipoIva.valorIva1;
        valor2 += cesta[i].tipoIva.valorIva2;
        valor3 += cesta[i].tipoIva.valorIva3;

        importe1 += cesta[i].tipoIva.importe1;
        importe2 += cesta[i].tipoIva.importe2;
        importe3 += cesta[i].tipoIva.importe3;
    }

    return {
        base1: redondearPrecio(base1),
        base2: redondearPrecio(base2),
        base3: redondearPrecio(base3),
        valor1: redondearPrecio(valor1),
        valor2: redondearPrecio(valor2),
        valor3: redondearPrecio(valor3),
        importe1: redondearPrecio(importe1),
        importe2: redondearPrecio(importe2),
        importe3: redondearPrecio(importe3)
    };
}

function pagarConEfectivo() {
    //var idTicket = generarIdTicket();
    var time = new Date();
    //var stringTime = `${time.getDate()}/${time.getMonth()}/${time.getFullYear()} ${time.getHours()}:${time.getMinutes()}:${time.getSeconds()}`;

    fichadoYActivo().then(res22 => {
        if (res22) {
            db.cesta.toArray(lista => {
                if (lista) {
                    if (lista.length > 0) {
                        db.activo.toArray().then(res => {
                            if (res.length === 1) {
                                db.tickets.put({ timestamp: time, total: Number(totalCesta.innerHTML), cesta: lista, tarjeta: false, idCaja: currentCaja, idTrabajador: res[0].idTrabajador, tiposIva: calcularBasesTicket(lista) }).then(idTicket => {
                                    vaciarCesta();
                                    notificacion('¡Ticket creado!', 'success');
                                    $('#modalPago').modal('hide');
                                    vueTicketMedio.actualizarTicketMedio();
                                });
                            } else {
                                console.log('Error #6');
                            }
                        }).catch(err => {
                            console.log(err);
                            notificacion('Error #5');
                        });
                    } else {
                        notificacion('Error. ¡No hay nada en la cesta!', 'error');
                    }
                } else {
                    notificacion('Error al cargar la cesta desde pagar()', 'error');
                }
            });
        } else {
            notificacion('¡Es necesario fichar antes cobrar!', 'warning');
        }
    });
}

function abrirPago() {
    db.cesta.toArray(lista => {
        if (lista) {
            if (lista.length > 0) {
                rowImprimirTicket.setAttribute('class', 'row hide');
                rowEfectivoTarjeta.setAttribute('class', 'row');
                $('#modalPago').modal();
            } else {
                notificacion('Error. ¡No hay nada en la cesta!', 'error');
            }
        } else {
            notificacion('Error al acceder a la cesta desde abrirPago()', 'error');
        }
    });
}

function generarIdTicket() {
    var dateTime = Date.now();
    var timestamp = Math.floor(dateTime / 1000);
    return timestamp;
}

function addMenus() {
    var menuData = [];

    menuData.push({ id: 0, nombre: 'Cafetería', submenus: [0, 1, 2], teclados: null });
    menuData.push({ id: 1, nombre: 'Panadería', submenus: [3, 4, 5], teclados: null });
    menuData.push({ id: 3, nombre: 'Frutería', submenus: [6, 7, 8], teclados: null });

    db.menus.bulkPut(menuData).then(function () {
        console.log("Menús agregadosadd");
    });
}
var vueSetCaja = null;
var vueFichajes = null;
var vuePeso = null;
var vuePanelInferior = null;
var vueSalidaDinero = null;
var vueEntradaDinero = null;
var vueTicketMedio = null;

window.onload = startDB;
var conexion = null;
var db = null;
var aux = null;
var puto = null;
var inicio = 0;
var currentMenu = 0;
var currentCaja = null;
var cosaParaPeso = null;