from flask import Blueprint, request, jsonify, render_template, send_from_directory
from src.models.Inventario import Inventario
from src.models.Referencias import Referencia
from src.models.UltimaFechaCompra import UltimaFechaCompra
from sqlalchemy import func, text
from src.db import Session, engine
import pandas as pd
import numpy as np
import os
import subprocess
from datetime import datetime, time
from apscheduler.schedulers.background import BackgroundScheduler # type: ignore
import shutil
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
        hora_fin = time(19, 40)
        hora_actual = datetime.now().time()

        if(hora_inicio <= hora_actual <= hora_fin):
            
                inv = os.path.join(ruta, "Inventario.txt")
                #tam = os.path.getsize(r'\\10.0.0.100\serveriltda\Iltda\Soporte Compartida\Inventario.txt')
                init = False
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
                    
                    # Guardar los cambios en la base de datos
                    session.commit()
                    print("Inventario actualizado correctamente.")
                    
                    # Retornar la suma de la EXISTENCIA
                
                    total_existencia = session.query(func.sum(Inventario.EXISTENCIA)).scalar() or 0
                    print(f"Total existencia: {total_existencia}")
                else:
                        print('cargando inventario...')
                    
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
        df = df[df['BODEGA'] == 1 | (df['BODEGA'] == 2)]
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

# METODO PARA BUSCAR UN INVENTARIO PARA UNA REFERENCIA
@controllerInventario.route('/inventario')
def inventarios():
    try:
        ref = request.args.get('r')
        resultados = []
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
                                                lp.DESCUENTO,
                                                (SELECT inv.COSTO FROM Inventarios AS inv WHERE inv.REFERENCIA = lp.REFERENCIA AND inv.BODEGA = '1') AS 'COSTO',
                                                lp.PRECIOXMAYOR,
                                                lp.PRECIOXUNIDAD,
                                                (SELECT FECHA FROM UltimaFechaCompra as fc WHERE fc.REFERENCIA = lp.REFERENCIA) as 'FECHACOMPRA'
                                            FROM ListaPreciosLectores as lp INNER JOIN Inventarios as i
                                                ON lp.REFERENCIA = i.REFERENCIA
                                                WHERE i.BODEGA IN ('1', '2', '20') {where}
                                            GROUP BY lp.REFERENCIA, lp.DESCRIPCION, lp.DESCUENTO, lp.PRECIOXMAYOR, lp.PRECIOXUNIDAD
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
                'descuento': inventario[5],
                'costo': inventario[6],
                'precioxmayor': inventario[7],
                'precioxunidad': inventario[8],
                'fechacompra': inventario[9],
                
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

def actualizaciones():
    try:
        actualizarInv()
        actualizarFechaCompra()
    except Exception as e:
        print("Error al actualizar: ", e)

def iniciarCargue():
    try:
        scheduler = BackgroundScheduler()
        scheduler.add_job(actualizaciones, 'interval', seconds=30)
        scheduler.start()
    except Exception as e:
        print(e)

iniciarCargue()