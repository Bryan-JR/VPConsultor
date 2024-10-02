from flask import Blueprint, request, render_template, redirect, url_for, flash, jsonify
import pandas as pd
import pyodbc
import os
from dotenv import load_dotenv

controllerArchivo = Blueprint('controllerArchivo', __name__)
load_dotenv()
server = os.getenv('DB_SERVER')
database = os.getenv('DB_DATABASE')
username = os.getenv('DB_USERNAME')
password = os.getenv('DB_PASSWORD')


# Configuración de la conexión a la nueva base de datos 'Consultas'
conexion_sql_server = 'DRIVER={ODBC Driver 17 for SQL Server};SERVER=',server,';DATABASE=',database,';UID=',username,';PWD=',password

@controllerArchivo.route('/buscar', methods=['POST'])
def buscar():
    query = request.form.get('query')
    resultados = buscar_referencia_o_descripcion(query)
    return jsonify(resultados)

def buscar_referencia_o_descripcion(query):
    try:
        print("Iniciar conexión")
        conn = pyodbc.connect(conexion_sql_server)
        print('Conectado a la base de datos')
        cursor = conn.cursor()
        sql_query = """
        SELECT REFERENCIA, DESCRIPCION, PRECIOXMAYOR, PRECIOXUNIDAD 
        FROM ListaPreciosLectores 
        WHERE REFERENCIA LIKE ? OR DESCRIPCION LIKE ?
        """
        print("Consulta preparada")
        cursor.execute(sql_query, (f'%{query}%', f'%{query}%'))
        print("consulta realizada")
        resultados = cursor.fetchall()
        conn.close()
        print("cursor cerrado")

        # Limita los resultados a 10
        resultados_limited = resultados[:10]

        # Retorna los resultados
        return [(row[0], row[1], row[2], row[3]) for row in resultados_limited]
    
    except Exception as e:
        print(f"Error al buscar en la base de datos: {str(e)}")
        return []

def actualizar_precios(referencia, nuevo_precio, nuevo_precio_iva):
    try:
        conn = pyodbc.connect(conexion_sql_server)
        cursor = conn.cursor()
        query = """
        UPDATE [dbo].[ListaPreciosLectores] 
        SET [PRECIOXMAYOR] = ?, [PRECIOXUNIDAD] = ? 
        WHERE [REFERENCIA] = ?
        """
        cursor.execute(query, (nuevo_precio, nuevo_precio_iva, referencia))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"Error al actualizar en la base de datos: {str(e)}")
        return False


@controllerArchivo.route('/actualizarPrecios', methods=['GET', 'POST'])
def actualizarPrecios():
    if request.method == 'POST':
        file = request.files.get('file')
        referencia = request.form.get('referencia')

        if file:  # Si se carga un archivo Excel
            try:
                filepath = os.path.join(file.filename)
                file.save(filepath)

                # Leer el archivo Excel
                df = pd.read_excel(filepath)

                # Validar y procesar datos del archivo Excel
                required_columns = ['BODEGA', 'REFERENCIA', 'DESCRIPCION', 'CODIGO_BARRAS', 'UNIDAD', 'PRECIOXMAYOR', 'PRECIOXUNIDAD', 'DESCUENTO', 'IMAGEN']
                if not all(col in df.columns for col in required_columns):
                    flash('El archivo Excel no tiene las columnas requeridas.', 'error')
                    return redirect(url_for('controllerArchivo.actualizarPrecios'))

                try:
                    conn = pyodbc.connect(conexion_sql_server)
                    cursor = conn.cursor()
                    cursor.execute('DELETE FROM ListaPreciosLectores')
                    conn.commit()
                    cursor.fast_executemany = True
                    cursor.executemany("""
                    INSERT INTO [dbo].[ListaPreciosLectores] (
                    [BODEGA], [REFERENCIA], [DESCRIPCION], [CODIGO_BARRAS], [UNIDAD], [PRECIOXMAYOR], [PRECIOXUNIDAD], [DESCUENTO],  [IMAGEN]
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, df[required_columns].values.tolist())
                    conn.commit()
                    conn.close()
                    flash('Archivo cargado y procesado exitosamente.', 'success')
                except Exception as e:
                    flash(f'Error al procesar el archivo: {str(e)}', 'error')

            except Exception as e:
                flash(f'Error al leer el archivo: {str(e)}', 'error')

            return redirect(url_for('controllerArchivo.actualizarPrecios'))
        
        elif referencia:  # Si se busca un producto
            resultados = buscar_referencia_o_descripcion(referencia)
            return render_template('cargueArchivo.html', resultados=resultados)
    
    return render_template('cargueArchivo.html')

@controllerArchivo.route('/editar/<string:referencia>', methods=['GET', 'POST'])
def editar(referencia):
    if request.method == 'POST':
        nuevo_precio = request.form['precio']
        nuevo_precio_iva = request.form['precio_iva']
        
        if actualizar_precios(referencia, nuevo_precio, nuevo_precio_iva):
            flash('Precios actualizados exitosamente.', 'success')  # Mensaje de éxito
            return redirect(url_for('controllerArchivo.actualizarPrecios'))
        else:
            flash('Error al actualizar los precios.', 'error')  # Mensaje de error
    
    referencia_data = buscar_referencia_o_descripcion(referencia)[0]
    return render_template('editarReferencia.html', referencia_data=referencia_data)







