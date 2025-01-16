from flask import Blueprint, request, jsonify, render_template, send_file
from src.models.Inventario import Inventario
from src.models.Referencias import Referencia
from src.models.UltimaFechaCompra import UltimaFechaCompra
from sqlalchemy import func, text
from src.db import Session, engine
import pandas as pd
import numpy as np
import os
import io
from openpyxl.styles import PatternFill, Alignment
from datetime import datetime, time
from apscheduler.schedulers.background import BackgroundScheduler # type: ignore
controllerInventario = Blueprint('controllerInventario', __name__)

ruta = r'\\10.0.0.100\serveriltda\Iltda\Soporte Compartida'
rutaCompras = r'\\10.0.0.96\Compartida\Planos'
inv = os.path.join(ruta, "Inventario.txt")


def datos(archivo):
    encodings = ['utf-8', 'ISO-8859-1', 'latin1']
    for encoding in encodings:
        try:
            return pd.read_csv(archivo, sep=';', encoding=encoding, on_bad_lines='skip', dtype={'REFERENCIA': str})
        except UnicodeDecodeError:
            continue
    raise ValueError("No se puede decodificar el archivo con codificaciones disponibles")


from sqlalchemy.orm import sessionmaker
from sqlalchemy import func

# METODO PARA ACTUALIZAR EL INVENTARIO
def actualizarInv():
    try:
        hora_inicio = time(7, 40)
        hora_fin = time(20, 40)
        hora_actual = datetime.now().time()
        init = False
        if(hora_inicio <= hora_actual <= hora_fin):
                inv = os.path.join(ruta, "Inventario.txt")
                #tam = os.path.getsize(r'\\10.0.0.100\serveriltda\Iltda\Soporte Compartida\Inventario.txt')
                df = datos(inv)
                NaN_ref = df['REFERENCIA'].isna().any()
                NaN_lin = df['LINEA'].isna().any()
                NaN_bd = df['BODEGA'].isna().any()
                NaN_exi = df['EXISTENCIA'].isna().any()
                NaN_cos = df['COSTO'].isna().any()
                
                
                if not NaN_ref and not NaN_bd and not NaN_lin and not NaN_exi and not NaN_cos:
                    conditions = [
                    (df['TIPO IVA'].between(41, 46)) | (df['TIPO IVA'].between(48, 54)),
                    (df['TIPO IVA'].isin([39, 47, 55, 56])),
                    (df['TIPO IVA'].isin([98, 99])),
                    ]
                    values = [1.19, 1.05, 1]
                    df['COSTO'] = (df['COSTO'] * np.select(conditions, values, default=1)).round(0).astype(int)
                    session = Session()
                    init = True
                    # Traer todos los registros existentes de la base de datos
                    inventarios_existentes = session.query(Inventario).all()
                    inventario_dict = {(inv.REFERENCIA, inv.BODEGA): inv for inv in inventarios_existentes}

                    # Iterar sobre las filas del DataFrame
                    for _, row in df.iterrows():
                        clave = (str(int(row['REFERENCIA'])), int(row['BODEGA']))
                        if clave in inventario_dict:
                            # Si el registro existe, actualizar EXISTENCIA y ESTADO
                            inventario_existente = inventario_dict[clave]
                            inventario_existente.EXISTENCIA = int(row['EXISTENCIA'])
                            inventario_existente.COSTO = int(row['COSTO']) if pd.notna(row['COSTO']) else None
                        else:
                            # Si no existe, crear un nuevo registro (nueva referencia)
                            nuevo_inventario = Inventario(
                                REFERENCIA=str(int(row['REFERENCIA'])),
                                BODEGA=int(row['BODEGA']),
                                LINEA=int(row['LINEA']),
                                PROVEEDOR=int(row['PROVEEDOR']) if pd.notna(row['PROVEEDOR']) else None,
                                SUBGRUPO=int(row['SUBGRUPO']) if pd.notna(row['SUBGRUPO']) else None,
                                EXISTENCIA=int(row['EXISTENCIA']) ,
                                COSTO=int(row['COSTO']) if pd.notna(row['COSTO']) else None
                            )
                            session.add(nuevo_inventario)
                    
                    session.commit()
                    total_existencia = session.query(func.sum(Inventario.EXISTENCIA)).scalar() or 0
                    msg("SERVER", f"Inventario actualizado correctamente. Total existencia: ---* {total_existencia} *---")
                    
    except Exception as e:
        print("Error en actualizar inventario: ", e)
        session.rollback()  # Revertir en caso de error
    finally:
        if init:
            session.close()

