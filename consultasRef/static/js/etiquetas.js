let buscador = document.getElementById('busqRef');
let tabBody = document.getElementById('respBus');
let tabEtiq = document.getElementById('listaE');
var listaRef = [];
let refreco;

function msgTabla(tabla, txt) {
    tabla.innerHTML = `
    <tr>
    <td class="px-6 py-4"></td>
    <td class="px-6 py-4"></td>
    <td class="px-6 py-4">
        <div class="flex items-center justify-center w-full">
            ${txt}
        </div>
    </td>
    <td class="px-6 py-4"></td>
    <td class="px-6 py-4"></td>
    <td class="px-6 py-4"></td>
    </tr>
    `;
}

buscador.addEventListener('keyup',() => {
    if (buscador.value != "") {
        msgTabla(tabBody, `
            <div role="status">
                <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/></svg>
                <span class="sr-only">Loading...</span>
            </div>`);
        clearTimeout(refreco);
        refreco = setTimeout(() => {
            axios.get('/buscador?search='+buscador.value)
            .then((result) => {
                let refs = result.data;
                console.log(result.data);
                if (refs.length>0) {
                    listarProductos(refs);
                } else {
                    msgTabla(tabBody, 'Producto no encontrado.')
                }
            }).catch((err) => {
                msgTabla(tabBody, 'Producto no encontrado.')
                console.log("Ocurrio un error: \n"+ err);
            });
        }, 500);
    }    
})

function formatearMoneda(valor) {
    if(valor!=null){
        let formato = valor.toLocaleString('es-CO', { maximumFractionDigits: 0 });
        let result = formato.replace(/,/g, '.');
        return `$ ${result}`;
    } else {
        return 'NaN, verificar.'
    }
}

function ocultaPrecio(valor) {
    let valorInv = valor.toString().split('').reverse().join('');
    return `${valorInv.slice(0, 2)}1P${valorInv.slice(2)}0P`;
}

function existe(cod) {
    for (const i in listaRef) {
        if (listaRef[i].codigo === cod) {
            return i;
        }
    }
    return -1;
}

function agregarRef(desc, cod, ref, pre, dsto, precioDsto) {
    let cant = document.getElementById('nt-'+cod).value;
    if (cant<=0) cant = 0;
    
    const inicio = cod.slice(0, 3);
    const medio = cod.slice(3, -3); 
    const final = cod.slice(-3);    

    codigo = `${inicio} ${medio} ${final}`;
    let i = existe(codigo);
    if(i==-1||listaRef.length==0){
        dato = {
            "descripcion": desc.trimEnd(),
            "codigo": codigo,
            "ref": ref,
            "precio": pre,
            "cantidad": Number(cant),
            "descuento": dsto,
            "precioDsto": precioDsto
        }
        listaRef.push(dato);
    } else {
        listaRef[i].cantidad += Number(cant);
    }
    console.log(listaRef);
    document.getElementById('nt-'+cod).value = "";
    listarEtiquetas();
}

function listarEtiquetas() {
    tabEtiq.innerHTML = "";
    if(listaRef.length>0)
    listaRef.forEach((r, i) => {
        tabEtiq.innerHTML += `
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <th scope="row" class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                    <div class="ps-3">
                        <div class="text-base font-semibold">${r.codigo}</div>
                        <div class="font-normal text-gray-500">${r.descripcion.trimEnd()}</div>
                    </div>  
                </th>
                <td class="px-6 text-center py-4">
                    ${r.cantidad}
                </td>
                <td class="px-2 text-center py-2">
                    <a href="#" onclick="eliminar(${i})" class="text-red-500 hover:bg-red-200  font-medium rounded-full text-sm p-2 text-center inline-flex items-center text-sm" >
                    <svg class="w-4 h-4 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                        <path fill-rule="evenodd" d="M8.586 2.586A2 2 0 0 1 10 2h4a2 2 0 0 1 2 2v2h3a1 1 0 1 1 0 2v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8a1 1 0 0 1 0-2h3V4a2 2 0 0 1 .586-1.414ZM10 6h4V4h-4v2Zm1 4a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Zm4 0a1 1 0 1 0-2 0v8a1 1 0 1 0 2 0v-8Z" clip-rule="evenodd"/>
                    </svg>
                    </a>
                </td>
                <td>
                    <a href="#" onclick="borrar(${i})" class="text-gray-500 hover:bg-gray-200 font-medium rounded-full text-sm p-2 text-center inline-flex items-center text-sm" >
                        <svg class="w-4 h-4" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18 17.94 6M18 18 6.06 6"/>
                        </svg>
                    </a>
                </td>
            </tr>
        `;
    });
    else tabEtiq.innerHTML = "<tr><td></td><td>Lista vacia</td><td></td><td></td></tr>";
}



function copiarCodigo(cod) {
    let def = document.getElementById("copy-"+cod);
    let check = document.getElementById("check-"+cod);
    navigator.clipboard.writeText(cod).then(function() {
        def.classList.add("hidden");
        check.classList.remove("hidden");
        setTimeout(() => {
            def.classList.remove("hidden");
            check.classList.add("hidden");
        }, 2000);
    }, function(err) {
        console.error('Error al copiar el código: ', err);
    });
}


