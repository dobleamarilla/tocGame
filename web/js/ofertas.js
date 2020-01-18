const OFERTA_INDIVIDUAL = 1;
const OFERTA_COMBO = 2;
const ACCION_NADA = 0;
const ACCION_RESTAR = 1;
const ACCION_ELIMINAR = 2;

// async function deshacerPromos() {
//     var cesta = await db.cesta.toArray();
//     var aux = false;
//     var aux2 = -1;
//     var idsPromocionesToAdd = [];

//     for (let i = 0; i < cesta.length; i++) {
//         if (cesta[i].promocion != -1) //ELIMINAR POSICIÓN i DE LA CESTA
//         {
//             idsPromocionesToAdd.push(cesta[i].promocion);
//             await db.cesta.where("idArticulo").equals(cesta[i].idArticulo).delete();
//         }
//     }

//     /* A estas alturas tengo todas las promociones deshechas y solo falta añadir los artículos */
//     var listaArticulos = await db.articulos.toArray();
//     var listaPromociones = await db.promociones.toArray();
//     var listaCesta = await db.cesta.toArray();

//     for (let i = 0; i < idsPromocionesToAdd.length; i++) {
//         for (let j = 0; j < listaPromociones.length; j++) {
//             if (listaPromociones[j].id == idsPromocionesToAdd[i]) {
//                 articulosParaAgregar = JSON.parse(listaPromociones[j].articulosNecesarios);

//                 for (let h = 0; h < articulosParaAgregar.length; h++) {
//                     yaExiste = false;

//                     for (let k = 0; k < listaCesta.length; k++) {
//                         if (listaCesta[k].idArticulo == articulosParaAgregar[h].idArticulo) {
//                             yaExiste = true;
//                             arrayPrecio = await db.articulos.where("id").equals(listaCesta[k].idArticulo).toArray();
//                             await db.cesta.put({ idArticulo: listaCesta[k].idArticulo, nombreArticulo: listaCesta[k].nombreArticulo, unidades: listaCesta[k].unidades + articulosParaAgregar[h].unidadesNecesarias, subtotal: (listaCesta[k].unidades + articulosParaAgregar[h].unidadesNecesarias) * arrayPrecio[0], promocion: -1 });
//                             break;
//                         }
//                     }
//                     if (!yaExiste) {
//                         arrayPrecio = await db.articulos.where("id").equals(articulosParaAgregar[h].idArticulo).toArray();
//                         await db.cesta.put({ idArticulo: articulosParaAgregar[h].idArticulo, nombreArticulo: arrayPrecio[0].nombre, unidades: articulosParaAgregar[h].unidadesNecesarias, subtotal: articulosParaAgregar[h].unidadesNecesarias * arrayPrecio[0].precio, promocion: -1 });
//                     }
//                 }
//             }
//         }
//     }
//     actualizarCesta();
// }

async function buscarOfertas() {
    var promociones = await db.promociones.toArray();
    var listaArticulos = await db.articulos.toArray();
    var promocionesValidas = [];
    var salida = 0;
    var cestaOriginal = null;
    var principales = []; //array de articulos principales donde hay que buscar promos.
    var secundarios = []; //array de articulos secundarios donde hay que buscar promos.

    //await deshacerPromos(); //MODIFICAR DESHACERPROMOS PARA QUE DEVUELVA UNA PROMESA. AHORA NO LO HACE.

    for (let i = 0; i < promociones.length; i++) {
        cestaOriginal = await db.cesta.toArray();
        principales = [];
        secundarios = [];
        if (promociones[i].secundario === "-1") {
            tipoOferta = OFERTA_INDIVIDUAL
        }
        else {
            tipoOferta = OFERTA_COMBO;
        }

        if (promociones[i].principal.substring(0, 2) === "F_") {
            /* BUSCO Y CREO ARRAY CON TODOS ESTOS PRODUCTOS DE LA FAMILIA */
            principales = await getArticulosFamilia(promociones[i].principal.substring(2));

        }
        else {
            principales = await db.articulos.where('id').equals(Number(promociones[i].principal)).toArray();
        }

        if (promociones[i].secundario.substring(0, 2) === "F_") {
            secundarios = await getArticulosFamilia(promociones[i].secundario.substring(2));
        }
        else {
            secundarios = await db.articulos.where('id').equals(Number(promociones[i].secundario)).toArray();
        }
        if (cestaOriginal.length > 1 || tipoOferta === OFERTA_INDIVIDUAL) {
            if (intentoAplicarPromo(promociones[i], principales, secundarios, cestaOriginal, promociones[i].cantidadPrincipal, promociones[i].cantidadSecundario, tipoOferta)) {
                await actualizarCesta();
                break;
            }
        }
    }
}

