import csv
from pathlib import Path

class ProductoService:
    def __init__(self):
        self.archivo_productos = Path(r'D:\Compartida\PlanoPreciosLP\LPL.txt')
        self._productos = {}
        self._lista_productos = []  # ← Agregado para búsquedas parciales
        self._cargar_productos()

    def _cargar_productos(self):
        try:
            with open(self.archivo_productos, 'r', encoding='latin-1') as f:
                reader = csv.DictReader(f)
                for producto in reader:
                    self._productos[producto['CODIGO_BARRAS']] = producto
                    self._productos[producto['REFERENCIA']] = producto
                    self._lista_productos.append(producto)  # ← Agregado
        except Exception as e:
            print(f"Error al cargar productos: {str(e)}")

    def buscar_producto(self, codigo):
        codigo = str(codigo).strip()
        return self._productos.get(codigo)

    def buscar_por_descripcion(self, texto):
        texto = texto.lower().strip()
        coincidencias = [
            p for p in self._lista_productos
            if texto in p['DESCRIPCION'].lower()
        ]
        return coincidencias[:15]
    
    def buscar_productos_por_descripcion(self, texto, limite=15):
        texto = texto.lower().strip()
        resultados = []

        for producto in self._productos.values():
            descripcion = producto['DESCRIPCION'].lower()

            # Coincidencias parciales múltiples (todos los términos deben estar en la descripción)
            if all(term in descripcion for term in texto.split()):
                resultados.append(producto)

            if len(resultados) >= limite:
                break

        return resultados


# Instancia global
servicio_productos = ProductoService()

def buscar_producto_por_codigo(codigo):
    return servicio_productos.buscar_producto(codigo)

def buscar_productos_por_descripcion(texto):
    return servicio_productos.buscar_por_descripcion(texto)


