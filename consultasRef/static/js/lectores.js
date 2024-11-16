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

input.addEventListener("change", () => {
    let tiempo;
    let retorno;
    clearTimeout(retorno);
    axios.get('/buscar/'+input.value)
    .then(async (result) => {
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
            tabInv.classList.add('hidden');
            precio.innerHTML =  `
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="280px" height="280px"  fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m15 9-6 6m0-6 6 6m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                </svg>
            `;
        } else {
            tiempo = 60000;
            imagenP.src = "/static/img/ProductosRaiz/" + referencia.img;
            imagenP.classList.remove("op-0");
            descripcion.innerText = referencia.descripcion;
            precio.classList.remove("flecha");
            precio.innerText = formatearMoneda(referencia.precioxunidad);
            info.classList.remove('down');
            codigo.innerText = referencia.referencia;
            precioculto.innerText = ocultaPrecio(referencia.precioxmayor);
            ue.innerText = referencia.ue;
            tabInv.classList.remove('hidden');
            await getInventario(referencia.referencia);
        }
        retorno = setTimeout(() => {
            input.value = "";
            input.focus();
            imagenP.classList.add("op-0");
            descripcion.innerText = "CONSULTA EL PRECIO AQUÍ";
            precio.classList.add("flecha");
            tabInv.classList.add('hidden');
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