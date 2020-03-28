socket.on('install-licencia', (data) => {
    if (!data.error) {
        db.parametros.put({
            licencia: data.licencia,
            nombreEmpresa: data.nombreEmpresa,
            database: data.database,
            nombreTienda: data.nombreTienda,
            codigoTienda: data.codigoTienda
        }).then(function () {
            console.log(data.licencia, data.nombreEmpresa, data.database);
            db.tickets.put({ idTicket: data.ultimoTicket, enTransito: 0, enviado: 1 }).then(lol => {
                db.tickets.where('idTicket').equals(data.ultimoTicket).delete()
            }).catch(err => {
                console.log(err);
                notificacion('Error en insertar último ticket correlativo', 'error');
            });
        });
        document.onmousedown = function () { return true };
        $("#installWizard").modal('hide');
        notificacion('Licencia OK!', 'success');
        iniciarTocSockets();
    }
    else {
        console.log("Hay error: " + data.infoError);
    }
});

socket.on('cargar-todo', (data) => {
    try {
        if (!data.error) {
            console.log(data);
            // cargarTecladoSockets(data.menus, data.teclas, data.articulos, data.dependentes, data.familias, data.promociones, data.clientes, data.parametrosTicket);
            cargarTodo(data.parametrosTicket, data.articulos, data.menus, data.dependentes, data.promociones, data.clientes, data.familias, data.teclas).then(() => {
                console.log("LA CARGA HA TERMINADO");
            });
        }
        else {
            console.log(data.infoError);
        }
    }
    catch (err) {
        console.log(err);
    }
});

//EN CARGAR TODO, TAMBIÉN SE TIENE QUE DIVIDIR EN LAS ACCIONES INDIVIDUALES PARA LAS HERRAMIENTAS DEL TOC. P.EJ. CARGAR PROMOCIONES(SOLO)

socket.on('confirmarEnvioTicket', (data) => {
    db.tickets.where('idTicket').equals(data.idTicket).modify((res) => {
        res.enviado = 1;
    }).catch(err => {
        console.log(err);
        notificacion('Error en confirmarEnvioTicket sockets', 'error');
    });
});
socket.on('confirmarEnvioCaja', (data) => {
    db.cajas.where('id').equals(data.idCaja).modify((res) => {
        res.enviado = 1;
    }).catch(err => {
        console.log(err);
        notificacion('Error en confirmarEnvioCaja sockets', 'error');
    });
});
socket.on('confirmarEnvioMovimiento', (data) => {
    db.movimientos.where('id').equals(data.idMovimiento).modify((res) => {
        res.enviado = 1;
    }).catch(err => {
        console.log(err);
        notificacion('Error en confirmarEnvioMovimiento sockets', 'error');
    });
});
function iniciarTocSockets() {
    db.parametros.toArray().then(info => {
        if (info) {
            console.log(info);
            socket.emit('cargar-todo', {
                licencia: info[0].licencia,
                database: info[0].database
            });
        }
        else {
            console.log("Error en borrar test 456");
        }
    }).catch(error => {
        console.log("Error " + error);
        notificacion('Error, contacte con un técnico', 'error');
    });
}