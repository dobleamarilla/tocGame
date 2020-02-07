var escpos = require('escpos');
var exec = require('child_process').exec;
var os = require('os');

const TIPO_SALIDA_DINERO = 1;
const TIPO_ENTRADA_DINERO = 2;

var imprimirTicketVenta = function (event, numFactura, arrayCompra, total, visa, tiposIva, cabecera, pie) {
    try {
        var device = new escpos.USB('0x4B8', '0x202'); //USB
        //var device = new escpos.Serial('COM1') //SERIE
        //var options = { encoding: "latin1" };
        var printer = new escpos.Printer(device);

        var detalles = '';
        var pagoTarjeta = '';
        for (let i = 0; i < arrayCompra.length; i++) {
            if(arrayCompra[i].articuloNombre.length < 20)
            {
                while(arrayCompra[i].articuloNombre.length < 20)
                {
                    arrayCompra[i].articuloNombre += ' ';
                }
            }
            detalles += `${arrayCompra[i].cantidad}     ${arrayCompra[i].articuloNombre.slice(0, 20)}       ${arrayCompra[i].importe}\n`;
        }
        var fecha = new Date();
        if (visa) {
            pagoTarjeta = '----------- PAGADO CON TARJETA ---------\n';
        }

        var detalleIva4     = '';
        var detalleIva10    = '';
        var detalleIva21    = '';
        var detalleiva         = '';
        if(tiposIva.importe1 > 0)
        {
            detalleIva4 = `${tiposIva.base1}        4%: ${tiposIva.valor1}      ${tiposIva.importe1}\n`;
        }
        if(tiposIva.importe2 > 0)
        {
            detalleIva10 = `${tiposIva.base2}        10%: ${tiposIva.valor2}      ${tiposIva.importe2}\n`;
        }
        if(tiposIva.importe3 > 0)
        {
            detalleIva21 = `${tiposIva.base3}       21%: ${tiposIva.valor3}      ${tiposIva.importe3}\n`;
        }
        detalleIva = detalleIva4 + detalleIva10 + detalleIva21;

        device.open(function () {
            printer
                .encode('latin1')
                .size(1, 1)
                .text(cabecera)
                .text('Data: ' + fecha.getDate() + '-' + fecha.getMonth() + '-' + fecha.getFullYear() + ' ' + fecha.getHours() + ':' + fecha.getMinutes())
                .text('Factura simplificada N: ' + numFactura)
                .control('LF')
                .control('LF')
                .control('LF')
                .control('LF')
                .text('Quantitat      Article        Import (EUR)')
                .text('-----------------------------------------')
                .align('LT')
                .text(detalles)
                .text(pagoTarjeta)
                .size(2, 2)
                .text('TOTAL: ' + total + ' EUR \n')
                .size(1, 1)
                .align('CT')
                .text('Base IVA         IVA         IMPORT')
                .text(detalleIva)
                .text('-- ES COPIA --')
                .text(pie)
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

var salidaDinero = function (event, totalRetirado, cajaActual, fecha, nombreDependienta, nombreTienda, concepto) {
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
                .text("Concepto")
                .size(2, 2)
                .text(concepto)
                .text('')
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
                .text('')
                .barcode('9933500329672', "CODE39")
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

var cierreCaja = function (event, calaixFet, nombreTrabajador, descuadre, nClientes, recaudado, arrayMovimientos, nombreTienda, fI, fF) {
    try {
        var fechaInicio     = new Date(fI);
        var fechaFinal      = new Date(fF);

        var textoMovimientos = '';
        for(let i = 0; i < arrayMovimientos.length; i++)
        {
            var auxFecha = new Date(arrayMovimientos[i].timestamp);
            if(arrayMovimientos[i].tipo === TIPO_SALIDA_DINERO)
            {
                textoMovimientos += `${i+1}: Salida:\n           Cantidad: -${arrayMovimientos[i].valor}\n           Fecha: ${auxFecha.getDate()}/${auxFecha.getMonth()}/${auxFecha.getFullYear()}  ${auxFecha.getHours()}:${auxFecha.getMinutes()}\n           Concepto: ${arrayMovimientos[i].concepto}\n`;
            }
            if(arrayMovimientos[i].tipo === TIPO_ENTRADA_DINERO)
            {
                textoMovimientos += `${i+1}: Entrada:\n            Cantidad: +${arrayMovimientos[i].valor}\n            Fecha: ${auxFecha.getDate()}/${auxFecha.getMonth()}/${auxFecha.getFullYear()}  ${auxFecha.getHours()}:${auxFecha.getMinutes()}\n            Concepto: ${arrayMovimientos[i].concepto}\n`;
            }
            auxFecha = null;
        }

        var device = new escpos.USB('0x4B8', '0x202'); //USB
        var options = { encoding: "ISO-8859-15"}; //"GB18030" };
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
                .text('Inici: ' + fechaInicio.getDate() + '-' + fechaInicio.getMonth() + '-' + fechaInicio.getFullYear() + ' ' + fechaInicio.getHours() + ':' + fechaInicio.getMinutes())
                .text('Final: ' + fechaFinal.getDate() + '-' + fechaFinal.getMonth() + '-' + fechaFinal.getFullYear() + ' ' + fechaFinal.getHours() + ':' + fechaFinal.getMinutes())
                .text('')
                .size(1, 2)
                .text('Calaix fet      :      ' + calaixFet)
                .text('Descuadre       :      ' + descuadre)
                .text('Clients atesos  :      ' + nClientes)
                .text('Recaudat        :      ' + recaudado)
                .text('')
                .size(1, 1)
                .text('Moviments de caixa')
                .text('')
                .text('')
                .text(textoMovimientos)
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
    imprimirTicketVenta(event, req.numFactura, req.arrayCompra, req.total, req.visa, req.tiposIva, req.cabecera, req.pie);
}

exports.imprimirTicketSalida = function (req, event) {
    salidaDinero(event, req.cantidad, req.cajaActual, req.fecha, req.nombreTrabajador, req.nombreTienda, req.concepto);
}

exports.imprimirTicketEntrada = function (req, event) {

    entradaDinero(event, req.cantidad, req.cajaActual, req.fecha, req.nombreTrabajador, req.nombreTienda);
}

exports.imprimirTicketCierreCaja = function (req, event) {
    cierreCaja(event, req.calaixFet, req.nombreTrabajador, req.descuadre, req.nClientes, req.recaudado, req.arrayMovimientos, req.nombreTienda, req.fechaInicio, req.fechaFinal);
}