# METODO PARA ACTUALIZAR ULTIMA FECHA DE COMPRA
def actualizarFechaCompra():
    try:
        fechas = os.path.join(rutaCompras, "MovCompras.txt")
        #tam = os.path.getsize(r'\\10.0.0.100\serveriltda\Iltda\Soporte Compartida\Inventario.txt')
        init = False
        df = datos(fechas)
        df = df[(df['BODEGA'] == 2) | df['BODEGA'] == 1]
        NaN_ref = df['REFERENCIA'].isna().any()
        NaN_fec = df['FECHA'].isna().any()
        if not NaN_ref and not NaN_fec:
            session = Session()
            init = True
            # Traer todos los registros existentes de la base de datos
            fechasCompras = session.query(UltimaFechaCompra).all()
            fechas_dict = {(inv.REFERENCIA): inv for inv in fechasCompras}
            # Iterar sobre las filas del DataFrame
            for _, row in df.iterrows():
                clave = (str(int(row['REFERENCIA'])))
                if clave in fechas_dict:
                    # Si el registro existe, actualizar EXISTENCIA y ESTADO
                    fechasCompras = fechas_dict[clave]
                    fechasCompras.FECHA = str(row['FECHA'])
                else:
                    # Si no existe, crear un nuevo registro (nueva referencia)
                    nuevaFecha = UltimaFechaCompra(
                        REFERENCIA=str(int(row['REFERENCIA'])),
                        FECHA=str(row['FECHA'])
                    )
                    session.add(nuevaFecha)
            
            # Guardar los cambios en la base de datos
            session.commit()
                
    except Exception as e:
        print("Error en actualizar fecha ultima compra: ", e)
        session.rollback()  # Revertir en caso de error
    finally:
        if init:
            session.close()


def msg(client, mensaje):
    hora_actual = datetime.now()
    print(f'[{client}][{hora_actual}]: {mensaje}')

# METODO PARA BUSCAR UN INVENTARIO PARA UNA REFERENCIA
@controllerInventario.route('/inventario')
def inventarios():
    try:
        ref = request.args.get('r')
        resultados = []
        msg(request.remote_addr, f"Consulta inventario de ({ref})")
        if ref!="":
            session = Session()
            resultados = session.query(
                Referencia.REFERENCIA,
                Referencia.PRECIOXMAYOR,
                Referencia.PRECIOXUNIDAD,
                Referencia.DESCUENTO,
                Inventario.BODEGA,
                Inventario.LINEA,
                Inventario.EXISTENCIA,
                Inventario.COSTO
            ).join(Inventario, Referencia.REFERENCIA == Inventario.REFERENCIA) \
            .filter(Referencia.REFERENCIA == ref ) \
            .order_by(Inventario.BODEGA.asc()) \
            .all()
            json = [
            {
                'referencia': resultado.REFERENCIA,
                'precioxmayor': resultado.PRECIOXMAYOR,
                'precioxunidad': resultado.PRECIOXUNIDAD,
                'descuento': resultado.DESCUENTO,
                'bodega': resultado.BODEGA,
                'linea': resultado.LINEA,
                'existencia': resultado.EXISTENCIA,
                'costo': resultado.COSTO
            }
            for resultado in resultados
        ]

        return jsonify(json)
    except Exception as e:
        print(e)
    finally:
        if ref!="":
            session.close()
            
# CONTROLADORES PARA LA VISTA DE INVENTARIOS POR PROOVEDOR

@controllerInventario.route('/inventarios', methods=['GET'])
def vistaInventarios():
    msg(request.remote_addr, f"Entró a inventarios.")
    return render_template('inventarios.html')

