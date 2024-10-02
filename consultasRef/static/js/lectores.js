let imagenP = document.getElementById("imagenP");
let input = document.getElementById("codBarras");
let descripcion = document.getElementById("descripcion");
let precio = document.getElementById("precio");
let codigo = document.getElementById("codigo");
let precioculto = document.getElementById("precioculto");
let ue = document.getElementById("ue");
let info = document.getElementById("info");
input.focus();
// let status = "{{referencia}}";

// // Enfocar el campo al cargar la página
// window.onload = function() {
//     document.getElementById('codBarras').focus();
//     if(status!="init") setTimeout(() => {
//         history.replaceState(null, '', location.pathname);
//         location.reload();
//     }, 15000);
// };

// Función para formatear un número como moneda
function formatearMoneda(valor) {
    let formato = valor.toLocaleString('es-CO', { maximumFractionDigits: 0 });
    let result = formato.replace(/,/g, '.');
    return `$ ${result}`;
}

// Función para ocultar un precio
function ocultaPrecio(valor) {
    let valorInv = valor.toString().split('').reverse().join('');
    return `${valorInv.slice(0, 2)}1P${valorInv.slice(2)}0P`;
}



input.addEventListener("change", () => {
    let tiempo;
    let retorno;
    clearTimeout(retorno);
    axios.get('/buscar/'+input.value)
    .then((result) => {
        input.value = "";
        input.focus();
        referencia = result.data;
        console.log(referencia);
        if(Object.keys(referencia)[0] === "error"){
            tiempo = 5000;
            imagenP.classList.add("op-0");
            descripcion.innerText = "PRODUCTO NO ENCONTRADO";
            precio.classList.add("flecha");
            info.classList.add('down');
            precio.innerHTML =  `
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="280px" height="280px"  fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                </svg>
            `;
        } else {
            tiempo = 60000;
            imagenP.src = "/static/img/ProductosRaiz/" + referencia.referencia +".jpg";
            imagenP.onerror = function() {
                this.onerror = null; // Evita bucles de error
                this.src = "/static/img/ProductosRaiz/noimage.jpg"; // Imagen por defecto
            };
            imagenP.classList.remove("op-0");
            descripcion.innerText = referencia.descripcion;
            precio.classList.remove("flecha");
            precio.innerText = formatearMoneda(referencia.precioxunidad);
            info.classList.remove('down');
            codigo.innerText = referencia.referencia;
            precioculto.innerText = ocultaPrecio(referencia.precioxmayor);
            ue.innerText = referencia.ue;
        }
        retorno = setTimeout(() => {
            input.value = "";
            input.focus();
            imagenP.classList.add("op-0");
            descripcion.innerText = "CONSULTA EL PRECIO AQUÍ";
            precio.classList.add("flecha");
            precio.innerHTML =  `
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="300px" height="300px" fill="none" viewBox="0 0 24 24">
                    <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19V5m0 14-4-4m4 4 4-4"/>
                </svg> 
            `;
            info.classList.add('down');
        }, tiempo);
        
    }).catch((err) => {
        console.log(err);        
    });
    input.value = "";
});