const exec = require('child_process').exec;
const os = require('os');

function atajosTeclado(globalShortcut, ventana) {
    /* REFRESH TOC */
    globalShortcut.register('F5', function () {
        ventana.reload();
    });
    /* CLOSE TOC */
    globalShortcut.register('F4', function () {
        ventana.close();
    });
    /* ACTUALIZAR TOCGAME */
    globalShortcut.register('F2', function () {
        if (os.platform() === 'win32') { //
            console.log("Hay que crear el instalador para windows");
        }
        else {
            if (os.platform() === 'linux') {
                exec('sh /home/hit/instalador.sh');
            }
        }
    });
}
exports.atajos = atajosTeclado;