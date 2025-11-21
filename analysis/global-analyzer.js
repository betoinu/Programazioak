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
    
    // Conectar con análisis específico
    generarRecomendacionesMejora() {
        const issues = this.detectarProblemasCoherencia();
        return this.derivarAccionesEspecificas(issues);
    }
}