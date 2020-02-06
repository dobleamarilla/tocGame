function insertarParametrosTicket(data)
{
    var devolver = new Promise((dev, rej)=>{
        db.parametrosTicket.bulkPut(data).then(function(){
            dev(true);
        }).catch(err=>{
            console.log(err);
            notificacion('Error al insertar parametros de ticket', 'error');
            dev(false);
        });
    });
    return devolver;
}

function insertarArticulos(data)
{
    var devolver = new Promise((dev, rej)=>{
        let articulos = [];
        for (let i = 0; i < data.length; i++) 
        {
            articulos.push({ 
                id: data[i].id,
                nombre: data[i].nombre, 
                precio: data[i].precioConIva, 
                iva: Number(data[i].tipoIva), 
                aPeso: data[i].aPeso, 
                familia: data[i].familia,
                precioBase: data[i].precioBase
            });
        }
        console.log("MI LISTA DE ARTICULOS: ", articulos);
        db.articulos.bulkPut(articulos).then(function(){
            dev(true);
        }).catch(err=>{
            console.log(err);
            notificacion('Error al insertar articulos', 'error');
            dev(false);
        });
    });
    return devolver;
}

function insertarTeclado(data, arrayTeclas) /* TECLADO INCLUYE SUBMENUS (QUE SON LOS MENÚS REALMENTE) DATA = ARRAYSUBMENUS */
{
    var devolver = new Promise((dev, rej)=>{
        let submenus = [];
        for (let i = 0; i < data.length; i++) 
        {
            submenus.push({ 
                id: i, 
                idPadre: 0, 
                nombre: data[i].nomMenu, 
                idTeclado: i, 
                color: data[i].color 
            });
        }
        db.submenus.bulkPut(submenus).then(function(){
            let tablaTeclado = [];
            for (let i = 0; i < submenus.length; i++) 
            {
                arrayTeclado = [];
                for (let j = 0; j < arrayTeclas.length; j++) 
                {
                    if (submenus[i].nombre == arrayTeclas[j].nomMenu) 
                    {
                        arrayTeclado.push({ id: arrayTeclas[j].idArticle, posicion: (arrayTeclas[j].pos + 1), color: traductorColor(arrayTeclas[j].color) });
                    }
                }
                tablaTeclado.push({ id: i, arrayTeclado: arrayTeclado });
            }
            db.teclado.bulkPut(tablaTeclado).then(function() {
                dev(true);
            }).catch(err=>{
                console.log(err);
                notificacion('Error al insertar teclado', 'error');
                dev(false);
            });
        }).catch(err=>{
            console.log(err);
            notificacion('Error al insertar submenus', 'error');
            dev(false);
        });
    });
    return devolver;
}
function insertarTrabajadores(data)
{
    var devolver = new Promise((dev, rej)=>{
        db.trabajadores.bulkPut(data).then(function(){
            dev(true);
        }).catch(err=>{
            console.log(err);
            notificacion('Error al insertar trabajadores', 'error');
            dev(false);
        });
    });
    return devolver;
}
function insertarPromociones(data)
{
    var devolver = new Promise((dev, rej)=>{
        db.promociones.bulkPut(data).then(function(){
            dev(true);
        }).catch(err=>{
            console.log(err);
            notificacion('Error al insertar promociones', 'error');
            dev(false);
        });
    });
    return devolver;
}
function insertarMenus(data) /* NO SE UTILIZA DE MOMENTO */
{
    var devolver = new Promise((dev, rej)=>{
        db.menus.bulkPut(data).then(function(){
            dev(true);
        }).catch(err=>{
            console.log(err);
            notificacion('Error al insertar menus', 'error');
            dev(false);
        });
    });
    return devolver;
}
function insertarClientes(data)
{
    var devolver = new Promise((dev, rej)=>{
        db.clientes.bulkPut(data).then(function(){
            dev(true);
        }).catch(err=>{
            console.log(err);
            notificacion('Error al insertar clientes', 'error');
            dev(false);
        });
    });
    return devolver;
}
function insertarFamilias(data)
{
    var devolver = new Promise((dev, rej)=>{
        db.familias.bulkPut(data).then(function(){
            dev(true);
        }).catch(err=>{
            console.log(err);
            notificacion('Error al insertar familias', 'error');
            dev(false);
        });
    });
    return devolver;
}