@controllerInventario.route('/inv-consultas', methods=['GET'])
def listaInventarios():
    try:
        where = ""
        pro = request.args.get('p')
        sub = request.args.get('s')
        lin = request.args.get('l')
        ref = request.args.get('r')
        page = int(request.args.get('pg'))
        page_size = int(request.args.get('sz'))
        msg(request.remote_addr, f"Consulta inventarios [pro:{pro}][lin:{lin}][sub:{sub}][ref:{ref}][pag:{page}][tam:{page_size}]")
        offset = (page - 1) * page_size
        if pro != "" or sub != "" or lin != "" or ref != "":
            where = ""
            i = 0
            if pro != "":
                where += f"and i.PROVEEDOR = '{pro}'"
                i += 1
            if sub != "":
                where += f"and i.SUBGRUPO = '{sub}'"
                i += 1
            if lin != "":
                where += f"and i.LINEA = '{lin}'"
                i += 1
            if ref != "":
                where += f"and (lp.REFERENCIA LIKE '%{ref}%' or lp.DESCRIPCION LIKE '%{ref}%')"
                i += 1
                
        session = Session()
        total_rows = session.execute(text(f'''
                                                SELECT COUNT(DISTINCT lp.REFERENCIA)
                                                FROM ListaPreciosLectores as lp 
                                                INNER JOIN Inventarios as i
                                                    ON lp.REFERENCIA = i.REFERENCIA
                                                    {where};
                                            ''')).scalar()
        if offset >= total_rows:
            offset = total_rows
            
        inventarios = session.execute(text(f'''
                                          SELECT
                                                lp.REFERENCIA,
                                                lp.DESCRIPCION,
                                                SUM(CASE WHEN i.BODEGA = '1' THEN i.EXISTENCIA ELSE 0 END) AS 'BD1',
                                                SUM(CASE WHEN i.BODEGA = '2' THEN i.EXISTENCIA ELSE 0 END) AS 'BD2',
                                                SUM(CASE WHEN i.BODEGA = '20' THEN i.EXISTENCIA ELSE 0 END) AS 'BD20',
                                                lp.UNIDAD,
                                                lp.DESCUENTO,
                                                (SELECT inv.COSTO FROM Inventarios AS inv WHERE inv.REFERENCIA = lp.REFERENCIA AND inv.BODEGA = '1') AS 'COSTO',
                                                lp.PRECIOXMAYOR,
                                                lp.PRECIOXUNIDAD,
                                                (SELECT FECHA FROM UltimaFechaCompra as fc WHERE fc.REFERENCIA = lp.REFERENCIA) as 'FECHACOMPRA'
                                            FROM ListaPreciosLectores as lp INNER JOIN Inventarios as i
                                                ON lp.REFERENCIA = i.REFERENCIA
                                                WHERE i.BODEGA IN ('1', '2', '20') {where}
                                            GROUP BY lp.REFERENCIA, lp.DESCRIPCION, lp.UNIDAD, lp.DESCUENTO, lp.PRECIOXMAYOR, lp.PRECIOXUNIDAD
                                            ORDER BY lp.DESCRIPCION ASC
                                            OFFSET {offset} ROWS FETCH NEXT {page_size} ROWS ONLY;
                                          ''')).fetchall()
        # lp.DESCRIPCION ASC
        session.close()
        json = [
            {
                'referencia': inventario[0],
                'descripcion': inventario[1],
                'bd1': inventario[2],
                'bd2': inventario[3],
                'bd20': inventario[4],
                'ue': inventario[5],
                'descuento': inventario[6],
                'costo': inventario[7],
                'precioxmayor': inventario[8],
                'precioxunidad': inventario[9],
                'fechacompra': inventario[10],
                
            }
            for inventario in inventarios
        ]
        
        resp = {
            "lista": json,
            "cantidad": total_rows
        }
        return jsonify(resp)
    except Exception as e:
        print(e)

#actualizarInv()

