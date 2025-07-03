from flask import Blueprint, request, jsonify, render_template
from src.models.venta_service import guardar_venta, obtener_siguiente_numero_venta, obtener_venta_por_numero

venta_bp = Blueprint('venta', __name__)


# Rutas principales


# Ruta para guardar una venta
@venta_bp.route('/venta-pos', methods=['POST'])
def crear_venta():
    datos = request.json
    try:
        resultado = guardar_venta(datos)

        if not resultado.get("success"):
            return jsonify({'success': False, 'message': resultado.get("message", "Error desconocido")}), 500

        return jsonify({
            'success': True,
            'venta_id': resultado['factura_id'],
            'numero_venta': resultado['numero_venta']
        }), 201

    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500


# Ruta para obtener el siguiente número de venta
@venta_bp.route('/venta-pos/siguiente', methods=['GET'])
def siguiente_numero_venta():
    try:
        numero = obtener_siguiente_numero_venta()
        return jsonify({'success': True, 'numero_venta': numero}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500

# Ruta para obtener una venta por su número
@venta_bp.route('/venta-pos/<numero>', methods=['GET'])
def obtener_factura(numero):
    try:
        factura = obtener_venta_por_numero(numero)
        if not factura:
            return jsonify({'success': False, 'message': 'Factura no encontrada'}), 404
        return jsonify({'success': True, 'venta': factura}), 200
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)}), 500
