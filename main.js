const path = require('path');
const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const exec = require('child_process').exec;
const os = require('os');
var net = require('net');
var impresora = require('./componentes/impresora');
var tecladoVirtual = require('./componentes/teclado');
var atajos = require('./componentes/atajos');
var acciones = require('./componentes/acciones');
//var escpos = require('n');
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';

app.on('ready', () => {
    var ventanaPrincipal = new BrowserWindow({
        kiosk: true, //cambiar a true
        frame: false, //cambiar a false
        webPreferences: {
            nodeIntegration: true
        }
    });

    ventanaPrincipal.loadFile('./web/index.html');
    atajos.atajos(globalShortcut, ventanaPrincipal);

    /* ACCIONES IPC-MAIN */
    ipcMain.on('ventaDatafono', (event, info) => {
        var client = new net.Socket();
        client.connect(8890, '127.0.0.1', function () {
            console.log('Conectado al CoLinux | Venta');
            var ventaCliente = 489;
            var nombreDependienta = info.nombreDependienta;
            var numeroTicket = info.idTicket;
            var tienda = 1;
            var tpv = 1;
            var tipoOperacion = 1; //1=> VENTA
            var importe = info.total; //EN CENTIMOS DE EURO
            var venta_t = `\x02${ventaCliente};${tienda};${tpv};${tipoOperacion};${numeroTicket};${tipoOperacion};${importe};;;;;;;\x03`;
            client.write(venta_t);
        });

        client.on('data', function (data) {
            console.log('Recibido: ' + data);
            event.sender.send('ventaDatafono', data);
            client.write('\x02ACK\x03');
            client.destroy();
        });
        client.on('close', function () {
            console.log('Conexión cerrada');
        });
        //event.sender.send('canal1', 'EJEMPLO DE EVENT SENDER SEND');
    });

    ipcMain.on('devolucion', (event, args) => {

    });
    ipcMain.on('anulacion', (event, args) => {

    });
    ipcMain.on('consulta', (event, args) => {

    });
    ipcMain.on('imprimir', (event, args) => {

        console.log(event);
        impresora.imprimirTicket(args, event);
    });
    ipcMain.on('imprimirSalidaDinero', (event, args) => {

        impresora.imprimirTicketSalida(args, event);
    });
    ipcMain.on('abrirCajon', (event, args) => {

        impresora.abrirCajon(event);
    });
    ipcMain.on('imprimirEntradaDinero', (event, args) => {

        impresora.imprimirTicketEntrada(args, event);
    });
    ipcMain.on('imprimirCierreCaja', (event, args) => {

        //console.log(args);
        impresora.imprimirTicketCierreCaja(args, event);
    });
    ipcMain.on('tecladoVirtual', (event, args) => {
        if (os.platform() === 'win32') { //
            console.log("Hey, soy windows!");
            tecladoVirtual.showTouchKeyboard(exec);
        }
        else {
            if (os.platform() === 'linux') {

            }
        }
    });

    ipcMain.on('cerrarToc', (event, args) => {
        acciones.cerrar(ventanaPrincipal);
    });
    ipcMain.on('refreshToc', (event, args) => {
        acciones.refresh(ventanaPrincipal);
    });
});