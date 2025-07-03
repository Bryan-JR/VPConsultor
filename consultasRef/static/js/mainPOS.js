
// ::::::::::::::::::::::::::::::::: CLIENTE :::::::::::::::::::::::::::::::::

// Función para formatear la fecha
function obtenerFechaActual() {
  const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('es-ES', opciones);
}

// Función para formatear la hora
function obtenerHoraActual() {
  return new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

// Actualizar fecha y hora al cargar la página
function actualizarFechaHora() {
  document.getElementById('fecha-actual').textContent = obtenerFechaActual();
  document.getElementById('hora-actual').textContent = obtenerHoraActual();
}

// Actualizar cada segundo
window.onload = function() {
  actualizarFechaHora();
  setInterval(actualizarFechaHora, 1000);
};

// Buscar cliente por NIT
document.getElementById("nit").addEventListener("keydown", function(event) {
  if (event.key === 'Tab' || event.key === 'Enter') {
    event.preventDefault(); // Evita que el form se envíe
    
    const nit = this.value.trim();
    if (nit) {
      buscarCliente(nit);
    }
  }
  // Para Tab no hacemos nada, permitiendo la navegación normal
});

async function buscarCliente(nit) {
  try {
    document.getElementById("nit").classList.add('loading');

    const response = await fetch(`http://10.0.0.96:5050/cliente-pos?nit=${nit}`);
    console.log(response);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Ocurrió un error inesperado.');
    }

    const data = await response.json();
    actualizarCamposCliente(data);

  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error al buscar cliente',
      text: error.message || 'Ocurrió un error inesperado.',
    });
    limpiarCamposCliente();
  } finally {
    document.getElementById("nit").classList.remove('loading');
  }
}


function actualizarCamposCliente(data) {
  document.getElementById("nombre_cliente").value = data.nombre_cliente || '';
  document.getElementById("ciudad").value = data.ciudad || '';
  document.getElementById("direccion").value = data.direccion || '';
  document.getElementById("telefono").value = data.telefono || '';
  document.getElementById("forma_pago").value = data.forma_pago || 'Contado';
  document.getElementById("vendedor").value = data.vendedor || 'Ventas POS';
  
  // Opcional: mover foco al siguiente campo después de cargar
  document.getElementById("nombre_cliente").focus();
}

function limpiarCamposCliente() {
  const campos = ['nombre_cliente', 'ciudad', 'direccion', 'telefono', 'forma_pago', 'vendedor'];
  campos.forEach(id => {
    document.getElementById(id).value = '';
  });
}

// ::::::::::::::::::::::::::::::::: PRODUCTOS :::::::::::::::::::::::::::::::::

// Variables globales
let carrito = [];
let precioActual = '01'; // 01 = PRECIOXUNIDAD por defecto

document.addEventListener('DOMContentLoaded', () => {
  const inputBusqueda = document.getElementById("codigo_barras");
  const sugerencias = document.getElementById("sugerencias");

  let evitarSugerencias = false;
  let timeoutBusqueda;

  // Escanear producto por código de barras
  inputBusqueda.addEventListener("keydown", async (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const codigo = inputBusqueda.value.trim();
      if (codigo) {
        evitarSugerencias = true;

        await agregarProducto(codigo);

        inputBusqueda.value = '';
        inputBusqueda.focus();
      }
    }
  });

  // Buscar por descripción (sugerencias)
  inputBusqueda.addEventListener("input", () => {
    const texto = inputBusqueda.value.trim();
    clearTimeout(timeoutBusqueda);

    if (evitarSugerencias) {
      evitarSugerencias = false;
      return;
    }

    if (texto.length < 3) {
      sugerencias.innerHTML = "";
      sugerencias.style.display = "none";
      return;
    }

    timeoutBusqueda = setTimeout(() => {
      fetch(`http://10.0.0.96:5050/producto-pos/buscar?q=${encodeURIComponent(texto)}`)
        .then(async res => {
          if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.error || "Error en búsqueda");
          }
          return res.json();
        })
        .then(data => {
          const productos = data.productos || [];
          sugerencias.innerHTML = "";

if (productos.length === 0) {
  sugerencias.innerHTML = "";
  sugerencias.style.display = "none";
  return;
}


          productos.forEach(prod => {
            const li = document.createElement("li");
            li.textContent = `${prod.descripcion} - $${prod.precio_unidad.toLocaleString()}`;
            li.style.padding = "4px";
            li.style.cursor = "pointer";

            li.addEventListener("click", () => {
              inputBusqueda.value = prod.referencia;
              sugerencias.innerHTML = "";
              sugerencias.style.display = "none";

              const evento = new KeyboardEvent("keydown", { key: "Enter" });
              inputBusqueda.dispatchEvent(evento);
            });

            sugerencias.appendChild(li);
          });

          sugerencias.style.display = "block";
        })
        .catch(error => {
          console.error("Error buscando por descripción:", error);
          sugerencias.innerHTML = "";
          const li = document.createElement("li");
          li.textContent = error.message || "Error de búsqueda";
          li.style.padding = "4px";
          li.style.color = "#c00";
          sugerencias.appendChild(li);
          sugerencias.style.display = "block";
        });
    }, 300);
  });

  // Ocultar sugerencias si se hace clic fuera
  document.addEventListener("click", (e) => {
    if (!sugerencias.contains(e.target) && e.target !== inputBusqueda) {
      sugerencias.style.display = "none";
    }
  });
});

