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



// Handler para cerrar formularios. Cierra el form y habilita el botón de añadir gasto.
let FormularioCerrar = {
    handleEvent: function (e) {
        this.formulario.remove();
        this.botonEditar.removeAttribute("disabled");
    }
}



function nuevoGastoWebFormulario(event){
    // Handler para el formulario
    function formularioCrearHandle(e) {
        e.preventDefault() // Previene el envío por defecto del formulario.

        // Obtenemos los datos del formulario
        const descripcion = e.currentTarget.descripcion.value;
        const valor = parseFloat(e.currentTarget.valor.value);
        const fecha = e.currentTarget.fecha.value;
        const etiquetas = e.currentTarget.etiquetas.value.split(",");
        // Creamos el nuevo gasto y lo añadimos al presupuesto
        Gestion.anyadirGasto(new Gestion.CrearGasto(descripcion, valor, fecha, etiquetas));
        repintar()
        
        // Elimina el formulario y habilita el botón de añadir gasto
        e.currentTarget.remove();
        document.getElementById("anyadirgasto-formulario").removeAttribute("disabled");
    }

    // Clonamos el template del formulario
    const plantillaFormulario = document.getElementById("formulario-template")
        .content.cloneNode(true);
    // Accedemos al elemento form dentro del template clonado
    const formulario = plantillaFormulario.querySelector("form");

    // Accedemos a los botones dentro del formulario
    const botonCancelar = formulario.querySelector("button.cancelar");
    const botonActual = event.currentTarget;
    
    // Añadimos listener al botón de enviar
    formulario.addEventListener("submit", formularioCrearHandle);

    // Boton cancelar: elimina el formulario y habilita el botón de añadir gasto
    let cancelarHandle = Object.create(FormularioCerrar)
    cancelarHandle.formulario = formulario;
    cancelarHandle.botonEditar = botonActual;
    botonCancelar.addEventListener("click", cancelarHandle);

    // DEhabilitar el botón de editar
    botonActual.setAttribute("disabled", "disabled");

    // Añadimos el formulario al body
    event.target.parentNode.appendChild(plantillaFormulario);
}
// Añaidmos el evento al botón de añadir gasto
const botonAnyadirGastoFormulario = document.getElementById("anyadirgasto-formulario");
if (botonAnyadirGastoFormulario) {
    botonAnyadirGastoFormulario.addEventListener("click", nuevoGastoWebFormulario);
} else {
    console.warn("No se encontró el botón de añadir gasto con formulario");
}

