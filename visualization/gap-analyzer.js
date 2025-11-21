export class GapAnalyzer {
    static analizarHuecosCurriculares(curriculumData, matricesANECA) {
    console.log("📦 curriculumData:", curriculumData);
    console.log("📊 matricesANECA:", matricesANECA);
    
    // VERIFICACIÓN DE SEGURIDAD - Si no hay matricesANECA, crear estructura vacía
    const matricesSeguras = matricesANECA || {
        RAsignaturas: { alertas: [] },
        competenciasRA: { competencias: [] }
    };
    
    const huecos = {
        cobertura: this.detectarHuecosCobertura(matricesSeguras.RAsignaturas),
        progresion: this.detectarHuecosProgresion(curriculumData),
        evaluacion: this.detectarHuecosEvaluacion(matricesSeguras.competenciasRA),
        integracion: this.detectarHuecosIntegracion(curriculumData)
    };
    
    return {
        huecos,
        prioridad: this.calcularPrioridadHuecos(huecos),
        planMejora: this.generarPlanMejora(huecos)
    };
}
    
    static detectarHuecosCobertura(matrizRAsignaturas) {
        return matrizRAsignaturas.alertas.map(alerta => ({
            tipo: 'COBERTURA',
            descripcion: alerta.mensaje,
            asignaturasAfectadas: this.identificarAsignaturasAfectadas(alerta),
            accionRecomendada: alerta.accion,
            impactoANECA: 'ALTO',
            urgencia: alerta.gravedad === 'ALTA' ? 'INMEDIATA' : 'MEDIA'
        }));
    }
    
    static detectarHuecosProgresion(curriculumData) {
    const huecos = [];
    const cursos = [1, 2, 3, 4];
    
    cursos.forEach(curso => {
        // ✅ CONTAR competencias REALES del curso (no las hipotéticas)
        let competenciasCurso = 0;
        
        // Buscar en la estructura real del curriculum
        Object.values(curriculumData).forEach(grado => {
            if (grado[curso]) {
                grado[curso].forEach(asignatura => {
                    if (asignatura.currentOfficialRAs) {
                        competenciasCurso += asignatura.currentOfficialRAs.length;
                    }
                });
            }
        });
        
        if (competenciasCurso < 10) { // Ajustar umbral según necesidad
            huecos.push({
                tipo: 'PROGRESION',
                descripcion: `Curso ${curso} tiene solo ${competenciasCurso} RAs (potenciales competencias)`,
                accionRecomendada: 'Diversificar competencias en este curso',
                impactoANECA: 'MEDIO',
                urgencia: 'MEDIA'
            });
        }
    });
    
    return huecos;
}
    
    static detectarHuecosEvaluacion(matrizCompetenciasRA) {
    console.log("🔍 detectarHuecosEvaluacion - matrizCompetenciasRA:", matrizCompetenciasRA);
    
    // VERIFICACIÓN DE SEGURIDAD (MANTENER ESTO)
    if (!matrizCompetenciasRA) {
        console.warn("⚠️ matrizCompetenciasRA es undefined");
        return [];
    }
    
    // BUSCAR COMPETENCIAS EN LA ESTRUCTURA REAL (ACTUALIZAR ESTA PARTE)
    let competencias = [];
    
    // ✅ NUEVA OPCIÓN: Estructura de competencias agrupadas
    if (matrizCompetenciasRA.competencias && Array.isArray(matrizCompetenciasRA.competencias)) {
        competencias = matrizCompetenciasRA.competencias;
        console.log("✅ Competencias encontradas en .competencias (nueva estructura)");
    }
    // ✅ MANTENER las opciones anteriores para compatibilidad
    else if (matrizCompetenciasRA.matriz && typeof matrizCompetenciasRA.matriz === 'object') {
        competencias = Object.values(matrizCompetenciasRA.matriz);
        console.log("✅ Competencias encontradas en .matriz");
    }
    else if (matrizCompetenciasRA.metricas && typeof matrizCompetenciasRA.metricas === 'object') {
        competencias = Object.values(matrizCompetenciasRA.metricas);
        console.log("✅ Competencias encontradas en .metricas");
    }
    else if (matrizCompetenciasRA.data && Array.isArray(matrizCompetenciasRA.data)) {
        competencias = matrizCompetenciasRA.data;
        console.log("✅ Competencias encontradas en .data");
    }
    
    console.log("📊 Competencias para evaluación:", competencias);
    
    if (!Array.isArray(competencias) || competencias.length === 0) {
        console.warn("⚠️ No se encontraron competencias para evaluar");
        return [];
    }
    
    const huecos = [];
    
    competencias.forEach((comp, index) => {
        console.log(`🔍 Competencia ${index}:`, comp);
        
        // ✅ ADAPTAR para nueva estructura de competencias agrupadas
        const instrumentos = comp.instrumentosEvaluacion || comp.evaluationInstruments || comp.instrumentos || [];
        const nombreCompetencia = comp.nombre || comp.competencia || comp.id || 'Sin nombre';
        const rasCount = comp.rasConstituyentes || 0;
        
        // Hueco: Sin instrumentos de evaluación
        if (instrumentos.length === 0) {
            huecos.push({
                tipo: 'EVALUACION',
                descripcion: `Competencia "${nombreCompetencia}" carece de instrumentos de evaluación`,
                accionRecomendada: 'Definir rúbricas o instrumentos de evaluación',
                impactoANECA: 'ALTO', 
                urgencia: 'INMEDIATA'
            });
        }
        
        // ✅ NUEVO: Competencia compleja con evaluación simple
        if (rasCount > 5 && instrumentos.length < 3) {
            huecos.push({
                tipo: 'EVALUACION_COMPLEJA',
                descripcion: `Competencia compleja "${nombreCompetencia}" (${rasCount} RAs) requiere evaluación más sofisticada`,
                accionRecomendada: 'Implementar evaluación por rúbricas y portafolio',
                impactoANECA: 'ALTO',
                urgencia: 'MEDIA'
            });
        }
        
        // ✅ NUEVO: Competencia sin progresión evaluativa
        if (comp.cursos && comp.cursos.length > 1 && instrumentos.length === 1) {
            huecos.push({
                tipo: 'PROGRESION_EVALUATIVA', 
                descripcion: `Competencia progresiva "${nombreCompetencia}" necesita evaluación diferenciada por curso`,
                accionRecomendada: 'Diseñar instrumentos de evaluación progresivos',
                impactoANECA: 'MEDIO',
                urgencia: 'MEDIA'
            });
        }
    });
    
    console.log("✅ Huecos de evaluación detectados:", huecos);
    return huecos;
}
    
    static detectarHuecosIntegracion(curriculumData) {
        // Detectar asignaturas aisladas sin conexión con otras
        const huecos = [];
        const asignaturas = curriculumData.asignaturas || [];
        
        asignaturas.forEach(asignatura => {
            const competenciasCompartidas = this.contarCompetenciasCompartidas(asignatura, asignaturas);
            if (competenciasCompartidas < 2) {
                huecos.push({
                    tipo: 'INTEGRACION',
                    descripcion: `Asignatura "${asignatura.nombre}" está aislada (solo ${competenciasCompartidas} competencias compartidas)`,
                    accionRecomendada: 'Crear conexiones con otras asignaturas mediante competencias compartidas',
                    impactoANECA: 'MEDIO',
                    urgencia: 'BAJA'
                });
            }
        });
        
        return huecos;
    }
    
    static contarCompetenciasCompartidas(asignatura, todasAsignaturas) {
        let count = 0;
        const competenciasAsignatura = new Set(asignatura.competencias || []);
        
        todasAsignaturas.forEach(otraAsignatura => {
            if (otraAsignatura.nombre !== asignatura.nombre) {
                const competenciasOtra = new Set(otraAsignatura.competencias || []);
                const compartidas = [...competenciasAsignatura].filter(comp => competenciasOtra.has(comp));
                count += compartidas.length;
            }
        });
        
        return count;
    }
    
    static calcularPrioridadHuecos(huecos) {
        const prioridades = {
            INMEDIATA: [],
            MEDIA: [],
            BAJA: []
        };
        
        Object.values(huecos).flat().forEach(hueco => {
            prioridades[hueco.urgencia].push(hueco);
        });
        
        return prioridades;
    }
    
    static generarPlanMejora(huecos) {
        const acciones = [];
        
        // Huecos de cobertura (alta prioridad)
        huecos.cobertura.forEach(hueco => {
            acciones.push({
                accion: `Resolver: ${hueco.descripcion}`,
                responsable: 'Coordinación académica',
                plazo: hueco.urgencia === 'INMEDIATA' ? '1 mes' : '3 meses',
                recursos: 'Revisión plan de estudios',
                indicadorExito: 'RA cubierto por al menos 2 asignaturas'
            });
        });
        
        // Huecos de evaluación (alta prioridad)
        huecos.evaluacion.forEach(hueco => {
            acciones.push({
                accion: `Implementar evaluación: ${hueco.descripcion}`,
                responsable: 'Comisión de evaluación',
                plazo: '2 meses',
                recursos: 'Desarrollo de rúbricas',
                indicadorExito: 'Instrumentos de evaluación definidos'
            });
        });
        
        // Huecos de progresión (media prioridad)
        huecos.progresion.forEach(hueco => {
            acciones.push({
                accion: `Mejorar progresión: ${hueco.descripcion}`,
                responsable: 'Coordinación de curso',
                plazo: '6 meses',
                recursos: 'Rediseño secuencia competencial',
                indicadorExito: 'Mínimo 5 competencias distintas por curso'
            });
        });
        
        return {
            accionesPrioritarias: acciones.filter(a => a.plazo.includes('mes') && !a.plazo.includes('6')),
            accionesMedioPlazo: acciones.filter(a => a.plazo.includes('6 meses')),
            seguimiento: this.generarSistemaSeguimiento()
        };
    }
    
    static generarSistemaSeguimiento() {
        return {
            frecuencia: 'Trimestral',
            indicadores: [
                'Porcentaje de RAs con cobertura mínima',
                'Número de competencias con instrumentos de evaluación',
                'Progresión competencial por cursos',
                'Integración entre asignaturas'
            ],
            responsables: [
                'Coordinador de calidad',
                'Comisión académica',
                'Coordinadores de curso'
            ]
        };
    }
    
    static identificarAsignaturasAfectadas(alerta) {
        // Extraer nombres de asignaturas del mensaje de alerta
        const texto = alerta.mensaje.toLowerCase();
        const asignaturas = [];
        
        // Buscar patrones comunes en los mensajes de alerta
        if (texto.includes('asignatura')) {
            const match = texto.match(/asignaturas?: ([^.,]+)/);
            if (match) {
                asignaturas.push(...match[1].split(',').map(a => a.trim()));
            }
        }
        
        return asignaturas.length > 0 ? asignaturas : ['Por determinar'];
    }
}






