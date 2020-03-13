const { ipcRenderer } = require('electron');

var testEco = null;

function testDatafonoNuevo() {
    ipcRenderer.send('ventaDatafono', 'ping pong');
}
/* RESPUESTAS ACCIONES IPC-MAIN */
ipcRenderer.on('ventaDatafono', (ev, args) => {
    testEco = args;
    console.log("Datáfono devuelve: ", args);
});
ipcRenderer.on('devolucion', (ev, args) => {

});
ipcRenderer.on('anulacion', (ev, args) => {

});
ipcRenderer.on('consulta', (ev, args) => {

});
ipcRenderer.on('imprimir', (ev, args) => {

});
ipcRenderer.on('falloImpresora', (ev, data) => {
    //notificacion(data, 'error');
});
/* FIN RESPUESTAS ACCIONES IPC-MAIN */

function imprimirEscpos(data) {
    ipcRenderer.send('imprimir', data);
}
function abrirTecladoVirtual() {
    ipcRenderer.send('tecladoVirtual', true);
}
function cerrarPrograma() {
    ipcRenderer.send('cerrarToc', true);
}
function refrescarPrograma() {
    ipcRenderer.send('refreshToc', true);
}
function imprimirSalidaDinero(data) {
    ipcRenderer.send('imprimirSalidaDinero', data);
}
function imprimirEntradaDinero(data) {
    ipcRenderer.send('imprimirEntradaDinero', data);
}
function imprimirTickerCierreCaja(data) {
    ipcRenderer.send('imprimirCierreCaja', data);
}