from flask import Blueprint, request, jsonify, render_template, send_from_directory
from src.models.Referencias import Referencia
from src.models.ReferenciasPulguero import ReferenciasPulguero
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_, text
from src.db import Session, engine
import pandas as pd
import numpy as np
from datetime import datetime, time
import os
import shutil
controllerReferencia = Blueprint('controllerReferencia', __name__)

def msg(client, mensaje):
    hora_actual = datetime.now()
    print(f'[{client}][{hora_actual}]: {mensaje}')

@controllerReferencia.route('/', methods=['GET'])
def inicio():
    try:
        msg(request.remote_addr, f"Inició en administrador de referencia.")
        start = request.args.get('i', 0, type=int)
        end = request.args.get('f', 10, type=int)
        session = Session()
        refs = session.query(Referencia).order_by(Referencia.REFERENCIA).offset(start).limit((end-start)).all()
        count = session.query(Referencia).count()
        info = {
            'start': start,
            'end': end,
            'count': count
        }
        return render_template("index.html", referencias=refs, info=info)
    except Exception as e:
        print(e)
    finally:
        session.close()

@controllerReferencia.route('/static/img/ProductosRaiz/<path:filename>')
def serve_image(filename):
    try:
        # Intentar servir la imagen solicitada
        return send_from_directory('static/img/ProductosRaiz', filename)
    except FileNotFoundError:
        # Si la imagen no se encuentra, retornar la imagen por defecto
        return send_from_directory('static/img/ProductosRaiz', 'noimage.jpg'), 200  # Cambiar a 200

@controllerReferencia.route('/buscar/<cod>', methods=['GET'])
def buscar(cod):
    try:
        session = Session()
        codBarras = cod
        msg(request.remote_addr, f"Buscó código de barras: ({codBarras})")
        ref = session.query(Referencia).filter_by(CODIGO_BARRAS=codBarras).first()
        return jsonify(ref.as_dict())
    except Exception as err:
        return jsonify({"error": f"Ocurrio un error: {err}"})
    finally:
        session.close()

@controllerReferencia.route('/consultar', methods=['GET'])
def consultar():
    msg(request.remote_addr, f"Lector conectado.")
    return render_template("lectores.html")

@controllerReferencia.route('/generador/etiquetas', methods=['GET'])
def generarEtiquetas():
    msg(request.remote_addr, f"Inició generador de etiquetas.")
    return render_template("generadorEtiquetas.html")

@controllerReferencia.route("/consultas")
def scan():
    msg(request.remote_addr, f"Inició consultor de referencias.")
    return render_template("consultas.html")

@controllerReferencia.route('/buscador')
def getReferencia():
    try:
        ref = request.args.get('search')
        tab = request.args.get('table')
        msg(request.remote_addr, f"Realiza busqueda: (referencia: {ref})(lista: {tab})")
        referencias = []
        if(ref!=""):
            db = Referencia
            if (tab=="pulguero"):
                db = ReferenciasPulguero
            else:
                db = Referencia
            session = Session()
            resp = session.query(db).filter(
                or_(
                    db.REFERENCIA==ref,
                    db.REFERENCIA.like(f'%{ref.upper()}%'),
                    db.DESCRIPCION.like(f'%{ref.upper()}%'),
                    db.CODIGO_BARRAS.like(f'%{ref.upper()}%')
                )
            ).limit(25).all()
            referencias = [ ref.as_dict() for ref in resp]
        return referencias
    except Exception as e:
        return jsonify({"error": f"Ocurrio un error: {e}"})
    finally:
        if(ref!=""):
            session.close()


