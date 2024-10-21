const startCameraButton = document.getElementById('start-camera');
const scannerContainer = document.getElementById('scanner-container');
const scannerBeep = document.getElementById('scanner-beep'); // Referencia al sonido
const buscaRef = document.getElementById('busqRef');
const resultado = document.getElementById('resultado');
const lista = document.getElementById("lista");
const tablaB = document.getElementById("tablaB");
let reposo;
let listaProductos = [];

window.onload = buscaRef.focus();

function formatearMoneda(valor) {
    if(valor!=null){
        let formato = valor.toLocaleString('es-CO', { maximumFractionDigits: 0 });
        let result = formato.replace(/,/g, '.');
        return `$ ${result}`;
    } else {
        return 'NaN, verificar.'
    }
}

async function listarProductos(){
    resultado.classList.add("hidden");
    tablaB.classList.remove('hidden');
    let filas = "";
    lista.innerHTML = ``;
    listaProductos.forEach((value, i) => {
        console.log(value.img);
        
        filas += `
            <tr class="bg-white border-b hover:bg-gray-50 cursor-pointer" onclick="mostrarInfo(${i})">
                <td class="p-4">
                    <img class="w-16 md:w-32 max-w-full max-h-full" alt="Imagen no encontrada" src="static/img/ProductosRaiz/${value.referencia}.jpg" onerror="this.onerror=null; this.src='/static/img/ProductosRaiz/noimage.jpg';">
                </td>
                <td class="px-6 py-4 font-semibold text-gray-900">
                    <div class="ps-3">
                        <div class="text-base font-semibold">${value.descripcion}</div>
                        <div class="font-normal text-gray-500">${value.referencia}</div>
                    </div>
                </td>
            </tr>
        `;
    });
    lista.innerHTML = filas;
}

function cartaReferencia(obj) {
    tablaB.classList.add('hidden');
    resultado.classList.remove('hidden');
    let descuento = formatearMoneda(obj.precioxunidad - obj.precioxunidad*(obj.descuento/100))
    let descuentoM = formatearMoneda(obj.precioxmayor - obj.precioxmayor*(obj.descuento/100))
    resultado.innerHTML = `
        <div class="flex flex-col p-4 justify-center w-full max-w-sm bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
            <a href="#" class="flex justify-center items-center">
                <img id="img" class="p-8 rounded-t-lg" width="240" src="static/img/ProductosRaiz/${obj.referencia}.jpg" onerror="this.src='static/img/ProductosRaiz/noimage.jpg';"/>
            </a>
            <div class="px-3 pb-3">
                
                <h5 class="text-xl text-center mb-4 font-bold tracking-tight text-gray-900 dark:text-white" id="descripcion">${obj.descripcion}</h5>
                <div class="my-2 flex justify-between items-center gap-2">
                    <kbd class="px-4 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">Código ${obj.referencia}</kbd>
                    <kbd class="px-4 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg">CodBarras ${obj.codBarras}</kbd>
                    <kbd class="px-4 py-1.5 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg text-center">U.E ${obj.ue}</kbd>
                </div>
                <div class="flex flex-col gap-4 my-4">
                    <div class="grid grid-cols-2">
                        <p class="flex flex-col col-span-1 gap-2 items-center">
                            <span class="text-sm font-bold text-gray-900 dark:text-white">Precio mayor</span>
                            <span class="text-xl font-semibold text-gray-900 dark:text-white" id="precioM">${formatearMoneda(obj.precioxmayor)}</span>
                            <kbd class="px-4 mx-4 py-1 text-xs font-semibold text-green-800 bg-green-100 border border-green-200 rounded-lg text-center">${descuentoM}</kbd>
                        </p>
                        <p class="flex flex-col col-span-1 gap-2 items-center">
                            <span class="text-sm font-bold text-gray-900 dark:text-white">Precio unidad</span>
                            <span class="text-xl font-semibold text-gray-900 dark:text-white" id="precio">${formatearMoneda(obj.precioxunidad)}</span>
                            <kbd class="px-4 mx-4 py-1 text-xs font-semibold text-green-800 bg-green-100 border border-green-200 rounded-lg text-center">${descuento}</kbd>
                        </p>
                    </div>
                    <p class="flex flex-col gap-2 items-center justify-center">
                        <span class="text-sm font-bold text-gray-900">Dsto</span>
                        <kbd class="text-xl px-4 mx-4 py-1 font-semibold text-red-900 bg-red-100 border border-red-200 rounded-lg text-center" id="ue">${obj.descuento}%</kbd>
                    </p>
                    
                </div>
            </div>
            <button type="button" onclick="listarProductos()" class="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-4 py-2 text-center me-2">VOLVER</button>
        </div>
    `;
}

function mostrarInfo(i){
    obj = listaProductos[i];
    cartaReferencia(obj);
}

buscaRef.addEventListener('keyup', () => {
    let ref = buscaRef.value;
    if(ref!=""){
        lista.innerHTML = `
            <tr class="flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50 overflow-none">
                <td class="py-2 px-4">
                    <div role="status">
                        <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
                        <span class="sr-only">Loading...</span>
                    </div>
                </td>
            </tr>
        `;
        clearTimeout(reposo);
        setTimeout(() => {
            axios.get('/buscador?search='+ref)
            .then( resp => {
                listaProductos = resp.data;
                listarProductos();
            })
            .catch(err =>{
                resultado.innerHTML = err;
            })
        }, 500);
    }
});



/*  FUNCIONES SCANNER CÓDIGO DE BARRAS  */
startCameraButton.addEventListener('click', () => {
    scannerContainer.classList.remove("hidden");
    Quagga.init({
        inputStream: {
            name: "Live",
            type: "LiveStream",
            target: scannerContainer, // Elemento donde se mostrará el video de la cámara
            constraints: {
                width: 250,
                height: 360,
                facingMode: "environment" // Usa la cámara trasera en dispositivos móviles
            }
        },
        decoder: {
            readers: [
                // "code_128_reader",      // Code 128
                "ean_reader",           // EAN-13
                // "ean_8_reader",         // EAN-8
                // "code_39_reader",       // Code 39
                // "code_39_vin_reader",   // VIN
                // "upc_reader",           // UPC-A
                // "upc_e_reader",         // UPC-E
                // "i2of5_reader",         // Interleaved 2 of 5
                // "2of5_reader",          // Standard 2 of 5
                // "codabar_reader"        // Codabar
            ]
        }
    }, function (err) {
        if (err) {
            console.error(err);
            alert('Error al iniciar QuaggaJS. Por favor, verifica los permisos y la configuración.');
            return;
        }
        console.log("QuaggaJS inicializado correctamente");
        Quagga.start();
    });

    let reposo;            
    Quagga.onDetected(function (result) {
        const code = result.codeResult.code;
        clearTimeout(reposo);
        reposo = setTimeout(() => {
            axios.get('/buscador?search='+code)
            .then((result) => {
                console.log(result.data);
                if(result.data.length > 0){
                    scannerBeep.play();
                    cartaReferencia(result.data[0]);
                } else {
                    document.getElementById('resultado').innerHTML = code;
                }
            }).catch((err) => {
                document.getElementById('resultado').innerHTML = err;
            });
        }, 200);
        
        // Aquí puedes realizar alguna acción con el código detectado, como enviarlo a tu servidor
    });
});