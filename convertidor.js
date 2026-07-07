const fs = require('fs');
const path = require('path');

// ============================================================
// CONVERTIDOR M3U → JSON (ExoPlayer / Tivimate / Estándar)
// Versión mejorada: DRM automático, categorización inteligente,
// múltiples formatos de salida, estadísticas y validación.
// ============================================================

// Configuración de rutas de archivos
const rutaTxt = path.join(__dirname, 'ck_alka.m3u.txt');
const rutaJson = path.join(__dirname, 'media.exolist234123412.json');

// ─── CATEGORÍAS PREDEFINIDAS ─────────────────────────────────
const CATEGORIAS_BASE = [
  { name: 'NACIONALES', samples: [] },
  { name: 'DOCUMENTALES', samples: [] },
  { name: 'DEPORTES', samples: [] },
  { name: 'CINE Y SERIES', samples: [] },
  { name: 'RAKUTEN', samples: [] },
  { name: 'INFANTILES', samples: [] },
  { name: 'MÚSICA', samples: [] },
  { name: 'INTERNACIONALES', samples: [] },
  { name: 'NOTICIAS', samples: [] },
  { name: 'REGIONALES', samples: [] },
  { name: 'OTROS', samples: [] }
];

// ─── MAPA DE CATEGORIZACIÓN (ampliado) ──────────────────────
const CATEGORY_MAP = {
  // NACIONALES
  'La 1': 'NACIONALES', 'La 1 HD': 'NACIONALES', 'TVE 1': 'NACIONALES',
  'La 2': 'NACIONALES', 'La 2 HD': 'NACIONALES', 'TVE 2': 'NACIONALES',
  'Antena 3': 'NACIONALES', 'Antena 3 HD': 'NACIONALES',
  'Cuatro': 'NACIONALES', 'Cuatro HD': 'NACIONALES',
  'Telecinco': 'NACIONALES', 'Telecinco HD': 'NACIONALES',
  'La Sexta': 'NACIONALES', 'La Sexta HD': 'NACIONALES',
  'Divinity': 'NACIONALES', 'Energy': 'NACIONALES', 'FDF': 'NACIONALES',
  'Neox': 'NACIONALES', 'Nova': 'NACIONALES', 'Be Mad': 'NACIONALES',
  'MEGA': 'NACIONALES', 'Ten': 'NACIONALES', 'DKISS': 'NACIONALES',
  'Trece': 'NACIONALES', 'GOL PLAY': 'NACIONALES', 'Real Madrid TV': 'NACIONALES',
  // DOCUMENTALES
  'Odisea': 'DOCUMENTALES', 'Historia': 'DOCUMENTALES', 'Canal Historia': 'DOCUMENTALES',
  'National Geographic': 'DOCUMENTALES', 'Nat Geo Wild': 'DOCUMENTALES',
  'Discovery': 'DOCUMENTALES', 'Discovery Channel': 'DOCUMENTALES',
  'Canal Cocina': 'DOCUMENTALES', 'Decasa': 'DOCUMENTALES', 'Caza y Pesca': 'DOCUMENTALES',
  'Iberalia TV': 'DOCUMENTALES', 'Mezzo': 'DOCUMENTALES', 'Mezzo Live': 'DOCUMENTALES',
  // DEPORTES
  'LALIGA Setanta Sport 1': 'DEPORTES', 'LALIGA Match! Futbol 2': 'DEPORTES',
  'LALIGA TV HYPERMOTION': 'DEPORTES', 'PREMIER LEAGUE': 'DEPORTES',
  'MATCH! PREMIER': 'DEPORTES', 'MATCH! FUTBOL 1': 'DEPORTES',
  'MATCH FUTBOL 3': 'DEPORTES', 'LaLiga +': 'DEPORTES',
  'HORSE TV': 'DEPORTES', 'WORLD POKER TOUR': 'DEPORTES', 'REDBULLTV': 'DEPORTES',
  'EUROSPORT 1 (ES)': 'DEPORTES', 'EUROSPORT 2 (ES)': 'DEPORTES',
  'EUROSPORT 1': 'DEPORTES', 'EUROSPORT 2': 'DEPORTES',
  'VOTV': 'DEPORTES', 'UFC': 'DEPORTES', 'TENNIS CHANNEL': 'DEPORTES',
  'HARD KNOCKS': 'DEPORTES', 'DAZN': 'DEPORTES', 'DAZN 1': 'DEPORTES',
  'DAZN 2': 'DEPORTES', 'DAZN F1': 'DEPORTES', 'M+ Deportes': 'DEPORTES',
  'M+ Golf': 'DEPORTES', 'M+ LaLiga': 'DEPORTES', 'M+ Champions': 'DEPORTES',
  'ESPN': 'DEPORTES', 'ESPN 2': 'DEPORTES', 'FOX Sports': 'DEPORTES',
  // CINE Y SERIES
  'AMC': 'CINE Y SERIES', 'TCM': 'CINE Y SERIES', 'Warner TV': 'CINE Y SERIES',
  'Hollywood': 'CINE Y SERIES', 'Paramount Network': 'CINE Y SERIES',
  'STÁR Channel': 'CINE Y SERIES', 'COSMO': 'CINE Y SERIES', 'SOMOS': 'CINE Y SERIES',
  'SUNDANCE TV': 'CINE Y SERIES', 'XTRM': 'CINE Y SERIES', 'Atreseries': 'CINE Y SERIES',
  'BOM Cine': 'CINE Y SERIES', 'Cine Feel Good Verdi TV': 'CINE Y SERIES',
  'Cine Verdi TV': 'CINE Y SERIES', 'CINES VERDI TV': 'CINE Y SERIES',
  'CINE FEEL GOOD': 'CINE Y SERIES', 'SONY CINE': 'CINE Y SERIES',
  'SONY CINEMA': 'CINE Y SERIES', 'CINE FRIKI': 'CINE Y SERIES', 'FILM&CO': 'CINE Y SERIES',
  'AXN': 'CINE Y SERIES', 'AXN White': 'CINE Y SERIES', 'Calle 13': 'CINE Y SERIES',
  'Syfy': 'CINE Y SERIES', 'Comedy Central': 'CINE Y SERIES', 'Dark': 'CINE Y SERIES',
  // RAKUTEN
  'Pelis Top': 'RAKUTEN', 'Acción': 'RAKUTEN', 'Comedia': 'RAKUTEN',
  'Drama': 'RAKUTEN', 'Familia': 'RAKUTEN', 'Películas Románticas': 'RAKUTEN',
  'Terror': 'RAKUTEN', 'Ciencia Ficción': 'RAKUTEN', 'Suspense': 'RAKUTEN',
  // INFANTILES
  'Baby TV': 'INFANTILES', 'Boing': 'INFANTILES', 'Clan TVE': 'INFANTILES',
  'Enfamilia': 'INFANTILES', 'Lolly Kids': 'INFANTILES', 'Disney Channel': 'INFANTILES',
  'Nickelodeon': 'INFANTILES', 'Nick Jr': 'INFANTILES', 'Cartoon Network': 'INFANTILES',
  'Panda': 'INFANTILES', 'Canal Panda': 'INFANTILES',
  // MÚSICA
  'TRACE LATINA': 'MÚSICA', 'TRACE URBAN': 'MÚSICA', 'Activa TV España': 'MÚSICA',
  'Cadena Elite España': 'MÚSICA', 'Molahits TV España': 'MÚSICA',
  'La Urban TV España': 'MÚSICA', 'Verbena TV España': 'MÚSICA',
  'VM Latino Costa Rica': 'MÚSICA', 'MTV': 'MÚSICA', 'MTV España': 'MÚSICA',
  '40 TV': 'MÚSICA', '40 Latino': 'MÚSICA', 'VH1': 'MÚSICA',
  // INTERNACIONALES
  'BBC One': 'INTERNACIONALES', 'BBC Two': 'INTERNACIONALES', 'BBC News': 'INTERNACIONALES',
  'CNN': 'INTERNACIONALES', 'CNN en Español': 'INTERNACIONALES',
  'Bloomberg': 'INTERNACIONALES', 'CNBC': 'INTERNACIONALES',
  'TV5 Monde': 'INTERNACIONALES', 'France 24': 'INTERNACIONALES',
  'DW': 'INTERNACIONALES', 'RT': 'INTERNACIONALES', 'Al Jazeera': 'INTERNACIONALES',
  'Rai 1': 'INTERNACIONALES', 'Rai 2': 'INTERNACIONALES', 'RTP': 'INTERNACIONALES',
  'TV Globo': 'INTERNACIONALES', 'Telemundo': 'INTERNACIONALES', 'Univision': 'INTERNACIONALES',
  // NOTICIAS
  '24h': 'NOTICIAS', 'Canal 24 Horas': 'NOTICIAS', 'Canal 24h': 'NOTICIAS',
  'Euronews': 'NOTICIAS', 'Sky News': 'NOTICIAS', 'Fox News': 'NOTICIAS',
  // REGIONALES
  'Canal Sur': 'REGIONALES', 'Canal Sur HD': 'REGIONALES',
  'TV3': 'REGIONALES', 'TV3 CAT': 'REGIONALES', '3Cat': 'REGIONALES',
  'Aragón TV': 'REGIONALES', 'Telemadrid': 'REGIONALES', 'CMM': 'REGIONALES',
  'ETB': 'REGIONALES', 'TVG': 'REGIONALES', 'IB3': 'REGIONALES',
  'Canal Extremadura': 'REGIONALES', 'TPA': 'REGIONALES', '7RM': 'REGIONALES'
};

