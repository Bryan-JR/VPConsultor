from sqlalchemy import Column, Integer, String, Numeric
from src.db import Base

class ReferenciasPulguero(Base):
    __tablename__ = 'ListaPreciosPulguero'
    REFERENCIA = Column(String, primary_key=True)
    BODEGA = Column(Integer)
    CODIGO_BARRAS = Column(String)
    DESCRIPCION = Column(String)
    UNIDAD = Column(String)
    PRECIOXMAYOR = Column(Integer)
    PRECIOXUNIDAD = Column(Integer)
    DESCUENTO = Column(Numeric)
    IMAGEN = Column(String)

    def as_dict(self):
        return {
            'referencia': self.REFERENCIA,
            'bodega': self.BODEGA,
            'codBarras': self.CODIGO_BARRAS,
            'descripcion': self.DESCRIPCION,
            'ue': self.UNIDAD,
            'precioxmayor': round(self.PRECIOXMAYOR/10)*10,
            'precioxunidad': round(self.PRECIOXUNIDAD/10)*10,
            'descuento': self.DESCUENTO,
            'img': self.IMAGEN,
        }