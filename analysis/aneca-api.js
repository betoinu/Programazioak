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
    console.log("🔍 Agrupando RAs relacionados en competencias coherentes...");
    
    // 1. Extraer todos los RAs del curriculum
    const todosLosRAs = this.extraerTodosLosRAs(curriculumData);
    console.log(`📊 Total de RAs encontrados: ${todosLosRAs.length}`);
    
    // 2. Agrupar RAs por temas relacionados
    const gruposTematicos = this.agruparRAsPorTema(todosLosRAs);
    console.log(`🎯 Grupos temáticos identificados: ${Object.keys(gruposTematicos).length}`);
    
    // 3. Crear competencias desde grupos temáticos
    const competencias = [];
    let idCounter = 1;
    
    Object.entries(gruposTematicos).forEach(([tema, grupo]) => {
        if (grupo.ras.length >= 1) { // Mínimo 1 RA por competencia
            const competencia = this.crearCompetenciaDesdeGrupo(
                tema, 
                grupo, 
                idCounter++
            );
            competencias.push(competencia);
        }
    });
    
    console.log(`✅ Generadas ${competencias.length} competencias agrupadas`);
    return competencias;
}

// ========== MÉTODOS NUEVOS ==========

static extraerTodosLosRAs(curriculumData) {
    const todosLosRAs = [];
    
    Object.values(curriculumData).forEach(grado => {
        Object.entries(grado).forEach(([cursoKey, asignaturasCurso]) => {
            asignaturasCurso.forEach(asignatura => {
                if (asignatura.currentOfficialRAs) {
                    asignatura.currentOfficialRAs.forEach(ra => {
                        todosLosRAs.push({
                            texto: ra,
                            curso: parseInt(cursoKey),
                            asignatura: asignatura.izena,
                            area: asignatura.arloa || 'General',
                            creditos: asignatura.kredituak || 6,
                            tipo: asignatura.mota || 'Obligatoria'
                        });
                    });
                }
            });
        });
    });
    
    return todosLosRAs;
}

static agruparRAsPorTema(todosLosRAs) {
    const grupos = {};
    
    todosLosRAs.forEach(ra => {
        const tema = this.identificarTemaPrincipal(ra.texto, ra.area);
        const temaKey = tema.replace(/\s+/g, '_').toLowerCase();
        
        if (!grupos[temaKey]) {
            grupos[temaKey] = {
                tema: tema,
                ras: [],
                cursos: new Set(),
                asignaturas: new Set(),
                areas: new Set()
            };
        }
        
        grupos[temaKey].ras.push(ra);
        grupos[temaKey].cursos.add(ra.curso);
        grupos[temaKey].asignaturas.add(ra.asignatura);
        grupos[temaKey].areas.add(ra.area);
    });
    
    return grupos;
}

static identificarTemaPrincipal(textoRA, area) {
    // Identificar el tema principal del RA
    const texto = textoRA.toLowerCase();
    
    // Temas comunes en diseño
    if (texto.includes('diseinu') || texto.includes('diseño') || texto.includes('proiektu')) {
        if (texto.includes('espazio') || texto.includes('espacio')) return 'Diseño Espacial';
        if (texto.includes('produktu') || texto.includes('producto')) return 'Diseño de Producto';
        if (texto.includes('grafik') || texto.includes('gráfico')) return 'Diseño Gráfico';
        return 'Diseño General';
    }
    
    if (texto.includes('teknolog') || texto.includes('tecnolog')) {
        return 'Tecnología Digital';
    }
    
    if (texto.includes('komunikazio') || texto.includes('comunicación')) {
        return 'Comunicación Visual';
    }
    
    if (texto.includes('kudeaketa') || texto.includes('gestión')) {
        return 'Gestión de Proyectos';
    }
    
    return area || 'Competencia Transversal';
}

static crearCompetenciaDesdeGrupo(tema, grupo, id) {
    const ras = grupo.ras;
    const cursos = Array.from(grupo.cursos).sort();
    const asignaturas = Array.from(grupo.asignaturas);
    const areas = Array.from(grupo.areas);
    
    return {
        id: `COMP-${id}`,
        nombre: tema,
        descripcion: `Competencia desarrollada a través de ${ras.length} resultados de aprendizaje en ${areas.join(', ')}`,
        ambito: this.mapearAreaAAmbito(areas[0]),
        nivelBloom: this.analizarNivelBloomGrupo(ras),
        instrumentosEvaluacion: this.generarInstrumentosGrupo(ras),
        cursos: cursos,
        asignaturasRelacionadas: asignaturas,
        areasConocimiento: areas,
        rasConstituyentes: ras,
        creditosTotales: ras.reduce((sum, ra) => sum + ra.creditos, 0),
        progresion: {
            cursoInicio: Math.min(...cursos),
            cursoConsolidacion: Math.max(...cursos),
            complejidad: cursos.length > 1 ? 'Progresiva' : 'Puntual'
        }
    };
}

static analizarNivelBloomGrupo(ras) {
    const niveles = ras.map(ra => this.analizarNivelBloom(ra.texto));
    if (niveles.includes('CREAR')) return 'CREAR';
    if (niveles.includes('EVALUAR')) return 'EVALUAR';
    if (niveles.includes('ANALIZAR')) return 'ANALIZAR';
    if (niveles.includes('APLICAR')) return 'APLICAR';
    if (niveles.includes('COMPRENDER')) return 'COMPRENDER';
    return 'RECORDAR';
}

static generarInstrumentosGrupo(ras) {
    const instrumentos = new Set();
    
    ras.forEach(ra => {
        const inst = this.generarInstrumentosDesdeRA(ra.texto, ra.area);
        inst.forEach(i => instrumentos.add(i));
    });
    
    return Array.from(instrumentos);
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








