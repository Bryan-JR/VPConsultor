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

ruta = r'\\10.0.0.96\Compartida\Planos'
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
# def actualizarInv():
#     try:
#         hora_inicio = time(7, 40)
#         hora_fin = time(20, 40)
#         hora_actual = datetime.now().time()
#         init = False

#         # Archivo para guardar el log de referencias eliminadas
#         log_file = os.path.join(r'\\10.0.0.96\Compartida\logs', "referencias_eliminadas.log")

#         if hora_inicio <= hora_actual <= hora_fin:
#             inv = os.path.join(ruta, "Inventario.txt")
#             df = datos(inv)
#             NaN_ref = df['REFERENCIA'].isna().any()
#             NaN_lin = df['LINEA'].isna().any()
#             NaN_bd = df['BODEGA'].isna().any()
#             NaN_exi = df['EXISTENCIA'].isna().any()
#             NaN_cos = df['COSTO'].isna().any()

#             if not NaN_ref and not NaN_bd and not NaN_lin and not NaN_exi and not NaN_cos:
#                 # Calcular el costo ajustado según el tipo de IVA
#                 conditions = [
#                     (df['TIPO IVA'].between(41, 46)) | (df['TIPO IVA'].between(48, 54)),
#                     (df['TIPO IVA'].isin([39, 47, 55, 56])),
#                     (df['TIPO IVA'].isin([98, 99])),
#                 ]
#                 values = [1.19, 1.05, 1]
#                 df['COSTO'] = (df['COSTO'] * np.select(conditions, values, default=1)).round(0).astype(int)

#                 session = Session()
#                 init = True

#                 # Traer todos los registros existentes de la base de datos
#                 inventarios_existentes = session.query(Inventario).all()
#                 inventario_dict = {(inv.REFERENCIA, inv.BODEGA): inv for inv in inventarios_existentes}

#                 # Obtener todas las combinaciones de referencias y bodegas del DataFrame
#                 referencias_actualizadas = set((str(int(row['REFERENCIA'])), int(row['BODEGA'])) for _, row in df.iterrows())

#                 # Iterar sobre las filas del DataFrame y actualizar/agregar referencias
#                 for _, row in df.iterrows():
#                     clave = (str(int(row['REFERENCIA'])), int(row['BODEGA']))
#                     if clave in inventario_dict:
#                         # Si el registro existe, actualizar los valores
#                         inventario_existente = inventario_dict[clave]
#                         inventario_existente.LINEA = int(row['LINEA'])
#                         inventario_existente.EXISTENCIA = int(row['EXISTENCIA'])
#                         inventario_existente.PROVEEDOR = int(row['PROVEEDOR']) if pd.notna(row['PROVEEDOR']) else None
#                         inventario_existente.COSTO = int(row['COSTO']) if pd.notna(row['COSTO']) else None
#                     else:
#                         # Si no existe, crear un nuevo registro
#                         nuevo_inventario = Inventario(
#                             REFERENCIA=str(int(row['REFERENCIA'])),
#                             BODEGA=int(row['BODEGA']),
#                             LINEA=int(row['LINEA']),
#                             PROVEEDOR=int(row['PROVEEDOR']) if pd.notna(row['PROVEEDOR']) else None,
#                             SUBGRUPO=int(row['SUBGRUPO']) if pd.notna(row['SUBGRUPO']) else None,
#                             EXISTENCIA=int(row['EXISTENCIA']),
#                             COSTO=int(row['COSTO']) if pd.notna(row['COSTO']) else None
#                         )
#                         session.add(nuevo_inventario)

#                 # Identificar referencias que ya no están en el DataFrame y eliminarlas
#                 referencias_existentes = set(inventario_dict.keys())
#                 referencias_a_eliminar = referencias_existentes - referencias_actualizadas

#                 with open(log_file, "a") as log:
#                     for referencia in referencias_a_eliminar:
#                         inventario_existente = inventario_dict[referencia]
#                         session.delete(inventario_existente)

#                         # Guardar en el log las referencias eliminadas
#                         log.write(
#                             f"{datetime.now()} - Eliminada referencia: {referencia[0]}, Bodega: {referencia[1]}\n"
#                         )

#                 session.commit()

#                 # Calcular la suma total de la existencia actualizada
#                 total_existencia = session.query(func.sum(Inventario.EXISTENCIA)).scalar() or 0
#                 msg("SERVER", f"Inventario actualizado correctamente. Total existencia: ---* {total_existencia} *---")

