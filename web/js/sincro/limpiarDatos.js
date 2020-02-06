function limpiarTodo()
{
    var devolver = new Promise((dev, rej) => {
        db.teclado.clear().then(function () {
            db.submenus.clear().then(function () {
                db.articulos.clear().then(function () {
                    db.cesta.clear().then(function(){
                        db.parametrosTicket.clear().then(function(){
                            db.trabajadores.clear().then(function(){
                                db.promociones.clear().then(function(){
                                    db.menus.clear().then(function(){
                                            db.clientes.clear().then(function(){
                                                db.familias.clear().then(function(){
                                                    dev(true);
                                                }).catch(err=>{
                                                    console.log(err);
                                                    dev(false);
                                                });
                                            }).catch(err=>{
                                                console.log(err);
                                                dev(false);
                                            });
                                    }).catch(err=>{
                                        console.log(err);
                                        dev(false);
                                    });
                                }).catch(err=>{
                                    console.log(err);
                                    dev(false);
                                });
                            }).catch(err=>{
                                console.log(err);
                                dev(false);
                            });
                        }).catch(err=>{
                            console.log(err);
                            dev(false);
                        });
                    }).catch(err=>{
                        console.log(err);
                        dev(false);
                    });
                }).catch(err => {
                    dev(false);
                });
            }).catch(error => {
                console.log(err);
                dev(false);
            });
        }).catch(error => {
            console.log(err);
            dev(false);
        });
    });
    return devolver;
}