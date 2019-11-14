const vueAbrirCaja = new Vue({
    el: '#tablaAperturaCaja',
    data: {
        valores: [
            {nombre: '0,01', valor: 0.01, unidades: 0},
            {nombre: '0,02', valor: 0.02, unidades: 0},
            {nombre: '0,05', valor: 0.05, unidades: 0},
            {nombre: '0,10', valor: 0.10, unidades: 0},
            {nombre: '0,20', valor: 0.20, unidades: 0},
            {nombre: '0,50', valor: 0.50, unidades: 0},
            {nombre: '1', valor: 1, unidades: 0},
            {nombre: '2', valor: 2, unidades: 0},
            {nombre: '5', valor: 5, unidades: 0},
            {nombre: '10', valor: 10, unidades: 0},
            {nombre: '20', valor: 20, unidades: 0},
            {nombre: '50', valor: 50, unidades: 0},
            {nombre: '100', valor: 100, unidades: 0}
        ]
    },
    methods: {
        sumaApertura: function(index){
            this.valores[index].unidades++;
        },
        restaApertura: function(index){
            if(this.valores[index].unidades > 0)
            {
                this.valores[index].unidades--;
            }
        },
        contarTodo: function(){
            var suma = 0;
            for(let i = 0; i < this.valores.length; i++)
            {
                suma += this.valores[i].valor*this.valores[i].unidades;
            }
            return suma;
        }
    }
});

const vueFichajes = new Vue({
    el: '#vueTablaTrabajadores',
    data: {
        trabajadores: [],
        fichados: []
    },
    methods: {
        getTrabajadores: function(){
            db.trabajadores.toArray().then(data=>{
                this.trabajadores = data;
            }).catch(err=>{
                console.log(err);
                notificacion('Error en getTrabajadores VUE()', 'error');
            });
        },
        ficharTrabajador: function(x){
            var idTrabajador = Number(x);
            ficharTrabajador(idTrabajador).then(res=>{
                if(res)
                {
                    this.verFichados();
                    console.log('Trabajador fichado');
                    notificacion('Trabajador fichado', 'success');
                }
                else
                {
                    console.log('Error al fichar ID: ' + idTrabajador);
                    notificacion('Error al fichar', 'error');
                }
            });
        },
        finTurno: function(x){
            var idTrabajador = Number(x);
            desfichar(idTrabajador).then(res=>{
                if(res)
                {
                    this.verFichados();
                }
                else
                {
                    console.log("Error fin turno()");
                    notificacion('Error al plegar', 'error');
                }
            });
        },
        verFichados: function(){
            getFichados().then(res=>{
                if(res.todoOK)
                {
                    if(res.data.length > 0)
                    {
                        this.fichados = res.data;
                    }
                    else
                    {
                        this.fichados = [];
                    }
                }
                else
                {
                    console.log("Error en getFichados/verFichados");
                }
            });
        }
    }
});