// TODO: Crear las funciones, objetos y variables indicadas en el enunciado

// TODO: Variable global
let presupuesto = 0;
let gastos = [];
let idGasto = 0;


// Función actualizarPresupuesto
function actualizarPresupuesto(nuevoPresupuesto) {
    if ((typeof nuevoPresupuesto === 'number') && (nuevoPresupuesto >= 0)) {
        presupuesto = nuevoPresupuesto;
        return presupuesto;
    } else {
        console.error('El presupuesto debe ser un número positivo.');
        //alert('El presupuesto debe ser un número positivo.'); //Los alerts dan error con los tests
        return -1;
    }
}

// Función mostrarPresupuesto
function mostrarPresupuesto() {
    let mensaje = `Tu presupuesto actual es de ${presupuesto} €`;
    console.log(mensaje);
    return mensaje;
}

// Función listarGastos
function listarGastos(){
    return gastos;
}

// Función anyadirGasto
function anyadirGasto(gastoRecibido) {
    gastoRecibido.id = idGasto;
    idGasto++;
    gastos.push(gastoRecibido);
}

// Función borrarGasto
function borrarGasto(idGasto) {
    gastos = gastos.filter(gasto => gasto.id !== idGasto);
}

// Función calcularTotalGastos
function calcularTotalGastos() {
    let total = 0;
    for (let gasto of gastos) {
        total += gasto.valor;
    }
    return total;
}

// Función calcularBalance
function calcularBalance() {
    return presupuesto - calcularTotalGastos();
}

// Función filtrarGastos
function filtrarGastos(filtros = {}) {
    // Filtros: fechaDesde, fedchaHasta, valorMinimo, valorMaximo, descipcionContiene, ...etiquetasTiene

        // Comprobamos que los filtros no sea null. Si lo son devolvemos todos los gastos sin filtrar
    if (filtros === null || Object.keys(filtros).length === 0) {
        return gastos;
    }

    const {
        fechaDesde,
        fechaHasta,
        valorMinimo,
        valorMaximo,
        descripcionContiene,
        etiquetasTiene
    } = filtros;

    // Parseo de fechas (si vienen)
    const tsDesde = (typeof fechaDesde === 'string' && !isNaN(Date.parse(fechaDesde)))
        ? Date.parse(fechaDesde)
        : null;

    const tsHasta = (typeof fechaHasta === 'string' && !isNaN(Date.parse(fechaHasta)))
        ? Date.parse(fechaHasta)
        : null;

    // Texto a buscar en descripción (case-insensitive)
    const textoDescripcion = (typeof descripcionContiene === 'string')
        ? descripcionContiene.toLowerCase()
        : null;

    // Etiquetas a buscar (case-insensitive)
    const etiquetasBuscadas = Array.isArray(etiquetasTiene)
        ? etiquetasTiene.map(e => String(e).toLowerCase())
        : null;

    // Usamos filter sobre la variable global "gastos"
    // Aplicada los filtros uno a uno, devolviendo solo los gastos que cumplan TODOS los filtros aplicados
    return gastos.filter(gasto => {
        // 1) Filtro por fecha desde
        if (tsDesde !== null && gasto.fecha < tsDesde) {
            return false;
        }

        // 2) Filtro por fecha hasta
        if (tsHasta !== null && gasto.fecha > tsHasta) {
            return false;
        }

        // 3) Filtro por valor mínimo
        if (typeof valorMinimo === 'number' && gasto.valor < valorMinimo) {
            return false;
        }

        // 4) Filtro por valor máximo
        if (typeof valorMaximo === 'number' && gasto.valor > valorMaximo) {
            return false;
        }

        // 5) Filtro por descripción contiene (case-insensitive)
        if (textoDescripcion !== null) {
            const desc = (gasto.descripcion || '').toLowerCase();
            if (!desc.includes(textoDescripcion)) {
                return false;
            }
        }

        // 6) Filtro por etiquetasTiene (case-insensitive, coincide si tiene ALGUNA)
        if (etiquetasBuscadas) {
            const etiquetasGasto = Array.isArray(gasto.etiquetas)
                ? gasto.etiquetas.map(e => String(e).toLowerCase())
                : [];

            const tieneAlguna = etiquetasBuscadas.some(tag =>
                etiquetasGasto.includes(tag)
            );

            if (!tieneAlguna) {
                return false;
            }
        }

        // Si pasa todos los filtros, se incluye en el resultado
        return true;
    });

}

