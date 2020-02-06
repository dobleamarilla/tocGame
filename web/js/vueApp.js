function initVueTocGame() {
    var vueConPeso = new Vue({
        el: '#conPeso',
        data: {
            gramos: 0,
            cosaParaPeso: {},
            precioTiempoReal: 0
        },
        methods: {
            addItemPeso() {
                console.log("VUE! idArticulo: ", cosaParaPeso.idArticulo, "nombreArticulo: ", cosaParaPeso.nombreArticulo, "precio: ", cosaParaPeso.precio, "sumable", cosaParaPeso.sumable, "gramos: ", this.gramos);
                addItemCesta(cosaParaPeso.idArticulo, cosaParaPeso.nombreArticulo, cosaParaPeso.precio, cosaParaPeso.sumable, cosaParaPeso.idBoton, this.gramos);
                this.gramos = 0;
                $('#modalAPeso').modal('hide');
            },
            addNumero(x) {
                this.gramos = Number((this.gramos.toString()) + x);
                if (this.gramos > 10000) {
                    this.gramos = 10000;
                }
            },
            borrarNumero() {
                this.gramos = Number(this.gramos.toString().slice(0, -1));
            }
        },
        computed: {
            calcularPrecio() {
                this.precioTiempoReal = this.cosaParaPeso.precio * (this.gramos / 1000);
                return this.precioTiempoReal.toFixed(2);
            }
        }
    });
    /* FICHAJES */
    var vueFichajes = new Vue({
        el: '#vueTablaTrabajadores',
        data: {
            trabajadores: [],
            fichados: [],
            busqueda: ''
        },
        mounted: function () {
            this.verFichados();
        },
        methods: {
            buscarTrabajadorVue: function () {
                buscarTrabajador(this.busqueda).then(data => {
                    if (data === null) {
                        this.trabajadores = [];
                    }
                    else {
                        this.trabajadores = data;
                    }
                });
            },
            setActivo: function (id) {
                setActivo(id).then(res => {
                    if (res) {
                        notificacion('¡OK!', 'success');
                    }
                    else {
                        console.log('Error 78913');
                        notificacion('Error, no se ha podido establecer activo', 'error');
                    }
                });
            },
            ficharTrabajador: function (x) {
                var idTrabajador = Number(x);
                setTodosInactivos().then(res => {
                    if (res) {
                        ficharTrabajador(idTrabajador).then(res => {
                            if (res) {
                                //FALTA ESTABLECER EL currentIdTrabajador en variable y en bbdd
                                let aux = this.verFichados;
                                db.activo.clear().then(function () {
                                    db.activo.put({ idTrabajador: idTrabajador });
                                    aux();
                                    notificacion('Trabajador fichado', 'success');
                                }).catch(err => {
                                    console.log(err);
                                    notificacion('Error en clear() activo', 'error');
                                });
                            } else {
                                console.log('Error al fichar ID: ' + idTrabajador);
                                notificacion('Error al fichar', 'error');
                            }
                        });
                    } else {
                        notificacion('Error: No se ha podido eliminar activos', 'error');
                    }
                });
            },
            finTurno: function (x) {
                var idTrabajador = Number(x);
                desfichar(idTrabajador).then(res => {
                    if (res) {
                        let aux = this.verFichados;
                        db.activo.clear().then(function () {
                            aux();
                        }).catch(err => {
                            console.log(err);
                            //console.log('LOL: '+ x);
                            notificacion('Error en finTurno #1', 'error');
                        });
                        //this.verFichados();
                    } else {
                        console.log("Error fin turno()");
                        notificacion('Error al plegar', 'error');
                    }
                });
            },
            verFichados: function () {
                getFichados().then(res => {
                    if (res.todoOK) {
                        if (res.data.length > 0) {
                            this.fichados = res.data;
                        } else {
                            this.fichados = [];
                        }
                    } else {
                        console.log("Error en getFichados/verFichados");
                    }
                });
            }
        },
        watch: {
            busqueda: function () {
                this.buscarTrabajadorVue();
            }
        }
    });
    /* FINAL FICHAJES */
    /* CAJA */
    var vueSetCaja = new Vue({
        el: '#vueSetCaja',
        data: {
            activo: 0,
            tipo: null,
            infoDinero: [
                { valor: 0, style: '' },
                { valor: 0, style: '' },
                { valor: 0, style: '' },
                { valor: 0, style: '' },
                { valor: 0, style: '' },
                { valor: 0, style: '' },
                { valor: 0, style: '' },
                { valor: 0, style: '' },
                { valor: 0, style: '' },
                { valor: 0, style: '' },
                { valor: 0, style: '' },
                { valor: 0, style: '' },
                { valor: 0, style: '' },
                { valor: 0, style: '' },
                { valor: 0, style: '' },
            ]
        },
        methods: {
            setActivo(x) {
                this.infoDinero[this.activo].style = '';
                this.activo = x;
                this.infoDinero[this.activo].style = 'color: red;font-weight: bold;';
            },
            addNumero(x) {
                this.infoDinero[this.activo].valor = Number(this.infoDinero[this.activo].valor.toString() + x);
            },
            borrarNumero() {
                this.infoDinero[this.activo].valor = Number(this.infoDinero[this.activo].valor.toString().slice(0, -1));
            },
            getAction() {
                if (this.tipo === 2) {
                    return 'confirmarCierre()';
                }
                else {
                    return 'setCaja()';
                }
            }
        },
        computed: {
            getTotal() {
                var total = 0;
                total += this.infoDinero[0].valor * 0.01;
                total += this.infoDinero[1].valor * 0.02;
                total += this.infoDinero[2].valor * 0.05;
                total += this.infoDinero[3].valor * 0.10;
                total += this.infoDinero[4].valor * 0.20;
                total += this.infoDinero[5].valor * 0.50;
                total += this.infoDinero[6].valor * 1;
                total += this.infoDinero[7].valor * 2;
                total += this.infoDinero[8].valor * 5;
                total += this.infoDinero[9].valor * 10;
                total += this.infoDinero[10].valor * 20;
                total += this.infoDinero[11].valor * 50;
                total += this.infoDinero[12].valor * 100;
                total += this.infoDinero[13].valor * 200;
                total += this.infoDinero[14].valor * 500;

                return total;
            }
        }
    });
    /* FINAL CAJA */
    var vuePanelInferior = new Vue({
        el: '#panelInferior',
        data: {
            activo: null,
            cesta: []
        },
        methods: {
            actualizarCesta() {
                db.cesta.toArray().then(info => {
                    this.activo = null;
                    this.cesta = info;
                }).catch(err => {
                    console.log(err);
                    notificacion('Error actualizar cesta', 'error');
                });
            },
            setActivo(idArticulo) {
                if (idArticulo === this.activo) {
                    this.activo = null;
                }
                else {
                    this.activo = idArticulo;
                }
            },
            calcularTotal() {

            },
            borrar() {
                if (this.activo === null) {
                    db.cesta.clear().then(function () {
                        actualizarCesta();
                    }).catch(err => {
                        console.log(err);
                        notificacion('Error al borrar cesta', 'error');
                    });
                }
                else {
                    db.cesta.where('idArticulo').equals(this.activo).delete().then(function () {
                        actualizarCesta();
                    }).catch(err => {
                        console.log(err);
                        notificacion('Error al borrar item', 'error');
                    });
                }
            }

        },
        computed: {

        }
    });

    var salidaDinero = new Vue({
        el: '#vueSalidaDinero',
        data: {
            cantidad: '',
            concepto: 'Entrega diaria'
        },
        methods: {
            addNumero(x) {
                this.cantidad = this.cantidad + x;
            },
            addComa() {
                this.cantidad = this.cantidad.replace(',', '') + ',';
            },
            borrarNumero() {
                this.cantidad = this.cantidad.slice(0, -1);
            },
            confirmarSalida() {
                $('#botonConfirmarSalida').attr('disabled', true); //El 'enable' con false se hace en la función de la caja.
                nuevaSalidaDinero(Number(this.cantidad.replace(',', '.')), this.concepto);
            },
            getConcepto(){
                return this.concepto;
            }
        }
    });
    var entradaDinero = new Vue({
        el: '#vueEntradaDinero',
        data: {
            cantidad: ''
        },
        methods: {
            addNumero(x) {
                this.cantidad = this.cantidad + x;
            },
            addComa() {
                this.cantidad = this.cantidad.replace(',', '') + ',';
            },
            borrarNumero() {
                this.cantidad = this.cantidad.slice(0, -1);
            },
            confirmarEntrada() {
                $('#botonConfirmarEntrada').attr('disabled', true); //El 'enable' con false se hace en la función de la caja.
                nuevaEntradaDinero(Number(this.cantidad.replace(',', '.')));
            }
        }
    });
    return {
        caja: vueSetCaja,
        fichajes: vueFichajes,
        peso: vueConPeso,
        panelInferior: vuePanelInferior,
        salidaDinero: salidaDinero,
        entradaDinero: entradaDinero
    };
}