const exec = require('child_process').exec;
const os = require('os');

function execute(command, callback) {
    exec(command, (error, stdout, stderr) => {
        callback(stdout);
    });
};
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
            execute('', (output) => {
                console.log(output);
            });
        }
        else {
            if (os.platform() === 'linux') {
                execute('sh /home/hit/tocGameUpdater.sh', (output) => {
                    console.log(output);
                });
            }
        }
    });
}
exports.atajos = atajosTeclado;