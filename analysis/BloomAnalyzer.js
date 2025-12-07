/* BloomAnalyzer.js

Módulo centralizado para normalizar y analizar niveles cognitivos
según la Taxonomía de Bloom. Exporta una API que deben usar todos
los módulos (accreditation-indicators, competence-mapper, gap-analyzer,
content-alignment, curriculum-coverage...).

Objetivos:
- Tener una única fuente de verdad para verbos y niveles Bloom
- Proveer utilidades para extraer verbos, inferir nivel Bloom,
  calcular coberturas y analizar progresión curricular
- Devolver estructuras estandarizadas para que el resto de módulos
  no implementen lógica propia redundante

NOTA: Este módulo usa heurísticas sencillas (tokenización, búsqueda
de verbos y mapas de lemmas). Si quieres mejor precisión, enchufa
un lematizador/PNL externo (spaCy, natural, compromise, etc.).
*/

// -----------------------------
// CONFIG: tabla universal de verbos
// -----------------------------
export const BLOOM_LEVELS = [
  'recordar',    // 1
  'comprender',  // 2
  'aplicar',     // 3
  'analizar',    // 4
  'evaluar',     // 5
  'crear'        // 6
];

// Lista de verbos agrupados por nivel (Español). Puedes ampliar.
export const BLOOM_VERBS = {
  recordar: [
    'recordar','reconocer','identificar','nombrar','listar','enumerar','describir_breve','record', 'definir'
  ],
  comprender: [
    'comprender','explicar','resumir','interpretar','parafrasear','clasificar','ilustrar','describir'
  ],
  aplicar: [
    'aplicar','usar','ejecutar','demostrar','implementar','resolver','operar','construir'
  ],
  analizar: [
    'analizar','diferenciar','comparar','descomponer','detallar','examinar','segmentar','organizar'
  ],
  evaluar: [
    'evaluar','juzgar','criticar','justificar','valorar','seleccionar','defender','verificar'
  ],
  crear: [
    'crear','diseñar','producir','componer','formular','planificar','generar','desarrollar'
  ]
};

// Mapa rudimentario de lemas para verbos frecuentes (forma infinitiva)
// Útil cuando el RA usa conjugaciones. Puedes ampliarlo o conectar un lematizador.
const VERB_LEMMAS = {
  'analizo': 'analizar', 'analiza': 'analizar', 'analizará': 'analizar', 'analizando': 'analizar', 'analizar': 'analizar',
  'aplico': 'aplicar', 'aplica': 'aplicar', 'aplicando': 'aplicar', 'aplicar': 'aplicar',
  'evalua': 'evaluar', 'evaluar': 'evaluar', 'evalúo': 'evaluar','evaluate':'evaluar',
  'crea': 'crear','crear':'crear','creando':'crear','creado':'crear',
  'identifica':'identificar', 'identificar':'identificar','identifico':'identificar',
  'describe':'describir','describir':'describir','describo':'describir',
  'explica':'explicar','explicar':'explicar','explico':'explicar','explicando':'explicar',
  'resolver':'resolver','resuelve':'resolver','resolviendo':'resolver','resolví':'resolver'
};

