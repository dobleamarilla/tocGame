var escpos = require('escpos');
var exec = require('child_process').exec;
var os = require('os');
var imprimirTicketVenta = function (event, numFactura, arrayCompra, total, visa) {
    try {
        var device = new escpos.USB('0x4B8', '0x202'); //USB
        //var device = new escpos.Serial('COM1') //SERIE
        var options = { encoding: "GB18030" };
        var printer = new escpos.Printer(device, options);

        var detalles = '';
        var pagoTarjeta = '';
        for (let i = 0; i < arrayCompra.length; i++) {
            detalles += `${arrayCompra[i].cantidad}     ${arrayCompra[i].articuloNombre}   ${arrayCompra[i].importe}\n`;
        }
        var fecha = new Date();
        if (visa) {
            pagoTarjeta = '----------- PAGADO CON TARJETA ---------\n';
        }

        device.open(function () {
            printer
                .encode('EUC-KR')
                .size(2, 2)
                .text('365')
                .size(1, 1)
                .text('Plaza Catalunya, 6')
                .text('BARCELONA - 08208')
                .text('NIF: B61957189')
                .text('Tel. 647 798 051')
                .text('Data: ' + fecha.getDate() + '-' + fecha.getMonth() + '-' + fecha.getFullYear() + ' ' + fecha.getHours() + ':' + fecha.getMinutes())
                .text('Factura simplificada N: ' + numFactura)
                .control('LF')
                .control('LF')
                .control('LF')
                .control('LF')
                .text('Quantitat      Article        Import (EUR)')
                .text('-----------------------------------------')
                .text(detalles)
                .text(pagoTarjeta)
                .size(2, 2)
                .text('TOTAL: ' + total + ' EUR')
                .size(1, 1)
                .text('IVA 10% : ' + (total / 1.1).toFixed(2) + ' EUR')
                .text('-- ES COPIA --')
                .text('GRACIES PER LA SEVA VISITA')
                .text('WiFi: 365Cafe')
                .text('Psw: 365sabadell')
                .control('LF')
                .control('LF')
                .control('LF')
                .cut('PAPER_FULL_CUT')
                .close()
        });
    }
    catch (err) {
        errorImpresora(err, event);
    }
}

var salidaDinero = function (event, totalRetirado, cajaActual, fecha, nombreDependienta, nombreTienda) {
    try {
        var device = new escpos.USB('0x4B8', '0x202'); //USB
        //var device = new escpos.Serial('COM1') //SERIE
        var options = { encoding: "GB18030" };
        var printer = new escpos.Printer(device, options);
        device.open(function () {
            printer
                .align('CT')
                .size(1, 1)
                .text(nombreTienda)
                .text(fecha)
                .text("Dependienta: " + nombreDependienta)
                .text("Retirada efectivo: " + totalRetirado)
                .size(2, 2)
                .text(totalRetirado)
                .size(1, 1)
                .text("Efectivo actual")
                .size(2, 2)
                .text(cajaActual)
                .cut()
                .close()
        });
    }
    catch (err) {
        errorImpresora(err, event);
    }
}

var entradaDinero = function (event, totalIngresado, cajaActual, fecha, nombreDependienta, nombreTienda) {
    try {
        var device = new escpos.USB('0x4B8', '0x202'); //USB
        //var device = new escpos.Serial('COM1') //SERIE
        var options = { encoding: "GB18030" };
        var printer = new escpos.Printer(device, options);
        device.open(function () {
            printer
                .align('CT')
                .size(1, 1)
                .text(nombreTienda)
                .text(fecha)
                .text("Dependienta: " + nombreDependienta)
                .text("Retirada efectivo: " + totalIngresado)
                .size(2, 2)
                .text(totalIngresado)
                .size(1, 1)
                .text("Efectivo actual")
                .size(2, 2)
                .text(cajaActual)
                .cut()
                .close()
        });
    }
    catch (err) {
        errorImpresora(err, event);
    }
}

var cierreCaja = function (event, calaixFet, nombreTrabajador, descuadre, nClientes, recaudado, arrayMovimientos, nombreTienda, fechaInicio, fechaFinal) {
    // console.log("---- INICIO TEST ----");
    // console.log(calaixFet);
    // console.log(nombreTrabajador);
    // console.log(descuadre);
    // console.log(nClientes);
    // console.log(recaudado);
    // console.log(arrayMovimientos);
    // console.log(nombreTienda);
    // console.log(fechaInicio);
    // console.log(fechaFinal);
    // console.log("---- FINAL TEST ----");
    try {
        var device = new escpos.USB('0x4B8', '0x202'); //USB
        //var device = new escpos.Serial('COM1') //SERIE
        var options = { encoding: "GB18030" };
        var printer = new escpos.Printer(device, options);
        device.open(function () {

            printer
                .align('CT')
                .size(2, 2)
                .text('BOTIGA : ' + nombreTienda)
                .size(1, 1)
                .text('Resum caixa')
                .text('')
                .align('LT')
                .text('Resp.   : ' + nombreTrabajador)
                .text('Inici   : ' + fechaInicio)
                .text('Fi      : ' + fechaFinal)
                .text('')
                .size(1, 2)
                .text('Calaix Fet      :      ' + calaixFet)
                .text('Descuadre       :      ' + descuadre)
                .text('Clients Atesos  :      ' + nClientes)
                .text('Recaudat.       :      ' + recaudado)
                .text('')
                .size(1, 1)
                .text('Moviments de Caixa')
                .align('CT')
                .text('')
                .text('')
                .text('')
                .cut()
                .close()

        });
    }
    catch (err) {
        errorImpresora(err, event);
    }
}

function errorImpresora(err, event) {
    console.log("No se encuentra la impresora");
    console.log(err);
    event.sender.send('falloImpresora', 'La impresora no está configurada');
    if (os.platform() === 'win32') { //

    }
    else {
        if (os.platform() === 'linux') {
            exec('echo sa | sudo -S sh /home/hit/tocGame/scripts/permisos.sh');
        }
    }
}

exports.imprimirTicket = function (req, event) {
    imprimirTicketVenta(event, req.numFactura, req.arrayCompra, req.total, req.visa);
}

exports.imprimirTicketSalida = function (req, event) {

    salidaDinero(event, req.cantidad, req.cajaActual, req.fecha, req.nombreTrabajador, req.nombreTienda);
}

exports.imprimirTicketEntrada = function (req, event) {

    entradaDinero(event, req.cantidad, req.cajaActual, req.fecha, req.nombreTrabajador, req.nombreTienda);
}

exports.imprimirTicketCierreCaja = function (req, event) {
    cierreCaja(event, req.calaixFet, req.nombreTrabajador, req.descuadre, req.nClientes, req.recaudado, req.arrayMovimientos, req.nombreTienda, req.fechaInicio, req.fechaFinal);
}