async function agregarProducto(codigo) {
  try {
    const response = await fetch(`http://10.0.0.96:5050/producto-pos?codigo=${codigo}`);
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'No se pudo obtener información del producto.');
    }

    const producto = await response.json();

    const existente = carrito.findIndex(p => p.referencia === producto.referencia && p.lp === precioActual);

    if (existente >= 0) {
      carrito[existente].cantidad += 1;
    } else {
      carrito.push({
        ...producto,
        cantidad: 1,
        lp: precioActual,
        descuento: producto.descuento || 0,
        valor_neto: calcularValorNeto(producto, precioActual)
      });
    }

    actualizarTablaProductos();
    actualizarTotales();
  } catch (error) {
    console.error("Error:", error);
    Swal.fire({
      icon: 'error',
      title: 'Error al buscar producto',
      text: error.message || 'No se pudo obtener información del producto.',
    });
  }
}



// ::::::::::::::::::::::::::::::::: CARRITO DE COMPRAS ::::::::::::::::::::::::::::::::

// Cambiar tipo de precio
document.querySelectorAll('input[name="lp"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        precioActual = e.target.value;
        actualizarPreciosCarrito();
    });
});

async function agregarProducto(codigo) {
    try {
        const response = await fetch(`http://10.0.0.96:5050/producto-pos?codigo=${codigo}`);
        if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'No se pudo obtener información del producto.');
      }
 
        const producto = await response.json();
        
        // Verificar si el producto ya está en el carrito
        const existente = carrito.findIndex(p => p.referencia === producto.referencia && p.lp === precioActual);
        
        if (existente >= 0) {
            // Incrementar cantidad si ya existe
            carrito[existente].cantidad += 1;
        } else {
            // Agregar nuevo producto
            carrito.push({
                ...producto,
                cantidad: 1,
                lp: precioActual,
                descuento: producto.descuento || 0,
                valor_neto: calcularValorNeto(producto, precioActual)
            });
        }
        
        actualizarTablaProductos();
        actualizarTotales();
        
    } catch (error) {
    console.error("Error:", error);
    Swal.fire({
        icon: 'error',
        title: 'Error al buscar producto',
        text: error.message || 'No se pudo obtener información del producto.',
    });
}
}

function calcularValorNeto(producto, lp) {
    const precio = lp === '00' ? producto.precio_mayor : producto.precio_unidad;
    return precio * (1 - (producto.descuento / 100));
}

