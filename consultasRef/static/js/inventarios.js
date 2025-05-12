tab = document.getElementById('listaInv');
let listaInventario = [];
let largo = 0;
const inpProveedores = document.getElementById('proveedores');
axios.get('/proveedores').then(proveedores => {
    pr = proveedores.data;
    console.log(pr);
    console.log("Proveedores cargados...");
    pr = pr.sort((a, b) => a.nombre.localeCompare(b.nombre));
    inpProveedores.innerHTML = '<option value="">TODOS</option>';
    pr.forEach(p => {
        inpProveedores.innerHTML += `
            <option value="${p.proveedor}">${p.nombre}</option>
        `;
    });
    console.log("Proveedores listados.");
}).catch((value) => {
    console.log(value);
    
});
const lineas = [{ Linea: 10, DESCRIPCION: "ALAMBRES" }, { Linea: 7, DESCRIPCION: "ALUMINIO Y FUNDIDO" }, { Linea: 15, DESCRIPCION: "BICICLETAS" }, { Linea: 24, DESCRIPCION: "DECORACION HOGAR" }, { Linea: 1, DESCRIPCION: "ELECTRODOMESTICOS MAYORES" }, { Linea: 2, DESCRIPCION: "ELECTRODOMESTICOS MENORES" }, { Linea: 4, DESCRIPCION: "ESCOLAR" }, { Linea: 17, DESCRIPCION: "HIERRO ALEADO Y FUNDIDO" }, { Linea: 18, DESCRIPCION: "HAMACAS Y TOALLAS" }, { Linea: 5, DESCRIPCION: "IMPORTADOS VARIOS" }, { Linea: 6, DESCRIPCION: "JUGUETERIA" }, { Linea: 21, DESCRIPCION: "JUGUETERIA IMPORTADA" }, { Linea: 9, DESCRIPCION: "LOCERIA" }, { Linea: 14, DESCRIPCION: "NACIONAL VARIOS" }, { Linea: 22, DESCRIPCION: "PIÑATERIA" }, { Linea: 3, DESCRIPCION: "PLASTICOS" }, { Linea: 8, DESCRIPCION: "CRISTALERIA" }, { Linea: 19, DESCRIPCION: "TELAS" }];
const inpLineas = document.getElementById('lineas');
const buscar = document.getElementById('buscar');
let pro;
let lin;
let ref;
const urlParams = new URLSearchParams(window.location.search);
const tp = urlParams.get('tp'); // "value1"

let waitExcel = document.getElementById('cargaExcel');
document.getElementById('excel').addEventListener('click', ()=>{
    if (tp == "@inv") location.href = `/descargar_excel?p=${inpProveedores.value}&s=&l=${inpLineas.value}&r=${buscar.value}&tp=${tp}`;
    else if (tp == "@all") location.href = `/descargar_excel?p=${inpProveedores.value}&s=&l=${inpLineas.value}&r=${buscar.value}&tp=${tp}`;
    else location.href = `/descargar_excel?p=${inpProveedores.value}&s=&l=${inpLineas.value}&r=${buscar.value}`;
})

const buscarDatos = (p, t) => {
    pro = inpProveedores.value;
    lin = inpLineas.value;
    ref = buscar.value;
    pagina = p;
    tam = t;  
    getListaInventarios(pro, "", lin, ref,tam, pagina);
};

let espera;

// inpProveedores.addEventListener('change', () => { buscarDatos(1, 50); });
// inpLineas.addEventListener('change', () => { buscarDatos(1, 50); });
buscar.addEventListener("keyup", () => {
    clearTimeout(espera);
    espera = setTimeout(() => {
        buscarDatos(1, 50);
    }, 750);
});

function cargarSelects(tipo, array){
    array.forEach(p => {
        let op = Object.values(p);
        tipo.innerHTML += `
            <option value="${op[0]}">${op[1]}</option>
        `;
    });
}

cargarSelects(inpLineas, lineas);

let fin = 0;
async function getListaInventarios(pro, sub, lin, ref, size, pag){
    cargar();
    await axios.get(`/inv-consultas?p=${pro}&s=${sub}&l=${lin}&r=${ref}&sz=${size}&pg=${pag}`)
    .then((value) => {
        listaInventario = value.data.lista;
        largo = value.data.cantidad;
        let i = (pag-1) * size;
        fin = Number(size) + i;
        if (fin >= largo) fin = largo;
        if (i == 0) i = 1
        document.getElementById('rango').innerText =  `${i} - ${fin}`;
        document.getElementById('total').innerText = ""+value.data.cantidad;
        console.log(listaInventario);
        listarInv(listaInventario);
    })
    .catch((err) => {
        alert("Error: "+ err);
    })
}

let pagina = 1;
let tam = 50;

document.getElementById("previo").addEventListener("click", () => {
    if (pagina > 1) {
        pagina--;
        buscarDatos(pagina, tam);
    }
});
document.getElementById("siguiente").addEventListener("click", () => {
    console.log(largo);
    if ((pagina*tam) <= largo) {
        pagina++;
        buscarDatos(pagina, tam);
    }
});

const cargador = document.getElementById('cargando');
function cargar() {
    tab.innerHTML = "";
    cargador.classList.remove('hidden');
}

