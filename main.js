const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const exec = require('child_process').exec;
var net = require('net');
var impresora = require('./componentes/impresora');
var tecladoVirtual = require('./componentes/teclado');
var escpos = require('escpos');
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
    //ventanaPrincipal.webContents.openDevTools();
});
/* ACCIONES IPC-MAIN */
ipcMain.on('venta', (event, args) => {
    var client = new net.Socket();
    client.connect(8890, '127.0.0.1', function () {
        console.log('Conectado al CoLinux | Venta');
        //var venta_t = `\x02${data.cliente};${data.tienda};${data.tpv};gleidy;${data.ticket};1;${data.importe};;;;;;;\x03`;
        var venta_t = `\x02252;1;1;gleidy;356;1;1050;;;;;;;\x03`;
        client.write(venta_t);
    });
    client.on('data', function (data) {
        console.log('Recibido: ' + data);
        client.write('\x02ACK\x03');
        client.destroy();
    });
    client.on('close', function () {
        console.log('Conexión cerrada');
    });
    //event.sender.send('canal1', 'PUTO');
});

ipcMain.on('devolucion', (event, args) => {

});
ipcMain.on('anulacion', (event, args) => {

});
ipcMain.on('consulta', (event, args) => {

});
ipcMain.on('imprimir', (event, args) => {

    impresora.imprimirTicket(args);
});
ipcMain.on('tecladoVirtual', (event, args) => {
    tecladoVirtual.showTouchKeyboard(exec);
});