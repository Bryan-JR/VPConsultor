from flask import Flask
from src.db import engine, Base
from waitress import serve
import ssl
from src.controllers.controllerReferencia import controllerReferencia
from src.controllers.controllerArchivo import controllerArchivo

app = Flask(__name__)
app.config['SECRET_KEY'] = 'plasdecor'
app.register_blueprint(controllerReferencia)
app.register_blueprint(controllerArchivo)

def formatear_moneda(valor):
    formato = "{:,.0f}".format(valor)
    result = formato.replace(',','.')
    return f'$ {result}'

# Registrar el filtro personalizado para formatear como moneda
@app.template_filter('moneda')
def moneda_colombiana_filter(valor):
    return formatear_moneda(valor)
    
def oculta_precio(valor):
    valorInv = f"{valor}"[::-1]
    return f"{valorInv[:2]}1P{valorInv[2:]}0P"

@app.template_filter('ocultar')
def oculta(valor):
    return oculta_precio(valor)

certfile = 'cert.pem'  
keyfile = 'key.pem'   

context = ssl.create_default_context(ssl.Purpose.CLIENT_AUTH)
context.load_cert_chain(certfile=certfile, keyfile=keyfile)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False, ssl_context=context) 
    
    #serve(app, host='0.0.0.0', port=8000)

