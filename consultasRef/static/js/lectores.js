let imagenP = document.getElementById("imagenP");
let input = document.getElementById("codBarras");
let descripcion = document.getElementById("descripcion");
let precio = document.getElementById("precio");
let codigo = document.getElementById("codigo");
let precioculto = document.getElementById("precioculto");
let ue = document.getElementById("ue");
let info = document.getElementById("info");
let tabInv = document.getElementById("tabInv");
input.focus();

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

function nombreBodega(id){
    nombre = "";
    switch (id) {
        case 1:
            nombre = "PRINCIPAL"
            break;
        case 2:
            nombre = "ALMACEN"
            break;
        case 3:
            nombre = "AVERÍAS"
            break;
        case 7:
            nombre = "EVENTOS"
            break;
        case 10:
            nombre = "DIRECTOS"
            break;
        case 20:
            nombre = "OUTLET"
            break;
        default:
            nombre = "???"
            break;
    }
    return nombre;
}

carga = `
    <tr>
        <td colspan="3" class="flex justify-center items-center">
            <svg aria-hidden="true" class="w-4 h-4 text-gray-200 animate-spin fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
            <span class="sr-only">Loading...</span>
        </td>
        <td></td>
    </tr>
`;

async function getInventario(ref) {
    document.getElementById('inv').innerHTML = carga;
    if(ref!="")
        axios.get(`/inventario?r=${ref}`)
        .then((value) => {
            let resp = value.data;
            let totalDisp = 0;
            document.getElementById('inv').innerHTML = '';
            resp.forEach((item) => {
                bd = [1, 2, 20];
                if (bd.includes(item.bodega, 0)) {
                    totalDisp += item.existencia;
                    document.getElementById('inv').innerHTML += `
                        <tr class="bg-white border-b">
                            <th scope="row" class="px-1 py-1 text-center font-medium text-gray-900 whitespace-nowrap" >
                                ${item.bodega}
                            </th>
                            <td class="px-1 py-1 font-medium text-gray-900">
                                ${nombreBodega(item.bodega)}
                            </td>
                            <td class="px-1 py-1 text-center text-gray-900 font-medium">
                                ${item.existencia}
                            </td>
                        </tr>
                    `;
                }
            });
            
            document.getElementById('inv').innerHTML += `
                <tr class="font-semibold text-gray-900  bg-white  border-b">
                    <th scope="row" class="px-1 py-1 text-base"></th>
                    <td class="px-1 py-1 text-right">TOTAL:</td>
                    <td class="px-1 py-1 text-center">${totalDisp}</td>
                </tr>
            `;
        })
        .catch((err) => {
            console.log(err);
        });
}

const imgTranparente = 'data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';

function pantallaCarga(){
    imagenP.src = imgTranparente;
    imagenP.classList.add("op-0");
    descripcion.innerText = "BUSCANDO...";
    precio.classList.add("flecha");
    info.classList.add('down');
    tabInv.classList.add('hidden');
    precio.innerHTML =  `
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="300" height="300" fill="none"><style>@keyframes loader4{0%{-webkit-transform:rotate(0);transform:rotate(0)}to{-webkit-transform:rotate(360deg);transform:rotate(360deg)}}</style><path stroke="#BA0F5A" stroke-linecap="round" stroke-width="1.5" d="M12 6.864v1.333m0 7.606v1.333M17.136 12h-1.333m-7.606 0H6.864m8.768 3.632l-.943-.943M9.311 9.311l-.943-.943m0 7.264l.943-.943m5.378-5.378l.943-.943" style="animation:loader4 1.5s linear infinite both;transform-origin:center center"/></svg>
    `;
}

