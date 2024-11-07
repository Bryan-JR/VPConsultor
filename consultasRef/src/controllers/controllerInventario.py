from flask import Blueprint, request, jsonify, render_template, send_from_directory
from src.models.Inventario import Inventario
from src.models.Referencias import Referencia
from sqlalchemy import func
from src.db import Session, engine
import pandas as pd
import os
import subprocess
from datetime import datetime, time
from apscheduler.schedulers.background import BackgroundScheduler # type: ignore
import shutil
controllerInventario = Blueprint('controllerInventario', __name__)

ruta = r'\\10.0.0.100\serveriltda\Iltda\Soporte Compartida'
inv = os.path.join(ruta, "Inventario.txt")


def datos(archivo):
    encodings = ['utf-8', 'ISO-8859-1', 'latin1']
    for encoding in encodings:
        try:
            return pd.read_csv(archivo, sep=';', encoding=encoding, on_bad_lines='skip', dtype={'REFERENCIA': str})
        except UnicodeDecodeError:
            continue
    raise ValueError("No se puede decodificar el archivo con codificaciones disponibles")

#@controllerInventario.route('/cargarInventario')
def cargarInv():
    try:
        session = Session()
        df = datos(inv)
        session.query(Inventario).delete()
        session.commit()
        
        df.to_sql('Inventario', con=engine, if_exists='append', index=False)
        print("Inventario ingresado correctamente.")  
    except Exception as e:
        print(e)
        session.rollback()  # Revertir en caso de error
        return print("Error: ", e)
    finally:
        session.close()

from sqlalchemy.orm import sessionmaker
from sqlalchemy import func

def traerInv():
    # Cambia de unidad y directorio
    subprocess.run(['cd', '..'], shell=True)
    subprocess.run(['cd', '..'], shell=True)
    subprocess.run(['I:'], shell=True)
    subprocess.run(['cd', 'Iltda\\sci'], shell=True)

    # Ejecuta AID.exe con parámetros y espera que termine
    process = subprocess.run(['AID.exe', '001', '744', '002', 'E', 'I\\Iltda\\sci'], shell=True)

    print(process.stdout)
    print("AID.exe ha terminado su ejecución.")

def actualizarInv():
    hora_inicio = time(7, 40)
    hora_fin = time(19, 40)
    hora_actual = datetime.now().time()

    if(hora_inicio <= hora_actual <= hora_fin):
        try:
            inv = os.path.join(ruta, "Inventario.txt")
            tam = os.path.getsize(r'\\10.0.0.100\serveriltda\Iltda\Soporte Compartida\Inventario.txt')
            init = False
            if tam > 2489999:
                session = Session()
                init = True
                df = datos(inv)
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
                        inventario_existente.ESTADO = int(row['ESTADO']) if pd.notna(row['ESTADO']) else None
                    else:
                        # Si no existe, crear un nuevo registro (nueva referencia)
                        nuevo_inventario = Inventario(
                            REFERENCIA=str(int(row['REFERENCIA'])),
                            BODEGA=int(row['BODEGA']),
                            LINEA=int(row['LINEA']),
                            EXISTENCIA=int(row['EXISTENCIA']),
                            ESTADO=int(row['ESTADO']) if pd.notna(row['ESTADO']) else None
                        )
                        session.add(nuevo_inventario)

                # Guardar los cambios en la base de datos
                session.commit()
                print("Inventario actualizado correctamente.")
                
                # Retornar la suma de la EXISTENCIA
                total_existencia = session.query(func.sum(Inventario.EXISTENCIA)).scalar() or 0
                print(f"Total existencia: {total_existencia}")

        except Exception as e:
            print("Error: ", e)
            session.rollback()  # Revertir en caso de error
        finally:
            if init:
                session.close()

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
                Inventario.ESTADO
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
                'estado': resultado.ESTADO
            }
            for resultado in resultados
        ]

        return jsonify(json)
    except Exception as e:
        print(e)
    finally:
        if ref!="":
            session.close()


#actualizarInv()
scheduler = BackgroundScheduler()
scheduler.add_job(actualizarInv, 'interval', minutes=1)
scheduler.start()