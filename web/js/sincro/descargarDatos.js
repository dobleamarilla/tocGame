function descargarArticulos()
{
    var devolver = new Promise((dev, rej)=>{
        db.parametros.toArray().then(infoParams=>{
            socket.emit('descargar-articulos', infoParams[0]);
        }).catch(err=>{
            console.log(err);
            notificacion('Error en descargarArticulos', 'error');
        });
        socket.on('descargar-articulos', (info)=>{
            console.log('SE VAN A INSERTAR: ', info);
            insertarArticulos(info).then(res=>{
                dev(true);
            });
        });
    });
    return devolver;
}
function descargarTrabajadores()
{
    var devolver = new Promise((dev, rej)=>{
        db.parametros.toArray().then(infoParams=>{
            socket.emit('descargar-trabajadores', infoParams[0]);
        }).catch(err=>{
            console.log(err);
            notificacion('Error en descargarTrabajadores', 'error');
        });
        socket.on('descargar-trabajadores', (info)=>{
            console.log('SE VAN A INSERTAR: ', info);
            insertarTrabajadores(info).then(res=>{
                dev(true);
            });
        });
    });
    return devolver;
}
function descargarClientes()
{
    var devolver = new Promise((dev, rej)=>{
        db.parametros.toArray().then(infoParams=>{
            socket.emit('descargar-clientes', infoParams[0]);
        }).catch(err=>{
            console.log(err);
            notificacion('Error en descargarClientes', 'error');
        });
        socket.on('descargar-clientes', (info)=>{
            console.log('SE VAN A INSERTAR: ', info);
            insertarClientes(info).then(res=>{
                dev(true);
            });
        });
    });
    return devolver;
}
function descargarPromociones()
{
    var devolver = new Promise((dev, rej)=>{
        db.parametros.toArray().then(infoParams=>{
            socket.emit('descargar-promociones', infoParams[0]);
        }).catch(err=>{
            console.log(err);
            notificacion('Error en descargarPromociones', 'error');
        });
        socket.on('descargar-promociones', (info)=>{
            console.log('SE VAN A INSERTAR: ', info);
            insertarPromociones(info).then(res=>{
                dev(true);
            });
        });
    });
    return devolver;
}
function descargarFamilias()
{
    var devolver = new Promise((dev, rej)=>{
        db.parametros.toArray().then(infoParams=>{
            socket.emit('descargar-familias', infoParams[0]);
        }).catch(err=>{
            console.log(err);
            notificacion('Error en descargarFamilias', 'error');
        });
        socket.on('descargar-familias', (info)=>{
            console.log('SE VAN A INSERTAR: ', info);
            insertarFamilias(info).then(res=>{
                dev(true);
            });
        });
    });
    return devolver;
}
function descargarTeclado()
{
    var devolver = new Promise((dev, rej)=>{
        db.parametros.toArray().then(infoParams=>{
            socket.emit('descargar-teclado', infoParams[0]);
        }).catch(err=>{
            console.log(err);
            notificacion('Error en descargarTeclado', 'error');
        });
        socket.on('descargar-teclado', (info)=>{
            console.log('SE VAN A INSERTAR: ', info);
            insertarTeclado(info.menus, info.teclas).then(res=>{
                dev(true);
            });
        }); 
    });
    return devolver;
}