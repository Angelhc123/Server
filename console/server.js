const express = require('express');
const net = require('net');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Variables de entorno con valores por defecto
const RCON_HOST = process.env.RCON_HOST || 'server.railway.internal';
const RCON_PORT = parseInt(process.env.RCON_PORT || '25575', 10);
const RCON_PASSWORD = process.env.RCON_PASSWORD || 'minecraft_secret_123';

const RAILWAY_API_TOKEN = process.env.RAILWAY_API_TOKEN;
const RAILWAY_PROJECT_ID = process.env.RAILWAY_PROJECT_ID;
const RAILWAY_ENVIRONMENT_ID = process.env.RAILWAY_ENVIRONMENT_ID;
const RAILWAY_SERVICE_ID = process.env.RAILWAY_SERVICE_ID;
const RAILWAY_VOLUME_ID = process.env.RAILWAY_VOLUME_ID;

const PORT = process.env.PORT || 3000;

// =========================================================================
// PROTOCOLO RCON CLIENTE (NATIVO TCP)
// =========================================================================

function encodeRcon(id, type, payload) {
    const payloadBuf = Buffer.from(payload, 'utf-8');
    const len = 4 + 4 + payloadBuf.length + 2; // id (4) + type (4) + payload + null (1) + null (1)
    const buf = Buffer.alloc(len + 4);
    buf.writeInt32LE(len, 0);
    buf.writeInt32LE(id, 4);
    buf.writeInt32LE(type, 8);
    payloadBuf.copy(buf, 12);
    buf.writeUInt8(0, 12 + payloadBuf.length);
    buf.writeUInt8(0, 12 + payloadBuf.length + 1);
    return buf;
}

function sendRconCommand(command) {
    return new Promise((resolve, reject) => {
        const client = net.createConnection({ host: RCON_HOST, port: RCON_PORT }, () => {
            // Envía paquete de autenticación
            const authPacket = encodeRcon(1, 3, RCON_PASSWORD);
            client.write(authPacket);
        });

        let authenticated = false;
        let responseBuffer = Buffer.alloc(0);
        
        client.setTimeout(6000);

        client.on('data', (data) => {
            responseBuffer = Buffer.concat([responseBuffer, data]);
            while (responseBuffer.length >= 12) {
                const len = responseBuffer.readInt32LE(0);
                if (responseBuffer.length < len + 4) break;
                
                const id = responseBuffer.readInt32LE(4);
                const type = responseBuffer.readInt32LE(8);
                const payload = responseBuffer.slice(12, len + 3).toString('utf-8').trim();
                responseBuffer = responseBuffer.slice(len + 4);

                if (type === 2 && id === -1) {
                    client.end();
                    return reject(new Error('Contraseña RCON incorrecta.'));
                }

                if (!authenticated) {
                    if (id === 1) {
                        authenticated = true;
                        // Envía comando
                        const cmdPacket = encodeRcon(2, 2, command);
                        client.write(cmdPacket);
                    }
                } else {
                    client.end();
                    return resolve(payload);
                }
            }
        });

        client.on('error', (err) => {
            client.end();
            reject(new Error(`Error de conexión con RCON (${RCON_HOST}:${RCON_PORT}): ${err.message}`));
        });

        client.on('timeout', () => {
            client.end();
            reject(new Error('Conexión con el servidor de Minecraft excedió el tiempo de espera (Timeout).'));
        });
    });
}

// =========================================================================
// INTEGRACIÓN CON LA API DE RAILWAY (GRAPHQL)
// =========================================================================

