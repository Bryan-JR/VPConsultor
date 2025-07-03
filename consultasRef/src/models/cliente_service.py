import csv
from pathlib import Path
import time

class ClienteService:
    def __init__(self):
        # Solución para el límite de campo CSV
        try:
            csv.field_size_limit(2147483647)  # Valor máximo para sistemas de 32 bits
        except OverflowError:
            csv.field_size_limit(131072)  # Valor por defecto si falla
            
        self.archivo_clientes = Path(r'D:\Compartida\PlanoPreciosLP\ClientesVP.txt')
        self._cache = {}
        self._ultima_actualizacion = 0
        self._encoding = 'latin-1'  # Encoding que sabemos que funciona

    def _cargar_clientes(self):
        """Carga clientes con mapeo completo de campos"""
        clientes = {}
        try:
            with open(self.archivo_clientes, 'r', encoding=self._encoding) as f:
                reader = csv.DictReader(f)
                for fila in reader:
                    nit = fila.get('CODIGO CLIENTE', '').strip()
                    if nit:
                        clientes[nit] = {
                            'nit': nit,
                            'nombre': fila.get('RAZON SOCIAL', '').strip(),
                            'departamento': fila.get('DEPARTAMENTO', '').strip(),
                            'ciudad': fila.get('CIUDAD', '').strip(),
                            'direccion': fila.get('DIRECCION', '').strip(),
                            'telefono': fila.get('CELULAR', '').strip() or 'No registrado',
                            'forma_pago': 'CONTADO',  # Valor por defecto
                            'vendedor': 'VENTA POS'  # Valor por defecto
                        }
                        # Diagnóstico: Mostrar estructura del primer cliente
                        if len(clientes) == 1:
                            print(f"\nEjemplo de primer cliente cargado: {clientes[nit]}")
        except Exception as e:
            print(f"Error al cargar clientes: {str(e)}")
        return clientes

    def buscar_cliente(self, nit):
        """Busca un cliente con caché"""
        nit = str(nit).strip()
        if not nit:
            return None
            
        if not self._cache:
            self._cache = self._cargar_clientes()
            self._ultima_actualizacion = time.time()
            
        return self._cache.get(nit)

def buscar_cliente_por_nit(nit):
    return ClienteService().buscar_cliente(nit)