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
}