// Función agruparGastos
function agruparGastos(periodo = "mes", etiquetas = [], fechaDesde = null, fechaHasta = null) {
    // Configuramos el objeto de filtros
    const opcionesFiltro = {
        fechaDesde: fechaDesde,
        fechaHasta: fechaHasta
    };

    // SOLO añadimos etiquetasTiene si el array tiene elementos
    if (etiquetas && etiquetas.length > 0) {
        opcionesFiltro.etiquetasTiene = etiquetas;
    }

    // 2. Ejecutar reduce sobre los gastos filtrados
    // https://es.javascript.info/array-methods#reduce-reduceright
    const gastosFiltrados = filtrarGastos(opcionesFiltro);
    return gastosFiltrados.reduce((acumulador, gastoActual) => {
        // Identificar bajo qué etiqueta de tiempo (día/mes/año) agrupamos este gasto
        const periodoDeEsteGasto = gastoActual.obtenerPeriodoAgrupacion(periodo);

        // Si el periodo no es válido, ignoramos este gasto y pasamos al siguiente
        if (!periodoDeEsteGasto) {
            return acumulador;
        }

        // Asegurarnos de que el acumulador tenga un número para ese periodo.
        // Si es la primera vez que vemos este mes/día, inicializamos el contador en 0.
        const valorAcumuladoHastaAhora = acumulador[periodoDeEsteGasto] || 0;

        // Calculamos el nuevo total sumando el valor del gasto actual
        const nuevoTotalDelPeriodo = valorAcumuladoHastaAhora + gastoActual.valor;

        // Actualizamos el objeto acumulador con el nuevo total
        acumulador[periodoDeEsteGasto] = nuevoTotalDelPeriodo;

        // Devolvemos el objeto actualizado para la siguiente iteración
        return acumulador;
    }, {}); // El valor inicial es un objeto vacío {}
}


// Función CrearGasto
function CrearGasto(descripcion, valor, fecha, ...etiquetas) {
    this.descripcion = descripcion;

    // Validación del valor
    if ((typeof valor === 'number') && (valor >= 0)) {
        this.valor = valor;
    } else {
        console.error('El valor del gasto debe ser un número positivo.');
        this.valor = 0;
    }

    //  Validación de etiquetas
    if (etiquetas.length > 0) {
        this.etiquetas = etiquetas;
    } else {
        this.etiquetas = [];
    }

    // Validación de fecha
    if (typeof fecha === 'string' && !isNaN(Date.parse(fecha))) {
        this.fecha = Date.parse(fecha);
    } else {
        this.fecha = Date.now();
    }

    // Método mostrarGasto
    this.mostrarGasto = function() {
        let mensaje = `Gasto correspondiente a ${this.descripcion} con valor ${this.valor} €`;
        console.log(mensaje);
        return mensaje;
    }

    // Método actualizarDescripcion
    this.actualizarDescripcion = function(nuevaDescripcion) {
        this.descripcion = nuevaDescripcion;
    }

    // Método actualizarValor
    this.actualizarValor = function(nuevoValor) {
        if ((typeof nuevoValor === 'number') && (nuevoValor >= 0)) {
            this.valor = nuevoValor;
        } else {
            console.error('El valor del gasto debe ser un número positivo.');
        }
    }

    // Método actualizarFecha
    this.actualizarFecha = function(nuevaFecha) {
        if (typeof nuevaFecha === 'string' && !isNaN(Date.parse(nuevaFecha))) {
            this.fecha = Date.parse(nuevaFecha);
        }
    }

    // Método anyadirEtiquetas
    this.anyadirEtiquetas = function(...nuevasEtiquetas) {
        for (let etiqueta of nuevasEtiquetas) {
            if (!this.etiquetas.includes(etiqueta)) {
                this.etiquetas.push(etiqueta);
            }
        }
    }

    // Método borrarEtiquetas
    this.borrarEtiquetas = function(...etiquetasABorrar) {
        this.etiquetas = this.etiquetas.filter(etiqueta => !etiquetasABorrar.includes(etiqueta));
    }

    // Método mostrarGastoCompleto
    this.mostrarGastoCompleto = function() {
        let mensaje = `Gasto correspondiente a ${this.descripcion} con valor ${this.valor} €.\n`;
        mensaje += `Fecha: ${new Date(this.fecha).toLocaleString()}\n`;
        mensaje += `Etiquetas:\n`;
        for (let etiqueta of this.etiquetas) {
            mensaje += `- ${etiqueta}\n`;
        }
        return mensaje;
    }

    // Método obtenerPeriodoAgrupacion
    this.obtenerPeriodoAgrupacion = function(periodo) {
        const fechaObj = new Date(this.fecha);

        const anyo = fechaObj.getFullYear();
        const mes = fechaObj.getMonth() + 1; // 0-11 + 1
        const dia = fechaObj.getDate();

        switch (periodo) {
            case 'anyo':
                return `${anyo}`;
            case 'mes':
                return `${anyo}-${mes.toString().padStart(2, '0')}`;
            case 'dia':
                return `${anyo}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`;
                // padStart(2, "0") asegura el formato 09 en vez de 9.
            default:
                console.error('Periodo de agrupación no válido. Usar "día", "mes" o "año".');
                return null;
        }
    }

}


