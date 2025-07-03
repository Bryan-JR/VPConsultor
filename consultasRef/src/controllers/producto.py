from flask import Blueprint, request, jsonify
from src.models.producto_service import buscar_producto_por_codigo, buscar_productos_por_descripcion, servicio_productos

producto_bp = Blueprint('producto', __name__)

@producto_bp.route('/producto-pos', methods=['GET'])
def obtener_producto():
    codigo = request.args.get('codigo')
    if not codigo:
        return jsonify({'error': 'Código requerido'}), 400

    producto = buscar_producto_por_codigo(codigo)
    if producto:
        return jsonify({
            'referencia': producto['REFERENCIA'],
            'descripcion': producto['DESCRIPCION'],
            'precio_mayor': float(producto['PRECIOXMAYOR']),
            'precio_unidad': float(producto['PRECIOXUNIDAD']),
            'descuento': float(producto['DESCUENTO']),
            'unidad': producto['UNIDAD']
        })
    return jsonify({'error': 'Valide su codigo, producto no encontrado'}), 404

@producto_bp.route('/producto-pos/buscar', methods=['GET'])
def buscar_producto_por_descripcion():
    q = request.args.get('q', '').strip()
    if not q:
        return jsonify({'productos': []})

    productos = servicio_productos.buscar_productos_por_descripcion(q)

    resultados = [
        {
            'referencia': p['REFERENCIA'],
            'descripcion': p['DESCRIPCION'],
            'precio_mayor': float(p['PRECIOXMAYOR']),
            'precio_unidad': float(p['PRECIOXUNIDAD']),
            'descuento': float(p['DESCUENTO']),
            'unidad': p['UNIDAD'],
            'codigo_barras': p.get('CODIGO_BARRAS', '')
        }
        for p in productos
    ]

    return jsonify({'productos': resultados})