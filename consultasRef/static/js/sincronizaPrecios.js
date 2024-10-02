// Verificar si el archivo está siendo cargado 
console.log('scripts.js ha sido cargado correctamente');
let msg = document.getElementById("msg");

// Mostrar el indicador de carga
function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

// Ocultar el indicador de carga
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Mostrar estado de los archivos y validar
async function checkFiles() {
    await fetch('/check_files')
        .then(response => response.json())
        .then(data => {
            let message = '';
            let loadedFiles = [];

            for (const [file, exists] of Object.entries(data)) {
                const iconClass = exists ? 'check' : 'cross';
                const statusText = exists ? `${file} está cargado` : `${file} falta`;

                message += `
                    <div>
                        <span class="file-status-icon ${iconClass}"></span>
                        ${statusText}
                    </div>
                `;

                if (exists) {
                    loadedFiles.push(file);  // Agregar archivos que existen a la lista
                }
            }

            document.getElementById('file-status').innerHTML = message;

            // Validar si todos los archivos requeridos están cargados
            validateFiles(loadedFiles);
        })
        .catch(error => {
            document.getElementById('file-status').innerHTML = `
                <div>
                    <span class="file-status-icon cross"></span>
                    Error al comprobar archivos: ${error}
                </div>
            `;
        });
}

// Validar archivos cargados
function validateFiles(loadedFiles) {
    const requiredFiles = ['AdatecListaPrecios.txt', 'AdatecKardex.txt', 'Imagenes.txt'];
    const missingFiles = requiredFiles.filter(file => !loadedFiles.includes(file));
    const processBtn = document.getElementById('process-btn');
    const errorMessage = document.getElementById('error-message');

    if (missingFiles.length > 0) {
        processBtn.disabled = true;
        errorMessage.style.display = 'block';
        errorMessage.textContent = `Faltan los siguientes archivos: ${missingFiles.join(', ')}`;
    } else {
        processBtn.disabled = false;
        errorMessage.style.display = 'none';
    }
}

async function checkFiles() {
    await fetch('/check_files')
        .then(response => response.json())
        .then(data => {
            let message = '';
            for (const [file, exists] of Object.entries(data)) {
                // Define icon classes based on file existence
                const iconClass = exists ? 'check' : 'cross';
                const statusText = exists ? `${file} está cargado` : `${file} falta`;
                
                message += `
                    <div>
                        <span class="file-status-icon ${iconClass}"></span>
                        ${statusText}
                    </div>
                `;
            }
            document.getElementById('file-status').innerHTML = message;
        })
        .catch(error => {
            document.getElementById('file-status').innerHTML = `
                <div>
                    <span class="file-status-icon cross"></span>
                    Error al comprobar archivos: ${error}
                </div>
            `;
        });
}

// Función para enviar el archivo LPL con SweetAlert2
async function uploadLPL(event) {
    event.preventDefault(); // Evita la recarga de la página
    const formData = new FormData(event.target); // Obtiene los datos del formulario
    msg.innerText = "Procesando archivo LPL.txt...";
    showLoading();
    await processFiles();
    msg.innerText = "Cargando información a la base de datos...";
    showLoading();
    await fetch('/upload_lpl', {
        method: 'POST',
        body: formData,
    })
    .then(async response => response.json())
    .then(async data => {
        hideLoading(); // Ocultar el indicador de carga
        if (data.success) {
            await Swal.fire({
                title: 'Éxito',
                text: data.message,
                icon: 'success',
                confirmButtonText: 'OK'
            });
            document.getElementById("cont").innerText = data.cont;
        } else {
            await Swal.fire({
                title: 'Error',
                text: data.message,
                icon: 'error',
                confirmButtonText: 'OK'
            });
            return;
        }
    })
    .catch(async error => {
        hideLoading(); // Ocultar el indicador de carga
        await Swal.fire({
            title: 'Error',
            text: 'Hubo un problema al cargar el archivo LPL',
            icon: 'error',
            confirmButtonText: 'OK'
        });
    });
}

// Función para procesar archivos y generar LPL.txt con SweetAlert2 
async function processFiles() { 
     
    showLoading(); // Mostrar el indicador de carga

    await fetch('/process_files', { // Suponiendo que la ruta para procesar archivos es '/process_files' 
        method: 'POST', 
    }) 
    .then(response => response.json()) 
    .then(async data => { 
        hideLoading(); // Ocultar el indicador de carga
        if (data.success) { 
            await Swal.fire({ 
                title: 'Éxito', 
                text: data.message, 
                icon: 'success', 
                confirmButtonText: 'OK' 
            }); 
        } else { 
            await Swal.fire({ 
                title: 'Error', 
                text: data.message, 
                icon: 'error', 
                confirmButtonText: 'OK' 
            }); 
        } 
    }) 
    .catch(async error => { 
        hideLoading(); // Ocultar el indicador de carga
        await Swal.fire({ 
            title: 'Error', 
            text: 'Hubo un problema al procesar los archivos', 
            icon: 'error', 
            confirmButtonText: 'OK' 
        });
        return;
    }); 
}

// Lista de archivos requeridos
const requiredFiles = ['Kardex.txt', 'ListaPrecios.txt', 'Imagenes.txt'];

// Simulación de archivos cargados (esto dependería de tu lógica backend o cómo determines si los archivos están cargados)
let loadedFiles = [];

// Función para validar si todos los archivos están cargados
function validateFiles() {
    const missingFiles = requiredFiles.filter(file => !loadedFiles.includes(file));
    const processBtn = document.getElementById('process-btn');
    const errorMessage = document.getElementById('error-message');

    if (missingFiles.length > 0) {
        // Deshabilitar el botón si faltan archivos
        processBtn.disabled = true;

        // Mostrar mensaje de error
        errorMessage.style.display = 'block';
        errorMessage.textContent = `Faltan los siguientes archivos: ${missingFiles.join(', ')}`;
    } else {
        // Habilitar el botón si todos los archivos están presentes
        processBtn.disabled = false;

        // Ocultar mensaje de error
        errorMessage.style.display = 'none';
    }
}


// Ejecutar la función de checkFiles cuando la página se cargue 
window.onload = checkFiles;