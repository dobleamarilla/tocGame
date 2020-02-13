async function enviarTickets(arrayTicket)
{
    var devolver = new Promise((dev, rej)=>{
        for(let i = 0; i < arrayTicket.length; i++)
        {
                db.parametros.toArray().then(infoParams=>{
                    let infoTicket = arrayTicket[i];
                    let database = infoParams[0].database;
                    let nombreTabla = `[V_Venut_${infoTicket.timestamp.getFullYear()}-${limpiarMes(infoTicket.timestamp)}]`;
                    db.parametros.toArray().then(parametros=>{
                        if(!modoDesarrollador)
                        {
                            console.log("TRAZA 3");
                            socket.emit('guardar-ticket', {
                                codigoTienda: parametros[0].codigoTienda,
                                idDependienta: infoTicket.idTrabajador,
                                idTicket: infoTicket.idTicket,
                                tipoVenta: 'V',
                                cesta: modificarCestaEnviarTicket(infoTicket),
                                nombreTabla: nombreTabla,
                                fecha: infoTicket.timestamp.toISOString(),
                                database: database
                            });
                            dev(true);
                        }
                        else
                        {
                            notificacion('¡Modo desarrollador activado!', 'warning');
                            dev(false);
                        }
                        
                    }).catch(err=>{
                        console.log(err);
                        notificacion('Error en db.parametros de enviarTicket', 'error');
                        dev(false);
                    });
                }).catch(err=>{
                    console.log(err);
                    notificacion('Error en get parametros en enviarTicket()', 'error');
                });
            infoTicket = [];
        }
        dev(true);
    });
    return devolver;
}
function limpiarMes(date)
{
    var month = date.getMonth() + 1;
    return month < 10 ? '0' + month : '' + month;
}  

function modificarCestaEnviarTicket(infoTicket) /* Esta función limpia las promociones y deja en la cesta los precios reales de los productos */
{
    for(let i = 0; i < infoTicket.cesta.length; i++)
    {
        if(infoTicket.cesta[i].promocion === 1)
        {
            if(infoTicket.cesta[i].infoArticulosPromo.tipoPromo === 'individual')
            {
                infoTicket.cesta.push({
                    idArticulo: infoTicket.cesta[i].infoArticulosPromo.idPrincipal,
                    nombreArticulo: 'nuncaSeVe',
                    unidades: infoTicket.cesta[i].infoArticulosPromo.cantidadPrincipal,
                    subtotal: infoTicket.cesta[i].infoArticulosPromo.subtotalPrincipal,
                    promocion: -1,
                    tipoIva: {},
                    activo: false,
                    idLinea: -1
                });
            }
            else
            {
                if(infoTicket.cesta[i].infoArticulosPromo.tipoPromo === 'combo')
                {
                    infoTicket.cesta.push({
                        idArticulo: infoTicket.cesta[i].infoArticulosPromo.idPrincipal,
                        nombreArticulo: 'nuncaSeVe',
                        unidades: infoTicket.cesta[i].infoArticulosPromo.cantidadPrincipal,
                        subtotal: infoTicket.cesta[i].infoArticulosPromo.subtotalPrincipal,
                        promocion: -1,
                        tipoIva: {},
                        activo: false,
                        idLinea: -1
                    });
                    infoTicket.cesta.push({
                        idArticulo: infoTicket.cesta[i].infoArticulosPromo.idSecundario,
                        nombreArticulo: 'nuncaSeVe',
                        unidades: infoTicket.cesta[i].infoArticulosPromo.cantidadSecundario,
                        subtotal: infoTicket.cesta[i].infoArticulosPromo.subtotalSecundario,
                        promocion: -1,
                        tipoIva: {},
                        activo: false,
                        idLinea: -1
                    });
                }
                else
                {
                    console.log("Error, buscar traza en modificarCestaEnviarTicket()");
                    notificacion('Error al enviar el ticket al servidor', 'error');
                }
            }
            infoTicket.cesta.splice(i,1);
        }
    }
    return infoTicket.cesta;
}