// ─── FUNCIONES AUXILIARES ────────────────────────────────────

/** Determina la categoría por nombre del canal (búsqueda exacta + fuzzy) */
const determineCategory = (name) => {
  const clean = name.trim();
  // Búsqueda exacta
  if (CATEGORY_MAP[clean]) return CATEGORY_MAP[clean];
  // Búsqueda case-insensitive
  const key = Object.keys(CATEGORY_MAP).find(k => k.toLowerCase() === clean.toLowerCase());
  if (key) return CATEGORY_MAP[key];
  // Búsqueda por inclusión (fuzzy)
  for (const [keyword, cat] of Object.entries(CATEGORY_MAP)) {
    if (clean.toLowerCase().includes(keyword.toLowerCase())) return cat;
  }
  // Heurísticas por palabras clave
  if (/fútbol|deporte|match|liga|ufc|nba|nfl|tennis|golf|motor|f1/i.test(clean)) return 'DEPORTES';
  if (/cine|pel[ií]cula|film|movie|serie|hbo|netflix|prime/i.test(clean)) return 'CINE Y SERIES';
  if (/m[uú]sica|radio|hit|rock|pop|jazz|latina|urban/i.test(clean)) return 'MÚSICA';
  if (/infantil|kids|baby|disney|nick|cartoon|clan|boing/i.test(clean)) return 'INFANTILES';
  if (/documental|historia|discovery|national geo|odisea|nature/i.test(clean)) return 'DOCUMENTALES';
  if (/noticia|news|24h|euronews|cnn|bbc/i.test(clean)) return 'NOTICIAS';
  if (/rakuten|pel[ií]cula.*top|acci[oó]n.*rakuten/i.test(clean)) return 'RAKUTEN';
  return 'OTROS';
};

