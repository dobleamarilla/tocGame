var escpos = require('escpos');

var imprimirPrueba = function (numFactura, arrayCompra, total, visa) {
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

// Select the adapter based on your printer type

try {
    var device = new escpos.USB('0x4B8', '0x202'); //ESTE ES EL BUENO
    var options = { encoding: "GB18030" };
    var printer = new escpos.Printer(device, options);

} catch (err) {
    console.log(err);
}

exports.imprimirTicket = function (req) {
    console.log(req);
    imprimirPrueba(req.numFactura, req.arrayCompra, req.total, req.visa);

    //res.json({ status: 'ok' }).end();
}