function actualizarTablaProductos() {
    const tbody = document.getElementById("detalle-productos");
    tbody.innerHTML = '';
    
    carrito.forEach((item, index) => {
        const row = document.createElement('tr');
        
        const precioActual = item.lp === '00' ? item.precio_mayor : item.precio_unidad;
        const valorNeto = precioActual * (1 - (item.descuento / 100)) * item.cantidad;
        
        row.innerHTML = `
            <td>${item.referencia}</td>
            <td>${item.descripcion}</td>
            <td>
                <div class="lp-options">
                    <div class="lp-option">
                        <input type="radio" id="lp_${index}_00" name="lp_${index}" value="00" ${item.lp === '00' ? 'checked' : ''}>
                        <label for="lp_${index}_00">00</label>
                    </div>
                    <div class="lp-option">
                        <input type="radio" id="lp_${index}_01" name="lp_${index}" value="01" ${item.lp === '01' ? 'checked' : ''}>
                        <label for="lp_${index}_01">01</label>
                    </div>
                </div>
            </td>
            <td class="precio">${formatearMoneda(precioActual)}</td>
            <td>${item.descuento}%</td>
            <td><input type="number" min="1" value="${item.cantidad}" class="cantidad"></td>
            <td class="valor-neto">${formatearMoneda(valorNeto)}</td>
            <td>
            <button class="btn-eliminar" data-ref="${item.referencia}" data-lp="${item.lp}">
              <i class="fas fa-trash"></i>
            </button>
          </td>

        `;
        
        // Eventos para los radios
        row.querySelectorAll(`input[name="lp_${index}"]`).forEach(radio => {
            radio.addEventListener('change', (e) => {
                carrito[index].lp = e.target.value;
                actualizarTablaProductos();
                actualizarTotales();
            });
        });
        
        // Evento para cantidad
        row.querySelector('.cantidad').addEventListener('change', (e) => {
            const nuevaCantidad = parseInt(e.target.value) || 1;
            carrito[index].cantidad = nuevaCantidad;
            actualizarTotales();
            
            // Actualizar solo la fila modificada
            const precio = carrito[index].lp === '00' ? carrito[index].precio_mayor : carrito[index].precio_unidad;
            const nuevoValorNeto = precio * (1 - (carrito[index].descuento / 100)) * nuevaCantidad;
            row.querySelector('.valor-neto').textContent = formatearMoneda(nuevoValorNeto);
        });
        
        tbody.appendChild(row);
    });
}

function actualizarPreciosCarrito() {
    carrito.forEach(item => {
        item.lp = precioActual;
        item.valor_neto = calcularValorNeto(item);
    });
    actualizarTablaProductos();
    actualizarTotales();
}

function actualizarTotales() {
    const subtotal = carrito.reduce((sum, item) => {
        const precio = item.lp === '00' ? item.precio_mayor : item.precio_unidad;
        return sum + (precio * item.cantidad); // sin descuentos
    }, 0);

    const totalNeto = carrito.reduce((sum, item) => {
        const precio = item.lp === '00' ? item.precio_mayor : item.precio_unidad;
        const valorNeto = precio * (1 - (item.descuento / 100)) * item.cantidad;
        return sum + valorNeto;
    }, 0);

    document.getElementById("subtotal").textContent = formatearMoneda(subtotal);
    document.getElementById("descuento-total").textContent = formatearMoneda(subtotal - totalNeto);
    document.getElementById("total-general").textContent = formatearMoneda(totalNeto);

    limpiarMontoRecibido();
}

function formatearMoneda(valor) {
  return '$ ' + Math.round(valor).toLocaleString('es-CO');
}


// Convierte texto en número 
function numeroDesdeFormatoEsCO(txt = '') {
  // 1️⃣ Deja solo 0-9 , . y -
  const limpio = String(txt).replace(/[^\d.,-]/g, '');
  // 2️⃣ Quita puntos de miles y pasa la coma decimal a punto
  const normalizado = limpio.replace(/\./g, '').replace(',', '.');
  return parseFloat(normalizado) || 0;
}


// Eliminar producto
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-eliminar') || e.target.closest('.btn-eliminar')) {
        const btn = e.target.closest('.btn-eliminar');
        const referencia = btn.getAttribute('data-ref');
        const lp = btn.getAttribute('data-lp');

        const index = carrito.findIndex(p => p.referencia === referencia && p.lp === lp);
        if (index !== -1) {
            carrito.splice(index, 1);
            actualizarTablaProductos();
            actualizarTotales();
        }
    }
});

// ::::::::::::::::::::::::::::: RENDERIZAR CARRITO ::::::::::::::::::::::::::::::::
function renderizarCarrito() {
    const tabla = document.getElementById("detalle-productos"); // ID correcto
    tabla.innerHTML = ""; // Limpia la tabla

    if (carrito.length === 0) {
        const filaVacia = document.createElement("tr");
        const celda = document.createElement("td");
        celda.colSpan = 5;
        celda.textContent = "No hay productos en la venta.";
        celda.classList.add("text-center", "text-muted");
        filaVacia.appendChild(celda);
        tabla.appendChild(filaVacia);
        return;
    }

    carrito.forEach((producto) => {
        const fila = document.createElement("tr");
        fila.innerHTML = `
            <td>${producto.codigo}</td>
            <td>${producto.descripcion}</td>
            <td>${producto.cantidad}</td>
            <td>${producto.precio}</td>
            <td>${producto.total}</td>
        `;
        tabla.appendChild(fila);
    });
}

