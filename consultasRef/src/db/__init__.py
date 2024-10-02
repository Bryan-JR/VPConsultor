from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session
import urllib
import os
from dotenv import load_dotenv
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# Cargar variables de entorno
load_dotenv()

# Obtener las credenciales de la base de datos desde las variables de entorno
server = os.getenv('DB_SERVER')
database = os.getenv('DB_DATABASE')
username = os.getenv('DB_USERNAME')
password = os.getenv('DB_PASSWORD')

# Crear el URL de conexión
params = urllib.parse.quote_plus(f"DRIVER={{ODBC Driver 17 for SQL Server}};"
                                 f"SERVER={server};"
                                 f"DATABASE={database};"
                                 f"UID={username};"
                                 f"PWD={password}")

connection_string = f"mssql+pyodbc:///?odbc_connect={params}"

# Crear el motor de SQLAlchemy
engine = create_engine(connection_string)

# Crear una sesión
Session = scoped_session(sessionmaker(bind=engine))
session = Session()