FILE_PATH = r'\\10.0.0.96\Compartida\BaseEtiquetas\BASE.xlsx'
FILE_PATH_pulguero = r'\\10.0.0.96\Compartida\BaseEtiquetas\BASE_pulguero.xlsx'
FILE_PATH_DSTO = r'\\10.0.0.96\Compartida\BaseEtiquetas\BASEDESCUENTOS.xlsx'
@controllerReferencia.route("/guardarLista", methods=["POST"])
def guardar_datos():
    try:
        data = request.get_json()
        msg(request.remote_addr, f"Asigna etiquetas a la BASE BarTender.")
        datosBASE = data
        datosDsto = data     
        df1 = pd.DataFrame(datosBASE)
        df1 = df1.drop(columns=['descuento', 'precioDsto'])
        df2 = pd.DataFrame(datosDsto)
        with pd.ExcelWriter(FILE_PATH) as writer:
            df1.to_excel(writer, index=False)
        with pd.ExcelWriter(FILE_PATH_DSTO) as writer:
            df2.to_excel(writer, index=False)
        return jsonify({'message': 'Datos reescritos correctamente'}), 200
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500
    
@controllerReferencia.route("/guardarPulguero", methods=["POST"])
def guardar_pulguero():
    try:
        data = request.get_json()
        msg(request.remote_addr, f"Asigna etiquetas a la BASE Pulguero BarTender.")
        datosBASE = data
        datosDsto = data     
        df1 = pd.DataFrame(datosBASE)
        df1 = df1.drop(columns=['descuento', 'precioDsto'])
        df2 = pd.DataFrame(datosDsto)
        with pd.ExcelWriter(FILE_PATH_pulguero) as writer:
            df1.to_excel(writer, index=False)
        return jsonify({'message': 'Datos reescritos correctamente'}), 200
    except Exception as e:
        print(e)
        return jsonify({'error': str(e)}), 500
    
@controllerReferencia.route("/editar/<ref>", methods=['GET', 'POST'])
def editarPrecio(ref):
    try:
        msg(request.remote_addr, f"Edita la referencia: ({ref})")
        session = Session()
        datos = request.get_json()
        descripcion = datos.get('descripcion')
        precioxmayor = datos.get('precioxmayor')
        precioxunidad = datos.get('precioxunidad')
        descuento = datos.get('descuento')
        referencia = session.query(Referencia).get(ref)
        refOld = referencia.as_dict()
        referencia.DESCRIPCION = descripcion
        referencia.PRECIOXMAYOR = precioxmayor
        referencia.PRECIOXUNIDAD = precioxunidad
        referencia.DESCUENTO = descuento
        refNew = referencia.as_dict()
        session.commit()
        return [refOld, refNew]
    except Exception as e:
        return jsonify({'msg', f'error: {e}'})
    finally:
        session.close()
    
# ========================= FUNCIONES PARA CARGUE CARGUE DE ADATEC ===========================================

ruta_carpeta = r'\\Server\sciadatec'
ruta_carpeta_compartida = r'\\10.0.0.96\Compartida\PlanoPreciosLP'
ruta_original = os.path.join(ruta_carpeta_compartida,'LPL.txt')
ruta_copia = os.path.join(ruta_carpeta_compartida,'LPL-copia.txt')

def read_csv_with_encoding(filepath):
    encodings = ['utf-8', 'ISO-8859-1', 'latin1']
    for encoding in encodings:
        try:
            return pd.read_csv(filepath, sep=',', encoding=encoding, on_bad_lines='skip', dtype={'REFERENCIA': str})
        except UnicodeDecodeError:
            continue
    raise ValueError("No se puede decodificar el archivo con codificaciones disponibles")

@controllerReferencia.route('/sincronizar/precios')
def sincronizacion():
    try:
        msg(request.remote_addr, f"Inicia sincronización de referencias y precios.")
        session = Session()
        cont = session.query(Referencia).count()
        ultimoCargue = session.execute(text('''
                                           SELECT TOP(2) * FROM AuditoriaCargueReferencias ORDER BY FECHA DESC
                                         ''')).fetchall()

    # Imprimir los valores específicos de la fila
        return render_template('upload.html', contador=cont, ultimoCargue=ultimoCargue)
    except Exception as e:
        print(e)
    finally:
        session.close()

def getIva(tipoIva):
    iva = 0
    if (tipoIva >= 41 and tipoIva <= 46) or (tipoIva >=48 and tipoIva <=54):
        iva = 1.19
    elif tipoIva == 39 or tipoIva == 47 or tipoIva == 55 or tipoIva == 56:
        iva = 1.05
    elif tipoIva == 98 or tipoIva == 99:
        iva = 0
    return iva

