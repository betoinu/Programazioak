// 📁 utils/diagnostic-system.js - SISTEMA DE DIAGNÓSTICO
export class DiagnosticSystem {
    static diagnosticarAplicacionCompleta() {
        console.group("🩺 DIAGNÓSTICO COMPLETO DE LA APLICACIÓN");
        
        const modulos = {
            'CompetenceMapper': window.CompetenceMapper,
            'CurriculumCoverage': window.CurriculumCoverage,
            'ContentAlignment': window.ContentAlignment,
            'HorizontalCoherence': window.HorizontalCoherence,
            'AccreditationIndicators': window.AccreditationIndicators,
            'AnecaValidator': window.AnecaValidator,
            'MatrixDisplay': window.MatrixDisplay,
            'GapAnalyzer': window.GapAnalyzer
        };
        
        let totalMetodosFaltantes = 0;
        let modulosConProblemas = 0;
        
        Object.entries(modulos).forEach(([nombre, modulo]) => {
            console.group(`🔍 ${nombre}`);
            
            if (typeof modulo === 'undefined') {
                console.error(`❌ MÓDULO NO CARGADO: ${nombre}`);
                modulosConProblemas++;
            } else {
                const metodosFaltantes = this.diagnosticarModulo(nombre, modulo);
                totalMetodosFaltantes += metodosFaltantes.length;
                
                if (metodosFaltantes.length > 0) {
                    modulosConProblemas++;
                    console.error(`❌ FALTAN ${metodosFaltantes.length} MÉTODOS:`, metodosFaltantes);
                } else {
                    console.log("✅ Módulo completo");
                }
            }
            
            console.groupEnd();
        });
        
        console.log("📊 RESUMEN DIAGNÓSTICO:");
        console.log(`- Módulos analizados: ${Object.keys(modulos).length}`);
        console.log(`- Módulos con problemas: ${modulosConProblemas}`);
        console.log(`- Total métodos faltantes: ${totalMetodosFaltantes}`);
        
        if (modulosConProblemas === 0) {
            console.log("🎉 ¡TODOS LOS MÓDULOS ESTÁN COMPLETOS!");
        } else {
            console.warn("⚠️  Se detectaron módulos incompletos");
        }
        
        console.groupEnd();
        
        return {
            modulosConProblemas,
            totalMetodosFaltantes,
            estado: modulosConProblemas === 0 ? 'COMPLETO' : 'INCOMPLETO'
        };
    }
    
    static diagnosticarModulo(nombreModulo, modulo) {
        const metodosRequeridos = this.obtenerMetodosRequeridos(nombreModulo);
        const metodosFaltantes = [];
        
        metodosRequeridos.forEach(metodo => {
            if (typeof modulo[metodo] !== 'function') {
                metodosFaltantes.push(metodo);
            }
        });
        
        return metodosFaltantes;
    }
    
    static obtenerMetodosRequeridos(nombreModulo) {
        const metodosPorModulo = {
            'CompetenceMapper': [
                'generarMatrizCompetenciasRA',
                'generarCodigoCompetencia',
                'extraerResultadosAprendizaje',
                'determinarNivelANECA',
                'generarEvidenciasLogro',
                'mapearInstrumentosEvaluacion',
                'calcularMetricasCompetencias',
                'calcularDistribucionNivelesANECA',
                'calcularPorcentajeRA',
                'calcularCoberturaVertical',
                'evaluarCumplimientoANECA',
                'calcularPuntuacionANECA',
                'analizarCoherenciaVertical',
                'extraerVerbosAccion'
            ],
            'CurriculumCoverage': [
                'generarMatrizRAsignaturas',
                'identificarAsignaturasPorRA',
                'determinarNivelContribucion',
                'calcularMetricasCobertura',
                'identificarAsignaturasSobrecargadas',
                'generarAlertasCobertura',
                'calcularPorcentajeCumplimiento',
                'hayCoincidenciaRA',
                'extraerEvidenciasContribucion',
                'analizarCumplimientoANECA',
                'analizarSecuenciaProgresion',
                'generarEvidenciasDetalladas',
                'calcularDistribucionNiveles',
                'evaluarProgresionGlobal',
                'calcularPuntuacionANECA',
                'generarAnalisisANECACompleto',
                'evaluarCriterioB1',
                'evaluarCriterioB2',
                'generarMapaCurricular',
                'generarRecomendacionesGlobales'
            ],
            'ContentAlignment': [
                'generarMatrizContenidosRA',
                'identificarRAsPorContenido',
                'hayCoincidenciaSemantica',
                'extraerPalabrasClave',
                'calcularFuerzaRelacion',
                'determinarNivelContenido',
                'evaluarAdecuacionContenido',
                'generarSugerenciasContenido',
                'calcularMetricasAdecuacion',
                'identificarContenidosDesalineados',
                'identificarEvidenciasRelacion',
                'calcularDistribucionNiveles',
                'calcularCoberturaRA',
                'identificarFortalezasAlineacion',
                'identificarAreasMejoraAlineacion'
            ],
            'HorizontalCoherence': [
                'generarMatrizCompetenciasAsignaturas',
                'identificarDesequilibrios',
                'generarRecomendacionesEquilibrio',
                'determinarNivelCompetencia',
                'calcularPesoCompetencia',
                'analizarEquilibrioAsignatura'
            ],
            'AccreditationIndicators': [
                'generarReporteAcreditacionCompleto',
                'evaluarClaridadCoherencia',
                'evaluarCoberturaCurricular',
                'evaluarSistemaEvaluacion',
                'evaluarSistemaMejoraContinua',
                'evaluarFormulacionCompetencias',
                'evaluarRAMedibles',
                'evaluarMapeoRAAsignaturas',
                'evaluarSecuenciaProgresion',
                'calcularPuntuacionCompetencias',
                'calcularPuntuacionRAMedibles',
                'calcularPuntuacionGlobal',
                'generarResumenEjecutivo',
                'calcularCumplimientoGlobal',
                'generarRecomendacionesPrioritarias'
            ]
        };
        
        return metodosPorModulo[nombreModulo] || [];
    }
    
    static generarReporteReparacion() {
        console.group("🔧 REPORTE DE REPARACIÓN AUTOMÁTICA");
        
        const modulos = {
            'CompetenceMapper': window.CompetenceMapper,
            'CurriculumCoverage': window.CurriculumCoverage,
            'ContentAlignment': window.ContentAlignment,
            'HorizontalCoherence': window.HorizontalCoherence,
            'AccreditationIndicators': window.AccreditationIndicators
        };
        
        Object.entries(modulos).forEach(([nombre, modulo]) => {
            if (typeof modulo !== 'undefined') {
                const metodosFaltantes = this.diagnosticarModulo(nombre, modulo);
                if (metodosFaltantes.length > 0) {
                    console.group(`📝 ${nombre} - Métodos a añadir:`);
                    metodosFaltantes.forEach(metodo => {
                        console.log(`static ${metodo}() {`);
                        console.log(`    // TODO: Implementar método`);
                        console.log(`    return {};`);
                        console.log(`}`);
                    });
                    console.groupEnd();
                }
            }
        });
        
        console.groupEnd();
    }
}

// Exportar al global para acceso desde consola
window.DiagnosticSystem = DiagnosticSystem;