function transformarListadoEtiquetas(listadoEtiquetas) {
    // Si no hay entrada o no es un string, devolvemos un array vacío
    if (!listadoEtiquetas || typeof listadoEtiquetas !== 'string') {
        return [];
    }
    const forma = 2;

    // Pongo varias formas de obtener este resultado, como práctica de regexp.
    if (forma == 1) {
        // Definimos la expresión regular:
        // El '+' permite que múltiples separadores seguidos cuenten como uno solo
        const patronSeparadores = /[ ,.:;]+/;

        // Aplicamos el split con la RegExp y filtramos para evitar strings vacíos
        return listadoEtiquetas
            .trim()                  // Quita espacios en los extremos del string global
            .split(patronSeparadores)  // Divide usando el patrón flexible
            .filter(etiqueta => etiqueta.length > 0); // Elimina resultados vacíos (",,")
    } else if (forma == 2) {
        // Definimos el patrón: busca grupos de caracteres que NO sean separadores. ^ dentro de [] significa "no estos caracteres"
        const patronEtiquetas = /[^ ,.:;]+/g;
        // /g: Bandera global para que no se detenga en la primera coincidencia y recorra todo el string

        // .match() devuelve un array con todas las coincidencias encontradas
        // Si no hay ninguna coincidencia, devuelve null, por eso usamos el "|| []"
        const resultado = listadoEtiquetas.match(patronEtiquetas);

        return resultado || [];
    }
}

function cargarGastos(gastosAlmacenamiento) {
    // gastosAlmacenamiento es un array de objetos "planos"
    // No tienen acceso a los métodos creados con "CrearGasto":
    // "anyadirEtiquetas", "actualizarValor",...
    // Solo tienen guardadas sus propiedades: descripcion, valor, fecha y etiquetas
  
    // Reseteamos la variable global "gastos"
    gastos = [];
    // Procesamos cada gasto del listado pasado a la función
    for (let g of gastosAlmacenamiento) {
        // Creamos un nuevo objeto mediante el constructor
        // Este objeto tiene acceso a los métodos "anyadirEtiquetas", "actualizarValor",...
        // Pero sus propiedades (descripcion, valor, fecha y etiquetas) están sin asignar
        let gastoRehidratado = new CrearGasto();
        // Copiamos los datos del objeto guardado en el almacenamiento
        // al gasto rehidratado
        // https://es.javascript.info/object-copy#cloning-and-merging-object-assign
        Object.assign(gastoRehidratado, g);
        // Ahora "gastoRehidratado" tiene las propiedades del gasto
        // almacenado y además tiene acceso a los métodos de "CrearGasto"
          
        // Añadimos el gasto rehidratado a "gastos"
        gastos.push(gastoRehidratado)
    }
}
    


/*
// Pruebas para agruparGastos (descomentar para probar)
gastos = [
    new CrearGasto("Gasto 1", 5, "2021-09-30", "alimentacion"),
    new CrearGasto("Gasto 1", 10, "2021-10-01", "alimentacion"),
    new CrearGasto("Gasto 1", 12, "2021-10-02", "transporte"),
    new CrearGasto("Gasto 1", 17, "2021-10-02", "alimentacion")
];

// Ahora, como son objetos creados con 'new CrearGasto', 
// todos tienen el método .obtenerPeriodoAgrupacion() disponible.

let agrup1 = agruparGastos("mes");
let agrup2 = agruparGastos("dia");
let agrup3 = agruparGastos("mes", ["alimentacion"]);

console.log("Agrupación por mes:", agrup1);
console.log("Agrupación por día:", agrup2);
console.log("Agrupación por mes (solo alimentación):", agrup3);
/**/

// NO MODIFICAR A PARTIR DE AQUÍ: exportación de funciones y objetos creados para poder ejecutar los tests.
// Las funciones y objetos deben tener los nombres que se indican en el enunciado
// Si al obtener el código de una práctica se genera un conflicto, por favor incluye todo el código que aparece aquí debajo
export   {
    mostrarPresupuesto,
    actualizarPresupuesto,
    CrearGasto,
    listarGastos,
    anyadirGasto,
    borrarGasto,
    calcularTotalGastos,
    calcularBalance,
    filtrarGastos,
    agruparGastos,
    transformarListadoEtiquetas,
    cargarGastos
}
