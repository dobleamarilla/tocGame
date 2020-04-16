const { ipcRenderer } = require('electron');

var testEco = null;

function testDatafonoNuevo(info) {
    ipcRenderer.send('ventaDatafono', info);
    console.log('Se ejecuta la función de enviar pago al datáfono');
}
function controlRespuestaDatafono(respuesta)
{
    document.getElementById("esperandoDatafono").classList.add('hide');
    if(respuesta[1] === 48) //Primero STX, segundo estado transacción: correcta = 48, incorrecta != 48
    {
        console.log("Operación APROBADA");
        vaciarCesta();
        notificacion('Operación APROBADA', 'success');
        $('#modalPago').modal('hide');
        vueTicketMedio.actualizarTicketMedio();
    }
    else
    {
        console.log("Opración DENEGADA");
        notificacion('Operación DENEGADA', 'error');
        $('#modalPago').modal('hide');
    }
}
/* RESPUESTAS ACCIONES IPC-MAIN */
ipcRenderer.on('ventaDatafono', (ev, args) => {
    controlRespuestaDatafono(args);
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