#     except Exception as e:
#         print("Error en actualizar inventario: ", e)
#         session.rollback()  # Revertir en caso de error
#     finally:
#         if init:
#             session.close()


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

                    #referencias_actualizadas = set((str(int(row['REFERENCIA'])), int(row['BODEGA'])) for _, row in df.iterrows())

                    # Iterar sobre las filas del DataFrame
                    for _, row in df.iterrows():
                        clave = (str(int(row['REFERENCIA'])), int(row['BODEGA']))
                        if clave in inventario_dict:
                            # Si el registro existe, actualizar EXISTENCIA y ESTADO
                            inventario_existente = inventario_dict[clave]
                            inventario_existente.LINEA = int(row['LINEA'])
                            inventario_existente.EXISTENCIA = int(row['EXISTENCIA'])
                            inventario_existente.PROVEEDOR = int(row['PROVEEDOR']) if pd.notna(row['PROVEEDOR']) else None
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
                    
                    # referencias_existentes = set(inventario_dict.keys())
                    # referencias_a_eliminar = referencias_existentes - referencias_actualizadas
                    # print(referencias_a_eliminar)
                    
                    
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
        fechas = os.path.join(ruta, "MovCompras.txt")
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
    logFile = os.path.join(r'\\10.0.0.96\Compartida\logs', "peticiones.log")
    msg = f'[{client}][{hora_actual}]: {mensaje}'
    with open(logFile, "a") as log:
        log.write(f"{msg}\n")
    print(msg)

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
                                                (SELECT CASE WHEN inv_b1.COSTO = 0 THEN ISNULL((SELECT inv_b2.COSTO FROM Inventarios AS inv_b2 WHERE inv_b2.REFERENCIA = lp.REFERENCIA AND inv_b2.BODEGA = '2'), 0) ELSE inv_b1.COSTO END FROM Inventarios AS inv_b1 WHERE inv_b1.REFERENCIA = lp.REFERENCIA AND inv_b1.BODEGA = '1') AS 'COSTO',
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

