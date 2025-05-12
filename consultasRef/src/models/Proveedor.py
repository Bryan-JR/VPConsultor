from sqlalchemy import Column, String, Integer
from src.db import Base

class Proveedor(Base):
    __tablename__ = 'Proveedor'
    PROVEEDOR = Column(Integer, primary_key=True)
    NOMBRE = Column(String)

    def as_dict(self):
        return {
            'proveedor': self.PROVEEDOR,
            'nombre': self.NOMBRE,
        }