proveedores = {81: "LANDERS Y CIA", 90: "MECANICOS UNIDOS", 586: "TEXTILES DLB", 583: "COMERCIALIZADORA RT", 584:"OMAR HERNAN TORRES", 585:"NIKA EDITORIAL",  4: "ALUMINIOS INDIA",13: "COLMUÑECOS S.A.S",15: "COLPLAST",17: "COMERCIALIZADORA CODEALAMBRE",18: "COMERCIALIZADORA SANTANDER",19: "COMPAÑIA COLOMBIANA DE ESMALTE",26: "CRISTAR S.A.S",30: "DISTRIBUIDORA ANGELITO",31: "DISTRIBUIDORA PERSAL",34: "DORICOLOR",38: "ELECTROLUX",43: "FABRIFOLDER S.A",44: "FANTIPLAS LTDA",49: "GIRAR PLASTICOS S.A.S",52: "GROUPE SEB COLOMBIA",61: "IMPRESARTE",62: "INCAMETAL",63: "INDUSEL S.A.",66: "INDUSTRIAS FERMAR",67: "COLALAMBRES S.A.S",69: "INDUSTRIAS VANYPLAS",70: "INGEPRODUCTOS S.A.S",75: "JUGUETES Y MUÑECAS",83: "LOCERIA COLOMBIANA S.A.",86: "MABE COLOMBIA S.A",93: "MUNDIPLAS S.A.S",96: "NOVEDADES PLASTICAS",102: "PAPELESA",105: "PLASTI Z",106: "PLASTICOS ASOCIADOS",107: "PLASTICOS BECELY S.A.S",108: "PLASTICOS CREATIVOS",110: "PLASTICOS INTEGRALES",112: "PLASTICOS MAFRA LTDA",115: "PLASTICOS RIMAX",125: "REY",126: "RIMOPLASTICAS S.A.",130: "SANFORD COLOMBIA",131: "SANTIAGO ROJAS Y CIA",138: "SUSAETA EDICIONES",140: "CONTEX",146: "ZETAPLAST S.A.S",207: "PROYECCIONES PLASTICAS Y CIA L",209: "CARVAJAL EDUCACION",215: "MULTI IDEAS LTDA",228: "PLASTICOS ROYAL ABELLA",230: "MAKRO",233: "UMCO",234: "IMUSA",239: "PANAMA",240: "CHINA 2014",244: "AGRUPAR ENVASES",245: "DHOGAR+",248: "PRODUCTOS HOGARPLAS S.A.S",255: "MILANS BALONES",256: "LEON MAZO",262: "PLASTICOS MORRINSON",263: "GL PLASTICOS",264: "KINGAS",269: "FUNDICIONES MONSALVE",281: "PLASTICOS FENIX",287: "RALLACOCOS ( WALTER SALAS )",292: "FREDDY MAURE",298: "IMPACTO",309: "EDINSON RODRIGUEZ",310: "HOMERO BERNAL",311: "ARTICULOS NO CODIFICADOS",323: "PAPELERIA JAPON",324: "MAURICIO GOMEZ",326: "ELVIA GUTIERRREZ PANOLA",334: "ESCOLARES VARIOS",336: "TOTTO",339: "INVERSIONES VADISA S.A.S",344: "MUNDIÚtIL S.A.S",345: "PRAKTIPLAS DE COLOMBIA S.A.S",353: "PLASTICOS BEED S.A.S",363: "PH PLASTICOS HOGAR S.A.S",365: "PLASTIRED S.A.S",382: "JOSE ALJAIR CASTRO",390: "KENDY COLOMBIA",396: "MARGIL ICM SAS",400: "INDUSTRIAS LICUADORAS SUPER",401: "TORRE",403: "FUNDICIONES SILVANA",404: "GOMEZUL LTDA",406: "ESTRA",415: "REPUESTOS",417: "CHINA 2016",423: "VARIOS",430: "KING´S FAM S.A.S",431: "ALTURA S.A.S",432: "G-PLAST",434: "HOGAR CENTER",435: "TRAMONTINA DE COLOMBIA S.A.S",444: "CHINA 2018",446: "FORMAS Y COLORES S.A.S",448: "DISTRIBUCIONES ADAL",450: "KW DE COLOMBIA",451: "SABANA",452: "ARTESCO",453: "KORES",511: "ARTESANIAS EL HATO",512: "PAPELES PRIMAVERA",515: "PLASTICOS VES",522: "INDUSTRIAS COLOMBIA INDUCOL",523: "DISTRIBUCIONES J.O",524: "IMPROMARKAS",525: "IMPORTADORA GZ GROUP",527: "L&R SUMINISTROS DE ASEO",531: "MADA S.A.S",532: "FABRICOOK",533: "COMERCIALIZADORA HAUS",534: "PROIMPO",536: "INVERSIONES DIOMARDI",537: "GRUPO NOVUM",538: "PRODEHOGAR",539: "MOLDES Y PLASTICOS",540: "MEDELLIN IG",541: "GIDA TOYS",543: "PLASTICOS DISEB",544: "ORGANIZACION MINERVA",545: "ARANGO GUEVARA",546: "CACHARRERIA NACIONAL",547: "MARIA LUCELLY ORREGO",548: "FIPLAS LTDA",549: "ZHONG HAO",550: "VAJILLA HOGAR",551: "OGUS JUGUETERIA",552: "LA FABRICA DE LOS TERMOS",553: "ARISBU",554: "AE DISTRIBUCIONES",556: "DISTRIBUCIONES J.A",557: "DIB ALFOMBRAS",558: "SUECO",559: "NEDIS CHANTACA PEREZ",560: "PAPAGAYO",561: "GRAN ANDINA",562: "SPRAY MEDELLIN",564: "TERMOS SAS",565: "STAR PLASTIC",566: "COMERCIALINC",567: "JORGE ARIAS MARIN",568: "FABRIHOGAR",569: "NOWCLEANY",570: "MAS HOGAR",571: "GAMA SINERGIA",572: "DECORGLASS",573: "DIAJOR",574: "ANDECOL",575: "DISTRIBUIDORA MM",576: "VARIEDADES EN PLASTICOS",577: "AURA CAMPOS GARZON",578: "BRYSNA",579: "PLASTIC TRENDS",580: "FUNDICIONES Y REPUJADOS",581: "INDURAMA",582: "RAGELY",1000: "EVENTOS Y PUBLICIDAD"}
lineas = {10: "ALAMBRES", 7: "ALUMINIO Y FUNDIDO", 15: "BICICLETAS", 24: "DECORACION HOGAR", 1: "ELECTRODOMESTICOS MAYORES", 2: "ELECTRODOMESTICOS MENORES", 4: "ESCOLAR", 17: "HIERRO ALEADO Y FUNDIDO", 18: "HAMACAS Y TOALLAS", 5: "IMPORTADOS VARIOS", 6: "JUGUETERIA", 21: "JUGUETERIA IMPORTADA", 9: "LOCERIA", 14: "NACIONAL VARIOS", 22: "PIÑATERIA", 3: "PLASTICOS", 8: "CRISTALERIA", 19: "TELAS"}


