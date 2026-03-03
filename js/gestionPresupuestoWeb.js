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