function intentoAplicarPromo(infoPromo, articulosPrincipales, articulosSecundarios, cesta, cantidadPrincipal, cantidadSecundario, tipoOferta) {
    if (tipoOferta === OFERTA_COMBO) {
        idArticuloPrincipal = null;
        idArticuloSecundario = null;

        for (let m = 0; m < articulosPrincipales.length; m++) {
            for (let i = 0; i < cesta.length; i++) {
                if (articulosPrincipales[m].id === cesta[i].idArticulo) {
                    if (cesta[i].unidades === cantidadPrincipal) //El artículo contiene la cantidad necesaria para la promo.
                    {
                        idArticuloPrincipal = cesta[i].idArticulo;
                        break;
                    }
                }
            }
        }
        for (let b = 0; b < articulosSecundarios.length; b++) {
            for (let i = 0; i < cesta.length; i++) {
                if (articulosSecundarios[b].id === cesta[i].idArticulo) {
                    if (cesta[i].unidades === cantidadSecundario) //El artículo contiene la cantidad necesaria para la promo.
                    {
                        idArticuloSecundario = cesta[i].idArticulo;
                        break;
                    }
                }
            }
        }
        if (idArticuloPrincipal !== null && idArticuloSecundario !== null) {
            cesta = corregirCesta(idArticuloPrincipal, cesta);
            cesta = corregirCesta(idArticuloSecundario, cesta);

            cesta = insertarOferta(cesta, infoPromo, tipoOferta);
            insertarCestaCompleta(cesta);
            return true;
        }
        return false;
    }
    else {
        if (tipoOferta === OFERTA_INDIVIDUAL) {
            for (let j = 0; j < articulosPrincipales.length; j++) {
                for (let i = 0; i < cesta.length; i++) {
                    if (cesta[i].idArticulo === articulosPrincipales[j].id) //El artículo existe dentro de la cesta.
                    {
                        if (cesta[i].unidades === cantidadPrincipal) // Se puede aplicar la oferta.
                        {
                            cesta = corregirCesta(cesta[i].idArticulo, cesta);
                            cesta = insertarOferta(cesta, infoPromo, tipoOferta);
                            insertarCestaCompleta(cesta);
                            return true;
                        }
                    }
                }
            }
            return false;
        }
    }
    return false;
}

function corregirCesta(idArticulo, cesta) {
    for (let i = 0; i < cesta.length; i++) {
        if (cesta[i].idArticulo === idArticulo) {
            cesta.splice(i, 1);
        }
    }
    return cesta;
}

function insertarOferta(cesta, promocion, tipoOferta) {

    var nombre = '';
    var posExiste = yaExiste(cesta, promocion.id);

    if (tipoOferta === OFERTA_COMBO) {
        nombre = 'Oferta Combo';
    }
    else {
        if (tipoOferta === OFERTA_INDIVIDUAL) {
            nombre = 'Oferta individual';
        }
    }
    if (posExiste !== -1) {
        total1 = cesta[posExiste].subtotal + (promocion.precioFinal * promocion.cantidadPrincipal);
        total2 = cesta[posExiste].subtotal + (promocion.precioFinal);
        cesta[posExiste].unidades++;
        if (tipoOferta === OFERTA_INDIVIDUAL) {
            cesta[posExiste].subtotal = redondearPrecio(total1);
        }
        else {
            if (tipoOferta === OFERTA_COMBO) {
                cesta[posExiste].subtotal = redondearPrecio(total2);
            }
        }
    }
    else {
        if (tipoOferta === OFERTA_COMBO) {
            datos = {
                idArticulo: promocion.id,
                nombreArticulo: nombre,
                unidades: 1,
                subtotal: redondearPrecio(promocion.precioFinal),
                promocion: 1,
                activo: 0
            };
        }
        else {
            if (tipoOferta === OFERTA_INDIVIDUAL) {
                datos = {
                    idArticulo: promocion.id,
                    nombreArticulo: nombre,
                    unidades: 1,
                    subtotal: redondearPrecio(promocion.precioFinal * promocion.cantidadPrincipal),
                    promocion: 1,
                    activo: 0
                };
            }
        }

        cesta.push(datos);
    }

    return cesta;
}
function yaExiste(cesta, id) {
    for (let i = 0; i < cesta.length; i++) {
        if (cesta[i].idArticulo === id) {
            return i;
        }
    }
    return -1;
}
function insertarCestaCompleta(cesta) {
    db.cesta.clear().then(function () {
        db.cesta.bulkPut(cesta).then(function (lastKey) {
            console.log("insertarCestaCompleta()", cesta);
        }).catch(Dexie.BulkError, function (e) {
            console.error("Error al insertarCestaCompleta");
            notificacion('Error al insertarCestaCompleta()', 'error');
        });
    }).catch(err => {
        console.log(err);
        notificacion('Error al borrar cesta', 'error');
    });
}

async function getArticulosFamilia(familia) /* ESTA FUNCIÓN DEBE DEVOLVER UN ARRAY DE ARTICULOS QUE TIENEN ESTA FAMILIA O SON HIJAS, PERO COMO PROMESA!!! OK */ {
    var info = await db.familias.where("nombre").equals(familia).or("padre").equals(familia).toArray();
    let articulos = [];
    let aux = [];

    for (let i = 0; i < info.length; i++) {
        aux = [];
        aux = await db.articulos.where("familia").equals(info[i].nombre).toArray();
        articulos = _.union(articulos, aux);
    }
    return articulos;
}