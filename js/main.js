// ✅ IMPORTS CORREGIDOS EN main.js:
import { APP_CONFIG } from '/Programazioak/config/app-config.js';
import { GroqAPIService } from '/Programazioak/services/api-service.js';
import { CurriculumDataService } from '/Programazioak/services/data-service.js';
import { PromptBuilder } from '/Programazioak/utils/prompt-builder.js';
import { ResultsDisplay } from '/Programazioak/components/results-display.js';
import { initializeApp } from '/Programazioak/components/app-initializer.js';
import { setupEventListeners } from '/Programazioak/components/event-manager.js';
import { APIKeyManager } from '/Programazioak/components/api-key-manager.js';
import { GlobalAnalyzer } from '/Programazioak/analysis/global-analyzer.js';
import { CompetenceMapper } from '/Programazioak/analysis/competence-mapper.js';
import { ANECA_STANDARDS } from '/Programazioak/data/aneca-standards.js';
import { CurriculumCoverage } from '/Programazioak/analysis/curriculum-coverage.js';
import { HorizontalCoherence } from '/Programazioak/analysis/horizontal-coherence.js';
import { AnecaValidator } from '/Programazioak/validation/aneca-validator.js';
import { ContentAlignment } from '/Programazioak/analysis/content-alignment.js';
import { MatrixDisplay } from '/Programazioak/visualization/matrix-display.js';
import { GapAnalyzer } from '/Programazioak/visualization/gap-analyzer.js';
import { showError, hideError, setLoadingState } from '/Programazioak/utils/ui-helpers.js';
import { AccreditationIndicators } from '/Programazioak/analysis/accreditation-indicators.js';
import { DiagnosticSystem } from '/Programazioak/utils/diagnostic-system.js';
import BloomAnalyzer from '/Programazioak/analysis/BloomAnalyzer.js';


// ===== INICIALIZACIÓN PRINCIPAL =====
document.addEventListener('DOMContentLoaded', async function() {
    try {
        console.log('🚀 Aplikazioa hasieratzen...');
        
        await initializeApp();
        setupEventListeners();
        await APIKeyManager.init();
        
        // Inicializar análisis global (ahora mejorado con ANECA)
        initializeGlobalAnalysis();
        
        console.log('✅ Aplikazioa prest!');
    } catch (error) {
        console.error('❌ Errorea aplikazioa hasieratzean:', error);
        showError(`Errorea aplikazioa hasieratzean: ${error.message}`);
    }
});

