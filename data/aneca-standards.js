export const ANECA_STANDARDS = {
    COMPETENCIAS: {
        CLARIDAD: {
            criterio: "Competencias redactadas según estándares internacionales",
            requisito: "Verbos observables, condiciones y criterios específicos",
            evaluacion: (competencias) => {
                let score = 0;
                competencias.forEach(comp => {
                    if (this.tieneVerboObservable(comp)) score += 1;
                    if (this.tieneCriteriosMedibles(comp)) score += 1;
                });
                return score / (competencias.length * 2);
            }
        }
    },
    
    COBERTURA_CURRICULAR: {
        MINIMO_ASIGNATURAS_POR_RA: 2,
        REQUIERE_NIVEL_PROFUNDIZACION: true,
        
        evaluar: (matrizRAAsignaturas) => {
            const RAsCubiertos = matrizRAAsignaturas.filter(ra => 
                ra.asignaturas.length >= this.MINIMO_ASIGNATURAS_POR_RA
            );
            return RAsCubiertos.length / matrizRAAsignaturas.length;
        }
    },
    
    EVALUACION: {
        REQUIERE_RUBRICAS: true,
        REQUIERE_EVIDENCIAS: true,
        
        evaluarSistemaEvaluacion: (sistemaEvaluacion) => {
            let score = 0;
            if (sistemaEvaluacion.rubricas) score += 0.5;
            if (sistemaEvaluacion.evidencias) score += 0.3;
            if (sistemaEvaluacion.portafolios) score += 0.2;
            return score;
        }
    }
};

export const BLOOM_TAXONOMY = {
    NIVELES: ['conocer', 'comprender', 'aplicar', 'analizar', 'evaluar', 'crear'],
    VERBOS: {
        conocer: ['definir', 'listar', 'recordar', 'reconocer'],
        comprender: ['explicar', 'interpretar', 'resumir', 'parafrasear'],
        aplicar: ['utilizar', 'emplear', 'calcular', 'resolver'],
        analizar: ['comparar', 'contrastar', 'categorizar', 'diferenciar'],
        evaluar: ['juzgar', 'criticar', 'defender', 'justificar'],
        crear: ['diseñar', 'planificar', 'producir', 'construir']
    }
};