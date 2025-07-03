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
const subgrupos = [["100","EVENTOS Y PUBLICIDAD"],["101","LAVADORAS"],["102","CONGELADORES"],["103","NEVERAS"],["104","ESTUFAS  GHAMA ALTA"],["105","AIRES ACONDICIONADOS"],["106","TELEVISORES"],["107","EQUIPOS DE SONIDO"],["108","DVD´S Y GRABADORAS"],["110","DISPENSADORES"],["111","CAMPANAS EXTRACTORAS"],["201","PICATODO"],["202","CAFETERAS"],["203","HORNOS"],["204","SANDUCHERAS"],["205","SONIDO"],["206","ESTUFA SENCILLA"],["208","N/A"],["209","N/A"],["210","LICUADORAS"],["211","PLANCHAS"],["212","VENTILADORES"],["219","PROCESADOR"],["220","OLLA  ARROCERA"],["221","ELECTRODOMESTICOS VARIOS"],["222","EXPRIMIDOR Y EXTRACTOR"],["301","SILLAS"],["302","TANQUES"],["303","BALDES"],["304","PONCHERAS"],["305","PORTACOMIDAS"],["306","ARTICULOS COCINA PLASTICOS"],["307","BUTACOS"],["308","BANDEJAS"],["309","BAÑERAS"],["310","CEPILLOS"],["311","CAJAS HERRAMIENTAS"],["312","CAJAS ORGANIZADORAS"],["313","JARRAS"],["314","SALSEROS"],["315","RECIPIENTES"],["316","TAZONES"],["317","PAPELERAS Y BASUREROS"],["318","N/A"],["319","VASOS PLASTICOS"],["320","CESTAS"],["321","CUBIERTEROS"],["322","ORGANIZADORES DE BAÑOS"],["323","ENSALADERAS"],["324","PLASTICOS VARIOS"],["325","MESAS"],["326","BOTELLONES Y GARRAFAS"],["327","PLATOS PLASTICOS"],["329","LONCHERAS"],["330","ESTANTES Y MUEBLES"],["331","N/A"],["332","POCILLOS PLASTICOS"],["333","N/A"],["334","N/A"],["336","CANASTAS"],["337","BOTELLAS Y BOTILITOS"],["338","N/A"],["339","THERMOS"],["341","CAJONERO"],["344","ALCANCIAS"],["345","N/A"],["346","ATOMIZADORES"],["347","ARTICULOS DE ASEO"],["348","VASO DE NOCHE"],["352","COLADORES"],["353","PORTAVAJILLAS"],["354","TABLAS DE CORTAR O PICAR"],["355","GANCHOS DE ROPA"],["356","RALLADORES GENERAL"],["357","PESEBRES"],["358","ESCURRIDORES PLASTICO"],["359","TAZAS"],["360","MATERAS"],["361","ARMARIOS"],["362","NEVERAS Y TERMOS PARA FRIO"],["363","TETEROS"],["401","CUADERNOS"],["402","BOLSOS ESCOLARES"],["403","BLOCK'S"],["404","LAPICEROS"],["405","CARPETAS ESCOLARES"],["408","CUADERNO COSIDO"],["409","CUADERNO ARGOLLADO"],["410","CUADERNO EMPASTADO"],["411","CUADERNO GRAPADO"],["412","COLORES"],["413","LAPICES"],["417","N/A"],["418","AGENDAS"],["420","MARCADORES"],["422","CUENTOS"],["423","CARTON PAJA"],["424","SOBRES"],["425","VINILOS Y TEMPERAS"],["426","DICCIONARIOS"],["427","PLASTILINAS"],["428","ESCALERAS"],["429","N/A"],["430","N/A"],["431","SACAPUNTAS"],["432","ESCUADRAS Y TRANSPORTADORES"],["433","JUEGO GEOMETRICO"],["434","REGLAS"],["435","ESCOLAR VARIOS"],["437","PAPELES Y CARTULINAS"],["438","CARTUCHERAS"],["439","CUAD.COS DESC"],["440","CUAD.GRAP DESC"],["441","CUAD.D-BOOK DESC"],["442","CUAD.EMPAST DESC"],["443","CUAD.ARG DESC"],["444","BORRADORES"],["445","ABACOS"],["446","IMPLEMENTOS DE OFICINA"],["501","PLATO BANDEJA Y CHOCHA MELAMIN"],["505","VASO MELAMINA"],["506","POCILLO MELAMINA"],["509","IMPORTADOS VARIOS"],["513","JARROS"],["517","PLATO BANDEJA Y CHOCHA MELAFOR"],["519","BOLSAS  Y BOLSOS"],["521","SOMBRILLAS"],["522","HALLOWEEN"],["524","FLORES"],["525","BOLSAS DE REGALO"],["526","RELOJES"],["527","ARTICULOS DE BEBES"],["601","MUÑECAS"],["602","CARROS"],["603","BALONES"],["604","INSTRUMENTOS MUSICALES NAC"],["605","MONTABLES"],["606","VAJILLAS INFANTILES"],["607","JUEGOS DIDACTICOS"],["608","VARIOS JUGUETERIA"],["701","JUEGO DE OLLAS"],["702","N/A"],["703","N/A"],["704","CALDEROS FUNDIDOS"],["705","CHOCOLATERAS"],["706","CUCHILLOS"],["707","OLLA A PRESION"],["708","N/A"],["711","SARTENES CACEROLAS Y PAILAS"],["712","OLLAS INDIVIDUALES"],["717","CALDEROS INDUSTRIALES"],["718","VARIOS ALUMINIO"],["721","LECHERAS"],["722","BATERIAS DE COCINA"],["801","COPAS"],["802","REFRACTARIA"],["803","FRASCOS CRISTALERIA"],["804","N/A"],["805","LICORERAS"],["806","SET'S Y ESTUCHES"],["808","VASOS CRISTAL"],["809","VARIOS CRISTALERIA"],["811","N/A"],["812","ACUARIOS FLOREROS Y JARRONES"],["813","N/A"],["814","N/A"],["816","PLATO BANDEJA Y CHOCHA CRISTAL"],["901","VAJILLAS DE LOZA"],["902","PLATO BANDEJA Y CHOCHA LOZA"],["903","TAZAS DE LOZA"],["904","POCILLOS DE LOZA"],["905","LOZA VARIOS"],["906","MUGS LOZA"],["907","N/A"],["908","N/A"],["1001","ESCURRIDORES ALAMBRE"],["1002","CLOSET'S"],["1007","VARIOS ALAMBRE"],["1201","COLCHONES"],["1202","COLCHONETAS"],["1203","MUEBLES"],["1301","NEVERAS DE ICOPOR"],["1400","N/A"],["1401","CINTAS"],["1402","TUBITO DE FIBRAS"],["1403","BOMBILLOS"],["1404","CEPILLOS DENTALES"],["1405","GLOBOS DE FIESTA"],["1406","REPUESTOS"],["1407","GASEOSAS Y REFRESCOS"],["1408","N/A"],["1409","N/A"],["1410","BOMBAS  ROCIAR"],["1415","COJINES"],["1417","TABLA DE PICADO"],["1418","REGULADORES"],["1420","GEL´S"],["1421","ARTICULOS DE MADERA"],["1422","ESPEJOS"],["1423","ARTICULOS NO CODIFICADOS"],["1424","BAMBU"],["1425","DECORACIONES"],["1426","ARTICULOS CARTAGENA"],["1427","NACIONALES VARIOS"],["1428","ASADORES Y PARRILLAS"],["1500","CORRECCION EN PRECIOS"],["1502","PARA CORREGIR DIFERENCIAS EN P"],["1503","BICICLETAS GIMNASIA"],["1504","BICICLETAS"],["1600","MELCOCHAS"],["1701","MOLINOS"],["1703","UTENSILIOS DE COCINA"],["1704","PINZAS"],["1705","CUBIERTOS (SET E INDIVIDUAL)"],["1706","N/A"],["1707","N/A"],["1708","VARIOS FUNDIDO"],["1801","HAMACAS"],["1802","TOALLAS"],["1901","CORTINAS"],["1902","TOLDOS"],["1903","MANTELES"],["1904","DELANTALES"],["1905","ALMOHADAS"],["1906","SABANAS"],["1907","N/A"],["1908","PAÑALERAS"],["1909","ALFOMBRAS Y TAPETES"],["2001","CUCHARAS DESECHABLES"],["2101","MUÑECAS IMPORTADAS"],["2102","CARROS IMPORTADOS"],["2103","ENCARTONADOS IMPORTADOS"],["2104","COMPUTADORES IMPORTADOS"],["2105","MOTOS Y AVIONES"],["2106","INSTRUMENTOS MUSICALES IMP"],["2107","CARRUAJES COCHES Y CUNAS"],["2108","SONAJEROS Y CHILLONES"],["2109","VARIOS JUGUETERIA IMPORTADA"],["2202","PIÑATERIA"],["2301","ASEO"],["5001","COMBOS"]];
const inpLineas = document.getElementById('lineas');
const inpSubGrupos = document.getElementById('subgrupos');
const buscar = document.getElementById('buscar');
let pro;
let lin;
let ref;
const urlParams = new URLSearchParams(window.location.search);
const tp = urlParams.get('tp'); // "value1"

