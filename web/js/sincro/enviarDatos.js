function enviarTicket(idTicket)
{
    var devolver = new Promise((dev, rej)=>{
        db.tickets.get(idTicket).then(infoTicket=>{
            if(infoTicket)
            {
                let nombreTabla = `[V_Venut_${infoTicket.timestamp.getFullYear()}_${infoTicket.timestamp.getMonth()+1}}]`;
                for(let i = 0; i < infoTicket.cesta.length; i++)
                {
                    if(infoTicket.cesta[i].promocion === 1)
                    {
                        
                    }
                }
            }
            else
            {
                console.log('No se encuentra el ticket: ' + infoTicket);
                notificacion('No se encuentra el ticket: ' + infoTicket, 'error');
                dev(false);
            }
        }).catch(err=>{
            console.log(err);
            notificacion('Error en get enviarTicket', 'error');
            dev(false);
        });
        socket.emit('guardar-ticket', {});
    });
    return devolver;
}