/** Extrae el KID de una URI (soporta múltiples formatos) */
const extractKidFromUri = (uri) => {
  if (!uri) return '';
  // kid=value en query string
  let m = uri.match(/[?&]kid=([^&]+)/i);
  if (m) return decodeURIComponent(m[1]);
  // KID en formato JSON dentro de URI
  m = uri.match(/"kid"\s*:\s*"([^"]+)"/i);
  if (m) return m[1];
  // kid en path
  m = uri.match(/\/kid\/([^/]+)/i);
  if (m) return m[1];
  return '';
};

/** Extrae la KEY de una URI (soporta múltiples formatos) */
const extractKeyFromUri = (uri) => {
  if (!uri) return '';
  let m = uri.match(/[?&]key=([^&]+)/i);
  if (m) return decodeURIComponent(m[1]);
  m = uri.match(/"key"\s*:\s*"([^"]+)"/i);
  if (m) return m[1];
  m = uri.match(/\/key\/([^/]+)/i);
  if (m) return m[1];
  return '';
};

/** Detecta el esquema DRM a partir de la URI */
const detectDrmScheme = (uri) => {
  if (!uri) return 'clearkey';
  if (/widevine|wv|license\.widevine/i.test(uri)) return 'widevine';
  if (/playready|pr/i.test(uri)) return 'playready';
  if (/fairplay|fp/i.test(uri)) return 'fairplay';
  return 'clearkey';
};

/** Obtiene la extensión del stream desde la URI */
const getExtensionFromUri = (uri) => {
  if (!uri) return 'mpd';
  // Extraer extensión antes de query string
  const pathPart = uri.split('?')[0].split('#')[0];
  const extMatch = pathPart.match(/\.([a-z0-9]+)$/i);
  if (extMatch) return extMatch[1].toLowerCase();
  // Detectar por contenido de la URI
  if (/\.m3u8/i.test(uri)) return 'm3u8';
  if (/\.mpd/i.test(uri)) return 'mpd';
  if (/\.ts/i.test(uri)) return 'ts';
  if (/\.mp4/i.test(uri)) return 'mp4';
  return 'mpd';
};

