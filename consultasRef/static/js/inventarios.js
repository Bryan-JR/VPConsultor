tab = document.getElementById('listaInv');
let listaInventario = [];
let largo = 0;
let proveedores = [{PROVEEDOR:4,DESCRIPCION:"ALUMINIOS INDIA"},{PROVEEDOR:13,DESCRIPCION:"COLMUÑECOS S.A.S"},{PROVEEDOR:15,DESCRIPCION:"COLPLAST"},{PROVEEDOR:17,DESCRIPCION:"COMERCIALIZADORA CODEALAMBRE"},{PROVEEDOR:18,DESCRIPCION:"COMERCIALIZADORA SANTANDER"},{PROVEEDOR:19,DESCRIPCION:"COMPAÑIA COLOMBIANA DE ESMALTE"},{PROVEEDOR:26,DESCRIPCION:"CRISTAR S.A.S"},{PROVEEDOR:30,DESCRIPCION:"DISTRIBUIDORA ANGELITO"},{PROVEEDOR:31,DESCRIPCION:"DISTRIBUIDORA PERSAL"},{PROVEEDOR:34,DESCRIPCION:"DORICOLOR"},{PROVEEDOR:38,DESCRIPCION:"ELECTROLUX"},{PROVEEDOR:43,DESCRIPCION:"FABRIFOLDER S.A"},{PROVEEDOR:44,DESCRIPCION:"FANTIPLAS LTDA"},{PROVEEDOR:49,DESCRIPCION:"GIRAR PLASTICOS S.A.S"},{PROVEEDOR:52,DESCRIPCION:"GROUPE SEB COLOMBIA"},{PROVEEDOR:61,DESCRIPCION:"IMPRESARTE"},{PROVEEDOR:62,DESCRIPCION:"INCAMETAL"},{PROVEEDOR:63,DESCRIPCION:"INDUSEL S.A."},{PROVEEDOR:66,DESCRIPCION:"INDUSTRIAS FERMAR"},{PROVEEDOR:67,DESCRIPCION:"COLALAMBRES S.A.S"},{PROVEEDOR:69,DESCRIPCION:"INDUSTRIAS VANYPLAS"},{PROVEEDOR:70,DESCRIPCION:"INGEPRODUCTOS S.A.S"},{PROVEEDOR:75,DESCRIPCION:"JUGUETES Y MUÑECAS"},{PROVEEDOR:83,DESCRIPCION:"LOCERIA COLOMBIANA S.A."},{PROVEEDOR:86,DESCRIPCION:"MABE COLOMBIA S.A"},{PROVEEDOR:93,DESCRIPCION:"MUNDIPLAS S.A.S"},{PROVEEDOR:96,DESCRIPCION:"NOVEDADES PLASTICAS"},{PROVEEDOR:102,DESCRIPCION:"PAPELESA"},{PROVEEDOR:105,DESCRIPCION:"PLASTI Z"},{PROVEEDOR:106,DESCRIPCION:"PLASTICOS ASOCIADOS"},{PROVEEDOR:107,DESCRIPCION:"PLASTICOS BECELY S.A.S"},{PROVEEDOR:108,DESCRIPCION:"PLASTICOS CREATIVOS"},{PROVEEDOR:110,DESCRIPCION:"PLASTICOS INTEGRALES"},{PROVEEDOR:112,DESCRIPCION:"PLASTICOS MAFRA LTDA"},{PROVEEDOR:115,DESCRIPCION:"PLASTICOS RIMAX"},{PROVEEDOR:125,DESCRIPCION:"REY"},{PROVEEDOR:126,DESCRIPCION:"RIMOPLASTICAS S.A."},{PROVEEDOR:130,DESCRIPCION:"SANFORD COLOMBIA"},{PROVEEDOR:131,DESCRIPCION:"SANTIAGO ROJAS Y CIA"},{PROVEEDOR:138,DESCRIPCION:"SUSAETA EDICIONES"},{PROVEEDOR:140,DESCRIPCION:"CONTEX"},{PROVEEDOR:146,DESCRIPCION:"ZETAPLAST S.A.S"},{PROVEEDOR:207,DESCRIPCION:"PROYECCIONES PLASTICAS Y CIA L"},{PROVEEDOR:209,DESCRIPCION:"CARVAJAL EDUCACION"},{PROVEEDOR:215,DESCRIPCION:"MULTI IDEAS LTDA"},{PROVEEDOR:228,DESCRIPCION:"PLASTICOS ROYAL ABELLA"},{PROVEEDOR:230,DESCRIPCION:"MAKRO"},{PROVEEDOR:233,DESCRIPCION:"UMCO"},{PROVEEDOR:234,DESCRIPCION:"IMUSA"},{PROVEEDOR:239,DESCRIPCION:"PANAMA"},{PROVEEDOR:240,DESCRIPCION:"CHINA 2014"},{PROVEEDOR:244,DESCRIPCION:"AGRUPAR ENVASES"},{PROVEEDOR:245,DESCRIPCION:"DHOGAR+"},{PROVEEDOR:248,DESCRIPCION:"PRODUCTOS HOGARPLAS S.A.S"},{PROVEEDOR:255,DESCRIPCION:"MILANS BALONES"},{PROVEEDOR:256,DESCRIPCION:"LEON MAZO"},{PROVEEDOR:262,DESCRIPCION:"PLASTICOS MORRINSON"},{PROVEEDOR:263,DESCRIPCION:"GL PLASTICOS"},{PROVEEDOR:264,DESCRIPCION:"KINGAS"},{PROVEEDOR:269,DESCRIPCION:"FUNDICIONES MONSALVE"},{PROVEEDOR:281,DESCRIPCION:"PLASTICOS FENIX"},{PROVEEDOR:287,DESCRIPCION:"RALLACOCOS ( WALTER SALAS )"},{PROVEEDOR:292,DESCRIPCION:"FREDDY MAURE"},{PROVEEDOR:298,DESCRIPCION:"IMPACTO"},{PROVEEDOR:309,DESCRIPCION:"EDINSON RODRIGUEZ"},{PROVEEDOR:310,DESCRIPCION:"HOMERO BERNAL"},{PROVEEDOR:311,DESCRIPCION:"ARTICULOS NO CODIFICADOS"},{PROVEEDOR:323,DESCRIPCION:"PAPELERIA JAPON"},{PROVEEDOR:324,DESCRIPCION:"MAURICIO GOMEZ"},{PROVEEDOR:326,DESCRIPCION:"ELVIA GUTIERRREZ PANOLA"},{PROVEEDOR:334,DESCRIPCION:"ESCOLARES VARIOS"},{PROVEEDOR:336,DESCRIPCION:"TOTTO"},{PROVEEDOR:339,DESCRIPCION:"INVERSIONES VADISA S.A.S"},{PROVEEDOR:344,DESCRIPCION:"MUNDIÚTIL S.A.S"},{PROVEEDOR:345,DESCRIPCION:"PRAKTIPLAS DE COLOMBIA S.A.S"},{PROVEEDOR:353,DESCRIPCION:"PLASTICOS BEED S.A.S"},{PROVEEDOR:363,DESCRIPCION:"PH PLASTICOS HOGAR S.A.S"},{PROVEEDOR:365,DESCRIPCION:"PLASTIRED S.A.S"},{PROVEEDOR:382,DESCRIPCION:"JOSE ALJAIR CASTRO"},{PROVEEDOR:390,DESCRIPCION:"KENDY COLOMBIA"},{PROVEEDOR:396,DESCRIPCION:"MARGIL ICM SAS"},{PROVEEDOR:400,DESCRIPCION:"INDUSTRIAS LICUADORAS SUPER"},{PROVEEDOR:401,DESCRIPCION:"TORRE"},{PROVEEDOR:403,DESCRIPCION:"FUNDICIONES SILVANA"},{PROVEEDOR:404,DESCRIPCION:"GOMEZUL LTDA"},{PROVEEDOR:406,DESCRIPCION:"ESTRA"},{PROVEEDOR:415,DESCRIPCION:"REPUESTOS"},{PROVEEDOR:417,DESCRIPCION:"CHINA 2016"},{PROVEEDOR:423,DESCRIPCION:"VARIOS"},{PROVEEDOR:430,DESCRIPCION:"KING´S FAM S.A.S"},{PROVEEDOR:431,DESCRIPCION:"ALTURA S.A.S"},{PROVEEDOR:432,DESCRIPCION:"G-PLAST"},{PROVEEDOR:434,DESCRIPCION:"HOGAR CENTER"},{PROVEEDOR:435,DESCRIPCION:"TRAMONTINA DE COLOMBIA S.A.S"},{PROVEEDOR:444,DESCRIPCION:"CHINA 2018"},{PROVEEDOR:446,DESCRIPCION:"FORMAS Y COLORES S.A.S"},{PROVEEDOR:448,DESCRIPCION:"DISTRIBUCIONES ADAL"},{PROVEEDOR:450,DESCRIPCION:"KW DE COLOMBIA"},{PROVEEDOR:451,DESCRIPCION:"SABANA"},{PROVEEDOR:452,DESCRIPCION:"ARTESCO"},{PROVEEDOR:453,DESCRIPCION:"KORES"},{PROVEEDOR:511,DESCRIPCION:"ARTESANIAS EL HATO"},{PROVEEDOR:512,DESCRIPCION:"PAPELES PRIMAVERA"},{PROVEEDOR:515,DESCRIPCION:"PLASTICOS VES"},{PROVEEDOR:522,DESCRIPCION:"INDUSTRIAS COLOMBIA INDUCOL"},{PROVEEDOR:523,DESCRIPCION:"DISTRIBUCIONES J.O"},{PROVEEDOR:524,DESCRIPCION:"IMPROMARKAS"},{PROVEEDOR:525,DESCRIPCION:"IMPORTADORA GZ GROUP"},{PROVEEDOR:527,DESCRIPCION:"L&R SUMINISTROS DE ASEO"},{PROVEEDOR:531,DESCRIPCION:"MADA S.A.S"},{PROVEEDOR:532,DESCRIPCION:"FABRICOOK"},{PROVEEDOR:533,DESCRIPCION:"COMERCIALIZADORA HAUS"},{PROVEEDOR:534,DESCRIPCION:"PROIMPO"},{PROVEEDOR:536,DESCRIPCION:"INVERSIONES DIOMARDI"},{PROVEEDOR:537,DESCRIPCION:"GRUPO NOVUM"},{PROVEEDOR:538,DESCRIPCION:"PRODEHOGAR"},{PROVEEDOR:539,DESCRIPCION:"MOLDES Y PLASTICOS"},{PROVEEDOR:540,DESCRIPCION:"MEDELLIN IG"},{PROVEEDOR:541,DESCRIPCION:"GIDA TOYS"},{PROVEEDOR:543,DESCRIPCION:"PLASTICOS DISEB"},{PROVEEDOR:544,DESCRIPCION:"ORGANIZACION MINERVA"},{PROVEEDOR:545,DESCRIPCION:"ARANGO GUEVARA"},{PROVEEDOR:546,DESCRIPCION:"CACHARRERIA NACIONAL"},{PROVEEDOR:547,DESCRIPCION:"MARIA LUCELLY ORREGO"},{PROVEEDOR:548,DESCRIPCION:"FIPLAS LTDA"},{PROVEEDOR:549,DESCRIPCION:"ZHONG HAO"},{PROVEEDOR:550,DESCRIPCION:"VAJILLA HOGAR"},{PROVEEDOR:551,DESCRIPCION:"OGUS JUGUETERIA"},{PROVEEDOR:552,DESCRIPCION:"LA FABRICA DE LOS TERMOS"},{PROVEEDOR:553,DESCRIPCION:"ARISBU"},{PROVEEDOR:554,DESCRIPCION:"AE DISTRIBUCIONES"},{PROVEEDOR:556,DESCRIPCION:"DISTRIBUCIONES J.A"},{PROVEEDOR:557,DESCRIPCION:"DIB ALFOMBRAS"},{PROVEEDOR:558,DESCRIPCION:"SUECO"},{PROVEEDOR:559,DESCRIPCION:"NEDIS CHANTACA PEREZ"},{PROVEEDOR:560,DESCRIPCION:"PAPAGAYO"},{PROVEEDOR:561,DESCRIPCION:"GRAN ANDINA"},{PROVEEDOR:562,DESCRIPCION:"SPRAY MEDELLIN"},{PROVEEDOR:564,DESCRIPCION:"TERMOS SAS"},{PROVEEDOR:565,DESCRIPCION:"STAR PLASTIC"},{PROVEEDOR:566,DESCRIPCION:"COMERCIALINC"},{PROVEEDOR:567,DESCRIPCION:"JORGE ARIAS MARIN"},{PROVEEDOR:568,DESCRIPCION:"FABRIHOGAR"},{PROVEEDOR:569,DESCRIPCION:"NOWCLEANY"},{PROVEEDOR:570,DESCRIPCION:"MAS HOGAR"},{PROVEEDOR:571,DESCRIPCION:"GAMA SINERGIA"},{PROVEEDOR:572,DESCRIPCION:"DECORGLASS"},{PROVEEDOR:573,DESCRIPCION:"DIAJOR"},{PROVEEDOR:574,DESCRIPCION:"ANDECOL"},{PROVEEDOR:575,DESCRIPCION:"DISTRIBUIDORA MM"},{PROVEEDOR:576,DESCRIPCION:"VARIEDADES EN PLASTICOS"},{PROVEEDOR:577,DESCRIPCION:"AURA CAMPOS GARZON"},{PROVEEDOR:578,DESCRIPCION:"BRYSNA"},{PROVEEDOR:579,DESCRIPCION:"PLASTIC TRENDS"},{PROVEEDOR:580,DESCRIPCION:"FUNDICIONES Y REPUJADOS"},{PROVEEDOR:581,DESCRIPCION:"INDURAMA"},{PROVEEDOR:582,DESCRIPCION:"RAGELY"}, {PROVEEDOR:583, DESCRIPCION:"COMERCIALIZADORA RT"},{PROVEEDOR:584,DESCRIPCION:"OMAR HERNAN TORRES"},{PROVEEDOR:585, DESCRIPCION:"NIKA EDITORIAL"}, {PROVEEDOR:81,  DESCRIPCION:"LANDERS Y CIA"}, {PROVEEDOR:90, DESCRIPCION: "MECANICOS UNIDOS"}, {PROVEEDOR:586, DESCRIPCION:"TEXTILES DLB"},{PROVEEDOR:1000,DESCRIPCION:"EVENTOS Y PUBLICIDAD"}];
const lineas = [{ Linea: 10, DESCRIPCION: "ALAMBRES" }, { Linea: 7, DESCRIPCION: "ALUMINIO Y FUNDIDO" }, { Linea: 15, DESCRIPCION: "BICICLETAS" }, { Linea: 24, DESCRIPCION: "DECORACION HOGAR" }, { Linea: 1, DESCRIPCION: "ELECTRODOMESTICOS MAYORES" }, { Linea: 2, DESCRIPCION: "ELECTRODOMESTICOS MENORES" }, { Linea: 4, DESCRIPCION: "ESCOLAR" }, { Linea: 17, DESCRIPCION: "HIERRO ALEADO Y FUNDIDO" }, { Linea: 18, DESCRIPCION: "HAMACAS Y TOALLAS" }, { Linea: 5, DESCRIPCION: "IMPORTADOS VARIOS" }, { Linea: 6, DESCRIPCION: "JUGUETERIA" }, { Linea: 21, DESCRIPCION: "JUGUETERIA IMPORTADA" }, { Linea: 9, DESCRIPCION: "LOCERIA" }, { Linea: 14, DESCRIPCION: "NACIONAL VARIOS" }, { Linea: 22, DESCRIPCION: "PIÑATERIA" }, { Linea: 3, DESCRIPCION: "PLASTICOS" }, { Linea: 8, DESCRIPCION: "CRISTALERIA" }, { Linea: 19, DESCRIPCION: "TELAS" }];
proveedores = proveedores.sort((a, b) => a.DESCRIPCION.localeCompare(b.DESCRIPCION));
const inpProveedores = document.getElementById('proveedores');
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

cargarSelects(inpProveedores, proveedores);
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
