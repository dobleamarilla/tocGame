/* FUNCIÓN DE BÚSQUEDA EN DIRECTO DE TRABAJADORES */
function buscarTrabajador(str) {
    let devolver = new Promise((dev, rej) => {
        if (str.length >= 1) {
            db.trabajadores.filter(trabajador => {
                if (trabajador.nombre.toUpperCase().includes(str.toUpperCase()) || trabajador.nombreCorto.toUpperCase().includes(str.toUpperCase())) {
                    return trabajador.nombre;
                }
            }).toArray().then(resultado => {
                dev(resultado);
            }).catch(err => {
                console.log(err);
                dev(null);
            });
        }
        else {
            dev(null);
        }
    });
    return devolver;
}