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
            console.log(data);
            
            for (const [file, exists] of Object.entries(data)) {
                // Define icon classes based on file existence
                const iconClass = exists[0] ? 'check' : 'cross';
                const statusText = exists[0] ? `${file} está cargado (${(exists[1] / (1024 ** 2)).toFixed(2)} MB)` : `${file} falta`;
                
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

function fechaCargue() {
    // Array para traducir los meses al idioma deseado
    const meses = [
        "Ene", "Feb", "Mar", "Abr", "May", "Jun",
        "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"
    ];

    fecha = new Date();
    console.log(fecha.toLocaleString());
    
    const dia = fecha.getDate();
    const mes = meses[fecha.getMonth()];
    const anio = fecha.getFullYear();
    const opciones = { hour: 'numeric', minute: 'numeric', hour12: true };
    const hora = fecha.toLocaleTimeString('en-US', opciones);

    return `${dia} de ${mes} del ${anio} a las ${hora}`;
}

// Función para enviar el archivo LPL con SweetAlert2
async function uploadLPL(event) {
    event.preventDefault(); // Evita la recarga de la página
    msg.innerText = "Cargando información a la base de datos...";
    showLoading();
    await fetch('/upload_lpl', {
        method: 'GET',
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
            console.log(data);
            console.log(data.cont);
            console.log(data.ultimoCargue);
            document.getElementById("cont").innerText = data.cont;
            document.getElementById("ultMod").innerText = fechaCargue();
            document.getElementById("ultCant").innerText = data.ultimoCargue.ultCant;
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
            text: 'Hubo un problema: ' + error,
            icon: 'error',
            confirmButtonText: 'OK'
        });
        console.log(error);
    });
}

async function uploadLPL_pulguero(event) {
    event.preventDefault(); // Evita la recarga de la página
    await processFiles();
    msg.innerText = "Cargando información de pulguero a la base de datos...";
    showLoading();
    await fetch('/upload_pulguero', {
        method: 'GET',
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
            console.log(data);
            console.log(data.cont);
            console.log(data.ultimoCargue);
            document.getElementById("cont").innerText = data.cont;
            document.getElementById("ultMod").innerText = fechaCargue();
            document.getElementById("ultCant").innerText = data.ultimoCargue.ultCant;
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
            text: 'Hubo un problema: ' + error,
            icon: 'error',
            confirmButtonText: 'OK'
        });
        console.log(error);
    });
}

// Función para procesar archivos y generar LPL.txt con SweetAlert2 
async function processFiles() { 
    msg.innerText = "Procesando archivo LPL.txt...";
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
            text: 'Hubo un problema al procesar los archivos \n('+error+')', 
            icon: 'error', 
            confirmButtonText: 'OK' 
        });
        return;
    }); 
}

async function processFilesPulguero() { 
    msg.innerText = "Procesando archivo LPL_pulguero.txt...";
    showLoading(); // Mostrar el indicador de carga
    await fetch('/process_pulguero', { // Suponiendo que la ruta para procesar archivos es '/process_files' 
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
            text: 'Hubo un problema al procesar los archivos \n('+error+')', 
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