// ===== ANALISIS GLOBAL ACTUALIZADO =====
async function initializeGlobalAnalysis() {
    try {
        console.log('🚀 Iniciando Análisis Global ANECA Completo');

        // ✅ EJECUTAR DIAGNÓSTICO COMPLETO
        console.log("🩺 Ejecutando diagnóstico completo...");
        const diagnostico = DiagnosticSystem.diagnosticarAplicacionCompleta();
        
        if (diagnostico.estado === 'INCOMPLETO') {
            console.warn("⚠️  Módulos incompletos detectados. Generando reporte de reparación...");
            DiagnosticSystem.generarReporteReparacion();
            
            // Preguntar si continuar
            if (!confirm(`Se detectaron ${diagnostico.totalMetodosFaltantes} métodos faltantes. ¿Continuar igualmente?`)) {
                throw new Error("Análisis cancelado por el usuario");
            }
        }
        const curriculumData = await CurriculumDataService.loadData();
        
        // 1. ANÁLISIS MACRO
        const globalAnalyzer = new GlobalAnalyzer(curriculumData);
        const ambitosProfesionales = globalAnalyzer.identificarAmbitosProfesionales();
        const progresionCompetencial = globalAnalyzer.analizarProgresionCompetencial();
        
        // 2. ✅ MATRICES ANECA COMPLETAS (MEJORADAS)
        console.log("📊 Generando Matriz 1: Competencias - RA...");
        const matrizCompetenciasRA = await CompetenceMapper.generarMatrizCompetenciasRA(curriculumData);
        
        console.log("📊 Generando Matriz 2: RA - Asignaturas...");
        const matrizRAsignaturas = await CurriculumCoverage.generarMatrizRAsignaturas(curriculumData);
        
        console.log("📊 Generando Matriz 3: Competencias - Asignaturas...");
        const matrizCompetenciasAsignaturas = await HorizontalCoherence.generarMatrizCompetenciasAsignaturas(curriculumData);
        
        console.log("📊 Generando Matriz 4: Contenidos - RA...");
        const matrizContenidosRA = await ContentAlignment.generarMatrizContenidosRA(curriculumData);
        
        // ✅ NUEVO: INDICADORES DE ACREDITACIÓN ANECA
        console.log("📊 Generando Indicadores de Acreditación ANECA...");
        const matricesCompletas = {
            competenciaRA: matrizCompetenciasRA,
            raSubject: matrizRAsignaturas,
            competenceSubject: matrizCompetenciasAsignaturas,
            contentRA: matrizContenidosRA
        };

        const indicadoresAcreditacion = AccreditationIndicators.generarReporteAcreditacionCompleto(curriculumData, matricesCompletas);
        
        // 3. VALIDACIÓN ANECA
        const validacionANECA = AnecaValidator.validarCumplimientoCompleto(curriculumData);
        
        // 4. DETECCIÓN DE HUECOS
        // ✅ CORREGIDO:
        console.log("🔍 Preparando matrices para GapAnalyzer...");
        const matricesANECA = {
            RAsignaturas: matrizRAsignaturas,
            competenciasRA: matrizCompetenciasRA
        };
        console.log("📊 matricesANECA:", matricesANECA);
        
        const analisisHuecos = GapAnalyzer.analizarHuecosCurriculares(curriculumData, matricesANECA);
        console.log("✅ Huecos detectados:", analisisHuecos);
        
        console.log('✅ Análisis ANECA completado');
        
        const resultadosCompletos = {
                    matrices: {
                        competenciasRA: matrizCompetenciasRA,
                        RAsignaturas: matrizRAsignaturas,
                        competenciasAsignaturas: matrizCompetenciasAsignaturas,
                        contenidosRA: matrizContenidosRA
                    },
                    indicadoresAcreditacion: indicadoresAcreditacion,
                    huecos: analisisHuecos, // Incluir huecos
                    validacionANECA: validacionANECA,
                    metadata: {
                        totalCompetencias: matrizCompetenciasRA.competencias?.length || 0,
                        totalAsignaturas: matrizRAsignaturas.matriz?.[0]?.asignaturas?.length || 0,
                        totalRA: matrizCompetenciasRA.metricas?.totalRAs || 0,
                        totalHuecos: analisisHuecos?.huecos?.length || 0,
                        cumplimientoGlobal: indicadoresAcreditacion?.cumplimientoGlobal?.puntuacion || 0
                    },
                    // Mantener compatibilidad con código existente si es necesario
                    curriculumData: curriculumData,
                    ambitosProfesionales: ambitosProfesionales,
                    progresionCompetencial: progresionCompetencial
                };
        
                console.log("✅ ResultadosCompletos creados:", {
                    matrices: Object.keys(resultadosCompletos.matrices),
                    tieneIndicadores: !!resultadosCompletos.indicadoresAcreditacion,
                    metadata: resultadosCompletos.metadata
                });
                
                // 6. MOSTRAR DASHBOARD COMPLETO
                ResultsDisplay.displayAnecaResults(resultadosCompletos);
                
                console.log("✅ Dashboard mostrado en interfaz");
                initializeMatrixVisualization(resultadosCompletos);
                
            } catch (error) {
                console.error('❌ Error en Análisis Global ANECA:', error);
                showError(`Error en análisis ANECA: ${error.message}`);
            }
        }

// ===== SISTEMA BIDIRECCIONAL =====
function setupBidirectionalSystem() {
    // Conectar eventos entre análisis global y específico
    document.addEventListener('globalAnalysisComplete', (event) => {
        const { issues, recomendaciones } = event.detail;
        this.derivarMejorasEspecificas(issues, recomendaciones);
    });
    
    document.addEventListener('specificImprovementApplied', (event) => {
        const { asignatura, cambios } = event.detail;
        this.actualizarAnalisisGlobal(asignatura, cambios);
    });
} // ← ESTE } CIERRA setupBidirectionalSystem

// ===== ✅ NUEVA FUNCIÓN: VISUALIZACIÓN DE MATRICES ANECA =====
function initializeMatrixVisualization(resultados) {
    try {
        console.log("🎨 Inicializando visualización de matrices ANECA...");
        
        // Tu código existente de visualización aquí
        // Esto se integrará con tu ResultsDisplay actual
        
        console.log("✅ Visualización de matrices mejorada con ANECA");
        
    } catch (error) {
        console.error("❌ Error en visualización de matrices:", error);
    }
}

// Exportatu funtzioak globalak izateko
window.showError = showError;
window.hideError = hideError;
window.setLoadingState = setLoadingState;

// ===== EXPORTAR MÓDULOS AL OBJETO GLOBAL =====

// Servicios y componentes base
window.CurriculumDataService = CurriculumDataService;
window.GroqAPIService = GroqAPIService;
window.APIKeyManager = APIKeyManager;
window.ResultsDisplay = ResultsDisplay;

// Sistema ANECA completo
window.GlobalAnalyzer = GlobalAnalyzer;
window.CompetenceMapper = CompetenceMapper;
window.CurriculumCoverage = CurriculumCoverage;
window.HorizontalCoherence = HorizontalCoherence;
window.ContentAlignment = ContentAlignment;
window.AnecaValidator = AnecaValidator;
window.MatrixDisplay = MatrixDisplay;
window.GapAnalyzer = GapAnalyzer;
window.ANECA_STANDARDS = ANECA_STANDARDS;

// ✅ NUEVOS MÓDULOS EXPORTADOS
window.AccreditationIndicators = AccreditationIndicators;

// Funciones principales
window.initializeGlobalAnalysis = initializeGlobalAnalysis;
window.setupBidirectionalSystem = setupBidirectionalSystem;

console.log('✅ Todos los módulos ANECA exportados al objeto global');




