let waitExcel = document.getElementById('cargaExcel');
document.getElementById('excel').addEventListener('click', ()=>{
    if (tp == "@inv") location.href = `/descargar_excel?p=${inpProveedores.value}&s=${inpSubGrupos.value}&l=${inpLineas.value}&r=${buscar.value}&tp=${tp}`;
    else if (tp == "@all") location.href = `/descargar_excel?p=${inpProveedores.value}&s=${inpSubGrupos.value}&l=${inpLineas.value}&r=${buscar.value}&tp=${tp}`;
    else location.href = `/descargar_excel?p=${inpProveedores.value}&s=${inpSubGrupos.value}&l=${inpLineas.value}&r=${buscar.value}`;
})

const buscarDatos = (p, t) => {
    pro = inpProveedores.value;
    lin = inpLineas.value;
    sub = inpSubGrupos.value;
    ref = buscar.value;
    pagina = p;
    tam = t;  
    getListaInventarios(pro, sub, lin, ref,tam, pagina);
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
cargarSelects(inpSubGrupos, subgrupos);

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
                let dsto = (value.descuento/100);
                let precioDsto = "";
                let precioMDsto = "";
                if(value.descuento>0) {
                    precioDsto= formatearMoneda(value.precioxunidad-(value.precioxunidad*dsto));
                    precioMDsto = formatearMoneda(value.precioxmayor-(value.precioxmayor*dsto));
                } else {
                    precioDsto = "Sin descuento";
                    precioMDsto = "Sin descuento";
                }
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
                        <td class="px-6 py-4 text-center font-semibold" title="Mayor: (${formatearMoneda(value.precioxmayor)} - ${value.descuento}%) --> ${precioMDsto}">
                            ${formatearMoneda(value.precioxmayor)}
                        </td>
                        <td class="px-6 py-4 text-center font-semibold" title="Unidad: ${value.descuento}% --> ${precioDsto}">
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
