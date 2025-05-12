from datetime import datetime
import os
import socket
from flask import Blueprint, request, jsonify, render_template, send_file
from src.models.Proveedor import Proveedor
from sqlalchemy import func, text
from src.db import Session, engine
from functools import lru_cache
controllerProveedor = Blueprint('controllerProveedor', __name__)

@lru_cache(maxsize=100)
def getName(ip):
    try:
        return socket.gethostbyaddr(ip)[0]  # Obtiene el nombre del equipo
    except socket.herror:
        return "Nombre no reconocido"

def msg(client, mensaje):
    hora_actual = datetime.now()
    logFile = os.path.join(r'\\10.0.0.96\Compartida\logs', "peticiones.log")
    msg = f'[{getName(client)} ({client})][{hora_actual}]: {mensaje}'
    with open(logFile, "a") as log:
        log.write(f"{msg}\n")
    print(msg)

@controllerProveedor.route('/proveedores')
def listarPro():
    try:
        msg(request.remote_addr, f"Cargando proveedores...")
        session = Session()
        prov = session.query(Proveedor).all()
        proveedores = [ p.as_dict() for p in prov]
        return jsonify(proveedores)
    except Exception as e:
        print(f'Ocurrio un error al traer los proveedores: {e}')
    finally:
        session.close()