// ::::::::::::::::::::::::::::::::: LIMPIAR FORMULARIO DE VENTA ::::::::::::::::::::::::::
function limpiarFormularioVenta() {

    // Limpia tabla de productos
    carrito = [];
    renderizarCarrito();
    actualizarTotales();
    limpiarMontoRecibido();
}

// ::::::::::::::::::::::::::::::::: ACTUALIZAR CONSECUTIVO ::::::::::::::::::::::::::
async function actualizarConsecutivo() {
    try {
        const resp = await fetch('/venta-pos/siguiente');
        const data = await resp.json();

        if (data && data.numero_venta) {
            document.getElementById("numero-factura").textContent = `Factura Nº: ${data.numero_venta}`;
        } else {
            console.warn("No se pudo actualizar el número de factura.");
        }
    } catch (err) {
        console.error("Error al consultar el nuevo consecutivo:", err);
    }
}

// ::::::::::::::::::::::::::::::::: BOTÓN GUARDAR E IMPRIMIR :::::::::::::::::::::::::::
document.getElementById("imprimir").addEventListener("click", async () => {
    const cliente = document.getElementById("nit").value.trim();
    const razonsocial = document.getElementById("nombre_cliente").value.trim();
    const formaPago = document.getElementById("forma_pago").value;
    const vendedor = document.getElementById("vendedor").value;
    const montoStr = document.getElementById("monto-recibido").value.trim();

    if (!cliente) {
        Swal.fire({ icon: 'info', title: 'NIT del Cliente', text: 'Debe ingresar el NIT del cliente.' });
        return;
    }

    if (!razonsocial) {
        Swal.fire({ icon: 'warning', title: 'Razón Social', text: 'La Razón Social del cliente está vacía.' });
        return;
    }

    if (!formaPago) {
        Swal.fire({ icon: 'warning', title: 'Medio de Pago', text: 'Seleccione el Medio de Pago.' });
        return;
    }

    if (!vendedor) {
        Swal.fire({ icon: 'warning', title: '¿Quién lo atiende?', text: 'Seleccione el Caja - Usuario.' });
        return;
    }

    if (!carrito || carrito.length === 0) {
        Swal.fire({ icon: 'error', title: 'Carrito Vacío', text: 'No hay productos en la venta. Agregue al menos uno.' });
        return;
    }

    if (!montoStr) {
        Swal.fire({ icon: 'warning', title: 'Monto recibido', text: 'Ingrese el monto recibido.' });
        return;
    }

    const recibidoNum = numeroDesdeFormatoEsCO(montoStr);
    const totalNum = numeroDesdeFormatoEsCO(document.getElementById("total-general").textContent);

    if (recibidoNum < totalNum) {
        Swal.fire({ icon: 'warning', title: 'Monto insuficiente', text: 'El monto recibido es menor al total. No se puede imprimir.' });
        return;
    }

    const datosVenta = obtenerDatosTicket();

    try {
        const guardarResponse = await fetch('/venta-pos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(datosVenta)
        });

        const guardarResult = await guardarResponse.json();

if (!guardarResult.success) {
    Swal.fire({
        icon: 'error',
        title: 'Error al guardar',
        text: guardarResult.message || 'Error al guardar la venta en la base de datos.'
    });
    return;
}

// ✅ Inyectar el número real generado por el backend en los datos del ticket
datosVenta.numero_venta = guardarResult.numero_venta;

// ✅ Mostrar en pantalla el número real y usarlo en el ticket
document.getElementById("numero-factura").textContent = `Factura Nº: ${guardarResult.numero_venta}`;
imprimirTicketEnVentana(datosVenta);

// ✅ Limpiar formulario después
limpiarFormularioVenta();

try {
    const resp = await fetch('/venta-pos/siguiente');
    const result = await resp.json();

    if (result.success) {
        document.getElementById("numero-factura").textContent = `Factura Nº: ${result.numero_venta}`;
    } else {
        console.warn("No se pudo actualizar el número de factura");
    }
} catch (err) {
    console.error("Error al actualizar número de factura:", err);
}

    } catch (error) {
        console.error('Error al guardar la venta:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error inesperado',
            text: 'Ocurrió un problema al guardar la venta.',
        });
    }
});



