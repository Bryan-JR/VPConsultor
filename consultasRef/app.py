from flask import Flask, send_from_directory, make_response, redirect, request
from src.db import engine, Base
# from flask_socketio import SocketIO
from waitress import serve
import ssl
from src.controllers.controllerReferencia import controllerReferencia
from src.controllers.controllerArchivo import controllerArchivo
from src.controllers.controllerInventario import controllerInventario
from src.controllers.controllerProveedor import controllerProveedor
from src.controllers.controllerCotizaciones import controllerCotizaciones
import logging
from datetime import datetime, time
import os


app = Flask(__name__)
app.config['SECRET_KEY'] = 'plasdecor'
app.register_blueprint(controllerReferencia)
app.register_blueprint(controllerArchivo)
app.register_blueprint(controllerInventario)
app.register_blueprint(controllerProveedor)
app.register_blueprint(controllerCotizaciones)

def formatear_moneda(valor):
    formato = "{:,.0f}".format(valor)
    result = formato.replace(',','.')
    return f'$ {result}'

# Registrar el filtro personalizado para formatear como moneda
@app.template_filter('moneda')
def moneda_colombiana_filter(valor):
    return formatear_moneda(valor)

@app.route('/static/img/<path:filename>')
def serve_image(filename):
    try:
        response = make_response(send_from_directory('static/img', filename))
        response.headers['Cache-Control'] = 'public, max-age=31536000'  # 1 año
        return response
    except Exception as e:
        print(e)
    
@app.template_filter('fecha')
def formatear_fecha(fecha):
    # Diccionario para traducir los meses al idioma deseado
    meses = {
        1: "Ene", 2: "Feb", 3: "Mar", 4: "Abr", 5: "May", 6: "Jun",
        7: "Jul", 8: "Ago", 9: "Sep", 10: "Oct", 11: "Nov", 12: "Dic"
    }
    dia = fecha.day
    mes = meses[fecha.month]
    anio = fecha.year
    hora = fecha.strftime("%I:%M %p")
    return f"{dia} de {mes} del {anio} a las {hora}"

def oculta_precio(valor):
    valorInv = f"{valor}"[::-1]
    return f"{valorInv[:2]}1P{valorInv[2:]}0P"

@app.template_filter('ocultar')
def oculta(valor):
    return oculta_precio(valor)

def msg(client, mensaje):
    hora_actual = datetime.now()
    logFile = os.path.join(r'\\10.0.0.96\Compartida\logs', "peticiones.log")
    msg = f'[{client}][{hora_actual}]: {mensaje}'
    with open(logFile, "a") as log:
        log.write(f"{msg}\n")
    print(msg)

if __name__ == '__main__':
    #app.run(host='0.0.0.0', port=5000, debug=False, ssl_context=context) 
    # Iniciar Waitress con SSL
    # serve(
    #     app,
    #     host='0.0.0.0',
    #     port=8443,
    #     threads=4,
    #     url_scheme='https'
    # )
    #socketio.run(app, host='0.0.0.0', port=8443)
    msg('SERVER', '*** SERVIDOR INICIADO ***')
    serve(app, host='0.0.0.0', port=5050, threads=6)
    msg('SERVER', '*** SERVIDOR CERRADO ***')

