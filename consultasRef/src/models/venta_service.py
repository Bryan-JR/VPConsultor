import pyodbc

# Cadena de conexión a SQL Server
conn_str = (
    r'DRIVER={ODBC Driver 17 for SQL Server};'
    r'SERVER=10.0.0.96\SQLEXPRESS;'
    r'DATABASE=ventaPOS;'
    r'UID=sa;'
    r'PWD=@control2024;'
    r'TIMEOUT=60;'
)

def guardar_venta(data):
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()

    try:
        cliente = data.get('cliente', {})
        nit = cliente.get('documento', '')
        nombre_cliente = cliente.get('nombre', '')
        ciudad = cliente.get('ciudad', '')
        direccion = cliente.get('direccion', '')
        telefono = cliente.get('telefono', '')


        # Bloquea tabla y obtiene siguiente número
        cursor.execute("""
            SELECT ISNULL(MAX(CAST(SUBSTRING(numero_venta, 3, LEN(numero_venta)) AS INT)), 0) + 1
            FROM Facturas WITH (TABLOCKX, HOLDLOCK)
        """)
        siguiente_num = cursor.fetchone()[0]
        nuevo_numero = f"VP{siguiente_num:05d}"

        # Insertar Factura
        factura_sql = """
            INSERT INTO Facturas (
                numero_venta, nit, nombre_cliente, ciudad, direccion, telefono,
                forma_pago, vendedor, subtotal, descuento_total, total,
                monto_recibido, cambio
            )
            OUTPUT INSERTED.id
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """

        factura_values = (
            nuevo_numero,
            nit,
            nombre_cliente,
            ciudad,
            direccion,
            telefono,
            data['medio_pago'],
            data['vendedor'],
            data['subtotal'],
            data['descuento_total'],
            data['total'],
            data['recibido'],
            data['cambio']
        )

        factura_id = cursor.execute(factura_sql, factura_values).fetchone()[0]

        # Insertar Detalles
        detalle_sql = """
            INSERT INTO DetalleFactura (
                factura_id, codigo_producto, descripcion,
                precio_neto, descuento, cantidad, total
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """

        for producto in data.get('productos', []):
            cursor.execute(detalle_sql, (
                factura_id,
                producto.get('codigo', ''),
                producto.get('descripcion', ''),
                producto.get('precio', 0),
                producto.get('desc', 0),
                producto.get('cantidad', 0),
                producto.get('total', 0)
            ))
        print(f"[INFO] Completando venta #{nuevo_numero} con ID {factura_id}")
        conn.commit()

        return {
            "success": True,
            "factura_id": factura_id,
            "numero_venta": nuevo_numero
        }

    except Exception as e:
        conn.rollback()
        return {
            "success": False,
            "message": f"Error al guardar venta: {e}"
        }

    finally:
        conn.close()


def obtener_siguiente_numero_venta():
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()

    try:
        cursor.execute("SELECT TOP 1 numero_venta FROM Facturas ORDER BY id DESC")
        row = cursor.fetchone()

        if row:
            ultimo = row[0]
            numero = int(ultimo.replace("VP", ""))
            siguiente = numero + 1
        else:
            siguiente = 1

        return f"VP{siguiente:05d}"
    
    finally:
        conn.close()

def obtener_venta_por_numero(numero):
    import pyodbc
    conn = pyodbc.connect(conn_str)
    cursor = conn.cursor()

    try:
        # Limpiar espacios en el número de factura
        numero = numero.strip()

        # Buscar la factura
        cursor.execute("SELECT * FROM Facturas WHERE LTRIM(RTRIM(numero_venta)) = ?", (numero,))
        factura = cursor.fetchone()

        if not factura:
            print(f"[DEBUG] No se encontró la factura con número: '{numero}'")
            return None

        columnas_factura = [col[0] for col in cursor.description]
        datos_factura = dict(zip(columnas_factura, factura))

        print(f"[DEBUG] Factura encontrada: {datos_factura}")

        # Buscar los productos del detalle
        cursor.execute("SELECT * FROM DetalleFactura WHERE factura_id = ?", (datos_factura["id"],))
        detalles = cursor.fetchall()
        columnas_detalle = [col[0] for col in cursor.description]
        productos = [dict(zip(columnas_detalle, row)) for row in detalles]

        return {
            "numero": datos_factura["numero_venta"],
            "fecha": str(datos_factura["fecha"]) if datos_factura["fecha"] else "",
            "cliente": datos_factura["nombre_cliente"],
            "nit": datos_factura["nit"],
            "direccion": datos_factura["direccion"],
            "ciudad": datos_factura["ciudad"],
            "telefono": datos_factura["telefono"],
            "forma_pago": datos_factura["forma_pago"],
            "vendedor": datos_factura["vendedor"],
            "subtotal": float(datos_factura["subtotal"]),
            "descuento": float(datos_factura["descuento_total"]),
            "total": float(datos_factura["total"]),
            "recibido": float(datos_factura["monto_recibido"]),
            "vueltos": float(datos_factura["cambio"]),
            "detalle": productos
        }

    except Exception as e:
        print(f"[ERROR] Al obtener la factura: {e}")
        return None

    finally:
        conn.close()