let tiempo;
let retorno;
let espera;
input.addEventListener("change", () => {
    if(retorno) clearTimeout(retorno);
    if(espera) clearTimeout(espera);
    pantallaCarga();
    axios.get('/buscar/'+input.value)
    .then((result) => {
        input.value = "";
        tiempo = 60000;
        input.focus();
        referencia = result.data;
        console.log(referencia);
        if(Object.keys(referencia)[0] === "error"){
            tiempo = 7000;
            imagenP.src = imgTranparente;
            imagenP.classList.add("op-0");
            descripcion.innerText = "PRODUCTO NO ENCONTRADO";
            precio.classList.add("flecha");
            info.classList.add('down');
            tabInv.classList.add('hidden');
            precio.innerHTML =  `
                 <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="300" height="300" fill="none"><style>@keyframes sad{0%{stroke-dashoffset:0}to{stroke-dashoffset:200}}</style><circle cx="12" cy="12" r="7" stroke="#BA0F5A" stroke-width="1.5"/><circle cx="9" cy="10.277" r="1" fill="#BA0F5A"/><circle cx="15" cy="10.277" r="1" fill="#BA0F5A"/><path stroke="#317FBF" stroke-linecap="round" d="M15 15.25l-.049-.04A4.631 4.631 0 009 15.25" style="animation:sad 4s infinite linear" stroke-dasharray="100"/></svg>
            `;
        } else {
            tiempo = 60000;
            imagenP.src = "/static/img/ProductosRaiz/" + referencia.img;
            descripcion.innerText = referencia.descripcion;
            precio.classList.remove("flecha");
            precio.innerText = formatearMoneda(referencia.precioxunidad);
            info.classList.remove('down');
            codigo.innerText = referencia.referencia;
            precioculto.innerText = ocultaPrecio(referencia.precioxmayor);
            ue.innerText = referencia.ue;
            tabInv.classList.remove('hidden');
            imagenP.classList.remove("op-0");
            getInventario(referencia.referencia);
        }
    }).catch((err) => {
        console.log(err);
        tiempo = 20000;
        clearTimeout(espera);
        espera = setTimeout(() => {
            input.value = "";
            input.focus();
            imagenP.src = imgTranparente;
            imagenP.classList.add("op-0");
            descripcion.innerText = "TIEMPO DE ESPERA TERMINADO. INTENTELO NUEVAMENTE";
            precio.classList.add("flecha");
            tabInv.classList.add('hidden');
            precio.innerHTML =  `
                 <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="300" height="300" fill="none"><style>@keyframes rotate-center{0%{transform:rotate(0)}to{transform:rotate(360deg)}}</style><g style="animation:rotate-center 2s ease-in-out infinite both;transform-origin:center center" stroke-width="1.5"><path stroke="#BA0F5A" stroke-linecap="round" d="M15.473 8.41a5 5 0 10.939 5.952"/><path fill="#317FBF" stroke="#317FBF" d="M17.195 10.373l-2.308-.347a.065.065 0 01-.018-.005.023.023 0 01-.007-.005.056.056 0 01-.015-.024.056.056 0 01-.002-.03.03.03 0 01.002-.007.069.069 0 01.013-.015l1.995-1.964a.066.066 0 01.015-.012.027.027 0 01.007-.003.056.056 0 01.029.003c.012.004.02.01.024.015a.027.027 0 01.005.007.069.069 0 01.004.019l.313 2.312a.047.047 0 01-.002.023.053.053 0 01-.013.02.053.053 0 01-.02.012.046.046 0 01-.022.001z"/></g></svg>
            `;
            info.classList.add('down');
        }, 10000);
    });
    //playVideoAtIndex(index + 1);
    retorno = setTimeout(() => {
        input.value = "";
        input.focus();
        imagenP.src = imgTranparente;
        imagenP.classList.add("op-0");
        descripcion.innerText = "CONSULTA EL PRECIO AQUÍ";
        precio.classList.add("flecha");
        tabInv.classList.add('hidden');
        precio.innerHTML =  `
             <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" width="300" height="300" fill="none"><style>@keyframes flipping{0%{transform:rotate3d(1,1,0,0deg)}to{transform:rotate3d(1,1,0,180deg)}}</style><g style="animation:flipping 1.5s cubic-bezier(.96,-.2,0,1.29) both infinite alternate-reverse"><path fill="#BA0F5A" fill-rule="evenodd" d="M5.71 11.025a5.25 5.25 0 1010.5 0 5.25 5.25 0 00-10.5 0zm5.25-7a7 7 0 100 14 7 7 0 000-14z" clip-rule="evenodd"/><rect width="1.839" height="3.677" x="16.139" y="17.375" fill="#317FBF" rx=".2" transform="rotate(-45 16.14 17.375)"/></g></svg>
        `;
        info.classList.add('down');
    }, tiempo);
    input.value = "";
});

// Lista de URLs llamando url_for con Flask en jinja2
const videos = [
// "/static/videos/PromoPulguero.mp4",
// "/static/videos/PromoPulgueroFecha22Mayo2025.mp4",
"/static/videos/PromoPulguero31Mayo2025.mp4",
"/static/videos/PromoPulguero31Mayo2025.mp4",
"/static/videos/pulgueroAnuncio.mp4"
];
const videoElement = document.getElementById('vid');
let index = 0;
function playVideoAtIndex(i) {
    if (i >= videos.length) {
        index = 0; // Reiniciar secuencia, o comentar esta linea para parar
        // return; // Si prefieres parar, descomenta esta línea y comenta la línea de reinicio
    } else {
        index = i;
    }
    videoElement.src = videos[index];
    videoElement.play().catch((e) => {
        console.log("No se pudo reproducir: ", e);
    });
}
videoElement.addEventListener('ended', () => {
playVideoAtIndex(index + 1);
});
// Inicia la reproducción con el primer video
//playVideoAtIndex(0);