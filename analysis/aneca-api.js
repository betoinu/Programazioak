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
    const raLower = ra.toLowerCase().trim();
    
    // NIVEL 6: CREAR - Sintetizar elementos para formar nuevo todo
    if (raLower.match(/(sortzea|diseinatzea|eraikitzea|proiektatzen|asmatu|berria|originala|planifikatzea|konposaketa|formulatzea)\b/)) {
        return {
            nivel: 'CREAR',
            verbo: this.extraerVerboCrear(raLower),
            subnivel: this.determinarSubnivelCrear(raLower),
            complejidad: 'ALTA',
            descriptores: this.extraerDescriptoresCrear(raLower),
            peso: 6,
            color: '#10b981', // verde
            icono: '✨'
        };
    }
    
    // NIVEL 5: EVALUAR - Emitir juicios basados en criterios
    if (raLower.match(/(ebaluatzea|baloratzea|aztertzea|konparatzea|ebaluazio|irizpide|justifikatu|aukera|hautatzea|argudiatzea)\b/)) {
        return {
            nivel: 'EVALUAR',
            verbo: this.extraerVerboEvaluar(raLower),
            subnivel: this.determinarSubnivelEvaluar(raLower),
            complejidad: 'ALTA_MEDIA',
            criterios: this.extraerCriteriosEvaluacion(raLower),
            peso: 5,
            color: '#8b5cf6', // violeta
            icono: '⚖️'
        };
    }
    
    // NIVEL 4: ANALIZAR - Descomponer en partes y entender relaciones
    if (raLower.match(/(aztertzea|analizatzea|bereiztea|erlazionatzea|zati|egitura|erlazio|motibo|kausa|ondorio|sailkatzea)\b/)) {
        return {
            nivel: 'ANALIZAR', 
            verbo: this.extraerVerboAnalizar(raLower),
            subnivel: this.determinarSubnivelAnalizar(raLower),
            complejidad: 'MEDIA',
            elementos: this.extraerElementosAnalisis(raLower),
            peso: 4,
            color: '#3b82f6', // azul
            icono: '🔍'
        };
    }
    
    // NIVEL 3: APLICAR - Usar información en nuevas situaciones
    if (raLower.match(/(aplikatzea|erabiltzea|erakustea|erantzutea|kasu|testuinguru|praktikan|implementatu|erabilera|antolatzea)\b/)) {
        return {
            nivel: 'APLICAR',
            verbo: this.extraerVerboAplicar(raLower),
            subnivel: this.determinarSubnivelAplicar(raLower),
            complejidad: 'MEDIA_BAJA',
            contexto: this.extraerContextoAplicacion(raLower),
            peso: 3,
            color: '#f59e0b', // amarillo
            icono: '🛠️'
        };
    }
    
    // NIVEL 2: COMPRENDER - Construir significado
    if (raLower.match(/(ulertzea|azaltzea|adieraztea|interpretatzea|esanahia|ideia|printzipio|teoria|laburtzea|adierazpena)\b/)) {
        return {
            nivel: 'COMPRENDER',
            verbo: this.extraerVerboComprender(raLower),
            subnivel: this.determinarSubnivelComprender(raLower),
            complejidad: 'BAJA_MEDIA', 
            conceptos: this.extraerConceptosComprension(raLower),
            peso: 2,
            color: '#84cc16', // verde claro
            icono: '💡'
        };
    }
    
    // NIVEL 1: RECORDAR - Recuperar conocimiento
    return {
        nivel: 'RECORDAR',
        verbo: this.extraerVerboRecordar(raLower),
        subnivel: this.determinarSubnivelRecordar(raLower),
        complejidad: 'BAJA',
        elementos: this.extraerElementosMemoria(raLower),
        peso: 1,
        color: '#6b7280', // gris
        icono: '📚'
    };
}

    // ========== MÉTODOS ESPECÍFICOS BLOOM ==========

