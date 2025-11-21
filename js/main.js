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
        
        const curriculumData = await CurriculumDataService.loadData();
        
        // 1. ANÁLISIS MACRO
        const globalAnalyzer = new GlobalAnalyzer(curriculumData);
        const ambitosProfesionales = globalAnalyzer.identificarAmbitosProfesionales();
        const progresionCompetencial = globalAnalyzer.analizarProgresionCompetencial();
        
        // 2. MATRICES ANECA COMPLETAS
        const matrizCompetenciasRA = CompetenceMapper.generarMatrizCompetenciasRA(curriculumData);
        const matrizRAsignaturas = CurriculumCoverage.generarMatrizRAsignaturas(curriculumData);
        const matrizCompetenciasAsignaturas = HorizontalCoherence.generarMatrizCompetenciasAsignaturas(curriculumData);
        const matrizContenidosRA = ContentAlignment.generarMatrizContenidosRA(curriculumData);
        
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
        
        // 5. MOSTRAR DASHBOARD COMPLETO
        MatrixDisplay.mostrarDashboardANECA({
            ambitosProfesionales,
            progresionCompetencial,
            matrices: {
                competenciasRA: matrizCompetenciasRA,
                RAsignaturas: matrizRAsignaturas,
                competenciasAsignaturas: matrizCompetenciasAsignaturas,
                contenidosRA: matrizContenidosRA
            },
            validacionANECA,
            analisisHuecos
        });
        
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

// Funciones principales
window.initializeGlobalAnalysis = initializeGlobalAnalysis;
window.setupBidirectionalSystem = setupBidirectionalSystem;

console.log('✅ Todos los módulos ANECA exportados al objeto global');



