function listarProductos(lista) {
    tabBody.innerHTML = "";
    lista.forEach(ref => {
        let cod = ref.referencia;
        let desc = ref.descripcion;
        let may = ocultaPrecio(ref.precioxmayor);
        let pre = formatearMoneda(ref.precioxunidad);
        let dsto = (ref.descuento/100);
        let precioDsto = "";
        let precioMDsto = "";
        if(ref.descuento>0) {
            precioDsto= formatearMoneda(ref.precioxunidad-(ref.precioxunidad*(ref.descuento/100)));
            precioMDsto = formatearMoneda(ref.precioxmayor-(ref.precioxmayor*(ref.descuento/100)));
        } else {
            precioDsto = "Sin descuento";
            precioMDsto = "Sin descuento";
        }
        
        tabBody.innerHTML += `
            <tr class="bg-white border-b hover:bg-gray-50">
                <th scope="row" class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap">
                    <div class="ps-3">
                        <div class="flex gap-3">
                            <div id="${cod}" class="text-base font-semibold select-none">${cod}</div>
                            <button onclick="copiarCodigo('${cod}')" class=" bg-gray-100 hover:bg-gray-200 text-sm text-gray-700 px-1 rounded">
                                <span id="copy-${cod}" class="inline-flex items-center" title="Copiar">
                                    <svg class="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 18 20">
                                        <path d="M16 1h-3.278A1.992 1.992 0 0 0 11 0H7a1.993 1.993 0 0 0-1.722 1H2a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2Zm-3 14H5a1 1 0 0 1 0-2h8a1 1 0 0 1 0 2Zm0-4H5a1 1 0 0 1 0-2h8a1 1 0 1 1 0 2Zm0-5H5a1 1 0 0 1 0-2h2V2h4v2h2a1 1 0 1 1 0 2Z"/>
                                    </svg>
                                </span>
                                <span id="check-${cod}" class="hidden inline-flex items-center" title="Copiado!">
                                    <svg class="w-3 h-3 text-blue-700 dark:text-blue-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 16 12">
                                        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M1 5.917 5.724 10.5 15 1.5"/>
                                    </svg>
                                </span>
                            </button>
                        </div>
                        <div class="font-normal text-gray-500 select-none">${ref.codBarras}</div>
                    </div>  
                </th>
                <td class="px-6 py-4 select-none">
                    ${desc}
                </td>
                <td class="px-6 py-4 cursor-help select-none" title="Mayor: (${formatearMoneda(ref.precioxmayor)} - ${ref.descuento}%) --> ${precioMDsto}">
                    ${may}
                </td>
                <td class="px-6 py-4 cursor-help select-none" title="Unidad: ${ref.descuento}% --> ${precioDsto}">
                    ${pre}
                </td>
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <div>
                            <input type="number" id="nt-${cod}" min=0 onchange="document.getElementById('btn-${cod}').click();" max=100 class="bg-gray-50 w-18 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block" placeholder="0" required />
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">
                    <a  id="btn-${cod}" href="#" type="button" onclick="agregarRef('${desc}', '${cod}', '${may}', '${pre}', '${dsto}', '${precioDsto}')" class="text-blue-700 hover:bg-blue-200 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-full text-sm p-2 text-center inline-flex items-center dark:border-blue-500 dark:text-blue-500 dark:hover:text-white dark:focus:ring-blue-800 dark:hover:bg-blue-500">
                        <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                            <path fill-rule="evenodd" d="M8 7V2.221a2 2 0 0 0-.5.365L3.586 6.5a2 2 0 0 0-.365.5H8Zm2 0V2h7a2 2 0 0 1 2 2v.126a5.087 5.087 0 0 0-4.74 1.368v.001l-6.642 6.642a3 3 0 0 0-.82 1.532l-.74 3.692a3 3 0 0 0 3.53 3.53l3.694-.738a3 3 0 0 0 1.532-.82L19 15.149V20a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9h5a2 2 0 0 0 2-2Z" clip-rule="evenodd"/>
                            <path fill-rule="evenodd" d="M17.447 8.08a1.087 1.087 0 0 1 1.187.238l.002.001a1.088 1.088 0 0 1 0 1.539l-.377.377-1.54-1.542.373-.374.002-.001c.1-.102.22-.182.353-.237Zm-2.143 2.027-4.644 4.644-.385 1.924 1.925-.385 4.644-4.642-1.54-1.54Zm2.56-4.11a3.087 3.087 0 0 0-2.187.909l-6.645 6.645a1 1 0 0 0-.274.51l-.739 3.693a1 1 0 0 0 1.177 1.176l3.693-.738a1 1 0 0 0 .51-.274l6.65-6.646a3.088 3.088 0 0 0-2.185-5.275Z" clip-rule="evenodd"/>
                        </svg>
                        Agregar
                    </a>
                </td>
            </tr>
        `;
    });
}

function limpiarLista() {
    listaRef = [];
    tabEtiq.innerHTML = "";
}

function eliminar(i) {
    listaRef[i].cantidad -= 1;
    if(listaRef[i].cantidad<1) listaRef.splice(i,1);
    listarEtiquetas();
}

function borrar(i) {
    listaRef.splice(i, 1);
    listarEtiquetas();
}


function mandarLista() {
    if(listaRef.length>0){
        axios.post('/guardarLista', listaRef)
        .then(resp => {
            limpiarLista();
            Swal.fire({
                title: "¡Cargadas Correctamente!",
                text: "Actualiza la aplicación de etiquetas",
                icon: "success",
                showConfirmButton: false,
                showCloseButton: true,
                timer: 30000
            });
        })
        .catch(err => {
            Swal.fire({
                icon: "error",
                title: "Ocurrió un error",
                text: "Contacte con sistemas, error: "+err,
                showConfirmButton: false,
                showCloseButton: true
            });
        })
    } else {
        Swal.fire({
            icon: "error",
            title: "Lista vacía",
            text: "Debes agregar productos para poder actualizar",
            showConfirmButton: false,
            showCloseButton: true
        });
    }
    
}