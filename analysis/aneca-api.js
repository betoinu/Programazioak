// 📁 analysis/aneca-api.js
export class AnecaAPI {
    static async interpretarCompetencias(curriculumData) {
        console.log("🧠 API: Interpretando competencias desde RAs reales en euskera...");
        
        // Extraer y analizar RAs reales
        const competencias = await this.generarCompetenciasDesdeRAs(curriculumData);
        
        // Agrupar por ámbitos profesionales
        const competenciasAgrupadas = this.agruparPorAmbitos(competencias);
        
        console.log(`✅ API: Generadas ${competencias.length} competencias desde ${this.contarRAsTotal(curriculumData)} RAs reales`);
        
        return competenciasAgrupadas;
    }
    
    static async generarCompetenciasDesdeRAs(curriculumData) {
    console.log("🔍 Analizando RAs para agrupar en competencias coherentes...");
    
    // 1. EXTRAER TODOS LOS RAs POR ÁREA
    const rasPorArea = this.agruparRAsPorArea(curriculumData);
    
    // 2. IDENTIFICAR COMPETENCIAS POR ÁREA (agrupando RAs relacionados)
    const competencias = [];
    
    Object.entries(rasPorArea).forEach(([area, rasArea]) => {
        console.log(`📊 Procesando área ${area} con ${rasArea.length} RAs`);
        
        // Agrupar RAs similares dentro de la misma área
        const gruposCompetencias = this.agruparRAsSimilares(rasArea, area);
        
        gruposCompetencias.forEach((grupo, index) => {
            if (grupo.ras.length > 0) {
                const competencia = this.crearCompetenciaDesdeGrupoRAs(grupo, area, index + 1);
                competencias.push(competencia);
            }
        });
    });
    
    console.log(`✅ Generadas ${competencias.length} competencias desde ${this.contarRAsTotal(curriculumData)} RAs`);
    return competencias;
}

static agruparRAsPorArea(curriculumData) {
    const rasPorArea = {};
    
    Object.values(curriculumData).forEach(grado => {
        Object.entries(grado).forEach(([cursoKey, asignaturasCurso]) => {
            asignaturasCurso.forEach(asignatura => {
                if (asignatura.currentOfficialRAs) {
                    const area = asignatura.arloa || 'Orokorra';
                    
                    if (!rasPorArea[area]) {
                        rasPorArea[area] = [];
                    }
                    
                    asignatura.currentOfficialRAs.forEach(ra => {
                        rasPorArea[area].push({
                            texto: ra,
                            curso: parseInt(cursoKey),
                            asignatura: asignatura.izena,
                            area: area,
                            creditos: asignatura.kredituak || 6
                        });
                    });
                }
            });
        });
    });
    
    return rasPorArea;
}

static agruparRAsSimilares(rasArea, area) {
    const grupos = [];
    const rasProcesados = new Set();
    
    rasArea.forEach((ra, index) => {
        if (rasProcesados.has(index)) return;
        
        const grupo = {
            ras: [ra],
            palabrasClave: this.extraerPalabrasClave(ra.texto),
            cursos: new Set([ra.curso]),
            asignaturas: new Set([ra.asignatura])
        };
        
        // Buscar RAs similares en el mismo área
        rasArea.forEach((otroRa, otroIndex) => {
            if (index !== otroIndex && !rasProcesados.has(otroIndex)) {
                const similitud = this.calcularSimilitudRAs(ra.texto, otroRa.texto);
                if (similitud > 0.6) { // Umbral de similitud
                    grupo.ras.push(otroRa);
                    grupo.cursos.add(otroRa.curso);
                    grupo.asignaturas.add(otroRa.asignatura);
                    rasProcesados.add(otroIndex);
                }
            }
        });
        
        grupos.push(grupo);
        rasProcesados.add(index);
    });
    
    return grupos;
}

static crearCompetenciaDesdeGrupoRAs(grupo, area, id) {
    const ras = grupo.ras;
    const cursos = Array.from(grupo.cursos).sort();
    const asignaturas = Array.from(grupo.asignaturas);
    
    // Determinar nombre de la competencia basado en los RAs
    const nombreCompetencia = this.generarNombreCompetencia(ras, area);
    
    // Determinar nivel Bloom más alto del grupo
    const nivelBloom = ras.reduce((maxNivel, ra) => {
        const nivelActual = this.analizarNivelBloom(ra.texto);
        return this.compararNivelesBloom(nivelActual, maxNivel) > 0 ? nivelActual : maxNivel;
    }, 'RECORDAR');
    
    return {
        id: `COMP-${area.substring(0, 3).toUpperCase()}-${id}`,
        nombre: nombreCompetencia,
        descripcion: `Competencia en ${area} desarrollada a través de ${ras.length} resultados de aprendizaje relacionados`,
        ambito: this.mapearAreaAAmbito(area),
        nivelBloom: nivelBloom,
        instrumentosEvaluacion: this.generarInstrumentosCompetencia(ras, area),
        cursos: cursos,
        asignaturasRelacionadas: asignaturas,
        areaConocimiento: area,
        rasConstituyentes: ras.map(ra => ({
            texto: ra.texto,
            curso: ra.curso,
            asignatura: ra.asignatura
        })),
        progresion: this.definirProgresionCompetencia(cursos, ras.length),
        creditosTotales: ras.reduce((sum, ra) => sum + (ra.creditos || 0), 0)
    };
}

static generarNombreCompetencia(ras, area) {
    // Analizar verbos y conceptos comunes en los RAs
    const verbosComunes = this.extraerVerbosComunes(ras);
    const conceptosComunes = this.extraerConceptosComunes(ras);
    
    const verboPrincipal = verbosComunes[0] || 'Desarrollar';
    const conceptoPrincipal = conceptosComunes[0] || `competencias en ${area}`;
    
    return `${verboPrincipal} ${conceptoPrincipal}`;
}

static extraerVerbosComunes(ras) {
    const verbos = {};
    ras.forEach(ra => {
        const verbo = this.extraerVerboPrincipal(ra.texto);
        if (verbo) {
            verbos[verbo] = (verbos[verbo] || 0) + 1;
        }
    });
    
    return Object.entries(verbos)
        .sort(([,a], [,b]) => b - a)
        .map(([verbo]) => verbo);
}

static extraerConceptosComunes(ras) {
    const conceptos = {};
    ras.forEach(ra => {
        const palabras = ra.texto.toLowerCase().split(' ');
        palabras.forEach(palabra => {
            if (palabra.length > 5 && !this.esPalabraFuncional(palabra)) {
                conceptos[palabra] = (conceptos[palabra] || 0) + 1;
            }
        });
    });
    
    return Object.entries(conceptos)
        .sort(([,a], [,b]) => b - a)
        .map(([concepto]) => concepto);
}

static extraerVerboPrincipal(textoRA) {
    const verbos = {
        'diseinatzea': 'Diseñar', 'sortzea': 'Crear', 'garatzea': 'Desarrollar',
        'ebaluatzea': 'Evaluar', 'aztertzea': 'Analizar', 'aplikatzea': 'Aplicar',
        'ulertzea': 'Comprender', 'ezagutzea': 'Conocer', 'erabiltzea': 'Utilizar'
    };
    
    for (const [verboEus, verboCast] of Object.entries(verbos)) {
        if (textoRA.toLowerCase().includes(verboEus)) {
            return verboCast;
        }
    }
    
    return 'Desarrollar';
}

static extraerPalabrasClave(texto) {
    return texto.toLowerCase()
        .split(' ')
        .filter(palabra => palabra.length > 4 && !this.esPalabraFuncional(palabra))
        .slice(0, 5);
}

static esPalabraFuncional(palabra) {
    const funcionales = ['diseinu', 'proiektu', 'elementu', 'oinarri', 'teknika', 'metodo', 'kontzeptu'];
    return funcionales.some(func => palabra.includes(func));
}

static calcularSimilitudRAs(ra1, ra2) {
    const palabras1 = new Set(ra1.toLowerCase().split(' '));
    const palabras2 = new Set(ra2.toLowerCase().split(' '));
    
    const interseccion = [...palabras1].filter(p => palabras2.has(p)).length;
    const union = new Set([...palabras1, ...palabras2]).size;
    
    return union > 0 ? interseccion / union : 0;
}

static compararNivelesBloom(nivel1, nivel2) {
    const orden = ['RECORDAR', 'COMPRENDER', 'APLICAR', 'ANALIZAR', 'EVALUAR', 'CREAR'];
    return orden.indexOf(nivel1) - orden.indexOf(nivel2);
}

static definirProgresionCompetencia(cursos, totalRAs) {
    return {
        inicio: Math.min(...cursos),
        consolidacion: Math.max(...cursos),
        complejidad: cursos.length > 1 ? 'progresiva' : 'puntual',
        rasPorCurso: totalRAs / cursos.length
    };
}

static generarInstrumentosCompetencia(ras, area) {
    const instrumentos = new Set();
    
    ras.forEach(ra => {
        const inst = this.generarInstrumentosDesdeRA(ra.texto, area);
        inst.forEach(i => instrumentos.add(i));
    });
    
    return Array.from(instrumentos);
}
    
