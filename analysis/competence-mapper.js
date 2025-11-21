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
        // En competence-mapper.js, agrega:
        evaluarClaridad(competencias) {
            let score = 0;
            competencias.forEach(comp => {
                if (comp.descripcion && comp.descripcion.length > 10) score += 1;
                if (comp.codigo) score += 1;
            });
            return score / (competencias.length * 2);
        },
        
        evaluarMedibilidad(RAs) {
            let score = 0;
            RAs.forEach(ra => {
                const texto = ra.descripcion?.toLowerCase() || ra.toLowerCase();
                if (texto.includes('analizar') || texto.includes('diseñar') || texto.includes('evaluar')) score += 1;
            });
            return score / RAs.length;
        }
}
