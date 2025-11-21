// Configuración
import { APP_CONFIG } from '../config/app-config.js';

// Servicios
import { GroqAPIService } from '../services/api-service.js';
import { CurriculumDataService } from '../services/data-service.js';

// Utils
import { PromptBuilder } from '../utils/prompt-builder.js';

// Components
import { ResultsDisplay } from '../components/results-display.js';
import { initializeApp } from '../components/app-initializer.js';
import { setupEventListeners } from '../components/event-manager.js';
import { APIKeyManager } from '../components/api-key-manager.js';

// Data - SI LO NECESITAS
import { CurriculumLoader } from '../data/curriculum-loader.js';

// Visualization - SI LO NECESITAS  
import { AnalysisDisplay } from '../visualization/analysis-display.js';

import { GlobalAnalyzer } from '../analysis/global-analyzer.js';
import { CompetenceMapper } from '../analysis/competence-mapper.js';
import { ANECA_STANDARDS } from '../data/aneca-standards.js';
import { CurriculumCoverage } from '../analysis/curriculum-coverage.js';
import { HorizontalCoherence } from '../analysis/horizontal-coherence.js';
import { AnecaValidator } from '../analysis/aneca-validator.js';
import { ContentAlignment } from '../analysis/content-alignment.js';
import { MatrixDisplay } from '../visualization/matrix-display.js';
import { GapAnalyzer } from '../visualization/gap-analyzer.js';
import { showError, hideError, setLoadingState } from '../utils/ui-helpers.js';

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
        const analisisHuecos = GapAnalyzer.analizarHuecosCurriculares(curriculumData, {
            competenciasRA: matrizCompetenciasRA,
            RAsignaturas: matrizRAsignaturas
        });
        
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

function disableAnalysisButton(message) {
    const button = document.getElementById('global-analysis-btn');
    if (button) {
        button.disabled = true;
        button.textContent = message;
        button.style.opacity = '0.6';
    }
}

async function launchGlobalAnalysis() {
    // Egiaztatu moduluak kargatuta daudela
    if (!CompetenceAnalyzer || !CurriculumLoader || !AnalysisDisplay) {
        showError('Analisi Globala moduluak oraindik ez daude kargatuta. Itxi eta berriz ireki.');
        return;
    }

    const button = document.getElementById('global-analysis-btn');
    const buttonText = document.getElementById('global-analysis-text');
    const loader = document.getElementById('global-analysis-loader');
    const resultsContainer = document.getElementById('global-analysis-results');
    
    try {
        // Egoera kargatzen
        button.disabled = true;
        buttonText.textContent = 'Analizatzen...';
        loader.classList.remove('hidden');
        if (resultsContainer) resultsContainer.classList.add('hidden');
        
        console.log('🚀 Analisi Globala abiarazten...');
        
        // Exekutatu analisia
        const results = await CompetenceAnalyzer.performGlobalAnalysis();
        
        // Erakutsi emaitzak
        displayCompetenceAnalysis(results);
        
        // Arrakasta
        buttonText.textContent = 'Analisia Osatuta!';
        setTimeout(() => {
            buttonText.textContent = 'Berriro Hasi Analisia';
            button.disabled = false;
            loader.classList.add('hidden');
        }, 2000);
        
    } catch (error) {
        console.error('❌ Errorea analisi globalean:', error);
        
        // Error egoera
        buttonText.textContent = 'Errorea - Saiatu Berriro';
        button.disabled = false;
        loader.classList.add('hidden');
        
        showError(`Analisi globalean errorea: ${error.message}`);
    }
}

function displayCompetenceAnalysis(results) {
    const resultsContainer = document.getElementById('global-analysis-results');
    const summaryContent = document.getElementById('summary-content');
    const areaContent = document.getElementById('area-content');
    const recommendationsContent = document.getElementById('recommendations-content');
    
    if (!resultsContainer || !summaryContent || !areaContent || !recommendationsContent) {
        showError('Emaitzak erakusteko elementuak ez daude aurkitu');
        return;
    }
    
    // Erakutsi edukiontzia
    resultsContainer.classList.remove('hidden');
    
    // Erabili display helper
    summaryContent.innerHTML = AnalysisDisplay.buildSummaryHTML(results);
    areaContent.innerHTML = AnalysisDisplay.buildAreaAnalysisHTML(results.areaAnalyses);
    recommendationsContent.innerHTML = AnalysisDisplay.buildRecommendationsHTML(results);
}


// Exportatu funtzioak globalak izateko
window.showError = showError;
window.hideError = hideError;
window.setLoadingState = setLoadingState;















