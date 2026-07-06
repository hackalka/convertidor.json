const fs = require('fs');
const path = require('path');

// Configuración de rutas de archivos
const rutaTxt = path.join(__dirname, 'RuNNeo0507.m3u.txt');
const rutaJson = path.join(__dirname, 'media.exolist234123412.json');

// Función principal para codificar el TXT/M3U a la estructura del JSON de ExoPlayer
function codificarM3uAJson() {
    try {
        // Verificar si existe el archivo de origen
        if (!fs.existsSync(rutaTxt)) {
            console.error(`Error: No se encuentra el archivo de origen en ${rutaTxt}`);
            return;
        }

        // Leer el contenido del archivo .txt
        const contenido = fs.readFileSync(rutaTxt, 'utf-8');
        const lineas = contenido.split(/\r?\n/);

        const muestras = [];
        let nombreActual = '';

        console.log('Iniciando el procesamiento de los enlaces...');

        // Iterar línea por línea para extraer la información
        for (let i = 0; i < lineas.length; i++) {
            const linea = lineas[i].trim();

            // Detectar la línea de metadatos del canal (#EXTINF)
            if (linea.startsWith('#EXTINF:')) {
                // Extraer todo lo que está después de la última coma (el nombre del canal)
                const partesComa = linea.split(',');
                if (partesComa.length > 1) {
                    nombreActual = partesComa.slice(1).join(',').trim();
                } else {
                    nombreActual = 'Canal sin nombre';
                }
            } 
            // Detectar la línea de la URL (omitiendo las líneas vacías y las opciones de VLC)
            else if (linea.startsWith('http://') || linea.startsWith('https://')) {
                if (nombreActual) {
                    muestras.push({
                        name: nombreActual,
                        uri: linea
                    });
                    // Resetear el nombre para la siguiente iteración
                    nombreActual = '';
                }
            }
        }

        // Construir la estructura final requerida por la lista de reproducción de ExoPlayer
        // Agrupamos todos tus canales bajo una sección llamada "Lista de Canales M3U"
        const estructuraJson = [
            {
                name: "Lista de Canales M3U",
                samples: muestras
            }
        ];

        // Escribir el archivo JSON resultante formateado
        fs.writeFileSync(rutaJson, JSON.stringify(estructuraJson, null, 2), 'utf-8');
        console.log(`\n¡Éxito! Se han codificado ${muestras.length} enlaces correctamente.`);
        console.log(`Archivo guardado en: ${rutaJson}`);

    } catch (error) {
        console.error('Ocurrió un error durante la conversión:', error);
    }
}

// Agregar esta función para convertir enlaces a JSON
function convertLinkToJson(url) {
    // Llamar a fetch para obtener el contenido del enlace
    fetch(url)
        .then(response => response.text())  // Obtener texto del enlace
        .then(text => {
            // Procesar el texto según el formato requerido (ej: M3U)
            const lines = text.split('\n');
            const samples = [];
            let currentName = '';

            for (let line of lines) {
                if (line.startsWith('#EXTINF:')) {
                    // Extraer nombre del canal
                    currentName = line.split(',').slice(1).join('').trim() || 'Canal sin nombre';
                } else if (line.startsWith('http://') || line.startsWith('https://')) {
                    samples.push({
                        name: currentName,
                        uri: line
                    });
                    currentName = '';
                }
            }

            // Devolver estructura JSON
            return {
                name: 'Lista de Canales M3U',
                samples: samples
            };
        });
}

// ==========================================
// TEMA ACESTREAM Y COMPONENTES VISUALES
// ==========================================
/* Para cumplir con los requisitos del tema "acestream", se exportan o definen 
  los estilos y configuraciones que aplicarás en la interfaz de tu reproductor 
  (por ejemplo, al renderizar la lista JSON generada).
*/
const TemaAcestream = {
    nombre: "acestream",
    colores: {
        principal: "#85B623",      // Verde característico de AceStream
        fondoOscuro: "#1E1E1E",    // Fondo de la app/lista
        textoBlanco: "#FFFFFF",    // Texto principal
        textoSecundario: "#AAAAAA",// Detalles del enlace/calidad
        bordeSeparador: "#2D2D2D"  // Líneas divisorias
    },
    estilosCss: `
        body.acestream-theme {
            background-color: #1E1E1E;
            color: #FFFFFF;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .playlist-group-title {
            color: #85B623;
            font-size: 1.4rem;
            font-weight: bold;
            padding: 10px 15px;
            border-bottom: 2px solid #85B623;
        }
        .channel-item {
            padding: 12px 20px;
            border-bottom: 1px solid #2D2D2D;
            transition: background 0.2s ease;
            cursor: pointer;
        }
        .channel-item:hover {
            background-color: #2A2A2A;
            color: #85B623;
        }
        .channel-uri {
            font-size: 0.8rem;
            color: #AAAAAA;
            display: block;
            margin-top: 4px;
            word-break: break-all;
        }
    `
};

// Ejecutar el proceso automático de codificación
codificarM3uAJson();

// Exportar el módulo por si necesitas integrarlo en otro script de tu servidor/app
module.exports = {
    codificarM3uAJson,
    convertLinkToJson,
    TemaAcestream
};