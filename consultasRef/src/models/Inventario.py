from sqlalchemy import Column, Integer, String, Numeric
from src.db import Base

class Inventario(Base):
    __tablename__ = 'Inventario'
    ID = Column(Integer, primary_key=True)
    REFERENCIA = Column(String)
    BODEGA = Column(Integer)
    LINEA = Column(Integer)
    EXISTENCIA = Column(Integer)
    ESTADO = Column(Integer)

    def as_dict(self):
        return {
            'id': self.ID,
            'referencia': self.REFERENCIA,
            'bodega': self.BODEGA,
            'linea': self.LINEA,
            'existencia': self.EXISTENCIA,
            'estado': self.ESTADO
        }