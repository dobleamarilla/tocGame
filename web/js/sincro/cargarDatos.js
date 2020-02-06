async function cargarTodo(arrayParametrosTicket, arrayArticulos, arraySubmenus, arrayTrabajadores, arrayPromociones, arrayClientes, arrayFamilias, arrayTeclas)
{
    let res = await limpiarTodo();
    if(res)
    {
        await insertarParametrosTicket(arrayParametrosTicket);
        await insertarArticulos(arrayArticulos);
        await insertarTeclado(arraySubmenus, arrayTeclas);
        await insertarTrabajadores(arrayTrabajadores);
        await insertarPromociones(arrayPromociones);
        await insertarClientes(arrayClientes);
        await insertarFamilias(arrayFamilias);
        loading.setAttribute("class", "centradoTotal hide");
        $("#modalFichajes").modal('show');
        console.log("¡CARGA COMPLETA 100% OK!");
    }
    else
    {
        console.log("Error en limpiarTodo()");
    }
}