@controllerReferencia.route('/process_files', methods=['POST'])
def process_files():
    try:
        msg(request.remote_addr, f"Preprocesado de archivo LPL.txt.")
        shutil.copy(ruta_original, ruta_copia)
        print(f"Copia del directorio realizada correctamente: {ruta_copia}")
        ruta_listas_precios = os.path.join(ruta_carpeta, 'AdatecListaPrecios.txt')
        ruta_kardex = os.path.join(ruta_carpeta, 'AdatecKardex.txt')
        ruta_imagenes = os.path.join(ruta_carpeta_compartida, 'Imagenes.txt')
        ruta_salida = os.path.join(ruta_carpeta_compartida, 'LPL.txt')

        listas_precios = read_csv_with_encoding(ruta_listas_precios)
        kardex = read_csv_with_encoding(ruta_kardex)
        imagenes = read_csv_with_encoding(ruta_imagenes)
        print("Cantidad en Kardex: ",len(kardex))

        listas_precios_bodega_02 = listas_precios[listas_precios['BODEGA'] == 2]
        kardex_bodega_02 = kardex[kardex['BODEGA'] == 2]


        kardex_activos = kardex_bodega_02[kardex_bodega_02['ESTADO ARTICULO'].isna() | (kardex_bodega_02['ESTADO ARTICULO'] == '') | (kardex_bodega_02['ESTADO ARTICULO'] == " ")]
        print("Cantidad 02: ", len(kardex_bodega_02))
        print("Cantidad 02 Activos: ", len(kardex_activos))

        kardex_activos = kardex_activos[['BODEGA', 'REFERENCIA', 'DESCRIPCION', 'CODIGO BARRAS', 'UNIDAD', 'PRECIO VENTA', 'TIPO IVA', 'DCTO VENTA']]


        kardex_activos['CODIGO BARRAS'] = kardex_activos.apply(
        lambda row: '20200' + row['REFERENCIA'] if pd.isna(row['CODIGO BARRAS']) or row['CODIGO BARRAS'] == '' else row['CODIGO BARRAS'], 
        axis=1
        )

        
        conditions = [
        (kardex_activos['TIPO IVA'].between(41, 46)) | (kardex_activos['TIPO IVA'].between(48, 54)),
        (kardex_activos['TIPO IVA'].isin([39, 47, 55, 56])),
        (kardex_activos['TIPO IVA'].isin([98, 99])),
        ]


        values = [1.19, 1.05, 1]
        kardex_activos['PRECIOXMAYOR'] = (kardex_activos['PRECIO VENTA'] * np.select(conditions, values, default=1)).round(0).astype(int)

        precios_01 = listas_precios_bodega_02[listas_precios_bodega_02['CODIGO LISTA DE PREC'] == 1][['REFERENCIA', 'PRECIO CON IVA']]
        precios_01 = precios_01.rename(columns={'PRECIO CON IVA': 'PRECIOXUNIDAD'})
        precios_01['PRECIOXUNIDAD'] = precios_01['PRECIOXUNIDAD'].fillna(0).round(0).astype(int)

        kardex_activos = kardex_activos.rename(columns={'CODIGO BARRAS': 'CODIGO_BARRAS', 'DCTO VENTA': 'DESCUENTO'})
        resultado = kardex_activos[['REFERENCIA', 'DESCRIPCION', 'CODIGO_BARRAS', 'UNIDAD', 'PRECIOXMAYOR', 'DESCUENTO']]
        resultado = resultado.merge(precios_01, on='REFERENCIA', how='left')

        imagenes.set_index('REFERENCIA', inplace=True)
        resultado['IMAGEN'] = resultado['REFERENCIA'].map(imagenes['IMAGEN']).fillna('noimage.jpg')
        resultado['CODIGO_BARRAS'] = resultado['CODIGO_BARRAS'].astype(str)
        resultado['CODIGO_BARRAS'] = resultado['CODIGO_BARRAS'].replace(r'\.0$', '', regex=True)
        resultado.to_csv(ruta_salida, index=False, sep=',')

        return jsonify(success=True,message="LPL.txt se genero con exito"), 200
    except Exception as e:
        print(e)
        return jsonify(success=False, message="No se genero con exito LPL.txt"), 500

