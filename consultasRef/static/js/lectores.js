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

async function getInventario(ref) {
    document.getElementById('inv').innerHTML = "";
    if(ref!="")
        axios.get(`/inventario?r=${ref}`)
        .then((value) => {
            let resp = value.data;
            let totalDisp = 0;
            resp.forEach((item) => {
                bd = [1, 2, 20];
                if (bd.includes(item.bodega, 0)) {
                    totalDisp += item.existencia;
                    document.getElementById('inv').innerHTML += `
                        <tr class="bg-white border-b">
                            <th scope="row" class="px-1 py-1 text-center font-medium text-gray-900 whitespace-nowrap" >
                                ${item.bodega}
                            </th>
                            <td class="px-1 py-1 font-medium">
                                ${nombreBodega(item.bodega)}
                            </td>
                            <td class="px-1 py-1 text-center font-medium">
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