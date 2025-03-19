var basedatos = localStorage.getItem("datos") ? JSON.parse(localStorage.getItem("datos")) : {
    operacion: "",
    numCuenta: "",
    banco: "",
    valor: "",
    billetes10: 0,
    billetes20: 0,
    billetes50: 0,
    billetes100: 0
}

var codigoAleatorio = Math.floor(100000 + Math.random() * 900000);
var segundos = 60
var intentosNequi = 0
function validarCuentaNequi() {
    try {
        let cuenta = $("#cuentaBanco").val()
        if (!esSoloNumeros(cuenta)) throw "Numero de cuenta invalido por caracteres no validos";
        if (cuenta.length != 10) throw "Numero de cuenta invalido";
        if (cuenta[0] != "3") throw "Numero de cuenta invalido";
        guardar("operacion", "RETIRO");
        guardar("numCuenta", cuenta);
        guardar("banco", "NEQUI");
        location.href = "valorRetiro.html"
    } catch (error) {
        dialog("Error", error, "error")
    }
}

function validarCuentaBancolombia() {
    try {
        let cuenta = $("#cuentaBanco").val()
        let clave = $("#clave").val()
        if (!esSoloNumeros(cuenta)) throw "Numero de cuenta invalido por caracteres no validos";
        if (cuenta.length != 11) throw "Numero de cuenta invalido";
        if (!esSoloNumeros(clave)) throw "Clave invalida por caracteres no validos";
        if (clave.length != 4) throw "Clave invalida";
        guardar("operacion", "RETIRO");
        guardar("numCuenta", cuenta);
        guardar("banco", "BANCOLOMBIA");
        location.href = "valorRetiro.html"
    } catch (error) {
        dialog("Error", error, "error")
    }
}

function validarCuentaAhorroMano() {
    try {
        let cuenta = $("#cuentaBanco").val()
        let clave = $("#clave").val()
        if (!esSoloNumeros(cuenta)) throw "Numero de cuenta invalido por caracteres no validos";
        if (cuenta.length != 11) throw "Numero de cuenta invalido";
        if (cuenta[0] != "0" && cuenta[0] != "1") throw "Numero de cuenta invalido no inicia con 0 o 1";
        if (cuenta[1] != "3") throw "Numero de cuenta invalido";
        if (!esSoloNumeros(clave)) throw "Clave invalida por caracteres no validos";
        if (clave.length != 4) throw "Clave invalida";
        guardar("operacion", "RETIRO");
        guardar("numCuenta", cuenta);
        guardar("banco", "BANCOLOMBIA A LA MANO");
        location.href = "valorRetiro.html"
    } catch (error) {
        dialog("Error", error, "error")
    }
}


function validarCodigoNequi(){
    if ($("#codigo").val().trim() != codigoAleatorio) {
        intentosNequi++
        if (intentosNequi == 3) {
            dialog("Error", "Ha superado el maximo de intentos para el codigo", "error")
            setTimeout(() => {
                window.history.back()
            }, 2 * 1000); 
        }else{
            dialog("Error", "El codigo no es valido", "error")
        }
    }else{
        location.href = "registroOperacion.html"
    }
}

function habilitarOtroValor() {
    $("#div-escoge-dinero").fadeOut()
    $("#div-digita-valor").fadeIn()
    $("#div-digita-valor").removeClass("hide")
}

function validarValor(valor) {
    if (valor != null && valor != "" && valor != 0 && valor % 10000 === 0) {
        guardar("valor", parseFloat(valor));
        calcularBilletes(valor);
        location.href = basedatos.banco == "NEQUI" ? "codigoRetiro.html" : "registroOperacion.html";
    }else{
        dialog("Error", "El valor a retirar no es valido para los billetes disponibles", "error")
    }
}

function calcularBilletes(cantidad) {
    let billetes = [10000, 20000, 50000, 100000];
    let billetesUsados = [];
    let cantidadActual = 0;
    let reinicio = 0;

    while (cantidadActual < cantidad) {
        for (let i = reinicio; i < billetes.length; i++) {
            if ((cantidadActual + billetes[i]) <= cantidad) {
                cantidadActual += billetes[i];
                billetesUsados.push(billetes[i]);
            }
        }
        reinicio += 1;
        if (reinicio === billetes.length) {
            reinicio = 0;
        }
    }

    let resultado = billetesUsados.reduce((contador, billete) => {
        contador[billete] = (contador[billete] || 0) + 1;
        return contador;
    }, {});
    guardar("billetes100", resultado[100000] ? resultado[100000] : 0);
    guardar("billetes50", resultado[50000] ? resultado[50000] : 0);
    guardar("billetes20", resultado[20000] ? resultado[20000] : 0);
    guardar("billetes10", resultado[10000] ? resultado[10000] : 0);
}

function guardar(campo, valor) {
    basedatos[campo] = valor;
    localStorage.setItem("datos", JSON.stringify(basedatos));
}

function dialog(titulo, msg, icono) {
    Swal.fire({
        title: titulo,
        text: msg,
        icon: icono
    });
}

function esSoloNumeros(valor) {
    let regex = /^[0-9]+$/; // Expresión regular que solo permite números del 0 al 9
    return regex.test(valor);
}

function iniciaExpiracion() {
    setInterval(() => {
        segundos--
        if (segundos == 0) {
            segundos = 60
            codigoAleatorio = Math.floor(100000 + Math.random() * 900000);
            $("#codigo-retiro-rand").html(codigoAleatorio)
        }
        $("#expiracion-segundos").html(segundos);
    }, 1 * 1000);
}

function pintarFactura() {
    $("#fac-fecha").html(obtenerFechaActual());
    $("#fac-hora").html(obtenerHoraActual());
    
    $("#fac-operacion").html(basedatos.operacion);
    $("#fac-numCuenta").html(basedatos.banco == "NEQUI" ? `0${basedatos.numCuenta}` : basedatos.numCuenta);
    $("#fac-banco").html(basedatos.banco);
    $("#fac-valor").html(formatoMonedaColombiana(basedatos.valor).split(",")[0]);
    $("#fac-billetes10").html(basedatos.billetes10);
    $("#fac-billetes20").html(basedatos.billetes20);
    $("#fac-billetes50").html(basedatos.billetes50);
    $("#fac-billetes100").html(basedatos.billetes100);
}

function obtenerFechaActual() {
    let fecha = new Date();
    let dia = String(fecha.getDate()).padStart(2, '0'); // Asegura que tenga dos dígitos
    let mes = String(fecha.getMonth() + 1).padStart(2, '0'); // +1 porque los meses van de 0-11
    let año = fecha.getFullYear();
    
    return `${dia}/${mes}/${año}`; // Formato DD/MM/YYYY
}

function obtenerHoraActual() {
    let ahora = new Date();
    let horas = String(ahora.getHours()).padStart(2, '0'); // Asegura dos dígitos
    let minutos = String(ahora.getMinutes()).padStart(2, '0');
    let segundos = String(ahora.getSeconds()).padStart(2, '0');

    return `${horas}:${minutos}:${segundos}`; // Formato HH:MM:SS
}

function formatoMonedaColombiana(numero) {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' }).format(numero);
}

$(document).ready(() => {
    $("#codigo-retiro-rand").html(codigoAleatorio)
    $("#expiracion-segundos").html(segundos)
    iniciaExpiracion()
    pintarFactura()
})