function anyadirGastoFormulario(){
    const template = document.getElementById("formulario-template");
    const formulario = template.content.cloneNode(true);
    document.body.appendChild(formulario);

    const form = document.querySelector("form");
    form.addEventListener("submit", function(event) {
        event.preventDefault();
        const descripcion = document.getElementById("descripcion").value;
        const valor = parseFloat(document.getElementById("valor").value);
        const fecha = document.getElementById("fecha").value;
        const etiquetasInput = document.getElementById("etiquetas").value;
        const etiquetas = etiquetasInput.split(",").map(etiqueta => etiqueta.trim());

        const nuevoGasto = new Gestion.CrearGasto(descripcion, valor, fecha, etiquetas);
        Gestion.anyadirGasto(nuevoGasto);

        // Eliminar el formulario después de enviar
        document.body.removeChild(form.parentElement);

        repintar();
    });

    // Añadir evento al botón cancelar
    const botonCancelar = form.querySelector(".cancelar");
    botonCancelar.addEventListener("click", function() {
        document.body.removeChild(form.parentElement);
    });
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
        // Recuperamos los valores actuales del gasto para mostrarlos como valores por defecto en los prompts
        const descripcionActual = this.gasto.descripcion;
        const valorActual = this.gasto.valor;
        const fechaActual = new Date(this.gasto.fecha).toISOString().split('T')[0]; // Convertimos a formato YYYY-MM-DD
        const etiquetasActuales = this.gasto.etiquetas.join(", ");

        // Pedimos los datos del nuevo gasto al usuario
        const descripcion = prompt("Introduce la descripción del gasto:", descripcionActual);
        if (descripcion === null) return;
        const valor = prompt("Introduce el valor del gasto:", valorActual);
        if (valor === null) return;
        const fecha = prompt("Introduce la fecha del gasto (YYYY-MM-DD):", fechaActual);
        if (fecha === null) return;
        const etiquetasInput = prompt("Introduce las etiquetas del gasto (separadas por comas):", etiquetasActuales);
        if (etiquetasInput === null) return;
        const etiquetas = etiquetasInput.split(",");

        // Los almacenamos
        this.gasto.actualizarDescripcion(descripcion);
        this.gasto.actualizarValor(Number(valor));
        this.gasto.actualizarFecha(fecha);
        this.gasto.anyadirEtiquetas(...etiquetas);

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


// Handler para borrar las etiquetas de un gasto
let BorrarEtiquetasHandle = {
    handleEvent: function(event) {
        // Borramos las etiquetas del gasto
        this.gasto.borrarEtiquetas(this.etiqueta);

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
    const elemento = document.getElementById(idElemento);

    if (!elemento) {
        console.warn(`No se encontró ningún elemento con el id: ${idElemento}`);
        return;
    }
    
    // Obtenemos la fecha en formato legible
    const fechaGasto = new Date(gasto.fecha).toLocaleDateString();

    // Div class gasto
    let divGasto = document.createElement("div");
    divGasto.className = "gasto";

    // Div con la descripción
    let divDescripcion = document.createElement("div");
    divDescripcion.className = "gasto-descripcion";
    divDescripcion.textContent = gasto.descripcion;
    
    // Div con la fecha
    let divFecha = document.createElement("div");
    divFecha.className = "gasto-fecha";
    divFecha.textContent = fechaGasto;

    // Div con el valor
    let divValor = document.createElement("div");
    divValor.className = "gasto-valor";
    divValor.textContent = `${gasto.valor}`;

    // Div con las etiquetas
    let divEtiquetas = document.createElement("div");
    divEtiquetas.className = "gasto-etiquetas";
    
    gasto.etiquetas.forEach(etiqueta => {
        let spanEtiqueta = document.createElement("span");
        spanEtiqueta.className = "gasto-etiquetas-etiqueta";
        spanEtiqueta.textContent = etiqueta + " ";
        divEtiquetas.appendChild(spanEtiqueta);

        // borrar etiqueta al hacer click sobre ella
        let borrarEtiquetaHandle = Object.create(BorrarEtiquetasHandle);
        borrarEtiquetaHandle.gasto = gasto;
        borrarEtiquetaHandle.etiqueta = etiqueta;
        spanEtiqueta.addEventListener("click", borrarEtiquetaHandle);

        divEtiquetas.appendChild(spanEtiqueta);
    });

    divGasto.append(divDescripcion, divFecha, divValor, divEtiquetas);

    // Botón de editar
    let botonEditar = document.createElement("button");
    botonEditar.className = "gasto-editar";
    botonEditar.type = "button";
    botonEditar.textContent = "Editar";
    
    // Asociamos el manejador de eventos al botón de editar
    // Importante: al ser un objeto reutilizable, debemos crear una nueva instancia para cada gasto, asignándole el gasto correspondiente
    let editarBotonHandle = Object.create(EditarHandle);
    editarBotonHandle.gasto = gasto;
    botonEditar.addEventListener("click", editarBotonHandle);

     // Botón de borrar
     let botonBorrar = document.createElement("button");
     botonBorrar.className = "gasto-borrar";
     botonBorrar.type = "button";
     botonBorrar.textContent = "Borrar";

     // Asociamos el manejador de eventos al botón de borrar
     let borrarBotonHandle = Object.create(BorrarHandle);
     borrarBotonHandle.gasto = gasto;
     botonBorrar.addEventListener("click", borrarBotonHandle);

     divGasto.append(botonEditar, botonBorrar);

     elemento.appendChild(divGasto);
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