static extraerVerboCrear(texto) {
    const verbos = {
        'sortzea': 'Generar', 'diseinatzea': 'Diseñar', 'eraikitzea': 'Construir',
        'proiektatzen': 'Proyectar', 'asmatu': 'Inventar', 'planifikatzea': 'Planificar',
        'konposaketa': 'Componer', 'formulatzea': 'Formular'
    };
    
    for (const [eusk, cast] of Object.entries(verbos)) {
        if (texto.includes(eusk)) return cast;
    }
    return 'Crear';
}

static determinarSubnivelCrear(texto) {
    if (texto.match(/(berria|originala|asmatu)/)) return 'PRODUCCIÓN_ORIGINAL';
    if (texto.match(/(plana|proposamena|planifikatzea)/)) return 'PLANIFICACIÓN';
    if (texto.match(/(eraikitzea|konposaketa|egitura)/)) return 'CONSTRUCCIÓN';
    return 'GENERACIÓN';
}

static extraerDescriptoresCrear(texto) {
    const descriptores = [];
    if (texto.includes('proiektu')) descriptores.push('proyecto_completo');
    if (texto.includes('soluzio') || texto.includes('soluzione')) descriptores.push('solucion_innovadora');
    if (texto.includes('prototipoa')) descriptores.push('prototipo');
    if (texto.includes('konposizio')) descriptores.push('composicion');
    if (texto.includes('formula')) descriptores.push('formulacion');
    return descriptores.length > 0 ? descriptores : ['produccion_creativa'];
}

static extraerVerboEvaluar(texto) {
    const verbos = {
        'ebaluatzea': 'Valorar', 'baloratzea': 'Calificar', 'konparatzea': 'Comparar',
        'justifikatu': 'Justificar', 'hautatzea': 'Seleccionar', 'argudiatzea': 'Argumentar'
    };
    
    for (const [eusk, cast] of Object.entries(verbos)) {
        if (texto.includes(eusk)) return cast;
    }
    return 'Evaluar';
}

static determinarSubnivelEvaluar(texto) {
    if (texto.match(/(irizpide|kriterio|estandar)/)) return 'JUICIO_CRITERIOS';
    if (texto.match(/(autoevaluazio|autoebaluazio)/)) return 'AUTOEVALUACIÓN';
    if (texto.match(/(konparatzea|aldeaketa)/)) return 'COMPARACIÓN';
    return 'EVALUACIÓN_EXTERNA';
}

static extraerCriteriosEvaluacion(texto) {
    const criterios = [];
    if (texto.match(/(kalitate|kualitate)/)) criterios.push('calidad');
    if (texto.match(/(efikasia|eraginkortasun)/)) criterios.push('eficacia');
    if (texto.match(/(egokitasun|appropriation)/)) criterios.push('adecuacion');
    if (texto.match(/(kostua|prezioa)/)) criterios.push('costo');
    if (texto.match(/(denbora|ebolucio)/)) criterios.push('tiempo');
    return criterios;
}

static extraerVerboAnalizar(texto) {
    const verbos = {
        'aztertzea': 'Examinar', 'bereiztea': 'Diferenciar', 'erlazionatzea': 'Relacionar',
        'sailkatzea': 'Clasificar', 'organizatzea': 'Organizar'
    };
    
    for (const [eusk, cast] of Object.entries(verbos)) {
        if (texto.includes(eusk)) return cast;
    }
    return 'Analizar';
}

static determinarSubnivelAnalizar(texto) {
    if (texto.match(/(zati|osagai|elementu)/)) return 'DESCOMPOSICIÓN';
    if (texto.match(/(erlazio|konexio|lotura)/)) return 'RELACIÓN';
    if (texto.match(/(egitura|organizazio)/)) return 'ORGANIZACIÓN';
    if (texto.match(/(printzipio|oinarri)/)) return 'PRINCIPIO';
    return 'DIFERENCIACIÓN';
}

static extraerElementosAnalisis(texto) {
    const elementos = [];
    if (texto.match(/(zati|pieza)/)) elementos.push('componentes');
    if (texto.match(/(erlazio|konexio)/)) elementos.push('relaciones');
    if (texto.match(/(egitura|eskema)/)) elementos.push('estructura');
    if (texto.match(/(prozesu|urrats)/)) elementos.push('proceso');
    return elementos;
}

