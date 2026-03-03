import * as Gestion from "./gestionPresupuesto.js";


function repintar(){
    // Mostrar el presupuesto en div#presupuesto
    const mensajePresupuesto = Gestion.mostrarPresupuesto();
    mostrarDatoEnId("presupuesto", mensajePresupuesto);

    // Mostrar los gasdos totales
    const total = Gestion.calcularTotalGastos();
    mostrarDatoEnId("gastos-totales", total);

    // Mostrar el balance total
    const balance = Gestion.calcularBalance();
    mostrarDatoEnId("balance-total", balance);

    // Borrar el listado completo de gastos previo
    const divListadoGastos = document.getElementById("listado-gastos-completo");
    if (divListadoGastos) {
        divListadoGastos.innerHTML = "";
    }

    const listadoGastos = Gestion.listarGastos();
    for (let i=0; i<listadoGastos.length ; i++){
        mostrarGastoWeb("listado-gastos-completo",listadoGastos[i])
    }
}


function actualizarPresupuestoWeb(){
    let nuevoPresupuesto = prompt("Introduce el nuevo presupuesto:");
    if (nuevoPresupuesto !== null) {
        nuevoPresupuesto = parseFloat(nuevoPresupuesto);
        Gestion.actualizarPresupuesto(nuevoPresupuesto);
        repintar();
    }
}
// Añadimos el evento al botón de actualizar presupuesto
const botonActualizar = document.getElementById("actualizarpresupuesto");
if (botonActualizar) {
    botonActualizar.addEventListener("click", actualizarPresupuestoWeb);
} else {
    console.warn("No se encontró el botón de actualizar presupuesto");
}


function nuevoGastoWeb(){
    // Pedimos los datos del nuevo gasto al usuario
    const descripcion = prompt("Introduce la descripción del gasto:");
    if (descripcion === null) return;
    const valor = prompt("Introduce el valor del gasto:");
    if (valor === null) return;
    const fecha = prompt("Introduce la fecha del gasto (YYYY-MM-DD):");
    if (fecha === null) return;
    const etiquetasInput = prompt("Introduce las etiquetas del gasto (separadas por comas):");
    if (etiquetasInput === null) return;
    const etiquetas = etiquetasInput.split(",").map(etiqueta => etiqueta.trim());

    // Creamos el nuevo gasto y lo añadimos al presupuesto
    const nuevoGasto = new Gestion.CrearGasto(descripcion, parseFloat(valor), fecha, etiquetas);
    Gestion.anyadirGasto(nuevoGasto);

    // Repintamos la información actualizada
    repintar();
}
// Añadimos el evento al botón de añadir gasto
const botonAnyadirGasto = document.getElementById("anyadirgasto");
if (botonAnyadirGasto) {
    botonAnyadirGasto.addEventListener("click", nuevoGastoWeb);
} else {
    console.warn("No se encontró el botón de añadir gasto");
}


// Editor de gasto, usando un manejador de eventos y una función constructora
let EditarHandle = {
    handleEvent: function(event) {
        // Pedimos los datos del nuevo gasto al usuario
        const descripcion = prompt("Introduce la descripción del gasto:");
        if (descripcion === null) return;
        const valor = prompt("Introduce el valor del gasto:");
        if (valor === null) return;
        const fecha = prompt("Introduce la fecha del gasto (YYYY-MM-DD):");
        if (fecha === null) return;
        const etiquetasInput = prompt("Introduce las etiquetas del gasto (separadas por comas):");
        if (etiquetasInput === null) return;
        const etiquetas = etiquetasInput.split(",").map(etiqueta => etiqueta.trim());

        // Los almacenamos
        this.gasto.actualizarDescripcion(descripcion);
        this.gasto.actualizarValor(parseFloat(valor));
        this.gasto.actualizarFecha(fecha);
        this.gasto.anyadirEtiquetas(etiquetas);

        // Repintamos la información actualizada
        repintar();
    }
}



// Handler para borrar gasto
let BorrarHandle = {
    handleEvent: function(event) {
        // Borramos el gasto
        Gestion.borrarGasto(this.gasto.id);

        // Repintamos la información actualizada
        repintar();
    }
}


function mostrarDatoEnId(idElemento, valor) {
    const elemento = document.getElementById(idElemento);
    
    if (elemento) {
        elemento.textContent = valor;
    } else {
        console.warn(`No se encontró ningún elemento con el id: ${idElemento}`);
    }
}

function mostrarGastoWeb(idElemento, gasto) {
    let elemento = document.getElementById(idElemento);

    if (!elemento) {
        console.warn(`No se encontró ningún elemento con el id: ${idElemento}`);
        return;
    }

    
    // Obtenemos la fecha en formato legible
    const fechaGasto = new Date(gasto.fecha).toLocaleDateString();

    // Creamos el div y spans de las etiquetas
    const etiquetasGasto = gasto.etiquetas.map (etiqueta =>
         `<span class="gasto-etiquetas-etiqueta">${etiqueta}</span>`).join('\n');

    // Creamos el HTML del gasto
    const htmlGasto = `
        <div class="gasto">
            <div class="gasto-descripcion">${gasto.descripcion}</div>
            <div class="gasto-fecha">${fechaGasto}</div>
            <div class="gasto-valor">${gasto.valor} €</div>
            <div class="gasto-etiquetas">${etiquetasGasto}</div>
        </div>
    `;

    // Insertamos el HTML del gasto en el elemento
    elemento.innerHTML += htmlGasto;
}

function mostrarGastosAgrupadosWeb(idElemento, agrup, periodo) {
    let elemento = document.getElementById(idElemento);
    if (!elemento) {
        console.warn(`No se encontró ningún elemento con el id: ${idElemento}`);
        return;
    }
    elemento.innerHTML = "BLA"; // Limpiamos el contenido previo del elemento

    // Traducir el periodo a un texto legible
    const periodoTraducido = {
        'dia': "día",
        'mes': "mes",
        'anyo': "año"
    }
    const periodoTexto = periodoTraducido[periodo] || periodo;

    // Verificamos que agrup.datos exista antes de iterar
    const listaDatos = agrup?.datos ? Object.entries(agrup.datos) : [];

    // HTML para para entrada del valor agrup.
    // Usamos object.entries para iterar sobre las claves (periodos) y valores (gastos) del objeto agrup
    const datosHTML = Object.entries(agrup).map(([periodo, gasto]) => `
        <div class="agrupacion-dato">
            <span class="agrupacion-dato-clave">${periodo}</span>
            <span class="agrupacion-dato-valor">${gasto} €</span>
        </div>
    `).join('\n');

    const htmlGrupo = `
        <div class="agrupacion">
            <h1>Gastos agrupados por ${periodoTexto}</h1>
                ${datosHTML}
        </div>
    `;

    // Insertamos el HTML de la agrupación en el elemento
    elemento.innerHTML = htmlGrupo;
}


// NO MODIFICAR A PARTIR DE AQUÍ: exportación de funciones y objetos creados para poder ejecutar los tests.
// Las funciones y objetos deben tener los nombres que se indican en el enunciado
// Si al obtener el código de una práctica se genera un conflicto, por favor incluye todo el código que aparece aquí debajo
export   {
    mostrarDatoEnId,
    mostrarGastoWeb,
    mostrarGastosAgrupadosWeb
}