function formatearMoneda(valor) {
    if(valor!=null){
        let formato = valor.toLocaleString('es-CO', { maximumFractionDigits: 0 });
        let result = formato.replace(/,/g, '.');
        return `$ ${result}`;
    } else {
        return 'NaN, verificar.'
    }
}

function formatoFecha(fecha) {
    if (typeof fecha === 'string') {
        const parsedFecha = new Date(fecha); 
        
        if (isNaN(parsedFecha.getTime())) {
        return 'Fecha inválida';
        }

        const meses = [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
        'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
        ];

        const dia = parsedFecha.getUTCDate();
        const mes = meses[parsedFecha.getUTCMonth()];
        const año = parsedFecha.getUTCFullYear();

        return `${mes} ${dia} ${año}`;
    } else if (fecha == undefined) {
        return `
            <span class="inline-flex items-center bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                <span class="w-2 h-2 me-1 bg-yellow-500 rounded-full"></span>
                Sin ingreso
            </span>
        `;
    }
}

let head = `
    <tr>
        <th scope="col" data-key="codigo" class="px-6 py-3 text-center">Código</th>
        <th scope="col" data-key="desc" style="width: 45em;" class="px-6 py-3 text-center text-ellipsis overflow-hidden whitespace-nowrap">Descripción</th>


`;

if(tp=="@inv"){
    head += `
        <th scope="col" data-key="ue" class="px-6 py-3 text-center">U/E</th>
        <th scope="col" data-key="bd1" class="px-6 py-3 text-center">BD 01</th>
        <th scope="col" data-key="bd2" class="px-6 py-3 text-center">BD 02</th>
        <th scope="col" data-key="bd20" class="px-6 py-3 text-center">BD 20</th>
        </tr>
    `;
} else {
    head += `
            <th scope="col" data-key="bd1" class="px-6 py-3 text-center">BD 01</th>
            <th scope="col" data-key="bd2" class="px-6 py-3 text-center">BD 02</th>
            <th scope="col" data-key="bd20" class="px-6 py-3 text-center">BD 20</th>
            <th scope="col" data-key="dsto" class="px-6 py-3 text-center">Dsto</th>
            <th scope="col" data-key="costo" class="w-40 px-6 py-3 text-center">Costo</th>
            <th scope="col" data-key="pxm" class="w-40 px-6 py-3 text-center">P. mayor</th>                
            <th scope="col" data-key="pxu" class="w-40 px-6 py-3 text-center">P. unidad</th>
            <th scope="col" data-key="rpxm" class="px-6 py-3 text-center">Renta P. mayor</th>
            <th scope="col" data-key="rpxu" class="px-6 py-3 text-center">Renta P. unidad</th>
            <th scope="col" data-key="fuc" class="px-6 py-3 whitespace-nowrap text-center">Fecha Ult. Compra</th>
        </tr>
    `;
}

document.getElementById("hdInv").innerHTML = head;


function listarInv(lista) {
    tab.innerHTML = "";
    let fila = "";
    if(lista.length > 0)
        lista.forEach((value) => {
            fila = `<tr class="bg-white border-b hover:bg-gray-50">
                        <th scope="row" class="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">
                                ${value.referencia}
                            </th>
                            <td class=" px-6 py-4 font-semibold">
                                ${value.descripcion}
                            </td>          
                `;
            if (tp=="@inv"){
                fila += `
                        <td class="px-6 py-4 text-center font-semibold">
                            ${value.ue}
                        </td>
                        <td class="px-6 py-4 text-center font-semibold">
                            ${value.bd1}
                        </td>
                        <td class="px-6 py-4 text-center font-semibold">
                            ${value.bd2}
                        </td>
                        <td class="px-6 py-4 text-center font-semibold">
                            ${value.bd20}
                        </td>
                    </tr>
                `;
            }
            else{
                fila += `
                        <td class="px-6 py-4 text-center font-semibold">
                            ${value.bd1}
                        </td>
                        <td class="px-6 py-4 text-center font-semibold">
                            ${value.bd2}
                        </td>
                        <td class="px-6 py-4 text-center font-semibold">
                            ${value.bd20}
                        </td>
                        <td class="px-6 py-4 text-center font-semibold">
                            ${value.descuento}%
                        </td>
                        <td class="px-6 py-4 text-center font-semibold">
                            ${formatearMoneda(value.costo)}
                        </td>
                        <td class="px-6 py-4 text-center font-semibold">
                            ${formatearMoneda(value.precioxmayor)}
                        </td>
                        <td class="px-6 py-4 text-center font-semibold">
                            ${formatearMoneda(value.precioxunidad)}
                        </td>
                        <td class="px-6 py-4 text-center font-semibold">
                            ${Number(100*(1-(value.costo/value.precioxmayor))).toFixed(2)}%
                        </td>
                        <td class="px-6 py-4 text-center font-semibold">
                            ${Number(100*(1-(value.costo/value.precioxunidad))).toFixed(2)}%
                        </td>
                        <td class="px-6 py-4 text-center font-semibold">
                            ${formatoFecha(value.fechacompra)}
                        </td>

                    </tr>
                `;
            }

            tab.innerHTML += fila;
        });
    else tab.innerHTML = `
        <tr colspan="12" class="text-center">
            <td colspan="12" class="text-center"><span class="font-medium text-md">Inventario no encontrado.</span></td>
        </tr>
    `;
    cargador.classList.add('hidden');
}

getListaInventarios("", "", "", "", tam, pagina);
