function cerrarPrograma(ventana) {
    ventana.close();
}
function refreshPrograma(ventana)
{
    ventana.reload();
}
exports.cerrar = cerrarPrograma;
exports.refresh = refreshPrograma;