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
                addItemCesta(cosaParaPeso.idArticulo, cosaParaPeso.nombreArticulo, cosaParaPeso.precio, cosaParaPeso.sumable, this.gramos);
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

    var vueFichajes = new Vue({
        el: '#vueTablaTrabajadores',
        data: {
            trabajadores: [],
            fichados: []
        },
        mounted: function () {
            this.getTrabajadores();
            this.verFichados();
        },
        methods: {
            getTrabajadores: function () {
                db.trabajadores.toArray().then(data => {
                    this.trabajadores = data;
                }).catch(err => {
                    console.log(err);
                    notificacion('Error en getTrabajadores VUE()', 'error');
                });
            },
            ficharTrabajador: function (x) {
                var idTrabajador = Number(x);
                setTodosInactivos().then(res => {
                    if (res) {
                        ficharTrabajador(idTrabajador).then(res => {
                            if (res) {
                                //FALTA ESTABLECER EL currentIdTrabajador en variable y en bbdd
                                db.activo.put({ idTrabajador: idTrabajador });
                                this.verFichados();
                                notificacion('Trabajador fichado', 'success');
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
        }
    });

    var vueSetCaja = new Vue({
        el: '#vueSetCaja',
        data: {
            activo: 0,
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
    return {
        caja: vueSetCaja,
        fichajes: vueFichajes,
        peso: vueConPeso
    };
}