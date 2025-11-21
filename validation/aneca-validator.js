class AnecaValidator {
    static validarCumplimientoCompleto(curriculumData) {
        const validaciones = {
            perfilEgreso: this.validarPerfilEgreso(curriculumData),
            coberturaCurricular: this.validarCoberturaCurricular(curriculumData),
            sistemaEvaluacion: this.validarSistemaEvaluacion(curriculumData),
            mejoraContinua: this.validarMejoraContinua(curriculumData)
        };
        
        return {
            validaciones,
            puntuacionGlobal: this.calcularPuntuacionGlobal(validaciones),
            cumplimientoPorcentaje: this.calcularPorcentajeCumplimiento(validaciones),
            informeANECA: this.generarInformeANECA(validaciones)
        };
    }
    
    static validarPerfilEgreso(curriculumData) {
        const competencias = curriculumData.competencias || [];
        const RAs = curriculumData.resultadosAprendizaje || [];
        
        return {
            criterio: "Claridad y coherencia del perfil de egreso",
            cumplimiento: {
                competenciasClaras: this.evaluarClaridadCompetencias(competencias),
                RAsMedibles: this.evaluarMedibilidadRAs(RAs),
                alineacionCompetenciasRAs: this.evaluarAlineacion(competencias, RAs)
            },
            evidencias: this.recopilarEvidenciasPerfilEgreso(curriculumData),
            puntuacion: this.calcularPuntuacionPerfil(competencias, RAs)
        };
    }
    
    static validarCoberturaCurricular(curriculumData) {
        const matrizCobertura = CurriculumCoverage.generarMatrizRAsignaturas(curriculumData);
        
        return {
            criterio: "Cobertura curricular completa y equilibrada",
            cumplimiento: {
                coberturaMinima: matrizCobertura.metricas.porcentajeCoberturaMinima >= 90,
                profundizacionSuficiente: matrizCobertura.metricas.porcentajeConProfundizacion >= 70,
                secuenciaLogica: this.validarSecuenciaProgresion(curriculumData)
            },
            metricas: matrizCobertura.metricas,
            alertas: matrizCobertura.alertas,
            puntuacion: this.calcularPuntuacionCobertura(matrizCobertura)
        };
    }
    
    static generarInformeANECA(validaciones) {
        const informe = {
            fechaGeneracion: new Date().toISOString(),
            resumenEjecutivo: this.generarResumenEjecutivo(validaciones),
            puntosFuertes: this.identificarPuntosFuertes(validaciones),
            areasMejora: this.identificarAreasMejora(validaciones),
            recomendacionesPrioritarias: this.generarRecomendacionesPrioritarias(validaciones),
            checklistANECA: this.generarChecklistANECA(validaciones)
        };
        
        return informe;
    }
    
    static generarChecklistANECA(validaciones) {
        return [
            {
                item: "A1. Competencias claramente formuladas",
                cumplido: validaciones.perfilEgreso.cumplimiento.competenciasClaras,
                evidencia: validaciones.perfilEgreso.evidencias,
                observaciones: "Verificar uso de verbos observables"
            },
            {
                item: "B1. Todos los RA mapeados a asignaturas", 
                cumplido: validaciones.coberturaCurricular.cumplimiento.coberturaMinima,
                evidencia: `Cobertura: ${validaciones.coberturaCurricular.metricas.porcentajeCoberturaMinima}%`,
                observaciones: validaciones.coberturaCurricular.alertas.length > 0 ? 
                    `Existen ${validaciones.coberturaCurricular.alertas.length} alertas` : "OK"
            },
            {
                item: "C1. Existencia de rúbricas de evaluación",
                cumplido: validaciones.sistemaEvaluacion.cumplimiento.rubricasExisten,
                evidencia: validaciones.sistemaEvaluacion.evidencias,
                observaciones: "Documentar en manual de evaluación"
            }
        ];
    }
  }
export { AnecaValidator };

if (typeof window !== 'undefined') {
    window.AnecaValidator = AnecaValidator;
}




