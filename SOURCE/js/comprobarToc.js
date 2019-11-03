async function comprobarConfiguracion()
{
    var arrayParametros = await db.parametros.toArray();
    console.log(arrayParametros);
    console.log("accede a comprobarConfiguracion()");
    if(arrayParametros.length == 0)
    {
        console.log(9999);
        return false;
    }
    else
    {
        console.log(69999);
        //comprobaciones faltan, todo okey devuelve true;
        return true;
    }
}

function installWizard()
{
    document.onmousedown=function(){return true};
    $("#installWizard").modal();
}

function checkLicencia()
{
    var numLicencia = document.getElementById('numLicenciaInstallWizard').value;
    var password    = document.getElementById('passwordInstallWizard').value;

    numLicencia = parseInt(numLicencia);
    if(numLicencia > 0 && numLicencia < 1000)
    {
        socket.emit('install-licencia', {numLicencia: numLicencia, password: password});
    }
}