    static procesarRAsAsignatura(asignatura, curso, idCounter) {
        const competencias = [];
        const area = asignatura.arloa || 'Orokorra';
        
        asignatura.currentOfficialRAs.forEach((ra, index) => {
            // Crear competencia desde cada RA
            const competencia = {
                id: `C${idCounter + index}`,
                nombre: this.extraerNombreCompetencia(ra, asignatura.izena),
                descripcion: ra,
                ambito: this.mapearAreaAAmbito(area),
                nivelBloom: this.analizarNivelBloom(ra),
                instrumentosEvaluacion: this.generarInstrumentosDesdeRA(ra, area),
                cursoRecomendado: curso,
                asignaturasRelacionadas: [asignatura.izena],
                areaConocimiento: area,
                creditos: asignatura.kredituak || 6,
                raOrigen: ra,
                tipoAsignatura: asignatura.mota
            };
            
            competencias.push(competencia);
        });
        
        return competencias;
    }
    
    static extraerNombreCompetencia(ra, nombreAsignatura) {
        // Extraer verbo acción del RA (en euskera)
        const verbosAccion = {
            'ulertzea': 'Comprender',
            'garatzea': 'Desarrollar', 
            'erabiltzea': 'Utilizar',
            'ezagutzea': 'Conocer',
            'ebaluatzea': 'Evaluar',
            'sortzea': 'Crear',
            'aztertzea': 'Analizar',
            'identifikatzea': 'Identificar',
            'jakiteko': 'Conocer',
            'baliatzeko': 'Utilizar'
        };
        
        // Buscar verbo en euskera
        let verboCastellano = 'Aplicar';
        Object.entries(verbosAccion).forEach(([eusk, cast]) => {
            if (ra.toLowerCase().includes(eusk)) {
                verboCastellano = cast;
            }
        });
        
        // Extraer objeto del RA (primeras palabras después de :)
        const partes = ra.split(':');
        const objeto = partes.length > 1 ? partes[0] : ra.split(' ').slice(0, 4).join(' ');
        
        return `${verboCastellano} ${objeto} en ${nombreAsignatura}`;
    }
    
