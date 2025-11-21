export class GlobalAnalyzer {
    constructor(curriculumData) {
        this.curriculum = curriculumData;
        this.ambitosProfesionales = this.identificarAmbitosProfesionales();
    }
    
    // Identifica los ámbitos profesionales del diseño según RAs
    identificarAmbitosProfesionales() {
        const ambitos = {
            disenoGrafico: { RAs: [], competencias: [], asignaturas: [] },
            disenoProducto: { RAs: [], competencias: [], asignaturas: [] },
            disenoInteriores: { RAs: [], competencias: [], asignaturas: [] },
            disenoDigital: { RAs: [], competencias: [], asignaturas: [] },
            gestionDiseno: { RAs: [], competencias: [], asignaturas: [] }
        };
        
        // Analizar RAs para mapear a ámbitos profesionales
        this.curriculum.asignaturas?.forEach(asignatura => {
            asignatura.resultadosAprendizaje?.forEach(ra => {
                const ambito = this.clasificarRAenAmbito(ra);
                if (ambito && ambitos[ambito]) {
                    ambitos[ambito].RAs.push(ra);
                    ambitos[ambito].asignaturas.push(asignatura.nombre);
                    // Extraer competencias del RA
                    const competenciasRA = this.extraerCompetenciasDeRA(ra);
                    ambitos[ambito].competencias.push(...competenciasRA);
                }
            });
        });
        
        return this.depurarYAnalizarAmbitos(ambitos);
    }

    depurarYAnalizarAmbitos(ambitos) {
        // Eliminar ámbitos vacíos y analizar
        const ambitosDepurados = {};
        
        Object.entries(ambitos).forEach(([nombre, datos]) => {
            if (datos.RAs.length > 0 || datos.asignaturas.length > 0) {
                ambitosDepurados[nombre] = {
                    ...datos,
                    totalRAs: datos.RAs.length,
                    totalAsignaturas: datos.asignaturas.length,
                    totalCompetencias: new Set(datos.competencias).size,
                    fortaleza: this.calcularFortalezaAmbito(datos)
                };
            }
        });
        
        return ambitosDepurados;
    }
    
    calcularFortalezaAmbito(datosAmbito) {
        const puntuacion = 
            (datosAmbito.RAs.length * 0.4) + 
            (datosAmbito.asignaturas.length * 0.3) + 
            (new Set(datosAmbito.competencias).size * 0.3);
        
        if (puntuacion > 2) return 'ALTA';
        if (puntuacion > 1) return 'MEDIA';
        return 'BAJA';
    }
    
    extraerCompetenciasDeRA(ra) {
        // Extraer competencias básicas del texto del RA
        const competencias = [];
        const textoRA = ra.descripcion?.toLowerCase() || ra.toLowerCase();
        
        const palabrasCompetencia = [
            'diseñar', 'planificar', 'gestionar', 'analizar', 'evaluar',
            'comunicar', 'colaborar', 'innovar', 'resolver', 'crear'
        ];
        
        palabrasCompetencia.forEach(palabra => {
            if (textoRA.includes(palabra)) {
                competencias.push(palabra);
            }
        });
        
        return competencias.length > 0 ? competencias : ['competencia_genérica'];
    }
    
    clasificarRAenAmbito(ra) {
        const keywords = {
            disenoGrafico: ['gráfico', 'visual', 'tipografía', 'branding', 'identidad'],
            disenoProducto: ['producto', 'industrial', 'ergonomía', 'materiales'],
            disenoInteriores: ['interior', 'espacio', 'habitabilidad', 'acondicionamiento'],
            disenoDigital: ['digital', 'web', 'UX', 'UI', 'interactivo', 'multimedia'],
            gestionDiseno: ['gestión', 'proyecto', 'presupuesto', 'cliente', 'equipo']
        };
        
        for (const [ambito, palabras] of Object.entries(keywords)) {
            if (palabras.some(palabra => ra.toLowerCase().includes(palabra))) {
                return ambito;
            }
        }
        
        return null;
    }
    
    // Progresión competencial por cursos
    analizarProgresionCompetencial() {
        const progresion = { 1: {}, 2: {}, 3: {}, 4: {} };
        
        this.curriculum.asignaturas?.forEach(asignatura => {
            const curso = asignatura.curso;
            asignatura.competencias?.forEach(competencia => {
                if (!progresion[curso][competencia]) {
                    progresion[curso][competencia] = 0;
                }
                progresion[curso][competencia]++;
            });
        });
        
        return this.calcularDensidadCompetencial(progresion);
    }
    
    calcularDensidadCompetencial(progresion) {
        const densidad = {};
        const totalCompetencias = new Set();
        
        // Calcular densidad por curso
        Object.entries(progresion).forEach(([curso, competencias]) => {
            const competenciasCurso = Object.keys(competencias);
            densidad[curso] = {
                total: competenciasCurso.length,
                densidad: competenciasCurso.length / 10, // Asumiendo 10 como máximo esperado
                competencias: competenciasCurso
            };
            
            competenciasCurso.forEach(comp => totalCompetencias.add(comp));
        });
        
        return {
            porCurso: densidad,
            totalCompetencias: totalCompetencias.size,
            distribucion: this.analizarDistribucionCompetencias(progresion)
        };
    }

    analizarDistribucionCompetencias(progresion) {
        const distribucion = {};
        
        // Contar en cuántos cursos aparece cada competencia
        Object.values(progresion).forEach(competenciasCurso => {
            Object.keys(competenciasCurso).forEach(competencia => {
                if (!distribucion[competencia]) {
                    distribucion[competencia] = 0;
                }
                distribucion[competencia]++;
            });
        });
        
        return distribucion;
    }
    
    // Conectar con análisis específico
    generarRecomendacionesMejora() {
        const issues = this.detectarProblemasCoherencia();
        return this.derivarAccionesEspecificas(issues);
    }

    // Métodos placeholder para evitar errores
    detectarProblemasCoherencia() {
        return [];
    }

    derivarAccionesEspecificas(issues) {
        return [];
    }
}


