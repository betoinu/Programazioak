export class CompetenceMapper {
    static generarMatrizCompetenciasRA(curriculumData) {
        const matriz = {
            competencias: [],
            coberturaRA: {},
            nivelesBloom: {},
            evidencias: {}
        };
        
        // Mapear cada competencia a sus RAs
        curriculumData.competencias?.forEach(competencia => {
            const raAsociados = this.buscarRAsPorCompetencia(competencia, curriculumData);
            matriz.competencias.push({
                competencia: competencia,
                RAs: raAsociados,
                nivel: this.determinarNivelCompetencia(raAsociados),
                evidencias: this.identificarEvidencias(raAsociados),
                instrumentosEvaluacion: this.identificarInstrumentos(raAsociados)
            });
        });
        
        return {
            matriz,
            metricas: this.calcularMetricasANECA(matriz),
            alertas: this.generarAlertasCumplimiento(matriz)
        };
    }
    
    static calcularMetricasANECA(matriz) {
        return {
            claridadCompetencias: this.evaluarClaridad(matriz),
            medibilidadRAs: this.evaluarMedibilidad(matriz),
            progresionVertical: this.evaluarProgresion(matriz),
            coberturaHorizontal: this.evaluarCobertura(matriz)
        };
    }

    // ✅ MÉTODOS CORREGIDOS - SIN COMAS Y DENTRO DE LA CLASE
    static evaluarClaridad(matriz) {
        let score = 0;
        matriz.competencias.forEach(comp => {
            if (comp.competencia.descripcion && comp.competencia.descripcion.length > 10) score += 1;
            if (comp.competencia.codigo) score += 1;
        });
        return score / (matriz.competencias.length * 2);
    }
    
    static evaluarMedibilidad(matriz) {
        let score = 0;
        const todosRAs = matriz.competencias.flatMap(comp => comp.RAs);
        todosRAs.forEach(ra => {
            const texto = ra.descripcion?.toLowerCase() || ra.toLowerCase();
            if (texto.includes('analizar') || texto.includes('diseñar') || texto.includes('evaluar')) score += 1;
        });
        return score / todosRAs.length;
    }

    // ✅ MÉTODOS PLACEHOLDER PARA EVITAR MÁS ERRORES
    static buscarRAsPorCompetencia(competencia, curriculumData) {
        return [];
    }
    
    static determinarNivelCompetencia(raAsociados) {
        return 'MEDIO';
    }
    
    static identificarEvidencias(raAsociados) {
        return ['Evidencia por defecto'];
    }
    
    static identificarInstrumentos(raAsociados) {
        return ['Instrumento por defecto'];
    }
    
    static evaluarProgresion(matriz) {
        return 0.5;
    }
    
    static evaluarCobertura(matriz) {
        return 0.5;
    }
    
    static generarAlertasCumplimiento(matriz) {
        return [];
    }
}
