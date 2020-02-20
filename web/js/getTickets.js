function verDetalleTicket(idTicket)
{
    getCurrentCaja().then(idCaja=>{
        db.tickets.where({idTicket: idTicket, idCaja: idCaja}).toArray(res=>{
            if(res)
            {
                let ticket      = res[0];
                let strTitulo   = "";
                let strBody     = "";
                let strTotal    = "";
                let strMetodo   = "";
                for(let i = 0; i < ticket.cesta.length; i++)
                {
                    strBody += `<tr style="height: 55px;"><th scope="row">${i+1}</th><td>${ticket.cesta[i].nombreArticulo}</td><td>${ticket.cesta[i].unidades}</td><td>${ticket.cesta[i].subtotal}</td></tr>`;
                }

                if(ticket.tarjeta)
                {
                    strMetodo = 'Pagado con tarjeta';
                }
                else
                {
                    strMetodo = 'Pagado en efectivo';
                }

                tituloDetalle.innerHTML     = `Factura nº ${ticket.idTicket}`;
                detalleBody.innerHTML       = strBody;
                detalleTotal.innerHTML      = `${ticket.total} €`;
                detalleMetodo.innerHTML     = strMetodo;
                document.getElementById('colDetalle').setAttribute("class", "col-md-4");
                document.getElementById('botonCajaImprimir').setAttribute("onclick", "imprimirTicketReal("+idTicket+")");
            }
            else
            {
                notificacion('Error al cargar el ticket', 'error');
            }
        });
    });
}