/** Valida si una URI parece válida */
const isValidUri = (uri) => {
  if (!uri) return false;
  return /^https?:\/\/.+/i.test(uri.trim());
};

/** Extrae el logo/tvg del tag #EXTINF */
const extractTvgLogo = (extinfLine) => {
  const m = extinfLine.match(/tvg-logo="([^"]+)"/i);
  return m ? m[1] : '';
};

/** Extrae el group-title del tag #EXTINF */
const extractGroupTitle = (extinfLine) => {
  const m = extinfLine.match(/group-title="([^"]+)"/i);
  return m ? m[1] : '';
};

// ─── CONVERSOR PRINCIPAL (formato M3U estándar) ─────────────

/**
 * Convierte contenido M3U a JSON categorizado para ExoPlayer.
 * @param {string} m3uContent - Contenido en formato M3U
 * @param {Object} opts - Opciones: categorizar (bool), extraerDrm (bool)
 * @returns {Array} Array de categorías con samples
 */
const convertirM3uAJson = (m3uContent, opts = {}) => {
  const { categorizar = true, extraerDrm = true } = opts;
  const categorias = JSON.parse(JSON.stringify(CATEGORIAS_BASE));
  const lines = m3uContent.split(/\r?\n/);
  let currentName = '';
  let currentLogo = '';
  let currentGroup = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith('#EXTINF:')) {
      const parts = trimmed.split(',');
      currentName = parts.length > 1 ? parts.slice(1).join(',').trim() : 'Sin nombre';
      currentLogo = extractTvgLogo(trimmed);
      currentGroup = extractGroupTitle(trimmed);
    } else if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      if (!currentName) continue;
      if (!isValidUri(trimmed)) continue;

      const uri = trimmed;
      const sample = {
        name: currentName,
        uri,
        extension: getExtensionFromUri(uri)
      };

      if (extraerDrm) {
        sample.drm_scheme = detectDrmScheme(uri);
        sample.kid = extractKidFromUri(uri);
        sample.key = extractKeyFromUri(uri);
      }
      if (currentLogo) sample.logo = currentLogo;
      if (currentGroup) sample.group = currentGroup;

      if (categorizar) {
        const cat = currentGroup ? determineCategory(currentGroup) : determineCategory(currentName);
        const catObj = categorias.find(c => c.name === cat);
        if (catObj) catObj.samples.push(sample);
        else categorias.find(c => c.name === 'OTROS').samples.push(sample);
      } else {
        categorias[0].samples.push(sample);
      }

      currentName = '';
      currentLogo = '';
      currentGroup = '';
    }
  }

  // Eliminar categorías vacías
  return categorias.filter(c => c.samples.length > 0);
};

// ─── FORMATOS DE SALIDA ──────────────────────────────────────

/** Formato ExoPlayer (array de grupos con name + samples) */
const toExoPlayerFormat = (categorias) => categorias;

/** Formato Tivimate (estructura plana con group para cada canal) */
const toTivimateFormat = (categorias) => {
  const result = [];
  for (const cat of categorias) {
    for (const s of cat.samples) {
      result.push({ ...s, group: cat.name });
    }
  }
  return result;
};

/** Formato estándar (un solo objeto con todos los samples) */
const toStandardFormat = (categorias) => {
  const allSamples = [];
  for (const cat of categorias) {
    allSamples.push(...cat.samples);
  }
  return { name: 'Lista de Canales M3U', samples: allSamples };
};

// ─── ESTADÍSTICAS ────────────────────────────────────────────

const generarEstadisticas = (categorias) => {
  const stats = { total: 0, porCategoria: {}, extensiones: {}, drm: {} };
  for (const cat of categorias) {
    stats.porCategoria[cat.name] = cat.samples.length;
    stats.total += cat.samples.length;
    for (const s of cat.samples) {
      stats.extensiones[s.extension] = (stats.extensiones[s.extension] || 0) + 1;
      stats.drm[s.drm_scheme] = (stats.drm[s.drm_scheme] || 0) + 1;
    }
  }
  return stats;
};

// ─── FUNCIÓN PRINCIPAL (modo CLI/Node) ──────────────────────

/**
 * Procesa un archivo M3U/TXT desde disco y genera JSON categorizado.
 * Usa el archivo `synth.ys` como referencia de RTL.
 */