@controllerInventario.route('/descargar_excel')
def descargar_excel():
    try:
        where = ""
        pro = request.args.get('p')
        sub = request.args.get('s')
        lin = request.args.get('l')
        ref = request.args.get('r')
        tp = request.args.get('tp')

        # Crear un archivo Excel en memoria usando pandas
        if pro!="" or sub!="" or lin!="" or ref!="":
            where = ""
            i = 0
            if pro != "":
                where += f"and i.PROVEEDOR = '{pro}'"
                i += 1
            if sub != "":
                where += f"and i.SUBGRUPO = '{sub}'"
                i += 1
            if lin != "":
                where += f"and i.LINEA = '{lin}'"
                i += 1
            if ref != "":
                where += f"and (lp.REFERENCIA LIKE '%{ref}%' or lp.DESCRIPCION LIKE '%{ref}%')"
                i += 1

        sql = f'''
            SELECT
                lp.REFERENCIA,
                lp.DESCRIPCION,
                i.PROVEEDOR,
                lp.UNIDAD AS "U/E",
                i.LINEA,
                SUM(CASE WHEN i.BODEGA = '1' THEN i.EXISTENCIA ELSE 0 END) AS 'BD1',
                SUM(CASE WHEN i.BODEGA = '2' THEN i.EXISTENCIA ELSE 0 END) AS 'BD2',
                -- SUM(CASE WHEN i.BODEGA = '3' THEN i.EXISTENCIA ELSE 0 END) AS 'BD3',
                -- SUM(CASE WHEN i.BODEGA = '7' THEN i.EXISTENCIA ELSE 0 END) AS 'BD7',
                SUM(CASE WHEN i.BODEGA = '20' THEN i.EXISTENCIA ELSE 0 END) AS 'BD20',
                lp.DESCUENTO,
                (SELECT inv.COSTO FROM Inventarios AS inv WHERE inv.REFERENCIA = lp.REFERENCIA AND inv.BODEGA = '1') AS 'COSTO',
                lp.PRECIOXMAYOR,
                lp.PRECIOXUNIDAD,
                (SELECT FECHA FROM UltimaFechaCompra as fc WHERE fc.REFERENCIA = lp.REFERENCIA) as 'FECHACOMPRA'
            FROM ListaPreciosLectores as lp INNER JOIN Inventarios as i
                ON lp.REFERENCIA = i.REFERENCIA
                WHERE i.BODEGA IN ('1', '2', '20') {where}
            GROUP BY lp.REFERENCIA, lp.DESCRIPCION, lp.UNIDAD, i.LINEA, lp.DESCUENTO, lp.PRECIOXMAYOR, lp.PRECIOXUNIDAD, i.PROVEEDOR
            ORDER BY lp.DESCRIPCION ASC
        '''

        df = pd.read_sql(sql, engine)
        df['PROVEEDOR'] = df['PROVEEDOR'].map(proveedores)
        df['LINEA'] = df['LINEA'].map(lineas)
        df['Renta x Mayor'] = df.apply(lambda x: (1 - (x['COSTO'] / x['PRECIOXMAYOR'])) if x['PRECIOXMAYOR'] > 0 else None, axis=1)
        df['Renta x Unidad'] = df.apply(lambda x: (1 - (x['COSTO'] / x['PRECIOXUNIDAD'])) if x['PRECIOXUNIDAD'] > 0 else None, axis=1)
        
        columnas_ordenadas = [
            'PROVEEDOR', 'REFERENCIA', 'DESCRIPCION', 'LINEA',  'U/E', 'BD1', 'BD2', 'BD20', 'DESCUENTO', 
            'COSTO', 'PRECIOXMAYOR', 'PRECIOXUNIDAD', 'Renta x Mayor', 'Renta x Unidad', 'FECHACOMPRA'
        ]
        if tp == "@inv":
            columnas_ordenadas = ['PROVEEDOR', 'REFERENCIA', 'DESCRIPCION', 'LINEA',  'U/E', 'BD1', 'BD2', 'BD20']
        elif tp == "@all":
            columnas_ordenadas = [
            'PROVEEDOR', 'REFERENCIA', 'DESCRIPCION', 'LINEA',  'U/E', 'BD1', 'BD2', 'BD3', 'BD7', 'BD20', 'DESCUENTO', 
            'COSTO', 'PRECIOXMAYOR', 'PRECIOXUNIDAD', 'Renta x Mayor', 'Renta x Unidad', 'FECHACOMPRA'
        ]

        # Reordenar el DataFrame
        df = df[columnas_ordenadas]
        excel_io = io.BytesIO()

        # Convertir el DataFrame a un archivo Excel con pandas
        with pd.ExcelWriter(excel_io, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Datos')

            # Obtener el objeto del libro y la hoja
            workbook = writer.book
            sheet = workbook['Datos']

            # Ajustar el tamaño de las columnas (autoajuste básico)
            for col in sheet.columns:
                max_length = 0
                column = col[0].column_letter  # Get the column name
                for cell in col:
                    try:
                        if len(str(cell.value)) > max_length:
                            max_length = len(cell.value)
                    except:
                        pass
                adjusted_width = (max_length + 10)
                sheet.column_dimensions[column].width = adjusted_width

            # Aplicar color gris claro a los encabezados
            header_fill = PatternFill(start_color="D3D3D3", end_color="D3D3D3", fill_type="solid")  # Gris claro
            for cell in sheet[1]:
                cell.fill = header_fill
                cell.alignment = Alignment(horizontal='center', vertical='center')

            if tp != "@inv":
                # Aplicar formato de contabilidad (moneda) a las columnas Costo, PrecioXMAYOR y PrecioXUNIDAD
                for row in sheet.iter_rows(min_row=2, min_col=10, max_col=12):  # Columnas Costo, PrecioXMAYOR, PrecioXUNIDAD
                    for cell in row:
                        cell.number_format = '_("$"* #,##0.00'  # Formato de contabilidad
                
                for row in sheet.iter_rows(min_row=2, min_col=13, max_col=14):  # Columnas Renta x Mayor, Renta x Unidad
                            for cell in row:
                                cell.number_format = '0.00%'  # Formato de porcentaje con 2 decimales
        # Mover el cursor al principio del archivo
        excel_io.seek(0)

        # Enviar el archivo Excel como respuesta
        return send_file(
            excel_io,
            as_attachment=True,
            download_name=f"INVENTARIO-{str(datetime.now()).replace('-','').replace('.','')}.xlsx",
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    except Exception as e:
        print(e)

def actualizaciones():
    try:
        actualizarInv()
        actualizarFechaCompra()
    except Exception as e:
        print("Error al actualizar: ", e)

def iniciarCargue():
    try:
        scheduler = BackgroundScheduler()
        scheduler.add_job(actualizaciones, 'interval', seconds=40)
        scheduler.start()
    except Exception as e:
        print(e)

iniciarCargue()