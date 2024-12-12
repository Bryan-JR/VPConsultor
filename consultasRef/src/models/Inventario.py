from sqlalchemy import Column, Integer, String, Numeric
from src.db import Base

class Inventario(Base):
    __tablename__ = 'Inventarios'
    ID = Column(Integer, primary_key=True)
    REFERENCIA = Column(String)
    BODEGA = Column(Integer)
    LINEA = Column(Integer)
    PROVEEDOR = Column(Integer)
    SUBGRUPO = Column(Integer)
    EXISTENCIA = Column(Integer)
    ESTADO = Column(Integer)

    def as_dict(self):
        return {
            'id': self.ID,
            'referencia': self.REFERENCIA,
            'bodega': self.BODEGA,
            'linea': self.LINEA,
            'proveedor': self.PROVEEDOR,
            'subgrupo': self.SUBGRUPO,
            'existencia': self.EXISTENCIA,
            'estado': self.ESTADO
        }