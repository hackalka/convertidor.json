const fs = require('fs');
const path = require('path');

// Configuración de rutas de archivos
const rutaTxt = path.join(__dirname, 'ck_alka.m3u.txt');
const rutaJson = path.join(__dirname, 'media.exolist234123412.json');

// Función principal para codificar el TXT/M3U a la estructura del JSON de ExoPlayer
const codificarM3uAJson = (m3uContent) => {
  const categories = [
    { name: 'NACIONALES', samples: [] },
    { name: 'DOCUMENTALES', samples: [] },
    { name: 'DEPORTES', samples: [] },
    { name: 'CINE Y SERIES', samples: [] },
    { name: 'RAKUTEN', samples: [] },
    { name: 'INFANTILES', samples: [] },
    { name: 'MÚnica', samples: [] }
  ];

  m3uContent.split('\n').forEach(line => {
    line = line.trim();
    if (!line) return;

    // Split into name and URI
    const [entryName, uri] = line.split(/\t|\s+/).slice(0, 2);

    // Determine category based on entry name
    const category = determineCategory(entryName);
    const categoryObj = categories.find(c => c.name === category);

    // Extract metadata
    const kid = extractKidFromUri(uri) || '';
    const key = extractKeyFromUri(uri) || '';
    const drmScheme = 'clearkey';
    const extension = getExtensionFromUri(uri) || 'mpd';

    // Add to samples
    categoryObj.samples.push({
      name: entryName,
      uri,
      kid,
      key,
      drm_scheme: drmScheme,
      extension
    });
  });

  return categories;
};

// Helper functions
const determineCategory = (name) => {
  // Implement category mapping logic
  const categoryMap = {
    'La 1': 'NACIONALES',
    'Antena 3': 'NACIONALES',
    'Cuatro': 'NACIONALES',
    'Telecinco': 'NACIONALES',
    'La Sexta': 'NACIONALES',
    'Divinity': 'NACIONALES',
    'Energy': 'NACIONALES',
    'FDF': 'NACIONALES',
    'Neox': 'NACIONALES',
    'Be Mad': 'NACIONALES',
    'MEGA': 'NACIONALES',
    'Ten': 'NACIONALES',
    'Canal Sur': 'NACIONALES',
    'Odisea': 'DOCUMENTALES',
    'Historia': 'DOCUMENTALES',
    'National Geographic': 'DOCUMENTALES',
    'Discovery': 'DOCUMENTALES',
    'LALIGA Setanta Sport 1': 'DEPORTES',
    'LALIGA Match! Futbol 2': 'DEPORTES',
    'LALIGA TV HYPERMOTION': 'DEPORTES',
    'PREMIER LEAGUE': 'DEPORTES',
    'MATCH! PREMIER': 'DEPORTES',
    'MATCH! FUTBOL 1': 'DEPORTES',
    'MATCH FUTBOL 3': 'DEPORTES',
    'LaLiga +': 'DEPORTES',
    'HORSE TV': 'DEPORTES',
    'WORLD POKER TOUR': 'DEPORTES',
    'REDBULLTV': 'DEPORTES',
    'EUROSPORT 1 (ES)': 'DEPORTES',
    'EUROSPORT 2 (ES)': 'DEPORTES',
    'VOTV': 'DEPORTES',
    'UFC': 'DEPORTES',
    'TENNIS CHANNEL': 'DEPORTES',
    'HARD KNOCKS': 'DEPORTES',
    'AMC': 'CINE Y SERIES',
    'TCM': 'CINE Y SERIES',
    'Warner TV': 'CINE Y SERIES',
    'Hollywood': 'CINE Y SERIES',
    'Paramount Network': 'CINE Y SERIES',
    'STÁR Channel': 'CINE Y SERIES',
    'COSMO': 'CINE Y SERIES',
    'SOMOS': 'CINE Y SERIES',
    'SUNDANCE TV': 'CINE Y SERIES',
    'XTRM': 'CINE Y SERIES',
    'Atreseries': 'CINE Y SERIES',
    'BOM Cine': 'CINE Y SERIES',
    'Cine Feel Good Verdi TV': 'CINE Y SERIES',
    'Cine Verdi TV': 'CINE Y SERIES',
    'CINES VERDI TV': 'CINE Y SERIES',
    'CINE FEEL GOOD': 'CINE Y SERIES',
    'SONY CINE': 'CINE Y SERIES',
    'SONY CINEMA': 'CINE Y SERIES',
    'CINE FRIKI': 'CINE Y SERIES',
    'FILM&CO': 'CINE Y SERIES',
    'Pelis Top': 'RAKUTEN',
    'Ación': 'RAKUTEN',
    'Comedia': 'RAKUTEN',
    'Drama': 'RAKUTEN',
    'Familia': 'RAKUTEN',
    'Películas Románticas': 'RAKUTEN',
    'Baby TV': 'INFANTILES',
    'Boing': 'INFANTILES',
    'Clan TVE': 'INFANTILES',
    'Enfamilia': 'INFANTILES',
    'Lolly Kids': 'INFANTILES',
    'TRACE LATINA': 'MÚnica',
    'TRACE URBAN': 'MÚnica',
    'Activa TV España': 'MÚnica',
    'Cadena Elite España': 'MÚnica',
    'Molahits TV España': 'MÚnica',
    'La Urban TV España': 'MÚnica',
    'Verbena TV España': 'MÚnica',
    'VM Latino Costa Rica': 'MÚnica'
  };
  return categoryMap[name] || 'OTROS';
};

const extractKidFromUri = (uri) => {
  const match = uri.match(/kid=([^&]+)/);
  return match ? match[1] : '';
};

const extractKeyFromUri = (uri) => {
  const match = uri.match(/key=([^&]+)/);
  return match ? match[1] : '';
};

const getExtensionFromUri = (uri) => {
  const ext = uri.split('.').pop() || 'mpd';
  return ext === 'm3u8' ? 'm3u8' : ext;
};

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
                        uri: linea,
                        kid: 'D4ddFD5FTCAtog1ZsmBTKQ',  // Valor fijo (ajustar si varía)
                        key: 'MqwWzb3XV17UnvyuaWMqDQ',  // Valor fijo (ajustar si varía)
                        drm_scheme: 'clearkey',
                        extension: 'mpd'
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

            // Parse M3U lines and extract metadata fields
            for (const line of lines) {
                if (line.startsWith('#EXTINF:')) {
                    const [, duration, title] = line.split(',', 2);
                    const metadata = {
                        kid: extractKidFromTitle(title) || 'default_kid',
                        key: extractKeyFromTitle(title) || 'default_key',
                        drm_scheme: extractDrmSchemeFromTitle(title) || 'clearkey',
                        extension: extractExtensionFromTitle(title) || 'mpd'
                    };
                    samples.push(metadata);
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