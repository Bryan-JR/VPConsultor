tab = document.getElementById('listaInv');
let listaInventario = [];
let largo = 0;
const proveedores = [{PROVEEDOR:4,DESCRIPCION:"ALUMINIOS INDIA"},{PROVEEDOR:13,DESCRIPCION:"COLMUÑECOS S.A.S"},{PROVEEDOR:15,DESCRIPCION:"COLPLAST"},{PROVEEDOR:17,DESCRIPCION:"COMERCIALIZADORA CODEALAMBRE"},{PROVEEDOR:18,DESCRIPCION:"COMERCIALIZADORA SANTANDER"},{PROVEEDOR:19,DESCRIPCION:"COMPAÑIA COLOMBIANA DE ESMALTE"},{PROVEEDOR:26,DESCRIPCION:"CRISTAR S.A.S"},{PROVEEDOR:30,DESCRIPCION:"DISTRIBUIDORA ANGELITO"},{PROVEEDOR:31,DESCRIPCION:"DISTRIBUIDORA PERSAL"},{PROVEEDOR:34,DESCRIPCION:"DORICOLOR"},{PROVEEDOR:38,DESCRIPCION:"ELECTROLUX"},{PROVEEDOR:43,DESCRIPCION:"FABRIFOLDER S.A"},{PROVEEDOR:44,DESCRIPCION:"FANTIPLAS LTDA"},{PROVEEDOR:49,DESCRIPCION:"GIRAR PLASTICOS S.A.S"},{PROVEEDOR:52,DESCRIPCION:"GROUPE SEB COLOMBIA"},{PROVEEDOR:61,DESCRIPCION:"IMPRESARTE"},{PROVEEDOR:62,DESCRIPCION:"INCAMETAL"},{PROVEEDOR:63,DESCRIPCION:"INDUSEL S.A."},{PROVEEDOR:66,DESCRIPCION:"INDUSTRIAS FERMAR"},{PROVEEDOR:67,DESCRIPCION:"COLALAMBRES S.A.S"},{PROVEEDOR:69,DESCRIPCION:"INDUSTRIAS VANYPLAS"},{PROVEEDOR:70,DESCRIPCION:"INGEPRODUCTOS S.A.S"},{PROVEEDOR:75,DESCRIPCION:"JUGUETES Y MUÑECAS"},{PROVEEDOR:83,DESCRIPCION:"LOCERIA COLOMBIANA S.A."},{PROVEEDOR:86,DESCRIPCION:"MABE COLOMBIA S.A"},{PROVEEDOR:93,DESCRIPCION:"MUNDIPLAS S.A.S"},{PROVEEDOR:96,DESCRIPCION:"NOVEDADES PLASTICAS"},{PROVEEDOR:102,DESCRIPCION:"PAPELESA"},{PROVEEDOR:105,DESCRIPCION:"PLASTI Z"},{PROVEEDOR:106,DESCRIPCION:"PLASTICOS ASOCIADOS"},{PROVEEDOR:107,DESCRIPCION:"PLASTICOS BECELY S.A.S"},{PROVEEDOR:108,DESCRIPCION:"PLASTICOS CREATIVOS"},{PROVEEDOR:110,DESCRIPCION:"PLASTICOS INTEGRALES"},{PROVEEDOR:112,DESCRIPCION:"PLASTICOS MAFRA LTDA"},{PROVEEDOR:115,DESCRIPCION:"PLASTICOS RIMAX"},{PROVEEDOR:125,DESCRIPCION:"REY"},{PROVEEDOR:126,DESCRIPCION:"RIMOPLASTICAS S.A."},{PROVEEDOR:130,DESCRIPCION:"SANFORD COLOMBIA"},{PROVEEDOR:131,DESCRIPCION:"SANTIAGO ROJAS Y CIA"},{PROVEEDOR:138,DESCRIPCION:"SUSAETA EDICIONES"},{PROVEEDOR:140,DESCRIPCION:"CONTEX"},{PROVEEDOR:146,DESCRIPCION:"ZETAPLAST S.A.S"},{PROVEEDOR:207,DESCRIPCION:"PROYECCIONES PLASTICAS Y CIA L"},{PROVEEDOR:209,DESCRIPCION:"CARVAJAL EDUCACION"},{PROVEEDOR:215,DESCRIPCION:"MULTI IDEAS LTDA"},{PROVEEDOR:228,DESCRIPCION:"PLASTICOS ROYAL ABELLA"},{PROVEEDOR:230,DESCRIPCION:"MAKRO"},{PROVEEDOR:233,DESCRIPCION:"UMCO"},{PROVEEDOR:234,DESCRIPCION:"IMUSA"},{PROVEEDOR:239,DESCRIPCION:"PANAMA"},{PROVEEDOR:240,DESCRIPCION:"CHINA 2014"},{PROVEEDOR:244,DESCRIPCION:"AGRUPAR ENVASES"},{PROVEEDOR:245,DESCRIPCION:"DHOGAR+"},{PROVEEDOR:248,DESCRIPCION:"PRODUCTOS HOGARPLAS S.A.S"},{PROVEEDOR:255,DESCRIPCION:"MILANS BALONES"},{PROVEEDOR:256,DESCRIPCION:"LEON MAZO"},{PROVEEDOR:262,DESCRIPCION:"PLASTICOS MORRINSON"},{PROVEEDOR:263,DESCRIPCION:"GL PLASTICOS"},{PROVEEDOR:264,DESCRIPCION:"KINGAS"},{PROVEEDOR:269,DESCRIPCION:"FUNDICIONES MONSALVE"},{PROVEEDOR:281,DESCRIPCION:"PLASTICOS FENIX"},{PROVEEDOR:287,DESCRIPCION:"RALLACOCOS ( WALTER SALAS )"},{PROVEEDOR:292,DESCRIPCION:"FREDDY MAURE"},{PROVEEDOR:298,DESCRIPCION:"IMPACTO"},{PROVEEDOR:309,DESCRIPCION:"EDINSON RODRIGUEZ"},{PROVEEDOR:310,DESCRIPCION:"HOMERO BERNAL"},{PROVEEDOR:311,DESCRIPCION:"ARTICULOS NO CODIFICADOS"},{PROVEEDOR:323,DESCRIPCION:"PAPELERIA JAPON"},{PROVEEDOR:324,DESCRIPCION:"MAURICIO GOMEZ"},{PROVEEDOR:326,DESCRIPCION:"ELVIA GUTIERRREZ PANOLA"},{PROVEEDOR:334,DESCRIPCION:"ESCOLARES VARIOS"},{PROVEEDOR:336,DESCRIPCION:"TOTTO"},{PROVEEDOR:339,DESCRIPCION:"INVERSIONES VADISA S.A.S"},{PROVEEDOR:344,DESCRIPCION:"MUNDIÚTIL S.A.S"},{PROVEEDOR:345,DESCRIPCION:"PRAKTIPLAS DE COLOMBIA S.A.S"},{PROVEEDOR:353,DESCRIPCION:"PLASTICOS BEED S.A.S"},{PROVEEDOR:363,DESCRIPCION:"PH PLASTICOS HOGAR S.A.S"},{PROVEEDOR:365,DESCRIPCION:"PLASTIRED S.A.S"},{PROVEEDOR:382,DESCRIPCION:"JOSE ALJAIR CASTRO"},{PROVEEDOR:390,DESCRIPCION:"KENDY COLOMBIA"},{PROVEEDOR:396,DESCRIPCION:"MARGIL ICM SAS"},{PROVEEDOR:400,DESCRIPCION:"INDUSTRIAS LICUADORAS SUPER"},{PROVEEDOR:401,DESCRIPCION:"TORRE"},{PROVEEDOR:403,DESCRIPCION:"FUNDICIONES SILVANA"},{PROVEEDOR:404,DESCRIPCION:"GOMEZUL LTDA"},{PROVEEDOR:406,DESCRIPCION:"ESTRA"},{PROVEEDOR:415,DESCRIPCION:"REPUESTOS"},{PROVEEDOR:417,DESCRIPCION:"CHINA 2016"},{PROVEEDOR:423,DESCRIPCION:"VARIOS"},{PROVEEDOR:430,DESCRIPCION:"KING´S FAM S.A.S"},{PROVEEDOR:431,DESCRIPCION:"ALTURA S.A.S"},{PROVEEDOR:432,DESCRIPCION:"G-PLAST"},{PROVEEDOR:434,DESCRIPCION:"HOGAR CENTER"},{PROVEEDOR:435,DESCRIPCION:"TRAMONTINA DE COLOMBIA S.A.S"},{PROVEEDOR:444,DESCRIPCION:"CHINA 2018"},{PROVEEDOR:446,DESCRIPCION:"FORMAS Y COLORES S.A.S"},{PROVEEDOR:448,DESCRIPCION:"DISTRIBUCIONES ADAL"},{PROVEEDOR:450,DESCRIPCION:"KW DE COLOMBIA"},{PROVEEDOR:451,DESCRIPCION:"SABANA"},{PROVEEDOR:452,DESCRIPCION:"ARTESCO"},{PROVEEDOR:453,DESCRIPCION:"KORES"},{PROVEEDOR:511,DESCRIPCION:"ARTESANIAS EL HATO"},{PROVEEDOR:512,DESCRIPCION:"PAPELES PRIMAVERA"},{PROVEEDOR:515,DESCRIPCION:"PLASTICOS VES"},{PROVEEDOR:522,DESCRIPCION:"INDUSTRIAS COLOMBIA INDUCOL"},{PROVEEDOR:523,DESCRIPCION:"DISTRIBUCIONES J.O"},{PROVEEDOR:524,DESCRIPCION:"IMPROMARKAS"},{PROVEEDOR:525,DESCRIPCION:"IMPORTADORA GZ GROUP"},{PROVEEDOR:527,DESCRIPCION:"L&R SUMINISTROS DE ASEO"},{PROVEEDOR:531,DESCRIPCION:"MADA S.A.S"},{PROVEEDOR:532,DESCRIPCION:"FABRICOOK"},{PROVEEDOR:533,DESCRIPCION:"COMERCIALIZADORA HAUS"},{PROVEEDOR:534,DESCRIPCION:"PROIMPO"},{PROVEEDOR:536,DESCRIPCION:"INVERSIONES DIOMARDI"},{PROVEEDOR:537,DESCRIPCION:"GRUPO NOVUM"},{PROVEEDOR:538,DESCRIPCION:"PRODEHOGAR"},{PROVEEDOR:539,DESCRIPCION:"MOLDES Y PLASTICOS"},{PROVEEDOR:540,DESCRIPCION:"MEDELLIN IG"},{PROVEEDOR:541,DESCRIPCION:"GIDA TOYS"},{PROVEEDOR:543,DESCRIPCION:"PLASTICOS DISEB"},{PROVEEDOR:544,DESCRIPCION:"ORGANIZACION MINERVA"},{PROVEEDOR:545,DESCRIPCION:"ARANGO GUEVARA"},{PROVEEDOR:546,DESCRIPCION:"CACHARRERIA NACIONAL"},{PROVEEDOR:547,DESCRIPCION:"MARIA LUCELLY ORREGO"},{PROVEEDOR:548,DESCRIPCION:"FIPLAS LTDA"},{PROVEEDOR:549,DESCRIPCION:"ZHONG HAO"},{PROVEEDOR:550,DESCRIPCION:"VAJILLA HOGAR"},{PROVEEDOR:551,DESCRIPCION:"OGUS JUGUETERIA"},{PROVEEDOR:552,DESCRIPCION:"LA FABRICA DE LOS TERMOS"},{PROVEEDOR:553,DESCRIPCION:"ARISBU"},{PROVEEDOR:554,DESCRIPCION:"AE DISTRIBUCIONES"},{PROVEEDOR:556,DESCRIPCION:"DISTRIBUCIONES J.A"},{PROVEEDOR:557,DESCRIPCION:"DIB ALFOMBRAS"},{PROVEEDOR:558,DESCRIPCION:"SUECO"},{PROVEEDOR:559,DESCRIPCION:"NEDIS CHANTACA PEREZ"},{PROVEEDOR:560,DESCRIPCION:"PAPAGAYO"},{PROVEEDOR:561,DESCRIPCION:"GRAN ANDINA"},{PROVEEDOR:562,DESCRIPCION:"SPRAY MEDELLIN"},{PROVEEDOR:564,DESCRIPCION:"TERMOS SAS"},{PROVEEDOR:565,DESCRIPCION:"STAR PLASTIC"},{PROVEEDOR:566,DESCRIPCION:"COMERCIALINC"},{PROVEEDOR:567,DESCRIPCION:"JORGE ARIAS MARIN"},{PROVEEDOR:568,DESCRIPCION:"FABRIHOGAR"},{PROVEEDOR:569,DESCRIPCION:"NOWCLEANY"},{PROVEEDOR:570,DESCRIPCION:"MAS HOGAR"},{PROVEEDOR:571,DESCRIPCION:"GAMA SINERGIA"},{PROVEEDOR:572,DESCRIPCION:"DECORGLASS"},{PROVEEDOR:573,DESCRIPCION:"DIAJOR"},{PROVEEDOR:574,DESCRIPCION:"ANDECOL"},{PROVEEDOR:575,DESCRIPCION:"DISTRIBUIDORA MM"},{PROVEEDOR:576,DESCRIPCION:"VARIEDADES EN PLASTICOS"},{PROVEEDOR:577,DESCRIPCION:"AURA CAMPOS GARZON"},{PROVEEDOR:578,DESCRIPCION:"BRYSNA"},{PROVEEDOR:579,DESCRIPCION:"PLASTIC TRENDS"},{PROVEEDOR:580,DESCRIPCION:"FUNDICIONES Y REPUJADOS"},{PROVEEDOR:581,DESCRIPCION:"INDURAMA"},{PROVEEDOR:582,DESCRIPCION:"RAGELY"},{PROVEEDOR:1000,DESCRIPCION:"EVENTOS Y PUBLICIDAD"}];