// ::::::::::::::::::::::::::::::::: GENERAR TICKET ::::::::::::::::::::::::::::::::::
function obtenerDatosTicket() {
    const clienteNombre     = document.getElementById("nombre_cliente").value || "CONSUMIDOR FINAL";
    const clienteDoc        = document.getElementById("nit").value || "";
    const clienteCiudad     = document.getElementById("ciudad").value || "";
    const clienteDireccion  = document.getElementById("direccion").value || "";
    const clienteTelefono   = document.getElementById("telefono").value || "";

    const medioPago         = document.getElementById("forma_pago").value || "CONTADO";
    const vendedorNombre    = document.getElementById("vendedor").value || "-";
    const numeroVenta = document.getElementById("numero-factura").textContent.replace('Factura Nº: ', '').trim();


    const recibido = numeroDesdeFormatoEsCO(document.getElementById("monto-recibido").value);

    const subtotal = carrito.reduce((s, i) => {
        const p = i.lp === '00' ? i.precio_mayor : i.precio_unidad;
        return s + p * i.cantidad;
    }, 0);

    const total = carrito.reduce((s, i) => {
        const p = i.lp === '00' ? i.precio_mayor : i.precio_unidad;
        const d = i.descuento || 0;
        return s + p * i.cantidad * (1 - d / 100);
    }, 0);

    const descuento_total = subtotal - total;
    const cambio = Math.max(0, recibido - total);

    return {
        numero_venta: numeroVenta,
        cliente: {
            nombre: clienteNombre,
            documento: clienteDoc,
            ciudad: clienteCiudad,
            direccion: clienteDireccion,
            telefono: clienteTelefono
        },
        vendedor: vendedorNombre,
        medio_pago: medioPago,
        recibido,
        cambio,
        descuento_total,
        productos: carrito.map(item => {
            const precio = item.lp === '00' ? item.precio_mayor : item.precio_unidad;
            const desc = item.descuento || 0;
            return {
                codigo: item.referencia || "",
                descripcion: item.descripcion,
                cantidad: item.cantidad,
                precio: precio,
                desc: desc,
                total: precio * item.cantidad * (1 - desc / 100)
            };
        }),
        subtotal,
        total
    };
}


const fMoneda = n => new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
}).format(n);


