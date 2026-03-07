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


/**
 * Constructor para el manejador del evento 'submit' del formulario de edición.
 */
function EditarActualizarGastoHandle() {
    this.handleEvent = function (e) {
        //console.log("EditarActualizarGastoHandle disparado para gasto:", this.gasto);
        e.preventDefault();

        // Actualizamos el gasto con los nuevos valores del formulario
        this.gasto.actualizarDescripcion(e.currentTarget.descripcion.value);
        this.gasto.actualizarValor(parseFloat(e.currentTarget.valor.value));
        this.gasto.actualizarFecha(e.currentTarget.fecha.value);
        
        // Procesamos las etiquetas (limpiando espacios)
        const etiquetas = e.currentTarget.etiquetas.value
            .split(",")
            .map(t => t.trim())
            .filter(t => t !== "");
        this.gasto.anyadirEtiquetas(...etiquetas);

        // Repintamos (esto regenera la lista y elimina el formulario automáticamente)
        repintar();
    };
}


// Handler para el formulario de editar gasto.
const EditarHandleFormulario = {
    handleEvent: function (e) {
        e.preventDefault() // Previene el envío por defecto del formulario.
        // console.log("EditarHandleFormulario disparado para gasto:", this.gasto);

        // Copiamos la estructura del formulario.
        const plantillaFormulario = document.getElementById("formulario-template").content.cloneNode(true);
        const formulario = plantillaFormulario.querySelector("form");
        // Selecionamos el botón de cancelar dentro del formulario para asociarle el evento de cierre.
        const botonCancelar = formulario.querySelector("button.cancelar");
        
        // Seleccionamos el botón de editar usado.
        const botonActual = e.currentTarget; // El botón que ha disparado el evento, en este caso el de editar.

        formulario.descripcion.value = this.gasto.descripcion;
        formulario.valor.value = this.gasto.valor;
        formulario.fecha.value = this.gasto.fecha;
        formulario.etiquetas.value = this.gasto.etiquetas.join();

        // Configuramos el manejador de eventos para el envío del formulario, pasándole las referencias necesarias.
        //const actualizarHandle = Object.create(EditarActualizarGastoHandle);
        const actualizarHandle = new EditarActualizarGastoHandle();
        actualizarHandle.gasto = this.gasto;
        actualizarHandle.formulario = formulario; // Pasamos referencia del form para borrarlo luego
        formulario.addEventListener("submit", actualizarHandle);

        // Configuramos el manejador de eventos para el botón de cancelar, pasándole las referencias necesarias.
        const cancelarHandle = Object.create(FormularioCerrar);
        cancelarHandle.formulario = formulario;
        cancelarHandle.botonEditar = botonActual;
        botonCancelar.addEventListener("click", cancelarHandle);

        // Desactivamos el botón de editar para evitar múltiples formularios abiertos y añadimos el formulario al DOM.
        botonActual.setAttribute("disabled", "disabled");
        // botonActual.parentNode.appendChild(formularioTemplate);
        // Insertamos el formulario justo después del botón o en su contenedor
        botonActual.parentNode.appendChild(plantillaFormulario);
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

        // Extraer valores usando los 'name' de los inputs del formulario
        const descripcion = e.currentTarget.descripcion.value;
        const valor = parseFloat(e.currentTarget.valor.value);
        const fecha = e.currentTarget.fecha.value;
        
        // Procesar etiquetas: split por coma y limpiar espacios
        const etiquetas = e.currentTarget.etiquetas.value
            .split(",")
            .map(t => t.trim())
            .filter(t => t !== ""); // Elimina etiquetas vacías

        // Crear el gasto usando el Operador Spread (...)
        // Esto envía cada elemento del array como un argumento individual al constructor
        const nuevoGasto = new Gestion.CrearGasto(descripcion, valor, fecha, ...etiquetas);
        
        // Persistir y actualizar la vista
        Gestion.anyadirGasto(nuevoGasto);
        repintar(); // Función global que refresca el DOM

        // Limpieza: eliminar formulario y reactivar el botón de apertura
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


// Añadimos el evento al botón de añadir gasto
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
    // console.log("Mostrando gasto en web:", gasto);
    // console.log("con idElemento:", idElemento);
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
    let editarFormBoton = Object.create(EditarHandleFormulario);
    editarFormBoton.gasto = gasto;
    botonEditarFormulario.addEventListener("click", editarFormBoton);

    // Botón de Borrar (API)
    let botonBorrarApi = document.createElement("button");
    botonBorrarApi.className = "gasto-borrar-api";
    botonBorrarApi.type = "button";
    botonBorrarApi.textContent = "Borrar (API)";

    // Manejador de eventos para el botón de borrar con API
    // TODO

    // Añadimos los botones al div del gasto y luego el div al elemento principal
     divGasto.append(botonEditar, botonBorrar, botonBorrarApi, botonEditarFormulario);
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



function filtrarGastosWeb(e) {
    console.log("filtrarGastosWeb disparado");
    e.preventDefault(); // Evita que el formulario se envíe y la página se recargue

    // Obtenemos los valores de los campos del formulario
    // Como los id's contienen "-", no podemos acceder a ellos con e.currentTarget.campo.value, por lo que usamos e.currentTarget["campo"].value
    // filtrarGastos espera un objeto tipo diccionario con las claves: fechaDesde, fechaHasta, valorMinimo, valorMaximo, descripcionContiene, etiquetasTiene
    const filtros = {};

    const descripcion = e.currentTarget["formulario-filtrado-descripcion"].value.trim() ||null;
    if (descripcion) {
        filtros.descripcionContiene = descripcion;
    }
    // Valores numéricos: si el campo está vacío o no es un número válido, lo dejamos como null para no filtrar por ese criterio. Evita error NaN.
    const valorMinimo = parseFloat(e.currentTarget["formulario-filtrado-valor-minimo"].value);
    if (!isNaN(valorMinimo)) {
        filtros.valorMinimo = valorMinimo;
    }
    const valorMaximo = parseFloat(e.currentTarget["formulario-filtrado-valor-maximo"].value);
    if (!isNaN(valorMaximo)) {
        filtros.valorMaximo = valorMaximo;
    }

    const fechaDesde = e.currentTarget["formulario-filtrado-fecha-desde"].value;
    if (fechaDesde) {
        filtros.fechaDesde = fechaDesde;
    }
    const fechaHasta = e.currentTarget["formulario-filtrado-fecha-hasta"].value;
    if (fechaHasta) {
        filtros.fechaHasta = fechaHasta;
    }

    const etiquetas = e.currentTarget["formulario-filtrado-etiquetas-tiene"].value.trim();
    filtros.etiquetasTiene = etiquetas ? Gestion.transformarListadoEtiquetas(etiquetas) : null;

    console.log("Filtros obtenidos del formulario:", filtros);

    // Limpiamos el listado previo de gastos filtrados/completos
    const divListadoGastos = document.getElementById("listado-gastos-completo");
    if (divListadoGastos) {
        divListadoGastos.innerHTML = "";
    }

    // Obtenemos el listado de gastos filtrados usando la función de gestión
    const gastosFiltrados = Gestion.filtrarGastos(filtros);
    console.log("Gastos filtrados:", gastosFiltrados);

    // Mostramos los gastos filtrados en el DOM
    for (let i=0; i<gastosFiltrados.length ; i++){
        mostrarGastoWeb("listado-gastos-completo", gastosFiltrados[i])
    }
}
// Añadimos el evento al botón de filtrar gastos
// Obtenemos el formulario de filtrado
const formularioFiltrar = document.getElementById("formulario-filtrado");
if (formularioFiltrar) {
    formularioFiltrar.addEventListener("submit", filtrarGastosWeb);
} else {
    console.warn("No se encontró el formulario de filtrado con id 'formulario-filtrar'");
}

function guardarGastosWeb() {
    // console.log("guardarGastosWeb disparado");
    localStorage.setItem("GestorGastosDWEC", JSON.stringify(Gestion.listarGastos()));

}
const botonGuardar = document.getElementById("guardar-gastos");
if (botonGuardar) {
    botonGuardar.addEventListener("click", guardarGastosWeb);
}


function cargarGastosWeb() {
    // console.log("cargarGastosWeb disparado");
    const gastosGuardados = localStorage.getItem("GestorGastosDWEC");
    if (gastosGuardados) {
        Gestion.cargarGastos(JSON.parse(gastosGuardados));
    } else {
        Gestion.cargarGastos([]); // Si no hay gastos guardados, cargamos un array vacío para no tener datos previos
    }
    repintar(); // Repintamos la información actualizada
}
const botonCargar = document.getElementById("cargar-gastos");
if (botonCargar) {
    botonCargar.addEventListener("click", cargarGastosWeb);
}


// Elementos de la API
const API_URL = "https://suhhtqjccd.execute-api.eu-west-1.amazonaws.com/latest/"; // Reemplaza con la URL real de tu API

async function cargarGastosApi() {
    console.log("cargarGastosAp disparado");
    // Usuario
    const nombreUsuario = document.getElementById("nombre_usuario").value;
    const urlConUsuario = API_URL + nombreUsuario;

    // Realizamos la petición a la API
    const response = await fetch(urlConUsuario);
    //console.log("Respuesta de la API:", response);

    if (response.ok) {
        const gastosApi = await response.json();
        if (Array.isArray(gastosApi)) {
            Gestion.cargarGastos(gastosApi);
        } else {
            Gestion.cargarGastos([]); // Si la respuesta no es un array, cargamos un array vacío para no tener datos previos
            console.warn("La respuesta de la API no es un array:", gastosApi);
        }
    } else {
        console.log("Error al cargar gastos desde la API. Código de estado:", response.status);
        Gestion.cargarGastos([]); // En caso de error, cargamos un array vacío para no tener datos previos
    }
    repintar(); // Repintamos la información actualizada
}
const botonCargarApi = document.getElementById("cargar-gastos-api");
if (botonCargarApi) {
    botonCargarApi.addEventListener("click", cargarGastosApi);
}

// NO MODIFICAR A PARTIR DE AQUÍ: exportación de funciones y objetos creados para poder ejecutar los tests.
// Las funciones y objetos deben tener los nombres que se indican en el enunciado
// Si al obtener el código de una práctica se genera un conflicto, por favor incluye todo el código que aparece aquí debajo
export   {
    mostrarDatoEnId,
    mostrarGastoWeb,
    mostrarGastosAgrupadosWeb
}