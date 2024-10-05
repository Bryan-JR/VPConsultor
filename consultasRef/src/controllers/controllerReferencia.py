from flask import Blueprint, request, jsonify, render_template, send_from_directory
from src.models.Referencias import Referencia
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import or_, text
from src.db import session, engine
import pandas as pd
import numpy as np
import os
import shutil
controllerReferencia = Blueprint('controllerReferencia', __name__)

@controllerReferencia.route('/', methods=['GET'])
def inicio():
    start = request.args.get('i', 0, type=int)
    end = request.args.get('f', 10, type=int)
    
    refs = session.query(Referencia).order_by(Referencia.REFERENCIA).offset(start).limit((end-start)).all()

    count = session.query(Referencia).count()
    info = {
        'start': start,
        'end': end,
        'count': count
    }
    return render_template("index.html", referencias=refs, info=info)

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
        codBarras = cod
        ref = session.query(Referencia).filter_by(CODIGO_BARRAS=codBarras).first()
        return jsonify(ref.as_dict())
    except Exception as err:
        return jsonify({"error": f"Ocurrio un error: {err}"})

@controllerReferencia.route('/consultar', methods=['GET'])
def consultar():
    return render_template("lectores.html")

@controllerReferencia.route('/generador/etiquetas', methods=['GET'])
def generarEtiquetas():
    return render_template("generadorEtiquetas.html")

@controllerReferencia.route("/consultas")
def scan():
    return render_template("consultas.html")

@controllerReferencia.route('/buscador')
def getReferencia():
    try:
        ref = request.args.get('search')
        referencias = []
        if(ref!=""):
            resp = session.query(Referencia).filter(
                or_(
                    Referencia.REFERENCIA==ref,
                    Referencia.REFERENCIA.like(f'%{ref.upper()}%'),
                    Referencia.DESCRIPCION.like(f'%{ref.upper()}%'),
                    Referencia.CODIGO_BARRAS.like(f'%{ref.upper()}%')
                )
            ).limit(15).all()
            referencias = [ ref.as_dict() for ref in resp]
        return referencias
    except Exception as e:
        return jsonify({"error": f"Ocurrio un error: {e}"})


FILE_PATH = r'\\10.0.0.96\Compartida\BaseEtiquetas\BASE.xlsx'
FILE_PATH_DSTO = r'\\10.0.0.96\Compartida\BaseEtiquetas\BASEDESCUENTOS.xlsx'
@controllerReferencia.route("/guardarLista", methods=["POST"])
def guardar_datos():
    try:
        data = request.get_json()
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
    
@controllerReferencia.route("/editar/<ref>", methods=['GET', 'POST'])
def editarPrecio(ref):
    try:
        datos = request.get_json()
        descripcion = datos.get('descripcion')
        precioxmayor = datos.get('precioxmayor')
        precioxunidad = datos.get('precioxunidad')
        referencia = session.query(Referencia).get(ref)
        refOld = referencia.as_dict()
        referencia.DESCRIPCION = descripcion
        referencia.PRECIOXMAYOR = precioxmayor
        referencia.PRECIOXUNIDAD = precioxunidad
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
        cont = session.query(Referencia).count()
        return render_template('upload.html', contador=cont)
    except Exception as e:
        print(e)

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


        kardex_activos = kardex_bodega_02[kardex_bodega_02['ESTADO ARTICULO'].isna() | (kardex_bodega_02['ESTADO ARTICULO'] == '')]
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
        resultado['IMAGEN'] = resultado['REFERENCIA'].map(imagenes['IMAGEN']).fillna('noimage.png')

        resultado.to_csv(ruta_salida, index=False, sep=',')

        return jsonify(success=True,message="LPL.txt se genero con exito"), 200
    except Exception as e:
        return jsonify(success=False, message="No se genero con exito LPL.txt"), 500

@controllerReferencia.route('/upload_lpl', methods=['POST'])
def upload_lpl():
    ruta_lpl = os.path.join(ruta_carpeta_compartida, 'LPL.txt')

    try:
        df = read_csv_with_encoding(ruta_lpl)
        session.query(Referencia).delete()
        session.commit()
        
        df.to_sql('ListaPreciosLectores', con=engine, if_exists='append', index=False)
        cont = session.query(Referencia).count()
        return jsonify(success=True, message="LPL.txt ha cargado con exito", cont=cont), 200
    except Exception as e:
        print(e)
        return jsonify(success=False, message="Error al cargar LPL.txt"), 500

@controllerReferencia.route('/check_files', methods=['GET'])
def check_files():
    archivos = {
        'AdatecListaPrecios.txt': os.path.isfile(os.path.join(ruta_carpeta, 'AdatecListaPrecios.txt')),
        'AdatecKardex.txt': os.path.isfile(os.path.join(ruta_carpeta, 'AdatecKardex.txt')),
        'Imagenes.txt': os.path.isfile(os.path.join(ruta_carpeta_compartida, 'Imagenes.txt'))
    }
    return jsonify(archivos), 200