// function pag(cant, pg) {
//     let i = (pg - 1) * cant;
//     return listaInventario.slice(i, i + cant);
// }

// const searchInput = document.getElementById('searchInput');
const inpProveedores = document.getElementById('proveedores');

// Escuchar el evento 'input' para filtrar las opciones
// searchInput.addEventListener('input', function () {
//     const filter = searchInput.value.toLowerCase();
//     const options = inpProveedores.options;

//     // Mostrar solo las opciones que coinciden
//     for (let i = 0; i < options.length; i++) {
//         const option = options[i];
//         const text = option.text.toLowerCase();
//         option.style.display = text.includes(filter) ? '' : 'none';
//     }
// });

inpProveedores.addEventListener('change', () => {
    pagina = 1;
    tam = 50;  
    pro = inpProveedores.value;
    if(pro != "")getListaInventarios(pro, "", "", "", "", tam, pagina);
});

function cargarProveedores(){
    proveedores.forEach(p => {
        inpProveedores.innerHTML += `
            <option value="${p.PROVEEDOR}">${p.DESCRIPCION}</option>
        `;
    });
}

cargarProveedores();
let fin = 0;
async function getListaInventarios(pro, sub, lin, ref, des, size, pag){
    cargar();
    await axios.get(`/inv-consultas?p=${pro}&s=${sub}&l=${lin}&r=${ref}&d=${des}&sz=${size}&pg=${pag}`)
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
        pro = inpProveedores.value;
        getListaInventarios(pro, "", "", "", "", tam, pagina);
    }
});
document.getElementById("siguiente").addEventListener("click", () => {
    console.log(largo);
    if ((pagina*tam) <= largo) {
        pagina++;
        pro = inpProveedores.value;
        getListaInventarios(pro, "", "", "", "", tam, pagina);
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
    }
  }
  
  
  

function listarInv(lista) {
    tab.innerHTML = "";
    lista.forEach((value) => {
        tab.innerHTML += `
            <tr class="bg-white border-b">
                    <th scope="row" class="px-6 py-4 font-bold text-gray-900 whitespace-nowrap">
                        ${value.referencia}
                    </th>
                    <td class=" px-6 py-4 font-semibold">
                        ${value.descripcion}
                    </td>
                    <td class="px-6 py-4 text-center font-semibold">
                        ${formatoFecha(value.fechacompra)}
                    </td>
                    <td class="px-6 py-4 text-right font-semibold">
                        ${formatearMoneda(value.precioxunidad)}
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
                    <td class="px-6 py-4 text-center font-bold">
                        ${(value.bd1 + value.bd2 + value.bd20)}
                    </td>
                </tr>
        `;
    });
    cargador.classList.add('hidden');
}

getListaInventarios("", "", "", "", "", tam, pagina);