@controllerReferencia.route('/process_pulguero', methods=['POST'])
def process_pulguero():
    try:
        msg(request.remote_addr, f"Preproceso de archivo LPL_pulguero.txt.")
        shutil.copy(ruta_original, ruta_copia)
        print(f"Copia del directorio realizada correctamente: {ruta_copia}")
        ruta_listas_precios = os.path.join(ruta_carpeta, 'AdatecListaPrecios.txt')
        ruta_kardex = os.path.join(ruta_carpeta_compartida, 'kardex_pulguero.txt')
        ruta_imagenes = os.path.join(ruta_carpeta_compartida, 'Imagenes.txt')
        ruta_salida = os.path.join(ruta_carpeta_compartida, 'LPL_pulguero.txt')

        listas_precios = read_csv_with_encoding(ruta_listas_precios)
        kardex = read_csv_with_encoding(ruta_kardex)
        imagenes = read_csv_with_encoding(ruta_imagenes)
        print("Cantidad en Kardex: ",len(kardex))

        listas_precios_bodega_02 = listas_precios[listas_precios['BODEGA'] == 7]
        kardex_bodega_02 = kardex[kardex['BODEGA'] == 7]


        kardex_activos = kardex_bodega_02[kardex_bodega_02['ESTADO ARTICULO'].isna() | (kardex_bodega_02['ESTADO ARTICULO'] == '')]
        print("Cantidad 07: ", len(kardex_bodega_02))
        print("Cantidad 07 Activos: ", len(kardex_activos))

        kardex_activos = kardex_activos[['BODEGA', 'REFERENCIA', 'DESCRIPCION', 'CODIGO BARRAS', 'UNIDAD', 'PRECIO VENTA', 'TIPO IVA', 'DCTO VENTA']]


        kardex_activos['CODIGO BARRAS'] = kardex_activos.apply(
        lambda row: '20200' + row['REFERENCIA'] if pd.isna(row['CODIGO BARRAS']) or row['CODIGO BARRAS'] == '' else row['CODIGO BARRAS'], 
        axis=1
        )

        
        conditions = [
        (kardex_activos['TIPO IVA'].between(41, 46)) | (kardex_activos['TIPO IVA'].between(48, 54)),
        (kardex_activos['TIPO IVA'].isin([39, 47, 55, 56])),
        (kardex_activos['TIPO IVA'].isin([98, 99])),
        ]


        values = [1.19, 1.05, 1]
        kardex_activos['PRECIOXMAYOR'] = (kardex_activos['PRECIO VENTA'] * np.select(conditions, values, default=1)).round(0).astype(int)

        precios_01 = listas_precios_bodega_02[listas_precios_bodega_02['CODIGO LISTA DE PREC'] == 6][['REFERENCIA', 'PRECIO CON IVA']]
        precios_01 = precios_01.rename(columns={'PRECIO CON IVA': 'PRECIOXUNIDAD'})
        precios_01['PRECIOXUNIDAD'] = precios_01['PRECIOXUNIDAD'].fillna(0).round(0).astype(int)

        kardex_activos = kardex_activos.rename(columns={'CODIGO BARRAS': 'CODIGO_BARRAS', 'DCTO VENTA': 'DESCUENTO'})
        resultado = kardex_activos[['REFERENCIA', 'BODEGA', 'DESCRIPCION', 'CODIGO_BARRAS', 'UNIDAD', 'PRECIOXMAYOR', 'DESCUENTO']]
        resultado = resultado.merge(precios_01, on='REFERENCIA', how='left')

        imagenes.set_index('REFERENCIA', inplace=True)
        resultado['IMAGEN'] = resultado['REFERENCIA'].map(imagenes['IMAGEN']).fillna('noimage.jpg')

        resultado.to_csv(ruta_salida, index=False, sep=',')

        return jsonify(success=True,message="LPL_pulguero.txt se genero con exito"), 200
    except Exception as e:
        print(e)
        return jsonify(success=False, message="No se genero con exito LPL_pulguero.txt"), 500

