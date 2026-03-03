import * as Gestion from "./gestionPresupuesto.js";
import * as Web from "./gestionPresupuestoWeb.js";

// Actualizamos el persupuesto a 1500€
Gestion.actualizarPresupuesto(1500);

// Mostrar el presupuesto en div#presupuesto
const mensajePresupuesto = Gestion.mostrarPresupuesto();
Web.mostrarDatoEnId("presupuesto", mensajePresupuesto);

// Crear gastos de ejemplo
const gasto1 = new Gestion.CrearGasto("Compra carne", 23.44, "2021-10-06", "casa", "comida");
const gasto2 = new Gestion.CrearGasto("Compra fruta y verdura", 14.25, "2021-09-06", "supermercado", "comida");
const gasto3 = new Gestion.CrearGasto("Bonobús", 18.60, "2020-05-26", "transporte");
const gasto4 = new Gestion.CrearGasto("Gasolina", 60.42, "2021-10-08", "transporte", "gasolina");
const gasto5 = new Gestion.CrearGasto("Seguro hogar", 206.45, "2021-09-26", "casa", "seguros");
const gasto6 = new Gestion.CrearGasto("Seguro coche", 195.78, "2021-10-06", "transporte", "seguros");

// Añadir los gastos al presupuesto
Gestion.anyadirGasto(gasto1);
Gestion.anyadirGasto(gasto2);
Gestion.anyadirGasto(gasto3);
Gestion.anyadirGasto(gasto4);
Gestion.anyadirGasto(gasto5);
Gestion.anyadirGasto(gasto6);

// Mostrar los gasdos totales
const total = Gestion.calcularTotalGastos();
Web.mostrarDatoEnId("gastos-totales", total);

// Mostrar el balance total
const balance = Gestion.calcularBalance();
Web.mostrarDatoEnId("balance-total", balance);

// Mostrar el listado completo de gastos
const listadoGastos = Gestion.listarGastos();
for (let i=0; i<listadoGastos.length ; i++){
    Web.mostrarGastoWeb("listado-gastos-completo",listadoGastos[i])
}

// Mostrar el listado de gastos realizados en septiembre de 2021 en div#listado-gastos-filtrado-1 (funciones filtrarGastos y mostrarGastoWeb)
const filtro1 = {
    fechaDesde: "2021-09-01",
    fechaHasta: "2021-09-30"
}
const filtrado1 = Gestion.filtrarGastos(filtro1);
for (let i=0; i<filtrado1.length ; i++){
    Web.mostrarGastoWeb("listado-gastos-filtrado-1",filtrado1[i])
}

// Mostrar el listado de gastos de más de 50€ en div#listado-gastos-filtrado-2 (funciones filtrarGastos y mostrarGastoWeb)
const filtro2 = {
    valorMinimo: 50
}
const filtrado2 = Gestion.filtrarGastos(filtro2);
for (let i=0; i<filtrado2.length ; i++){
    Web.mostrarGastoWeb("listado-gastos-filtrado-2",filtrado2[i])
}

// Mostrar el listado de gastos de más de 200€ con etiqueta seguros en div#listado-gastos-filtrado-3 (funciones filtrarGastos y mostrarGastoWeb)
const filtro3 = {
    valorMinimo: 200,
    etiquetas: ["seguros"]
}
const filtrado3 = Gestion.filtrarGastos(filtro3);
for (let i=0; i<filtrado3.length ; i++){
    Web.mostrarGastoWeb("listado-gastos-filtrado-3",filtrado3[i])
}

// Mostrar el listado de gastos que tengan las etiquetas comida o transporte de menos de 50€ en div#listado-gastos-filtrado-4 (funciones filtrarGastos y mostrarGastoWeb)
const filtro4 = {
    etiquetas: ["comida", "transporte"],
    valorMaximo: 50
}
const filtrado4 = Gestion.filtrarGastos(filtro4);
for (let i=0; i<filtrado4.length ; i++){
    Web.mostrarGastoWeb("listado-gastos-filtrado-4",filtrado4[i])
}

// Mostrar el total de gastos agrupados por día en div#agrupacion-dia (funciones agruparGastos y mostrarGastosAgrupadosWeb)
const filtradoDia = Gestion.agruparGastos("dia");
Web.mostrarGastosAgrupadosWeb("agrupacion-dia", filtradoDia, "dia");

// Mostrar el total de gastos agrupados por mes en div#agrupacion-mes (funciones agruparGastos y mostrarGastosAgrupadosWeb)
const filtradoMes = Gestion.agruparGastos("mes");
Web.mostrarGastosAgrupadosWeb("agrupacion-mes", filtradoMes, "mes");

// Mostrar el total de gastos agrupados por año en div#agrupacion-anyo (funciones agruparGastos y mostrarGastosAgrupadosWeb)
const filtradoAnyo = Gestion.agruparGastos("anyo");
Web.mostrarGastosAgrupadosWeb("agrupacion-anyo", filtradoAnyo, "anyo");