function codificarM3uAJson() {
    try {
        if (!fs.existsSync(rutaTxt)) {
            console.error(`Error: No se encuentra el archivo de origen en ${rutaTxt}`);
            console.log('Coloca tu archivo .m3u o .txt como "ck_alka.m3u.txt" en el mismo directorio.');
            return;
        }

        const contenido = fs.readFileSync(rutaTxt, 'utf-8');
        console.log(`Procesando ${contenido.split(/\r?\n/).length} líneas...`);

        const categorias = convertirM3uAJson(contenido, { categorizar: true, extraerDrm: true });
        const stats = generarEstadisticas(categorias);

        // Guardar en los 3 formatos
        const dirSalida = path.join(__dirname, 'build');
        fs.mkdirSync(path.join(dirSalida, 'netlist'), { recursive: true });
        fs.mkdirSync(path.join(dirSalida, 'tivimate'), { recursive: true });

        // Formato ExoPlayer (categorizado)
        fs.writeFileSync(rutaJson, JSON.stringify(categorias, null, 2), 'utf-8');

        // Formato Tivimate
        const tivimatePath = path.join(dirSalida, 'tivimate', 'playlist_tivimate.json');
        fs.writeFileSync(tivimatePath, JSON.stringify(toTivimateFormat(categorias), null, 2), 'utf-8');

        // Formato estándar (compatible con más reproductores)
        const stdPath = path.join(dirSalida, 'netlist', 'playlist_standard.json');
        fs.writeFileSync(stdPath, JSON.stringify(toStandardFormat(categorias), null, 2), 'utf-8');

        // Guardar estadísticas
        const statsPath = path.join(dirSalida, 'netlist', 'stats.json');
        fs.writeFileSync(statsPath, JSON.stringify(stats, null, 2), 'utf-8');

        // ─── Resumen ───
        console.log('\n═══════════════════════════════════════');
        console.log('  CONVERSIÓN COMPLETADA CON ÉXITO');
        console.log('═══════════════════════════════════════');
        console.log(`  Total canales: ${stats.total}`);
        console.log(`  Categorías:    ${Object.keys(stats.porCategoria).length}`);
        for (const [cat, count] of Object.entries(stats.porCategoria)) {
            console.log(`    • ${cat}: ${count}`);
        }
        console.log(`\n  Extensiones:`);
        for (const [ext, count] of Object.entries(stats.extensiones)) {
            console.log(`    • .${ext}: ${count}`);
        }
        console.log(`\n  DRM detectado:`);
        for (const [drm, count] of Object.entries(stats.drm)) {
            console.log(`    • ${drm}: ${count}`);
        }
        console.log(`\n  Archivos generados:`);
        console.log(`    • ExoPlayer:  ${rutaJson}`);
        console.log(`    • Tivimate:   ${tivimatePath}`);
        console.log(`    • Estándar:   ${stdPath}`);
        console.log(`    • Stats:      ${statsPath}`);
        console.log('═══════════════════════════════════════\n');

    } catch (error) {
        console.error('Error durante la conversión:', error.message || error);
    }
}

// ─── TEMA ACESTREAM (mejorado) ──────────────────────────────

const TemaAcestream = {
    nombre: 'acestream',
    colores: {
        principal: '#85B623',
        fondoOscuro: '#1E1E1E',
        textoBlanco: '#FFFFFF',
        textoSecundario: '#AAAAAA',
        bordeSeparador: '#2D2D2D',
        hover: '#2A2A2A',
        exito: '#27ae60',
        error: '#e74c3c',
        info: '#3498db',
        warning: '#f39c12'
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

// ─── EJECUCIÓN AUTOMÁTICA ───────────────────────────────────
// Solo se ejecuta si se llama directamente con Node (no como módulo)
if (require.main === module) {
    console.log('╔══════════════════════════════════════╗');
    console.log('║  Photonic TPU - Convertidor M3U→JSON ║');
    console.log('╚══════════════════════════════════════╝');
    codificarM3uAJson();
}

// ─── EXPORTACIONES ──────────────────────────────────────────

module.exports = {
    // Conversión
    convertirM3uAJson,
    codificarM3uAJson,
    // Formatos de salida
    toExoPlayerFormat,
    toTivimateFormat,
    toStandardFormat,
    // Utilidades
    determineCategory,
    extractKidFromUri,
    extractKeyFromUri,
    detectDrmScheme,
    getExtensionFromUri,
    isValidUri,
    extractTvgLogo,
    extractGroupTitle,
    generarEstadisticas,
    // Constantes
    CATEGORIAS_BASE,
    CATEGORY_MAP,
    // Tema
    TemaAcestream
};