def actualizarImg():
    carpeta_imagenes = 'C:/Proyectos/consultasRef/static/img/ProductosRaiz/'

    session = Session()

    referencias = session.query(Referencia).all()

    for ref in referencias:
        ruta_imagen = os.path.join(carpeta_imagenes, f"{ref.REFERENCIA}.jpg")
        
        if os.path.isfile(ruta_imagen):
            ref.IMAGEN = f"{ref.REFERENCIA}.jpg"
        else:
            ref.IMAGEN = "noimage.jpg"
        
        session.add(ref)

    session.commit()
    session.close()


@controllerReferencia.route('/upload_lpl', methods=['GET'])
def upload_lpl():
    ruta_lpl = os.path.join(ruta_carpeta_compartida, 'LPL.txt')
    msg(request.remote_addr, f"Carga de archivo LPL.txt a la Base de datos.")
    try:
        session = Session()
        df = read_csv_with_encoding(ruta_lpl)
        session.query(Referencia).delete()
        session.commit()
        
        df.to_sql('ListaPreciosLectores', con=engine, if_exists='append', index=False)
        ultimoCargue = session.execute(text('''
                                           SELECT TOP(2) * FROM AuditoriaCargueReferencias ORDER BY FECHA DESC
                                         ''')).fetchall()
        infoCargue = {
            "ultMod": ultimoCargue[0][2],
            "ultCant": ultimoCargue[1][1]
        }
        cont = session.query(Referencia).count()
        actualizarImg()
        return jsonify(success=True, message="LPL.txt ha cargado con exito", cont=cont, ultimoCargue=infoCargue), 200
    except Exception as e:
        print(e)
        session.rollback()
        return jsonify(success=False, message="Error al cargar LPL.txt"), 500
    finally:
        session.close()
        
        
@controllerReferencia.route('/upload_pulguero', methods=['GET'])
def upload_lpl_pulguero():
    ruta_lpl = os.path.join(ruta_carpeta_compartida, 'LPL_pulguero.txt')
    msg(request.remote_addr, f"Carga de archivo LPL_pulguero.txt a la Base de datos.")
    try:
        session = Session()
        df = read_csv_with_encoding(ruta_lpl)
        session.query(ReferenciasPulguero).delete()
        session.commit()
        
        df.to_sql('ListaPreciosPulguero', con=engine, if_exists='append', index=False)
        ultimoCargue = session.execute(text('''
                                           SELECT TOP(2) * FROM AuditoriaCargueReferencias ORDER BY FECHA DESC
                                         ''')).fetchall()
        infoCargue = {
            "ultMod": ultimoCargue[0][2],
            "ultCant": ultimoCargue[1][1]
        }
        cont = session.query(ReferenciasPulguero).count()
        actualizarImg()
        return jsonify(success=True, message="LPL_pulguero.txt ha cargado con exito", cont=cont, ultimoCargue=infoCargue), 200
    except Exception as e:
        print(e)
        session.rollback()
        return jsonify(success=False, message="Error al cargar LPL_pulguero.txt"), 500
    finally:
        session.close()

@controllerReferencia.route('/check_files', methods=['GET'])
def check_files():
    archivos = {
        'AdatecListaPrecios.txt': (os.path.isfile(os.path.join(ruta_carpeta, 'AdatecListaPrecios.txt')), os.path.getsize(os.path.join(ruta_carpeta, 'AdatecListaPrecios.txt'))),
        'AdatecKardex.txt': (os.path.isfile(os.path.join(ruta_carpeta, 'AdatecKardex.txt')), os.path.getsize(os.path.join(ruta_carpeta, 'AdatecKardex.txt'))),
        'Imagenes.txt': (os.path.isfile(os.path.join(ruta_carpeta_compartida, 'Imagenes.txt')), os.path.getsize(os.path.join(ruta_carpeta_compartida, 'Imagenes.txt')))
    }
    return jsonify(archivos), 200