from sqlalchemy import Column, String, DATE
from src.db import Base

class UltimaFechaCompra(Base):
    __tablename__ = 'UltimaFechaCompra'
    REFERENCIA = Column(String, primary_key=True)
    FECHA = Column(DATE)

    def as_dict(self):
        return {
            'referencia': self.REFERENCIA,
            'fecha': self.FECHA,
        }