import { APP_CONFIG } from 'config/app-config.js';
import { GroqAPIService } from 'services/api-service.js';
import { CurriculumDataService } from 'services/data-service.js';
import { PromptBuilder } from 'utils/prompt-builder.js';
import { ResultsDisplay } from 'components/results-display.js';
import { initializeApp } from 'components/app-initializer.js';
import { setupEventListeners } from 'components/event-manager.js';
import { APIKeyManager } from 'components/api-key-manager.js';

// ===== APLIKAZIOA HASIERATU =====
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('🚀 Aplikazioa hasieratzen...');
        
        // 1. Datu-basea kargatu
        await CurriculumDataService.loadData();
        
        // 2. Interfazea hasieratu
        await initializeApp();
        
        // 3. Event listener-ak konfiguratu
        setupEventListeners();
        
        // 4. Analisi Globala hasieratu
        initializeGlobalAnalysis();
        
        console.log('✅ Aplikazioa prest!');
    } catch (error) {
        console.error('❌ Errorea aplikazioa hasieratzean:', error);
        showError(`Errorea aplikazioa hasieratzean: ${error.message}`);
    }
});

// ===== ANALISI GLOBALA =====
let CompetenceAnalyzer, CurriculumLoader, AnalysisDisplay;

async function initializeGlobalAnalysis() {
    try {
        // Kargatu moduluak dinamikoki
        const competenceModule = await import('./analysis/competence-analyzer.js');
        const curriculumModule = await import('./data/curriculum-loader.js');
        const displayModule = await import('./visualization/analysis-display.js');
        
        CompetenceAnalyzer = competenceModule.CompetenceAnalyzer;
        CurriculumLoader = curriculumModule.CurriculumLoader;
        AnalysisDisplay = displayModule.AnalysisDisplay;
        
        console.log('✅ Analisi Globala moduluak kargatuta');
        
        // Konfiguratu botoia
        setupAnalysisButton();
        
    } catch (error) {
        console.error('❌ Errorea Analisi Globala moduluak kargatzean:', error);
        disableAnalysisButton('Analisia Eskuragarri Ez');
    }
}

function setupAnalysisButton() {
    const button = document.getElementById('global-analysis-btn');
    if (button) {
        button.addEventListener('click', launchGlobalAnalysis);
        button.disabled = false;
        console.log('🔍 Analisi botoia konfiguratuta');
    } else {
        console.warn('⚠️ Analisi botoia ez da aurkitu');
    }
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

// ===== ERROR HANDLER =====
function showError(message) {
    console.error('❌ Errorea:', message);
    
    // Erabili zure errore-sistema existentea
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.remove('hidden');
        
        // Automatikoki ezkutatu 5 segundoaren ondoren
        setTimeout(() => {
            errorDiv.classList.add('hidden');
        }, 5000);
    } else {
        // Fallback: alert sinplea
        alert(`Errorea: ${message}`);
    }
}

function hideError() {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }
}

function setLoadingState(isLoading) {
    const button = document.getElementById('generate-button');
    const buttonText = document.getElementById('button-text');
    const loader = document.getElementById('button-loader');
    
    if (button && buttonText && loader) {
        button.disabled = isLoading;
        if (isLoading) {
            buttonText.textContent = 'Sortzen...';
            loader.classList.remove('hidden');
        } else {
            buttonText.textContent = 'Iradokizunak Sortu';
            loader.classList.add('hidden');
        }
    }
}

// Exportatu funtzioak globalak izateko
window.showError = showError;
window.hideError = hideError;
window.setLoadingState = setLoadingState;