    static mapearAreaAAmbito(area) {
        const areaLower = area.toLowerCase();
        
        if (areaLower.includes('diseinu') || areaLower.includes('proiektu')) return 'diseño_creativo';
        if (areaLower.includes('teknologia') || areaLower.includes('tekniko')) return 'tecnologico_digital';
        if (areaLower.includes('komunikazio') || areaLower.includes('bisual')) return 'comunicacion_visual';
        if (areaLower.includes('kudeaketa') || areaLower.includes('gestión')) return 'gestion_proyectos';
        if (areaLower.includes('teoria') || areaLower.includes('oinarri')) return 'fundamental_teorico';
        if (areaLower.includes('eraikuntza')) return 'tecnologico_constructivo';
        if (areaLower.includes('arte') || areaLower.includes('kultura')) return 'arte_cultura';
        
        return 'transversal';
    }
    
    static analizarNivelBloom(ra) {
        const raLower = ra.toLowerCase();
        
        if (raLower.includes('sortzea') || raLower.includes('diseinatzea')) return 'CREAR';
        if (raLower.includes('ebaluatzea') || raLower.includes('baloratzea')) return 'EVALUAR';
        if (raLower.includes('aztertzea') || raLower.includes('konparatzea')) return 'ANALIZAR';
        if (raLower.includes('aplikatzea') || raLower.includes('erabiltzea')) return 'APLICAR';
        if (raLower.includes('ulertzea') || raLower.includes('azaltzea')) return 'COMPRENDER';
        
        return 'RECORDAR';
    }
    
    static generarInstrumentosDesdeRA(ra, area) {
        const instrumentosBase = ['azterketa teorikoa', 'lan praktikoa'];
        
        if (area.toLowerCase().includes('diseinu') || area.includes('PROIEKTU')) {
            return ['portfolio', 'proiektu finala', 'aurkezpen oral', ...instrumentosBase];
        }
        if (area.toLowerCase().includes('teknologia') || area.includes('TEKNIKO')) {
            return ['ariketa praktikoak', 'software proiektua', 'ebaluazio jarraitua', ...instrumentosBase];
        }
        if (area.toLowerCase().includes('eraikuntza')) {
            return ['proiektu teknikoa', 'planos', 'maquetas', ...instrumentosBase];
        }
        
        return instrumentosBase;
    }
    
    static contarRAsTotal(curriculumData) {
        let total = 0;
        Object.values(curriculumData).forEach(grado => {
            Object.values(grado).forEach(asignaturasCurso => {
                asignaturasCurso.forEach(asignatura => {
                    if (asignatura.currentOfficialRAs) {
                        total += asignatura.currentOfficialRAs.length;
                    }
                });
            });
        });
        return total;
    }
    
    static agruparPorAmbitos(competencias) {
        const agrupadas = {};
        
        competencias.forEach(competencia => {
            if (!agrupadas[competencia.ambito]) {
                agrupadas[competencia.ambito] = [];
            }
            agrupadas[competencia.ambito].push(competencia);
        });
        
        return agrupadas;
    }
    
    // Método para pruebas rápidas
    static async probarAPI() {
        console.log("🧪 Probando API...");
        const response = await fetch('data/curriculumBD.json');
        const curriculumData = await response.json();
        
        const competencias = await this.interpretarCompetencias(curriculumData);
        console.log("✅ Resultado prueba API:", competencias);
        
        return competencias;
    }
}    
if (typeof window !== 'undefined') {
    window.AnecaAPI = AnecaAPI;
}







