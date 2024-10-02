let buscador = document.getElementById('busqueda');
let tabBody = document.getElementById('tabBody')

let reposo;

buscador.addEventListener('keyup', () => {
    if(buscador.value!=""){
        clearTimeout(reposo);
        reposo = setTimeout(() => {
            axios.get('/buscador?search='+buscador.value)
            .then((result) => {
                let refs = result.data;
                if(refs.length>0){
                    listarProductos(refs);
                }
            }).catch((err) => {
                alert("Ocurrio un error: \n"+ err);
            }); 
        }, 500);
    }
})


function formatearMoneda(valor) {
    let formato = valor.toLocaleString('es-CO', { maximumFractionDigits: 0 });
    let result = formato.replace(/,/g, '.');
    return `$ ${result}`;
}

function formato(event) {
    let input = event.target;
    let valor = input.value;
    valor = valor.replace(/\D/g, '');
    let resultado;
    if(valor!=""){
        resultado = parseInt(valor);
    } else {
        resultado = 0;
    }
    input.value = formatearMoneda(resultado);
}


function editarPrecio(ref) {
    let des = document.getElementById('des-'+ref).value;
    let pxm = parseInt(document.getElementById('pxm-'+ref).value.replace(/\D/g, ''));
    let pxu = parseInt(document.getElementById('pxu-'+ref).value.replace(/\D/g, ''));
    let precios = {
        "descripcion": des,
        "precioxmayor": pxm,
        "precioxunidad": pxu
    };
    Swal.fire({
        title: `¿Seguro de actualizar la referencia ${ref}?`,
        icon: 'question',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        denyButtonColor: "#d33",
        cancelButtonColor: "#aaa",
        confirmButtonText: "Sí",
        denyButtonText: `No`,
        cancelButtonText: 'Cancelar'
      }).then((result) => {
        if (result.isConfirmed) {
            axios.post('/editar/'+ref, precios)
            .then(resp => {
                console.log(resp.data);
                Swal.fire("¡Referencia actualizada!", "", "success");
            })
            .catch(err => {
                Swal.fire("Algo salió mal", "error: "+err, "error");
            });
          
        } else if (result.isDenied) {
          Swal.fire("No se actualizó la referencia", "", "info");
        }
      });
}

function listarProductos(lista) {
    tabBody.innerHTML = "";
    lista.forEach(ref => {
        tabBody.innerHTML += `
            <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                <th scope="row" class="flex items-center px-6 py-4 text-gray-900 whitespace-nowrap dark:text-white">
                    <div class="ps-3">
                        <div class="text-base font-semibold">${ref.referencia}</div>
                    </div>  
                </th>
                <td class="px-6 py-4">
                    <input type="text" id="des-${ref.referencia}"  value="${ref.descripcion}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Descripcion" required />
                </td>
                <td class="px-6 py-4">
                    <div>
                        <input type="text" id="pxm-${ref.referencia}" onkeyup="formato(event)" value="${formatearMoneda(ref.precioxmayor)}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="$ 0" required />
                    </div>
                </td>
                <td class="px-6 py-4">
                    <div>
                        <input type="text" id="pxu-${ref.referencia}" onkeyup="formato(event)" value="${formatearMoneda(ref.precioxunidad)}" class="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="$ 0" required />
                    </div>
                </td>
                <td class="px-6 py-4">
                    <a href="#" onclick="editarPrecio(${ref.referencia})" class="font-medium text-blue-600 dark:text-blue-500 hover:underline">Guardar</a>
                </td>
            </tr>
        `;
    });
}