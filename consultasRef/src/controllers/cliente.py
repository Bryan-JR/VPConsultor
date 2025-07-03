from flask import Blueprint, request, jsonify
from src.models.cliente_service import buscar_cliente_por_nit

cliente_bp = Blueprint('cliente', __name__)

@cliente_bp.route('/cliente-pos', methods=['GET'])
def obtener_cliente():
    nit = request.args.get('nit')
    if not nit:
        return jsonify({'error': 'NIT requerido'}), 400

    cliente = buscar_cliente_por_nit(nit)
    if cliente:
        # Formatear respuesta para el frontend
        return jsonify({
            'nit': cliente.get('nit'),
            'nombre_cliente': cliente.get('nombre'),
            'ciudad': cliente.get('ciudad'),
            'direccion': cliente.get('direccion'),
            'telefono': cliente.get('telefono'),
            'forma_pago': cliente.get('forma_pago'),
            'vendedor': cliente.get('vendedor')
        })
    return jsonify({'error': 'Cliente no encontrado'}), 404