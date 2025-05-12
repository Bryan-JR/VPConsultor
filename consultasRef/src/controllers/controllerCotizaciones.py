from flask import Flask, Blueprint, request, jsonify, render_template, json
#from flask_cors import CORS
import pyodbc


controllerCotizaciones = Blueprint('controllerCotizaciones', __name__)
#CORS(controllerCotizaciones)

# Conexión SQL Server
conn_str = (
    r"DRIVER={ODBC Driver 17 for SQL Server};"
    r"SERVER=10.0.0.96\SQLEXPRESS;"
    r"DATABASE=Cotizacion;"
    r"UID=sa;"
    r"PWD=@control2024;"
)

def obtener_conexion():
    try:
        conn = pyodbc.connect(conn_str)
        return conn
    except Exception as e:
        print("Error al conectar con la base de datos:", e)
        return None

def obtener_proxima_cotizacion():
    try:
        conn = obtener_conexion()
        if conn:
            cursor = conn.cursor()
            cursor.execute("SELECT ISNULL(MAX(Id), 0) + 1 FROM EncabezadoCotizacion")
            siguiente = cursor.fetchone()[0]
            conn.close()
            return f"VP{str(siguiente).zfill(5)}"  # Ej: VP00001
        return "VPERROR"
    except Exception as e:
        print("Error al obtener cotización:", e)
        return "VPERROR"


@controllerCotizaciones.route('/cotizaciones')
def index():
    # Obtener el próximo número de cotización basado en el próximo ID estimado
    numero_cotizacion = obtener_proxima_cotizacion()  # Ej: VP00001 si no hay registros
    return render_template('cotizacion.html', numero_cotizacion=numero_cotizacion)


@controllerCotizaciones.route('/guardar-cotizacion', methods=['POST'])
def guardar_cotizacion():
    data = request.json
    encabezado = data.get("encabezado")
    detalle = data.get("detalle")

    # Verificar que los campos del encabezado no estén vacíos
    required_fields = ["cliente", "direccion", "ciudad", "telefono", "nit", "forma_pago", "vendedor"]
    for field in required_fields:
        if not encabezado.get(field):
            return jsonify({"success": False, "mensaje": f"El campo '{field}' es obligatorio."})

    # Verificar que el detalle no esté vacío
    if not detalle or len(detalle) == 0:
        return jsonify({"success": False, "mensaje": "El detalle de productos no puede estar vacío."})

    try:
        conn = obtener_conexion()
        if conn:
            cursor = conn.cursor()

            # Generar código secuencial
            cursor.execute("SELECT ISNULL(MAX(Id), 0) + 1 FROM EncabezadoCotizacion")
            count = cursor.fetchone()[0]
            numero_cot = f"VP{count:05d}"

            # Insertar encabezado
            cursor.execute("""
                INSERT INTO EncabezadoCotizacion
                (Cliente, Direccion, Ciudad, Telefono, Nit, FormaPago, Vendedor)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (
                encabezado["cliente"],
                encabezado["direccion"],
                encabezado["ciudad"],
                encabezado["telefono"],
                encabezado["nit"],
                encabezado["forma_pago"],
                encabezado["vendedor"]
            ))
            conn.commit()

            cursor.execute("SELECT @@IDENTITY AS ID")
            id_encabezado = int(cursor.fetchone()[0])
            cursor.execute("SELECT NumeroCotizacion FROM EncabezadoCotizacion WHERE Id = ?", id_encabezado)
            numero_cot = cursor.fetchone()[0]

            # Insertar detalles
            for item in detalle:
                # Validar que cada producto tenga los campos requeridos
                if not all([item.get("codigo"), item.get("nombre"), item.get("cantidad"), item.get("precio_neto")]):
                    return jsonify({"success": False, "mensaje": "Todos los campos del detalle de producto son obligatorios."})
                
                # Validar que la cantidad sea un número positivo
                if not isinstance(item["cantidad"], int) or item["cantidad"] <= 0:
                    return jsonify({"success": False, "mensaje": "La cantidad debe ser un número entero positivo."})
                
                cursor.execute("""
                    INSERT INTO DetalleCotizacion
                    (EncabezadoId, Codigo, NombreProducto, Cantidad, PrecioNeto, TipoIVA, PrecioSinIVA, IVA, ValorNeto)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    id_encabezado,
                    item["codigo"],
                    item["nombre"],
                    item["cantidad"],
                    item["precio_neto"],
                    item["tipo_iva"],
                    item["precio_sin_iva"],
                    item["iva"],
                    item["valor_neto"]
                ))

            conn.commit()
            conn.close()

            return jsonify({"success": True, "mensaje": "Cotización guardada con éxito", "numero": numero_cot})

        return jsonify({"success": False, "mensaje": "No se pudo conectar con la base de datos."})

    except Exception as e:
        return jsonify({"success": False, "mensaje": str(e)})

