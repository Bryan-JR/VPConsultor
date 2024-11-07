import os
from sqlalchemy import update
from src.db import Session  # Importa tu sesión de base de datos
from src.models.Referencias import Referencia  # Importa el modelo Referencia

# Ruta de la carpeta de imágenes
carpeta_imagenes = 'C:/Proyectos/consultasRef/static/img/ProductosRaiz/'

# Inicia la sesión de base de datos
session = Session()

# Consulta todas las referencias en la base de datos
referencias = session.query(Referencia).all()

for ref in referencias:
    # Ruta completa de la imagen que debería tener el nombre de la referencia
    ruta_imagen = os.path.join(carpeta_imagenes, f"{ref.REFERENCIA}.jpg")
    
    # Verifica si la imagen existe
    if os.path.isfile(ruta_imagen):
        # Si existe, asigna el nombre de la imagen
        ref.IMAGEN = f"{ref.REFERENCIA}.jpg"
    else:
        # Si no existe, asigna "noimage.jpg"
        ref.IMAGEN = "noimage.jpg"
    
    # Agrega los cambios a la sesión
    session.add(ref)

# Commit de los cambios
session.commit()
session.close()