// Genera HTML + print() manteniendo 48 columnas aprox (papel 80 mm)
function imprimirTicketEnVentana(data) {
    const fecha = new Date();
    const fechaStr = fecha.toLocaleDateString();
    const horaStr  = fecha.toLocaleTimeString();

    // --- util para cortar descripción sin romper columnas ----
    const wrapDescripcion = (texto, ancho = 32) => {
        const palabras = texto.split(' ');
        const lineas = [];
        let linea = '';
        palabras.forEach(w => {
            if ((linea + w).length > ancho) {
                lineas.push(linea.trimEnd());
                linea = '';
            }
            linea += w + ' ';
        });
        if (linea) lineas.push(linea.trimEnd());
        return lineas;
    };

    // --- cuerpo de la tabla de ítems --------------------------
// --- Función para formatear los items manteniendo alineación ---
const itemsTexto = data.productos.map((p, i) => {
    const codigo = (p.codigo || "").toString();
    const descripcion = (p.descripcion || "").substring(0, 25).padEnd(25);
    const cantidad = String(p.cantidad).padStart(3);
    const precio = fMoneda(p.precio).padStart(10);
    const descuento = (p.desc || 0).toString().padStart(2) + "%";
    const total = fMoneda(p.total).padStart(10);
    
    return `
    <tr class="item-row">
        <td colspan="6" class="item-line"></td>
    </tr>
    <tr>
        <td class="codigo bold">${codigo}</td>
        <td class="descripcion bold">${descripcion}</td>
        <td class="cantidad bold">${cantidad}</td>
    </tr>
    <tr>
        <td class="precio bold">${precio}</td>
        <td class="descuento bold">${descuento}</td>
        <td class="total bold">${total}</td>
    </tr>
    `;

}).join('');

const html = `
<html>
<head>
  <meta charset="utf-8">
  <title>Ticket ${data.numero_venta}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: monospace;
      font-size: 7pt;
      width: 76mm;
      margin-left: 4mm;
      margin-right: 4mm;
      /*margin: 0 auto;*/
      padding: 0.5mm;
      font-weight: 700;
    }

    .logo {
      text-align: center;
      margin: 1mm 0;
    }
    .logo img {
      max-width: 100px;
      height: auto;
    }

    .header {
      text-align: center;
      margin-bottom: 0.5mm;
      font-size: 7.5pt;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .bold { font-weight: 800; }
    .divider {
      border-top: 1px dashed #000;
      margin: 0.8mm 0;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      table-layout: fixed;
      font-size: 6.6pt;
    }
    .items-table th {
      padding: 0.3mm 0;
      font-weight: 900;
      text-align: left;
      Font-size: 8.6pt;
    }
    .items-table td {
      padding: 0.2mm 0;
      vertical-align: top;
      overflow: hidden;
    }
    .item-line {
      border-top: 1px dotted #ccc;
      height: 1mm;
      padding: 0;
    }
    .codigo { width: 11mm; }
    .descripcion { width: 22mm; }
    .cantidad { width: 6mm; text-align: left; }
    .precio { width: 10mm; text-align: left; }
    .descuento { width: 7mm; text-align: left; }
    .total { width: 11mm; text-align: left; }
    .totals-table {
      width: 90%;
      border-collapse: collapse;
      font-size: 7pt;
    }
    .totals-table td {
      padding: 0.2mm 0;
    }
    .total-row {
      font-weight: 900;
      font-size: 9pt;

    }
    .footer {
      font-size: 6pt;
      text-align: center;
      margin-top: 0.8mm;
    }
    .thin-line {
      border-top: 1px solid #000;
      margin: 0.5mm 0;
    }

    .iconos {width: 20px;height: 20px;vertical-align: middle}
  </style>
</head>
<body onload="window.print(); window.onafterprint = () => window.close(); 5000)">

<div class="logo">
  <img src="/static/img/logoPOS.png" alt="Logo">
</div>

<div class="header">
  <div class="bold">PLASDECOR DE MONTERIA S.A.S</div>
  <div>NIT: 900334132-2</div>
  <div>Tel: 7810779 - 7814558 - 7811620</div>
  <div>CL 37 1B 65 MONTERIA</div>
  <div>Responsables de IVA</div>
</div>

<div class="thin-line"></div>

<div><span class="bold">  Cliente:</span> ${data.cliente.nombre}</div>
${data.cliente.documento ? '<div><span class="bold">  Documento:</span> ' + data.cliente.documento + '</div>' : ''}
<div><span class="bold">  Fecha:</span> ${fechaStr}, ${horaStr}</div>
<div><span class="bold">   N° Factura:</span> ${data.numero_venta}</div>

<div class="thin-line"></div>

<table class="items-table">
  <thead>
    <tr>
      <th class="codigo" style="width: 20%;">  Código</th>
      <th class="descripcion" style="width: 53%;">Descripción</th>
      <th class="cantidad" style="width: 22%;">Cant</th>
    </tr>
    <tr>
      <th class="precio">  Precio</th>
      <th class="descuento">D%</th>
      <th class="total">Total</th>
    </tr>
  </thead>
  <tbody>
    ${itemsTexto}
  </tbody>
</table>

<div class="thin-line"></div>

<table class="totals-table">
  <tr><td style="width:30mm"><span class="bold">  Subtotal:</span></td><td class="bold" style="width:44mm; text-align:right">${formatearMoneda(data.subtotal)}</td></tr>
  <tr><td><span class="bold">  Descuento:</span></td><td class="bold" style="text-align:right">${formatearMoneda(data.descuento_total)}</td></tr>
  <tr class="total-row"><td><span class="bold">  TOTAL NETO:</span></td><td class="bold" style="text-align:right">${formatearMoneda(data.total)}</td></tr>
  <tr><td><span class="bold">  Recibido:</span></td><td class="bold" style="text-align:right">${fMoneda(data.recibido)}</td></tr>
  <tr><td><span class="bold">  Cambio:</span></td><td class="bold" style="text-align:right">${fMoneda(data.cambio)}</td></tr>
</table>

<div class="thin-line"></div>

<div><span class="bold">  Medio de pago:</span> ${data.medio_pago}</div>
<div><span class="bold">  Lo atendió:</span> ${data.vendedor}</div>
<div><span class="bold">  Observaciones:</span></div>
<br><br><br>

<div class="thin-line"></div>

<div class="footer">
  <div class="bold">GRACIAS POR SU COMPRA</div>
  <div>72 h límite para cambios/reclamos</div>
  <div>¡Revise su factura!</div>

  <div>Elaborado por Dpto.Sistemas<img src="/static/img/vp.ico" alt="Ícono de Admin" class="iconos"></div>
  <div>Plasdecor de Montería S.A.S. - Copyright © 2025</div>
  <div>Todos los Derechos Reservados</div>
  <div><Strong>Factura Temporal No oficial</Strong></div>
</div>

</body>
</html>
`;

    const win = window.open('', '_blank', 'width=400,height=600');
    win.document.write(html);
    win.document.close();
}

