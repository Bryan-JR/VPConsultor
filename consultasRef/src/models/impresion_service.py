import os
import platform
from datetime import datetime

class ImpresionService:
    def __init__(self):
        self.win32_available = False
        self._check_dependencies()
    
    def _check_dependencies(self):
        """Verifica si las dependencias de impresión están disponibles"""
        if os.name == 'nt' and platform.system() == 'Windows':
            try:
                import win32print
                self.win32_available = True
            except ImportError:
                print("Advertencia: pywin32 no está disponible. La impresión directa estará deshabilitada.")
    
    def imprimir_ticket(self, datos_venta):
        """Genera e imprime el ticket"""
        try:
            comando = self._generar_comando_epson(datos_venta)
            
            if self.win32_available:
                self._imprimir_en_windows(comando)
                return True, "Ticket enviado a la impresora"
            else:
                archivo = self._guardar_como_respaldo(comando)
                # CAMBIO: esto también es un éxito
                return True, f"Impresión simulada. Ticket guardado en: {archivo}"
                
        except Exception as e:
            return False, f"Error al imprimir: {str(e)}"
    
    def _generar_comando_epson(self, datos):
        """Genera los comandos ESC/POS para impresora Epson"""
        comando = b'\x1B\x40'  # Inicializar impresora
        
        # Encabezado (centrado)
        comando += b'\x1B\x61\x01'  # Centrar texto
        comando += b'\nPLASDECOR DE MONTERIA\n'.encode('latin1')
        comando += b'NIT: 900334132-2\n'.encode('latin1')
        comando += b'Calle 37 N\xb0 1B - 65 Monter\xeda\n'.encode('latin1')
        comando += b'Tel: 7810779 - 7814558 - 7811620\n\n'.encode('latin1')
        
        # Fecha y número de venta
        fecha = datetime.now().strftime('%d/%m/%Y %H:%M:%S')
        comando += f'FECHA: {fecha}\n'.encode('latin1')
        comando += f'VENTA N\xb0: {datos["numero_venta"]}\n\n'.encode('latin1')
        
        # Detalle de productos
        comando += b'\x1B\x45\x01'  # Negrita ON
        comando += 'DESCRIPCION          CANT  PRECIO   TOTAL\n'.encode('latin1')
        comando += b'\x1B\x45\x00'  # Negrita OFF
        
        for producto in datos['productos']:
            desc = producto['descripcion'][:20].ljust(20)
            linea = f"{desc} {producto['cantidad']:>3}  {producto['precio']:>7}  {producto['total']:>7}\n"
            comando += linea.encode('latin1')
        
        # Totales
        comando += b'\n' + b'-'*40 + b'\n'
        comando += f"SUBTOTAL: ${datos['subtotal']:>9}\n".encode('latin1')
        comando += f"TOTAL: ${datos['total']:>13}\n\n".encode('latin1')
        
        # Pie de página
        comando += b'\x1B\x61\x01'  # Centrar texto
        comando += b'Gracias por su compra!\n\n'
        comando += b'\x1D\x56\x41\x10'  # Cortar papel
        
        return comando
    
    def _imprimir_en_windows(self, comando):
        """Envía los comandos a la impresora en Windows"""
        import win32print
        printer_name = win32print.GetDefaultPrinter()
        hprinter = win32print.OpenPrinter(printer_name)
        try:
            win32print.StartDocPrinter(hprinter, 1, ("POS Ticket", None, "RAW"))
            win32print.StartPagePrinter(hprinter)
            win32print.WritePrinter(hprinter, comando)
            win32print.EndPagePrinter(hprinter)
        finally:
            win32print.ClosePrinter(hprinter)
    
    def _guardar_como_respaldo(self, comando):
        """Guarda el ticket como archivo para respaldo"""
        if not os.path.exists('tickets'):
            os.makedirs('tickets')
        
        archivo = os.path.join('tickets', f'ticket_{datetime.now().strftime("%Y%m%d_%H%M%S")}.prn')
        with open(archivo, 'wb') as f:
            f.write(comando)
        
        return archivo