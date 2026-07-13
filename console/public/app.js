const terminalScreen = document.getElementById('terminal-screen');
const terminalForm = document.getElementById('terminal-form');
const cmdInput = document.getElementById('cmd-input');
const statusLight = document.getElementById('status-light');
const statusText = document.querySelector('.status-text');
const configWarning = document.getElementById('config-warning');

const storagePercentage = document.getElementById('storage-percentage');
const storageText = document.getElementById('storage-text');
const storageFill = document.getElementById('storage-fill');

const updateVersionBtn = document.getElementById('update-version-btn');
const resetWorldBtn = document.getElementById('reset-world-btn');

let config = {};

// Escribir línea en la terminal
function logToTerminal(message, type = 'output') {
    const line = document.createElement('div');
    line.className = `terminal-line ${type}-msg`;
    line.textContent = message;
    terminalScreen.appendChild(line);
    terminalScreen.scrollTop = terminalScreen.scrollHeight;
}

// Limpiar consola
function clearConsole() {
    terminalScreen.innerHTML = '<div class="terminal-line system-msg">[Panel] Consola limpia.</div>';
}

// Cargar la configuración de Railway desde el backend
async function checkConfig() {
    try {
        const res = await fetch('/api/config');
        config = await res.json();
        
        if (!config.hasToken) {
            configWarning.classList.remove('hidden');
            updateVersionBtn.disabled = true;
            resetWorldBtn.disabled = true;
        } else {
            configWarning.classList.add('hidden');
            updateVersionBtn.disabled = false;
            resetWorldBtn.disabled = false;
        }
    } catch (err) {
        console.error('Error al cargar la configuración:', err);
    }
}

// Consultar el estado del servidor (Online/Offline)
async function updateStatus() {
    try {
        const res = await fetch('/api/status');
        const data = await res.json();
        
        if (data.status === 'Online') {
            statusLight.className = 'status-glow online';
            statusText.textContent = `Online (Minecraft en ${config.rconHost || 'Railway'})`;
        } else {
            statusLight.className = 'status-glow offline';
            statusText.textContent = 'Offline (Servidor Apagado o Iniciando)';
        }
    } catch (err) {
        statusLight.className = 'status-glow offline';
        statusText.textContent = 'Error de conexión';
    }
}

// Consultar almacenamiento
async function updateStorage() {
    try {
        const res = await fetch('/api/storage');
        const data = await res.json();
        
        if (data.error) {
            storageText.textContent = 'Variable RAILWAY_VOLUME_ID no configurada';
            storagePercentage.textContent = 'N/A';
            storageFill.style.width = '0%';
            return;
        }

        const size = parseFloat(data.sizeMB);
        const current = parseFloat(data.currentSizeMB);
        
        // Conversión a GB
        const sizeGB = (size / 1024).toFixed(2);
        const currentGB = (current / 1024).toFixed(2);
        
        const percent = Math.min(Math.round((current / size) * 100), 100) || 0;
        
        storagePercentage.textContent = `${percent}%`;
        storageText.textContent = `${currentGB} GB usados de ${sizeGB} GB`;
        storageFill.style.width = `${percent}%`;

        // Color de la barra según uso
        if (percent > 85) {
            storageFill.style.background = 'linear-gradient(90deg, #ff5252, #ff1744)';
        } else if (percent > 60) {
            storageFill.style.background = 'linear-gradient(90deg, #ffb74d, #ff9100)';
        } else {
            storageFill.style.background = 'linear-gradient(90deg, #3cd070, #76ff03)';
        }
    } catch (err) {
        storageText.textContent = 'Error al leer espacio';
    }
}

// Enviar comandos
async function executeCommand(command) {
    if (!command.trim()) return;
    
    logToTerminal(`> ${command}`, 'command-sent');
    
    try {
        const res = await fetch('/api/command', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ command })
        });
        const data = await res.json();
        
        if (data.error) {
            logToTerminal(`[Error] ${data.error}`, 'error');
        } else {
            logToTerminal(data.output, 'output');
        }
    } catch (err) {
        logToTerminal(`[Error] Fallo en la comunicación con el panel: ${err.message}`, 'error');
    }
}

// Comandos rápidos
function sendQuickCommand(cmd) {
    executeCommand(cmd);
}

function promptOp() {
    const user = prompt("Ingresa el nombre del jugador para darle permisos de Administrador (OP):");
    if (user) {
        executeCommand(`op ${user}`);
    }
}

function promptWhitelist() {
    const user = prompt("Ingresa el nombre del jugador para añadir a la whitelist:");
    if (user) {
        executeCommand(`whitelist add ${user}`);
        executeCommand('whitelist on');
    }
}

// Cambiar versión
async function changeVersion() {
    const versionSelect = document.getElementById('version-select');
    const selectedVersion = versionSelect.value;
    
    if (!confirm(`¿Estás seguro de que quieres cambiar la versión a ${selectedVersion}? El servidor de Minecraft se reiniciará inmediatamente.`)) {
        return;
    }

    logToTerminal(`[Sistema] Enviando orden de actualizar versión a ${selectedVersion}...`, 'system-msg');
    
    try {
        const res = await fetch('/api/version', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ version: selectedVersion })
        });
        const data = await res.json();
        
        if (data.error) {
            logToTerminal(`[Error] ${data.error}`, 'error');
            alert(`Error: ${data.error}`);
        } else {
            logToTerminal(`[Sistema] ${data.message}`, 'system-msg');
            alert(data.message);
        }
    } catch (err) {
        logToTerminal(`[Error] Falló la petición: ${err.message}`, 'error');
    }
}

// Reiniciar Mundo (Reset)
async function resetWorld() {
    const seedInput = document.getElementById('seed-input');
    const seed = seedInput.value;

    const confirm1 = confirm("⚠️ ATENCIÓN: Estás a punto de ELIMINAR el mundo actual de Minecraft y crear uno completamente nuevo.\n¿Deseas continuar?");
    if (!confirm1) return;

    const confirm2 = confirm("🚨 ESTA ACCIÓN NO SE PUEDE DESHACER. Se borrará todo tu progreso. ¿Estás absolutamente seguro?");
    if (!confirm2) return;

    logToTerminal(`[Sistema] Reiniciando el mundo con semilla "${seed || 'Aleatoria'}"...`, 'system-msg');
    
    try {
        const res = await fetch('/api/reset-world', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ seed })
        });
        const data = await res.json();
        
        if (data.error) {
            logToTerminal(`[Error] ${data.error}`, 'error');
            alert(`Error: ${data.error}`);
        } else {
            logToTerminal(`[Sistema] ${data.message}`, 'system-msg');
            alert(data.message);
            seedInput.value = '';
        }
    } catch (err) {
        logToTerminal(`[Error] Falló la petición: ${err.message}`, 'error');
    }
}

// Manejar envío de terminal
terminalForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const command = cmdInput.value;
    if (command) {
        executeCommand(command);
        cmdInput.value = '';
    }
});

// Inicialización y ciclos
async function init() {
    await checkConfig();
    updateStatus();
    updateStorage();
    
    // Intervalo de status cada 10 segundos
    setInterval(updateStatus, 10000);
    // Intervalo de almacenamiento cada 30 segundos
    setInterval(updateStorage, 30000);
}

init();