// ::::::::::::::::::::::::::::::::: CALCULO - RECIBIDO & CAMBIO :::::::::::::::::::::::::::

const montoRecibidoInput = document.getElementById("monto-recibido");
const cambioElem = document.getElementById("cambio");

// 👉 Esta función extrae y convierte texto formateado tipo "Total a Pagar: $ 799.650"
function numeroDesdeFormatoEsCO(valor) {
  if (!valor) return 0;
  const soloNumero = valor.match(/[\d\.,]+/g)?.[0] || "0";
  return parseFloat(soloNumero.replace(/\./g, '').replace(',', '.')) || 0;
}

function formatearMoneda(numero) {
  return numero.toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
        minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

// 👉 Formatea mientras se escribe
montoRecibidoInput.addEventListener("input", (e) => {
  let valor = e.target.value.replace(/\D/g, ""); // elimina todo menos dígitos

  if (!valor) {
    e.target.value = "";
    cambioElem.textContent = "";
    cambioElem.className = "";
    return;
  }

  const numero = parseInt(valor, 10);
  e.target.value = new Intl.NumberFormat("es-CO").format(numero);

  evaluarPago(numero); // calcula cambio o falta
});

function evaluarPago(valorRecibido) {
  const totalTexto = document.getElementById("total-general").textContent;
  const total = numeroDesdeFormatoEsCO(totalTexto);

  const diferencia = valorRecibido - total;

  if (diferencia < 0) {
    cambioElem.textContent = `Falta $ ${Math.abs(diferencia).toLocaleString("es-CO")}`;
    cambioElem.className = "text-rojo";
  } else {
    cambioElem.textContent = `Vuelto $ ${diferencia.toLocaleString("es-CO")}`;
    cambioElem.className = "text-verde";
  }
}

function limpiarMontoRecibido() {
  montoRecibidoInput.value = "";
  cambioElem.textContent = "";
  cambioElem.className = "";
}


// ::::::::::::::::::::::::::::::::: NÚMERO DE FACTURA :::::::::::::::::::::::::::::::::
document.addEventListener('DOMContentLoaded', function () {
  fetch('/venta-pos/siguiente')
    .then(response => response.json())
    .then(data => {
      if (data.success) {
        document.getElementById('numero-factura').textContent = 'Factura Nº: ' + data.numero_venta;
      } else {
        document.getElementById('numero-factura').textContent = 'Factura Nº: ERROR';
        console.error('Error al obtener el número de factura:', data.message);
      }
    })
    .catch(error => {
      document.getElementById('numero-factura').textContent = 'Factura Nº: ERROR';
      console.error('Error en la solicitud al backend:', error);
    });
});

// ::::::::::::::::::::::::::::::::: REIMPRESIÓN DE FACTURA ::::::::::::::::::::::::::::::::
function adaptarFacturaParaImpresion(factura, detalleProductos) {
    function toNumberSafe(value) {
        if (value === undefined || value === null || value === '' || isNaN(value)) return 0;
        return Number(value);
    }

    return {
        cliente: {
            nombre: factura.cliente || factura.nombre_cliente || "Cliente genérico",
            documento: factura.nit || "",
        },
        numero_venta: factura.numero_venta || factura.numero || "N/D", // Soporte alternativo
        fecha: factura.fecha,
        productos: (detalleProductos || []).map(p => ({
        codigo: p.codigo_producto || "",
        descripcion: p.descripcion || "",
        cantidad: toNumberSafe(p.cantidad),
        precio: toNumberSafe(p.precio_neto), 
        desc: toNumberSafe(p.descuento),
        total: toNumberSafe(p.total),
        })),
        subtotal: toNumberSafe(factura.subtotal),
        descuento_total: toNumberSafe(factura.descuento_total || factura.descuento),
        total: toNumberSafe(factura.total),
        recibido: toNumberSafe(factura.monto_recibido || factura.recibido),
        cambio: toNumberSafe(factura.cambio || factura.vueltos),
        medio_pago: factura.forma_pago || "N/D",
        vendedor: factura.vendedor || "N/D",
    };
}

// Evento para reimprimir factura
document.getElementById("btn-reimprimir").addEventListener("click", async () => {
    const numeroFactura = document.getElementById("buscar-factura").value.trim();

    if (!numeroFactura) {
        Swal.fire({
            icon: 'warning',
            title: 'Número de Factura',
            text: 'Ingrese un número de factura válido.',
        });
        return;
    }

    try {
        const resp = await fetch(`/venta-pos/${numeroFactura}`);
        const data = await resp.json();

        if (!data.success) {
            Swal.fire({
                icon: 'error',
                title: 'Factura no encontrada',
                text: data.message || 'No se encontró la factura.',
            });
            return;
        }

        console.log("[DEBUG] Factura encontrada:", data.venta);

        const facturaAdaptada = adaptarFacturaParaImpresion(data.venta, data.venta.detalle);
        console.table(facturaAdaptada.productos);

        imprimirTicketEnVentana(facturaAdaptada);

    } catch (err) {
        console.error("❌ Error al reimprimir factura:", err);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'No se pudo recuperar la factura.',
        });
    }
});