proveedores = { 331: "ABOUGANEM Y CIA" , 554: "AE DISTRIBUCIONES" , 244: "AGRUPAR ENVASES" , 290: "ALBA SALGADO" , 442: "ALCEGA SAS" , 300: "ALEX  FAJARDO" , 422: "ALJAIR" , 529: "ALMACEN CASA HOGAR" , 431: "ALTURA S.A.S" , 2: "ALUMAR" , 528: "ALUMINIHOGAR S.A.S" , 329: "ALUMINIO RECOR E.U" , 428: "ALUMINIOS COMPANY" , 4: "ALUMINIOS INDIA" , 500: "ALUMINIOS MACK" , 147: "ALUMINIOS MUNAL" , 5: "ALUMINIOS ONAVA" , 3: "ALUMINIOS ROCA" , 516: "ALUMINIOS S & S" , 381: "ALVAPLAS S.A.S" , 347: "ALVARO CELIS PATIÑO" , 362: "AMAZONA EXPORT S.A.S" , 574: "ANDECOL" , 545: "ARANGO GUEVARA" , 332: "ARGELIA" , 553: "ARISBU" , 511: "ARTESANIAS EL HATO" , 452: "ARTESCO" , 317: "ARTICULOS CARTAGENA" , 311: "ARTICULOS NO CODIFICADOS" , 577: "AURA CAMPOS GARZON" , 392: "AUTOMACION" , 157: "AVANTPLAS" , 383: "AVERIAS" , 197: "BAMBOLOTTO S.A.S" , 402: "BARRILITO" , 243: "BEDER TABARES" , 360: "BLACK & DECKER" , 454: "BODEGA JY" , 455: "BODEGA MAYORISTA" , 312: "BOLSA DE REGALO" , 578: "BRYSNA" , 343: "C.C. AIRES S.A.S" , 354: "C.I ASIA EXPORT S.A.S" , 370: "CACHARRERIA MAXIMA" , 546: "CACHARRERIA NACIONAL" , 325: "CARTAGENA" , 209: "CARVAJAL EDUCACION" , 279: "CASA DEL DEPORTE" , 11: "CELLUX COLOMBIANA" , 411: "CERAMICAS BLAKER" , 440: "CHALLENGER" , 240: "CHINA 2014" , 410: "CHINA 2015" , 417: "CHINA 2016" , 514: "CHINA 2017" , 444: "CHINA 2018" , 510: "CHOCOROS" , 12: "CICLO ENERGIA" , 224: "COIMPRESORES" , 67: "COLALAMBRES S.A.S" , 357: "COLCHONES Y MUEBLES RELAX" , 13: "COLMUÑECOS S.A.S" , 355: "COLOMBIANA DE COMERCIO Y/O ALK" , 388: "COLOMBIANA DE PET" , 14: "COLOMBIANA KIMBERLY" , 217: "COLPATEX LTDA" , 15: "COLPLAST" , 566: "COMERCIALINC" , 17: "COMERCIALIZADORA CODEALAMBRE" , 235: "COMERCIALIZADORA DIVERTEX" , 533: "COMERCIALIZADORA HAUS" , 395: "COMERCIALIZADORA J.J" , 589: "COMERCIALIZADORA KAOZ" , 583: "COMERCIALIZADORA RT" , 18: "COMERCIALIZADORA SANTANDER" , 441: "COMERCIALIZADORA SERTA" , 380: "COMERCIALIZADORA SOLMEX S.A.S." , 19: "COMPAÑIA COLOMBIANA DE ESMALTE" , 210: "COMPAÑIA COMERCIAL G4" , 140: "CONTEX" , 21: "CORDEX S.A.S" , 9999: "CORRECCION EN PRECIOS" , 22: "COYSELL" , 268: "CREACIONES RJ" , 205: "CRISTALERIA BRASIL DO SANTOS" , 26: "CRISTAR S.A.S" , 246: "CRISTIAN GOMEZ" , 427: "CUADERNOS EL CID" , 348: "DAEWOO ELECTRONICS" , 299: "DAIRO PEREZ" , 247: "DARIO HENAO O DISTRIALUMINIOS" , 517: "DECORACION Y MODA PARA EL HOGA" , 572: "DECORGLASS" , 245: "DHOGAR+" , 573: "DIAJOR" , 557: "DIB ALFOMBRAS" , 288: "DISPRO" , 376: "DISTRIBUCIONES ABUCHAR" , 448: "DISTRIBUCIONES ADAL" , 556: "DISTRIBUCIONES J.A" , 523: "DISTRIBUCIONES J.O" , 232: "DISTRIBUCIONES OMN" , 372: "DISTRIBUCIONES YESER" , 588: "DISTRIBUIDORA 2D" , 30: "DISTRIBUIDORA ANGELITO" , 535: "DISTRIBUIDORA HOGAR PLAS" , 521: "DISTRIBUIDORA INFINITA" , 591: "DISTRIBUIDORA LA MIES" , 575: "DISTRIBUIDORA MM" , 374: "DISTRIBUIDORA PEPE" , 31: "DISTRIBUIDORA PERSAL" , 236: "DISTRIBUIDORA ROIMAN  S.A.S" , 520: "DISTRIBUIDORA TUOGAR S.A.S" , 366: "DISTRIMAFER" , 436: "DISTRIPLAST" , 350: "DISVINILOS LTDA" , 280: "DOBLE C" , 282: "DOLLY PEREZ" , 34: "DORICOLOR" , 421: "DULCES LA DELICIA" , 35: "DURAPLAST" , 36: "EBERHARD FABER" , 309: "EDINSON  RODRIGUEZ" , 508: "EDYPLAS LTDA" , 318: "EL PALACIO DEL HOGAR" , 38: "ELECTROLUX" , 503: "ELECTROMAX" , 326: "ELVIA GUTIERRREZ PANOLA" , 443: "ENCOPLAST" , 289: "ESCOBAR" , 334: "ESCOLARES VARIOS" , 40: "ESPUMADO LITORAL S.A" , 406: "ESTRA" , 356: "ESTUFAS CONTINENTAL" , 41: "EUSSE JIMENEZ" , 1000: "EVENTOS Y PUBLICIDAD" , 42: "EXPRESARTE" , 231: "FABRICA DE CORRALES GRUMAB" , 532: "FABRICOOK" , 43: "FABRIFOLDER S.A" , 568: "FABRIHOGAR" , 319: "FADIPLAS" , 229: "FAN STORE" , 44: "FANTIPLAS LTDA" , 45: "FERNANDO BENITEZ" , 46: "FINSA S.A" , 548: "FIPLAS LTDA" , 47: "FIRST INTERNATIONAL" , 273: "FITECOL" , 219: "FLEXICO INTERNATIONAL" , 446: "FORMAS Y COLORES S.A.S" , 292: "FREDDY MAURE" , 48: "FRODIPLAST S.A.S" , 269: "FUNDICIONES MONSALVE" , 403: "FUNDICIONES SILVANA" , 580: "FUNDICIONES Y REPUJADOS" , 221: "GAD" , 571: "GAMA SINERGIA" , 420: "GESTION HUMANA" , 541: "GIDA TOYS" , 49: "GIRAR PLASTICOS S.A.S" , 263: "GL PLASTICOS" , 404: "GOMEZUL LTDA" , 306: "GONZALO  SALAZAR" , 432: "G-PLAST" , 399: "GRAFICAS TJ LITOGRAFIA" , 561: "GRAN ANDINA" , 51: "GRAN ANDINA PLASTICOS" , 117: "GRANDES PLASTICOS DE COLOMBIA" , 52: "GROUPE SEB COLOMBIA" , 526: "GRUPO MVG SAS" , 537: "GRUPO NOVUM" , 425: "HACEB" , 301: "HAIDER  CAÑA" , 434: "HOGAR CENTER" , 222: "HOLLYWOOD" , 310: "HOMERO BERNAL" , 58: "HOYOS GOMEZ IVAN JOSE" , 414: "HYUNDAI" , 340: "I.C ESCALAR LTDA" , 59: "ILKOASEOS S.A.S" , 298: "IMPACTO" , 373: "IMPORTACIONES MULTIHOGAR" , 525: "IMPORTADORA GZ GROUP" , 518: "IMPORTADOS V.I.P" , 61: "IMPRESARTE" , 524: "IMPROMARKAS" , 234: "IMUSA" , 62: "INCAMETAL" , 581: "INDURAMA" , 63: "INDUSEL S.A." , 297: "INDUSTRIA NACIONAL DE PRODUCTO" , 64: "INDUSTRIAS BOSTON S.A.S" , 352: "INDUSTRIAS CANNON" , 522: "INDUSTRIAS COLOMBIA INDUCOL" , 66: "INDUSTRIAS FERMAR" , 226: "INDUSTRIAS IMAR S.A.S" , 400: "INDUSTRIAS LICUADORAS SUPER" , 65: "INDUSTRIAS MAKRIC S.A.S" , 68: "INDUSTRIAS PLESCO" , 211: "INDUSTRIAS RAPID Y CIA LTDA" , 384: "INDUSTRIAS SPRING SAS" , 69: "INDUSTRIAS VANYPLAS" , 70: "INGEPRODUCTOS S.A.S" , 555: "INMENSA" , 71: "INNOVACION DE COMPRESORES S.A." , 72: "INTELPLASTICOS S.A" , 237: "INTERESPUMAS" , 359: "INTERNATIONAL TRADE ADVISERS" , 238: "INVERPRIMOS" , 393: "INVERSIONES BIOPLAST SAS" , 429: "INVERSIONES DE LA RUE" , 536: "INVERSIONES DIOMARDI" , 342: "INVERSIONES REALES VERGARA E.U" , 339: "INVERSIONES VADISA S.A.S" , 278: "IVAN ARISTIZABAL" , 249: "IVAN MONTOYA" , 316: "J.A.G (DANIEL ARCILA)" , 351: "JAIME ALBERTO SIERRA" , 307: "JAVIER  ESTRADA" , 337: "JHON K GUERRERO" , 567: "JORGE ARIAS MARIN" , 382: "JOSE ALJAIR CASTRO" , 361: "JOSE ESCOBAR" , 251: "JUAN SILVA" , 385: "JUGUEPLAST CALI S.A.S." , 250: "JUGUEPLAST DEL VALLE LTDA" , 371: "JUGUETERIA PEREZ MEJIA S.A.S" , 321: "JUGUETES JOHANA" , 75: "JUGUETES Y MUÑECAS" , 76: "KANGUPOR" , 77: "KENDI" , 390: "KENDY COLOMBIA" , 78: "KICO" , 430: "KING´S FAM S.A.S" , 264: "KINGAS" , 79: "KOKI EDITORES S.A.S" , 453: "KORES" , 450: "KW DE COLOMBIA" , 527: "L&R SUMINISTROS DE ASEO" , 552: "LA FABRICA DE LOS TERMOS" , 375: "LA FANTASIA DEL JUGUETE" , 284: "LABORATORIOS BACHUE" , 364: "LABORATORIOS VIDA S.A.S" , 81: "LANDERS Y CIA" , 212: "LAZOS EXPRESS S. A" , 256: "LEON MAZO" , 304: "LEONARDO NIÑO" , 82: "LG ELECTRONICS" , 214: "LITOGRAFIA BERNA" , 83: "LOCERIA COLOMBIANA S.A." , 253: "LUIS ANGEL VALENCIA" , 308: "LUIS RIOS" , 296: "LUIS VILLACOR" , 86: "MABE COLOMBIA S.A" , 531: "MADA S.A.S" , 230: "MAKRO" , 419: "MANA DISTRIBUCIONES" , 254: "MANUEL JARAMILLO" , 587: "MARFIL" , 396: "MARGIL ICM SAS" , 199: "MARGIL VARIEDADES DOMESTICOS" , 547: "MARIA LUCELLY ORREGO" , 87: "MARIA´S KITCHEN" , 563: "MARQUETERIA OSTER" , 570: "MAS HOGAR" , 88: "MASTER KOLOR S.A" , 315: "MAURICIO  ARBELAEZ" , 324: "MAURICIO GOMEZ" , 90: "MECANICOS UNIDOS" , 540: "MEDELLIN IG" , 439: "MEGA RELOJ" , 405: "MEGADISTRIBUCIONES" , 285: "MELAFORM" , 338: "MIKO CLUB" , 255: "MILANS BALONES" , 274: "MILENA RIVERA" , 286: "MINIGOL" , 91: "MINIPLAST" , 539: "MOLDES Y PLASTICOS" , 225: "MONIX COLOMBIA S.A.S" , 213: "MONTANA CONTINENTAL COMPANY" , 424: "MOVISER" , 408: "MUEBLES DUMMI" , 215: "MULTI IDEAS LTDA" , 291: "MULTIMODA" , 93: "MUNDIPLAS S.A.S" , 344: "MUNDIÚTIL S.A.S" , 426: "MUÑEPLASTICOS" , 379: "MYTEK INTERNATIONAL INC" , 507: "NALDEPLAST" , 559: "NEDIS CHANTACA PEREZ" , 206: "NEOSTAR S.A.S" , 94: "NEW LIFE ELECTRONIC" , 585: "NIKA EDITORIAL" , 134: "NO APLICA" , 103: "NO EXISTE" , 220: "NOVA ZONA LIBRE IMPORTADO" , 95: "NOVAPLASTIC S.A" , 96: "NOVEDADES PLASTICAS" , 569: "NOWCLEANY" , 283: "OCAMPLAST" , 551: "OGUS JUGUETERIA" , 584: "OMAR HERNAN TORRES" , 544: "ORGANIZACION MINERVA" , 305: "OSCAR  PIEDRAHITA" , 100: "OSTER COLOMBIA" , 239: "PANAMA" , 367: "PANASIER" , 560: "PAPAGAYO" , 323: "PAPELERIA JAPON" , 208: "PAPELERIA OFIGOMEZ" , 512: "PAPELES PRIMAVERA" , 102: "PAPELESA" , 1100: "PARA CORREGIR DIFERENCIAS EN P" , 542: "PELTRE COLOMBIANO PELCOL" , 327: "PESEBRES TULUA" , 363: "PH PLASTICOS HOGAR S.A.S" , 322: "PIÑATERIA" , 386: "PLASCO C S.A.S" , 418: "PLASTI AMERICA" , 506: "PLASTI AMERICA CENTER" , 105: "PLASTI Z" , 579: "PLASTIC TRENDS" , 258: "PLASTICOS ARANA O DIST KATERIN" , 266: "PLASTICOS ARANGO" , 106: "PLASTICOS ASOCIADOS" , 107: "PLASTICOS BECELY S.A.S" , 353: "PLASTICOS BEED S.A.S" , 265: "PLASTICOS BRYSNA" , 437: "PLASTICOS COLVEN" , 108: "PLASTICOS CREATIVOS" , 543: "PLASTICOS DISEB" , 281: "PLASTICOS FENIX" , 110: "PLASTICOS INTEGRALES" , 111: "PLASTICOS LINEA HOGAR" , 112: "PLASTICOS MAFRA LTDA" , 262: "PLASTICOS MORRINSON" , 113: "PLASTICOS MQ LTDA" , 252: "PLASTICOS PILLI" , 277: "PLASTICOS RAZUL" , 115: "PLASTICOS RIMAX" , 160: "PLASTICOS RJ" , 228: "PLASTICOS ROYAL ABELLA" , 515: "PLASTICOS VES" , 320: "PLASTIFIESTA" , 365: "PLASTIRED S.A.S" , 445: "PLASTISELL" , 349: "PLASTYPELES S.A.S" , 389: "PLASUTIL" , 447: "PLAY COLA" , 530: "PLUS SOLUTIONS" , 412: "POLINES" , 227: "POLINPLAST" , 341: "POLYFORMAS COLOMBIA S.A.S" , 513: "POLYHOGAR" , 345: "PRAKTIPLAS DE COLOMBIA S.A.S" , 538: "PRODEHOGAR" , 119: "PRODUCTOS CONFORT S.A." , 248: "PRODUCTOS HOGARPLAS S.A.S" , 294: "PRODUCTOS ORO WHITE" , 190: "PROIMPAL" , 534: "PROIMPO" , 438: "PROMOPLAST S.A.S" , 121: "PROPANDINA S.A.S" , 207: "PROYECCIONES PLASTICAS Y CIA L" , 270: "RAFAEL NAVARRO" , 260: "RAFAEL VALERO" , 582: "RAGELY" , 287: "RALLACOCOS ( WALTER SALAS )" , 191: "RASCHELLTEX" , 123: "REDISA REPRESENTACIONES" , 202: "REPRESENTACIONES JUAN GONZALEZ" , 124: "REPRESENTACIONES Y DISTRIB NOS" , 415: "REPUESTOS" , 125: "REY" , 126: "RIMOPLASTICAS S.A." , 590: "RIO IMPORTADORA" , 335: "ROCKA" , 259: "RONIPLAS" , 330: "ROSEN" , 346: "RUMATEX DE COLOMBIA LTDA" , 451: "SABANA" , 129: "SAMSUNGS ELECTRONICS" , 130: "SANFORD COLOMBIA" , 131: "SANTIAGO ROJAS Y CIA" , 200: "SCRIBE COLOMBIA SAS" , 276: "SERMAPLASTICOS" , 398: "SHIMASU ELECTRONICS" , 449: "SOCODA" , 132: "SOINCO S.A.S" , 391: "SOLUCIONES DE PRODUCTOS" , 562: "SPRAY MEDELLIN" , 565: "STAR PLASTIC" , 328: "STILOTEX S.A.S" , 133: "SUDELEC" , 558: "SUECO" , 135: "SUPLASCOL" , 137: "SURAMERICANA DE PRODUCTOS PLAS" , 151: "SURAPLAS" , 138: "SUSAETA EDICIONES" , 409: "TALLER CASA NAZARETH" , 564: "TERMOS SAS" , 586: "TEXTILES DLB" , 407: "T-FAL" , 433: "THREE GROUP" , 261: "TITO ROBLES" , 401: "TORRE" , 336: "TOTTO" , 397: "TOY PARK" , 519: "TRADE STAR S.A.S" , 358: "TRADER GROUP S.A" , 435: "TRAMONTINA DE COLOMBIA S.A.S" , 204: "TRITEC INDUSTRIAL LTDA" , 178: "TUPLAST" , 295: "ULDARICO YEPEZ" , 233: "UMCO" , 313: "UNICO IMPORTADO" , 333: "UNIVERSAL S.A" , 550: "VAJILLA HOGAR" , 368: "VARIEDADES ALIRIO MEJIA" , 576: "VARIEDADES EN PLASTICOS" , 369: "VARIEDADES YEPO" , 378: "VARIEDADES YEYENY" , 423: "VARIOS" , 216: "VENTER COLOMBIA S.A.S" , 241: "VIDA PANAMA" , 416: "VIDRIERA J.F" , 387: "VIDRIERA OTUN" , 143: "VIDRIERIA CALDAS(VICAL S.A)" , 144: "VOMPLAST S.A.S" , 394: "WHIRLPOOL" , 267: "WILFER HOYOS (ALMOHADA)" , 192: "WILLIAN PULGARIN" , 413: "WILLIAN RESTREPO" , 509: "WJ PLAST" , 146: "ZETAPLAST S.A.S" , 549: "ZHONG HAO" , 377: "ZIPI ZAPE"}
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
                (SELECT CASE WHEN inv_b1.COSTO = 0 THEN ISNULL((SELECT inv_b2.COSTO FROM Inventarios AS inv_b2 WHERE inv_b2.REFERENCIA = lp.REFERENCIA AND inv_b2.BODEGA = '2'), 0) ELSE inv_b1.COSTO END FROM Inventarios AS inv_b1 WHERE inv_b1.REFERENCIA = lp.REFERENCIA AND inv_b1.BODEGA = '1') AS 'COSTO',
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