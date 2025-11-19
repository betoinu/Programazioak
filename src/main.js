// ===== INPORTATU MODULU GUZTIAK =====
import { APP_CONFIG } from './config/app-config.js';
import { GroqAPIService } from './services/api-service.js';
import { CurriculumDataService } from './services/data-service.js';
import { PromptBuilder } from './utils/prompt-builder.js';
import { ResultsDisplay } from './components/results-display.js';
import { initializeApp } from './components/app-initializer.js';
import { setupEventListeners } from './components/event-manager.js';
import { APIKeyManager } from './components/api-key-manager.js';
import { CompetenceAnalyzer } from './src/analysis/competence-analyzer.js';
import { CurriculumLoader } from './src/data/curriculum-loader.js';

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
        
        console.log('✅ Aplikazioa prest!');
    } catch (error) {
        console.error('❌ Errorea aplikazioa hasieratzean:', error);
    }
});

// Función para lanzar el análisis global
// Función mejorada para lanzar análisis global
async function launchGlobalAnalysis() {
    const button = document.getElementById('global-analysis-btn');
    const buttonText = document.getElementById('global-analysis-text');
    const loader = document.getElementById('global-analysis-loader');
    const resultsContainer = document.getElementById('global-analysis-results');
    
    try {
        // Estado de carga
        button.disabled = true;
        buttonText.textContent = 'Analizatzen...';
        loader.classList.remove('hidden');
        resultsContainer.classList.add('hidden');
        
        console.log('🚀 Analisi Globala abiarazten...');
        
        // Ejecutar análisis completo
        const results = await CompetenceAnalyzer.performGlobalAnalysis();
        
        // Mostrar resultados
        displayCompetenceAnalysis(results);
        
        // Éxito
        buttonText.textContent = 'Analisia Osatuta!';
        setTimeout(() => {
            buttonText.textContent = 'Berriro Hasi Analisia';
            button.disabled = false;
            loader.classList.add('hidden');
        }, 2000);
        
    } catch (error) {
        console.error('❌ Errorea analisi globalean:', error);
        
        // Error state
        buttonText.textContent = 'Errorea - Saiatu Berriro';
        button.disabled = false;
        loader.classList.add('hidden');
        
        // Mostrar error
        showError(`Analisi globalean errorea: ${error.message}`);
    }
}

function displayCompetenceAnalysis(results) {
    const resultsContainer = document.getElementById('global-analysis-results');
    const summaryContent = document.getElementById('summary-content');
    const areaContent = doc
        ument.getElementById('area-content');
    const recommendationsContent = document.getElementById('recommendations-content');
    
    // Mostrar contenedor
    resultsContainer.classList.remove('hidden');
    
    // 1. Resumen ejecutivo
    summaryContent.innerHTML = this.buildSummaryHTML(results);
    
    // 2. Análisis por áreas
    areaContent.innerHTML = this.buildAreaAnalysisHTML(results.areaAnalyses);
    
    // 3. Recomendaciones
    recommendationsContent.innerHTML = this.buildRecommendationsHTML(results);
}

// Botón para lanzar el análisis (añadir al HTML)
function addGlobalAnalysisButton() {
    const button = document.createElement('button');
    button.textContent = '🔍 Analisi Kompetentzial Globala';
    button.className = 'btn-primary mt-4';
    button.onclick = launchGlobalAnalysis;
    
    document.querySelector('header').appendChild(button);
}

// ===== FUNTZIO GLOBALAK (beharrezkoak baldin badaude) =====
export function setLoadingState(isLoading) {
    const generateButton = document.getElementById("generate-button");
    const buttonText = document.getElementById("button-text");
    const buttonLoader = document.getElementById("button-loader");
    
    if (!generateButton || !buttonText || !buttonLoader) return;
    
    if (isLoading) {
        generateButton.disabled = true;
        buttonText.classList.add("hidden");
        buttonLoader.classList.remove("hidden");
    } else {
        generateButton.disabled = false;
        buttonText.classList.remove("hidden");
        buttonLoader.classList.add("hidden");
    }
}

// ===== ERROR HANDLER GLOBALA =====
export function showError(message) {
    const errorMessage = document.getElementById("error-message");
    if (errorMessage) {
        errorMessage.textContent = message;
        errorMessage.classList.remove("hidden");
    }
}

export function hideError() {
    const errorMessage = document.getElementById("error-message");
    if (errorMessage) {
        errorMessage.classList.add("hidden");
    }

}