// -----------------------------
// UTIL: tokenización / extracción de verbo principal
// -----------------------------
function tokenize(text) {
  if (!text || typeof text !== 'string') return [];
  // Normalizar: minusculas, quitar puntuación básica
  const clean = text.toLowerCase()
    .replace(/[.,;:()\[\]"'¿?¡!\-–—]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return clean.split(' ');
}

function lemmaFromToken(token) {
  if (!token) return token;
  if (VERB_LEMMAS[token]) return VERB_LEMMAS[token];
  // heurística: quitar terminaciones comunes (simple)
  if (token.endsWith('ando') || token.endsWith('iendo') || token.endsWith('ado') || token.endsWith('ido')) {
    // forma gerundio/pasado -> intentar raíz
    return token.replace(/(ando|iendo|ado|ido)$/, 'ar'); // heurística: volver a infinitivo 'ar'
  }
  // quitar sufijos 'a', 'e', 'o' no siempre correcto; mejor fallback
  return token;
}

/**
 * Extrae una lista de verbos candidatos (lemmas) desde un texto.
 * Devuelve array ordenado por aparición.
 */
export function extractVerbCandidates(text) {
  const tokens = tokenize(text);
  // heurística: buscar verbos en las primeras 8 tokens (el verbo principal suele estar al inicio)
  const window = tokens.slice(0, 12);
  const candidates = window.map(t => lemmaFromToken(t));
  return [...new Set(candidates)];
}

/**
 * Intenta extraer el verbo "principal" del RA.
 * Retorna el lemma o null.
 */
export function extractMainVerb(text) {
  const candidates = extractVerbCandidates(text);
  // Priorizar tokens que aparezcan en la lista BLOOM_VERBS
  for (const c of candidates) {
    for (const level of BLOOM_LEVELS) {
      if (BLOOM_VERBS[level].includes(c)) return c;
    }
  }
  // Si no hay coincidencias directas, devolver primer token como fallback
  return candidates.length > 0 ? candidates[0] : null;
}

// -----------------------------
// LOGICA: mapear verbo -> nivel Bloom
// -----------------------------
/**
 * Devuelve un objeto { level: Number (1-6), name: String }
 * Si no se puede inferir, devuelve null
 */
export function inferBloomLevelFromVerb(verbLemma) {
  if (!verbLemma) return null;
  for (let i = 0; i < BLOOM_LEVELS.length; i++) {
    const levelName = BLOOM_LEVELS[i];
    if (BLOOM_VERBS[levelName].includes(verbLemma)) {
      return { level: i + 1, name: levelName };
    }
  }
  return null;
}

/**
 * Inferir nivel Bloom para un texto de RA completo.
 * Intenta: 1) extraer verbo principal, 2) mapearlo, 3) heurística por palabras clave
 */
export function inferBloomLevel(text) {
  if (!text || typeof text !== 'string') return null;
  const mainVerb = extractMainVerb(text);
  const byVerb = inferBloomLevelFromVerb(mainVerb);
  if (byVerb) return byVerb;

  // heurística secundaria: buscar cualquier verbo conocido en todo el texto
  const tokens = tokenize(text);
  for (const t of tokens) {
    const lemma = lemmaFromToken(t);
    const inf = inferBloomLevelFromVerb(lemma);
    if (inf) return inf;
  }

  // fallback: null
  return null;
}

// -----------------------------
// MÉTRICAS: cobertura Bloom para una lista de RAs
// -----------------------------
/**
 * RAs: array de objetos { id?, descripcion: string, texto?: string }
 * devuelve: { counts: {recordar: n,...}, percentages: {...}, total, byLevel: {1:[ids],2:[ids],...} }
 */
export function calculateBloomCoverage(RAs) {
  const result = {
    counts: {},
    percentages: {},
    total: 0,
    byLevel: {}
  };

  BLOOM_LEVELS.forEach(level => (result.counts[level] = 0));
  for (let i = 1; i <= BLOOM_LEVELS.length; i++) result.byLevel[i] = [];

  if (!Array.isArray(RAs)) return result;
  result.total = RAs.length;

  RAs.forEach(ra => {
    const text = (ra.descripcion || ra.texto || '').toString();
    const inferred = inferBloomLevel(text);
    if (inferred) {
      result.counts[inferred.name] = (result.counts[inferred.name] || 0) + 1;
      result.byLevel[inferred.level].push(ra.id || ra.slug || text.slice(0,20));
    } else {
      // contar en "no_identificado"
      result.counts['no_identificado'] = (result.counts['no_identificado'] || 0) + 1;
    }
  });

  // porcentajes
  BLOOM_LEVELS.forEach(level => {
    const c = result.counts[level] || 0;
    result.percentages[level] = result.total > 0 ? (c / result.total) * 100 : 0;
  });

  result.percentages['no_identificado'] = result.total > 0 ? ((result.counts['no_identificado'] || 0) / result.total) * 100 : 0;

  return result;
}

// -----------------------------
// PROGRESION: comparar años / semestres
// -----------------------------
/**
 * Estructura esperada: {
 *   '1': [ra1, ra2, ...],
 *   '2': [..],
 *   '3': [..],
 *   '4': [..]
 * }
 * donde las claves son niveles/curso/semestre. Devuelve un informe sobre
 * la progresión (si los niveles aumentan, se mantienen o hay regresión)
 */
export function analyzeBloomProgression(rasByLevelOrYear) {
  // rasByLevelOrYear: objeto map(e.g. {1:[...],2:[...],3:[...]})
  const years = Object.keys(rasByLevelOrYear).sort((a,b) => Number(a) - Number(b));
  const outcome = {
    years,
    summary: [],
    trend: 'NO_DATA', // UP, STABLE, DOWN, MIXED
    details: {}
  };

  if (years.length === 0) return outcome;

  // calcular media ponderada de nivel Bloom por año
  const meanByYear = {};
  years.forEach(y => {
    const ras = rasByLevelOrYear[y] || [];
    if (ras.length === 0) { meanByYear[y] = null; return; }
    const coverage = calculateBloomCoverage(ras);
    // media ponderada: sum(level * count) / total
    let weightedSum = 0;
    let total = 0;
    for (let i = 0; i < BLOOM_LEVELS.length; i++) {
      const levelName = BLOOM_LEVELS[i];
      const count = coverage.counts[levelName] || 0;
      weightedSum += (i + 1) * count;
      total += count;
    }
    meanByYear[y] = total > 0 ? (weightedSum / total) : null;
  });

  outcome.summary = meanByYear;

  // determina tendencia: comparar medias con tolerancia
  const values = years.map(y => meanByYear[y]);
  const cleaned = values.filter(v => typeof v === 'number');
  if (cleaned.length >= 2) {
    let ups = 0, downs = 0, stable = 0;
    for (let i = 1; i < values.length; i++) {
      const a = values[i-1], b = values[i];
      if (a == null || b == null) continue;
      if (b > a + 0.15) ups++;
      else if (b < a - 0.15) downs++;
      else stable++;
    }
    if (ups > 0 && downs === 0) outcome.trend = 'UP';
    else if (downs > 0 && ups === 0) outcome.trend = 'DOWN';
    else if (stable === values.length - 1 && ups === 0 && downs === 0) outcome.trend = 'STABLE';
    else outcome.trend = 'MIXED';
  }

  // detalles por año: cobertura porcentual
  years.forEach(y => {
    outcome.details[y] = calculateBloomCoverage(rasByLevelOrYear[y] || []);
  });

  return outcome;
}

// -----------------------------
// API: obtener indicadores estandarizados
// -----------------------------
/**
 * getIndicators({ curriculumData, matrices, scope })
 * - curriculumData: objeto completo
 * - matrices: matrices precomputadas (competenciaRA, raSubject, etc.)
 * - scope: opcional, e.g. { by: 'competencia' | 'asignatura' }
 *
 * Devuelve un objeto estandarizado:
 * {
 *   bloomCoverageGlobal, // calculateBloomCoverage(allRAs)
 *   bloomCoverageByCompetence: { compId: coverage },
 *   bloomCoverageBySubject: { subjectId: coverage },
 *   progressionByYear: analyzeBloomProgression(...)
 * }
 */
export function getIndicators({ curriculumData = {}, matrices = {}, scope = {} } = {}) {
  // Obtener lista de todos los RAs
  const allRAs = [];

  // Estructuras esperadas: matrices.competenciaRA.competencias[].resultadosAprendizaje[]
  if (matrices?.competenciaRA?.competencias) {
    matrices.competenciaRA.competencias.forEach(comp => {
      (comp.resultadosAprendizaje || []).forEach(ra => {
        allRAs.push(Object.assign({ _parentCompetencia: comp.id || comp.nombre }, ra));
      });
    });
  }

  // Fallback: intentar leer desde curriculumData
  if (allRAs.length === 0 && Array.isArray(curriculumData.resultadosAprendizaje)) {
    curriculumData.resultadosAprendizaje.forEach(ra => allRAs.push(ra));
  }

  const bloomCoverageGlobal = calculateBloomCoverage(allRAs);

  // cobertura por competencia
  const bloomCoverageByCompetence = {};
  if (matrices?.competenciaRA?.competencias) {
    matrices.competenciaRA.competencias.forEach(comp => {
      bloomCoverageByCompetence[comp.id || comp.nombre] = calculateBloomCoverage(comp.resultadosAprendizaje || []);
    });
  }

  // cobertura por asignatura (si existe matrices.raSubject.matriz con RA -> asignaturas mapping)
  const bloomCoverageBySubject = {};
  if (matrices?.raSubject?.asignaturas) {
    matrices.raSubject.asignaturas.forEach(asig => {
      // cada asignatura debería tener lista de RAs o referencias
      bloomCoverageBySubject[asig.id || asig.codigo || asig.nombre] = calculateBloomCoverage(asig.resultadosAprendizaje || asig.ras || []);
    });
  }

  // progresión: si hay curriculumData.organizacionPorAnios o matrices.raSubject por curso
  const rasByYear = {};
  if (curriculumData?.organizacionPorAnios) {
    Object.entries(curriculumData.organizacionPorAnios).forEach(([year, ras]) => {
      rasByYear[year] = ras;
    });
  } else if (matrices?.raSubject?.asignaturas) {
    // intentar agrupar asignaturas por curso
    matrices.raSubject.asignaturas.forEach(asig => {
      const year = asig.curso || asig.anio || '0';
      rasByYear[year] = rasByYear[year] || [];
      rasByYear[year].push(...(asig.resultadosAprendizaje || asig.ras || []));
    });
  }

  const progressionByYear = analyzeBloomProgression(rasByYear);

  return {
    bloomCoverageGlobal,
    bloomCoverageByCompetence,
    bloomCoverageBySubject,
    progressionByYear
  };
}

// -----------------------------
// UTIL: normalizar representación a formatos estandarizados
// -----------------------------
export function normalizeLevelRepresentation(levelInput) {
  if (!levelInput) return null;
  if (typeof levelInput === 'number') {
    const n = Math.max(1, Math.min(6, Math.round(levelInput)));
    return { level: n, name: BLOOM_LEVELS[n-1] };
  }
  if (typeof levelInput === 'string') {
    const lower = levelInput.toLowerCase();
    // si es 'b1' 'B1' o '1'
    const asNum = parseInt(lower.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(asNum) && asNum >=1 && asNum <=6) return { level: asNum, name: BLOOM_LEVELS[asNum-1] };
    if (BLOOM_LEVELS.includes(lower)) return { level: BLOOM_LEVELS.indexOf(lower) + 1, name: lower };
  }
  return null;
}

// -----------------------------
// FIN DEL MÓDULO
// -----------------------------

// Export default helper agrupando funciones claves (opcional)
const BloomAnalyzer = {
  BLOOM_LEVELS,
  BLOOM_VERBS,
  extractVerbCandidates,
  extractMainVerb,
  inferBloomLevelFromVerb,
  inferBloomLevel,
  calculateBloomCoverage,
  analyzeBloomProgression,
  getIndicators,
  normalizeLevelRepresentation
};

export default BloomAnalyzer;