async function queryRailwayAPI(query, variables) {
    if (!RAILWAY_API_TOKEN) {
        throw new Error('La variable RAILWAY_API_TOKEN no está configurada.');
    }
    const response = await fetch('https://backboard.railway.com/graphql/v2', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${RAILWAY_API_TOKEN}`
        },
        body: JSON.stringify({ query, variables })
    });
    const json = await response.json();
    if (json.errors) {
        throw new Error(json.errors[0].message);
    }
    return json.data;
}

// =========================================================================
// RUTAS DE LA API DEL PANEL
// =========================================================================

// Configuración general del panel (verifica qué variables de Railway están seteadas)
app.get('/api/config', (req, res) => {
    res.json({
        hasToken: !!RAILWAY_API_TOKEN,
        projectId: RAILWAY_PROJECT_ID || null,
        environmentId: RAILWAY_ENVIRONMENT_ID || null,
        serviceId: RAILWAY_SERVICE_ID || null,
        volumeId: RAILWAY_VOLUME_ID || null,
        rconHost: RCON_HOST
    });
});

// Enviar comandos a la consola
app.post('/api/command', async (req, res) => {
    const { command } = req.body;
    if (!command) {
        return res.status(400).json({ error: 'Falta el comando' });
    }
    try {
        const output = await sendRconCommand(command);
        res.json({ output: output || 'Comando ejecutado con éxito (sin salida).' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Ver el estado de conexión con Minecraft
app.get('/api/status', async (req, res) => {
    try {
        await sendRconCommand('list');
        res.json({ status: 'Online' });
    } catch (err) {
        res.json({ status: 'Offline', details: err.message });
    }
});

// Consultar espacio de almacenamiento del volumen
app.get('/api/storage', async (req, res) => {
    if (!RAILWAY_VOLUME_ID) {
        return res.json({ error: 'La variable RAILWAY_VOLUME_ID no está configurada.', sizeMB: 5120, currentSizeMB: 0 });
    }
    try {
        const query = `
            query VolumeMetrics($id: String!) {
                volumeInstance(id: $id) {
                    currentSizeMB
                    sizeMB
                }
            }
        `;
        const data = await queryRailwayAPI(query, { id: RAILWAY_VOLUME_ID });
        if (data && data.volumeInstance) {
            res.json(data.volumeInstance);
        } else {
            res.status(404).json({ error: 'No se encontraron métricas del volumen' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Cambiar la versión de Minecraft
app.post('/api/version', async (req, res) => {
    const { version } = req.body;
    if (!version) {
        return res.status(400).json({ error: 'Falta la versión' });
    }
    if (!RAILWAY_PROJECT_ID || !RAILWAY_ENVIRONMENT_ID || !RAILWAY_SERVICE_ID) {
        return res.status(400).json({ error: 'Faltan variables de configuración de Railway (Project, Environment o Service ID).' });
    }

    try {
        // 1. Actualizar la variable de entorno VERSION
        const upsertQuery = `
            mutation variableUpsert($input: VariableUpsertInput!) {
                variableUpsert(input: $input)
            }
        `;
        await queryRailwayAPI(upsertQuery, {
            input: {
                projectId: RAILWAY_PROJECT_ID,
                environmentId: RAILWAY_ENVIRONMENT_ID,
                serviceId: RAILWAY_SERVICE_ID,
                name: 'VERSION',
                value: version
            }
        });

        // 2. Disparar el re-despliegue del servidor de Minecraft
        const redeployQuery = `
            mutation serviceInstanceRedeploy($serviceId: String!, $environmentId: String!) {
                serviceInstanceRedeploy(serviceId: $serviceId, environmentId: $environmentId)
            }
        `;
        await queryRailwayAPI(redeployQuery, {
            serviceId: RAILWAY_SERVICE_ID,
            environmentId: RAILWAY_ENVIRONMENT_ID
        });

        res.json({ message: `Versión de Minecraft actualizada a ${version}. Reiniciando servidor...` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reiniciar el mundo (con semilla opcional)
app.post('/api/reset-world', async (req, res) => {
    const { seed } = req.body;
    if (!RAILWAY_PROJECT_ID || !RAILWAY_ENVIRONMENT_ID || !RAILWAY_SERVICE_ID) {
        return res.status(400).json({ error: 'Faltan variables de configuración de Railway.' });
    }

    try {
        // 1. Borrar carpetas del mundo vía comando RCON para que en el próximo reinicio se regenere.
        // Minecraft no deja borrar los archivos mientras corre, pero podemos indicarle al backend
        // que cambie el nombre del nivel o cambie la semilla.
        // La mejor manera y más segura en itzg/minecraft-server es cambiar la variable SEED y LEVEL.
        // Cambiaremos el nombre del nivel a un ID único con la semilla elegida, así itzg/minecraft-server
        // crea un mundo completamente nuevo desde cero.
        const newLevelName = `world_${Date.now()}`;
        const finalSeed = seed || Math.floor(Math.random() * 9999999999).toString();

        const upsertQuery = `
            mutation variableUpsert($input: VariableUpsertInput!) {
                variableUpsert(input: $input)
            }
        `;

        // Guardar LEVEL nuevo
        await queryRailwayAPI(upsertQuery, {
            input: {
                projectId: RAILWAY_PROJECT_ID,
                environmentId: RAILWAY_ENVIRONMENT_ID,
                serviceId: RAILWAY_SERVICE_ID,
                name: 'LEVEL',
                value: newLevelName
            }
        });

        // Guardar SEED nueva
        await queryRailwayAPI(upsertQuery, {
            input: {
                projectId: RAILWAY_PROJECT_ID,
                environmentId: RAILWAY_ENVIRONMENT_ID,
                serviceId: RAILWAY_SERVICE_ID,
                name: 'SEED',
                value: finalSeed
            }
        });

        // Disparar re-despliegue
        const redeployQuery = `
            mutation serviceInstanceRedeploy($serviceId: String!, $environmentId: String!) {
                serviceInstanceRedeploy(serviceId: $serviceId, environmentId: $environmentId)
            }
        `;
        await queryRailwayAPI(redeployQuery, {
            serviceId: RAILWAY_SERVICE_ID,
            environmentId: RAILWAY_ENVIRONMENT_ID
        });

        res.json({ message: `Mundo reiniciado con semilla ${finalSeed}. Nivel nuevo: ${newLevelName}. Reiniciando...` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Iniciar servidor web
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Minecraft Web Control Panel corriendo en http://0.0.0.0:${PORT}`);
});
