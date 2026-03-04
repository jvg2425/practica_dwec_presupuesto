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
const FormularioCerrar = {
    handleEvent: function (e) {
        this.formulario.remove();
        this.botonEditar.removeAttribute("disabled");
    }
}

// Handler para el formulario de editar gasto.
const EditarHandleFormulario = {
    handleEvent: function (e) {
        e.preventDefault() // Previene el envío por defecto del formulario.
    }
}


/**
 * e es el event del submit del formulario. En este handler se extraen los datos del formulario, se crea un nuevo gasto, se añade a la gestión y se repinta la información actualizada. Luego se limpia el formulario y se habilita el botón de añadir gasto.
 * e.currentTarget:
 *  Es una propiedad del objeto de evento que hace referencia al elemento HTML que tiene el escuchador de eventos
 * y que en este caso es el formulario. Esto nos permite acceder a los campos del formulario usando sus 'name' (ej: e.currentTarget.descripcion.value).
 */

const FormularioCrearHandle = {
    handleEvent: function (e) {
        e.preventDefault(); // Evita que la página se recargue

        // 1. Extraer valores usando los 'name' de los inputs del formulario
        const descripcion = e.currentTarget.descripcion.value;
        const valor = parseFloat(e.currentTarget.valor.value);
        const fecha = e.currentTarget.fecha.value;
        
        // 2. Procesar etiquetas: split por coma y limpiar espacios
        const etiquetas = e.currentTarget.etiquetas.value
            .split(",")
            .map(t => t.trim())
            .filter(t => t !== ""); // Elimina etiquetas vacías

        // 3. Crear el gasto usando el Operador Spread (...)
        // Esto envía cada elemento del array como un argumento individual al constructor
        const nuevoGasto = new Gestion.CrearGasto(descripcion, valor, fecha, ...etiquetas);
        
        // 4. Persistir y actualizar la vista
        Gestion.anyadirGasto(nuevoGasto);
        repintar(); // Función global que refresca el DOM

        // 5. Limpieza: eliminar formulario y reactivar el botón de apertura
        this.formulario.remove();
        this.botonAbrir.removeAttribute("disabled");
    }
}


/**
 * Prepara e inserta el formulario de nuevo gasto en la web.
 * @param {Event} e - Evento de click del botón de apertura.
 * 
 * Notas: repasar bien esta estructura, es un patrón común para manejar formularios dinámicos con JavaScript.
 * - Clonamos un template HTML para crear el formulario, lo que nos permite mantener
 *  el HTML separado y limpio.
 * - Usamos objetos manejadores (handleEvent) para gestionar los eventos de envío y 
 * cancelación, lo que nos permite mantener el estado (referencias al formulario y botón) 
 * de forma organizada.
 * - Al enviar el formulario, extraemos los datos, creamos un nuevo gasto, 
 * lo añadimos a la gestión y refrescamos la vista. 
 * Luego limpiamos el formulario y reactivamos el botón. Esto se hace en el Handle de envío (FormularioCrearHandle).
 */
function nuevoGastoWebFormulario(e) {
    const botonActual = e.currentTarget;

    //Clonar el contenido del template HTML
    const plantilla = document.getElementById("formulario-template").content.cloneNode(true);
    const formulario = plantilla.querySelector("form");
    const botonCancelar = formulario.querySelector("button.cancelar");

    // Configurar el Manejador de Envío (Submit)
    const envioHandle = Object.create(FormularioCrearHandle);
    envioHandle.formulario = formulario; // Pasamos referencia del form para borrarlo luego
    envioHandle.botonAbrir = botonActual; // Pasamos referencia del botón para habilitarlo
    formulario.addEventListener("submit", envioHandle);

    // Configurar el Manejador de Cancelación
    const cancelarHandle = Object.create(FormularioCerrar);
    cancelarHandle.formulario = formulario;
    cancelarHandle.botonEditar = botonActual;
    botonCancelar.addEventListener("click", cancelarHandle);

    // Estado de la interfaz: deshabilitar botón y mostrar formulario
    botonActual.setAttribute("disabled", "disabled");
    
    // Insertamos el formulario justo después del botón o en su contenedor
    botonActual.parentNode.appendChild(plantilla);
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

     // Botón de editar-formulario
     let botonEditarFormulario = document.createElement("button");
     botonEditarFormulario.className = "gasto-editar-formulario";
     botonEditarFormulario.type = "button";
     botonEditarFormulario.textContent = "Editar (formulario)";

     // Manejadror de eventos para el botón de editar con formulario
    let editarFormularioHandle = Object.create(FormularioCerrar);
    // TODO
     divGasto.append(botonEditar, botonBorrar, botonEditarFormulario);

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