static extraerVerboAplicar(texto) {
    const verbos = {
        'erabiltzea': 'Utilizar', 'erakustea': 'Demostrar', 'exekutatu': 'Ejecutar',
        'antolatzea': 'Organizar', 'implementatu': 'Implementar'
    };
    
    for (const [eusk, cast] of Object.entries(verbos)) {
        if (texto.includes(eusk)) return cast;
    }
    return 'Aplicar';
}

static determinarSubnivelAplicar(texto) {
    if (texto.match(/(testuinguru|kontestu|ingurune)/)) return 'CONTEXTO_NUEVO';
    if (texto.match(/(praktikan|praktikoa)/)) return 'SITUACIÓN_PRÁCTICA';
    if (texto.match(/(erakustea|demostratzea)/)) return 'DEMOSTRACIÓN';
    return 'EJECUCIÓN';
}

static extraerContextoAplicacion(texto) {
    const contextos = [];
    if (texto.match(/(proiektu|lan)/)) contextos.push('proyecto');
    if (texto.match(/(problema|arazo)/)) contextos.push('problema');
    if (texto.match(/(kasu|adibide)/)) contextos.push('caso_especifico');
    if (texto.match(/(simulazio|praktika)/)) contextos.push('simulacion');
    return contextos;
}

static extraerVerboComprender(texto) {
    const verbos = {
        'ulertzea': 'Comprender', 'azaltzea': 'Explicar', 'interpretatzea': 'Interpretar',
        'adieraztea': 'Expresar', 'laburtzea': 'Resumir'
    };
    
    for (const [eusk, cast] of Object.entries(verbos)) {
        if (texto.includes(eusk)) return cast;
    }
    return 'Entender';
}

static determinarSubnivelComprender(texto) {
    if (texto.match(/(interpretatzea|sinbolo|adierazpen)/)) return 'INTERPRETACIÓN';
    if (texto.match(/(azaltzea|deskribatzea)/)) return 'EXPLICACIÓN';
    if (texto.match(/(adieraztea|komunikatzea)/)) return 'EXPRESIÓN';
    return 'COMPRENSIÓN';
}

static extraerConceptosComprension(texto) {
    const conceptos = [];
    if (texto.match(/(ideia|kontzeptu)/)) conceptos.push('concepto');
    if (texto.match(/(printzipio|lege)/)) conceptos.push('principio');
    if (texto.match(/(prozesu|sekuentzia)/)) conceptos.push('proceso');
    if (texto.match(/(teoria|hipotesi)/)) conceptos.push('teoria');
    return conceptos;
}

static extraerVerboRecordar(texto) {
    const verbos = {
        'gogoratzea': 'Recordar', 'ezagutzea': 'Identificar', 'izendatzea': 'Nombrar',
        'deskribatzea': 'Describir', 'aurkitzea': 'Encontrar'
    };
    
    for (const [eusk, cast] of Object.entries(verbos)) {
        if (texto.includes(eusk)) return cast;
    }
    return 'Memorizar';
}

static determinarSubnivelRecordar(texto) {
    if (texto.match(/(izendatzea|izen)/)) return 'RECONOCIMIENTO';
    if (texto.match(/(gogoratzea|memoria)/)) return 'RECUERDO';
    if (texto.match(/(deskribatzea|zerrenda)/)) return 'DESCRIPCIÓN';
    return 'IDENTIFICACIÓN';
}

static extraerElementosMemoria(texto) {
    const elementos = [];
    if (texto.match(/(izen|termino)/)) elementos.push('terminologia');
    if (texto.match(/(data|urte)/)) elementos.push('fechas');
    if (texto.match(/(leku|kokapena)/)) elementos.push('localizacion');
    if (texto.match(/(egitura|forma)/)) elementos.push('estructura_basica');
    return elementos;
}

// Actualizar el método para grupos
static analizarNivelBloomGrupo(ras) {
    const niveles = ras.map(ra => this.analizarNivelBloom(ra.texto));
    
    // Encontrar el nivel más alto por peso
    const nivelMasAlto = niveles.reduce((max, actual) => 
        actual.peso > max.peso ? actual : max
    );
    
    return nivelMasAlto;
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