document.getElementById("buscar-factura").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
      e.preventDefault(); 
      document.getElementById("btn-reimprimir").click();
    }
  });

// ::::::::::::::::::::::::::::::::: NAVEGACIÓN CON TAB ::::::::::::::::::::::::::::::::
// Resaltar campos obligatorios y navegar con Enter
document.addEventListener("DOMContentLoaded", function () {
  const campos = Array.from(document.querySelectorAll(
    "input:not([type=hidden]):not([readonly]):not([disabled]), select:not([disabled])"
  ));

  // Estilo para mostrar errores
  function mostrarError(campo, mensaje) {
    campo.classList.add("input-error");

    // Crear mensaje si no existe
    if (!campo.nextElementSibling || !campo.nextElementSibling.classList.contains("error-msg")) {
      const msg = document.createElement("span");
      msg.classList.add("error-msg");
      msg.textContent = mensaje;
      msg.style.color = "red";
      msg.style.fontSize = "12px";
      msg.style.marginLeft = "6px";
      campo.insertAdjacentElement("afterend", msg);
    }
  }

  function ocultarError(campo) {
    campo.classList.remove("input-error");
    const siguiente = campo.nextElementSibling;
    if (siguiente && siguiente.classList.contains("error-msg")) {
      siguiente.remove();
    }
  }

  function validarCampo(campo) {
    const requerido = campo.required || campo.hasAttribute("required");
    const vacio = !campo.value || campo.value.trim() === "";

    if (requerido && vacio) {
      mostrarError(campo, "Este campo es obligatorio");
      return false;
    }

    if (campo.id === "codigo_barras") {
      const productos = document.querySelectorAll("#detalle-productos tr").length;
      if (productos === 0) {
        mostrarError(campo);
        return false;
      }
    }

    if (campo.id === "monto-recibido") {
      const monto = parseFloat(campo.value.replace(/[^\d.]/g, ''));
      if (isNaN(monto) || monto <= 0) {
        mostrarError(campo, "Ingrese un monto válido");
        return false;
      }
    }

    ocultarError(campo);
    return true;
  }

  campos.forEach((campo, index) => {
    campo.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === "Tab") {
        const valido = validarCampo(campo);
        if (!valido) {
          e.preventDefault(); // No avanza si no es válido
          return;
        }

        if (e.key === "Enter") {
          e.preventDefault(); // Evitar comportamiento por defecto de Enter

          // Enfocar el siguiente campo visible, no bloqueado
          let siguiente = index + 1;
          while (siguiente < campos.length) {
            const next = campos[siguiente];
            if (!next.readOnly && !next.disabled && next.offsetParent !== null) {
              next.focus();
              break;
            }
            siguiente++;
          }
        }
      }
    });

    campo.addEventListener("input", () => ocultarError(campo));
    campo.addEventListener("change", () => ocultarError(campo));
  });
});

window.addEventListener('DOMContentLoaded', () => {
    const nitInput = document.getElementById('nit');
    if (nitInput) {
      nitInput.focus();
    }
  });