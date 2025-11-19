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
async function launchGlobalAnalysis() {
    try {
        // Cargar todos los datos del curriculum
        const allCurriculumData = await loadCompleteCurriculumData();
        
        const results = await CompetenceAnalyzer.performGlobalAnalysis(allCurriculumData);
        
        // Mostrar resultados
        displayCompetenceAnalysis(results);
        
    } catch (error) {
        console.error('❌ Errorea analisi globala egiten:', error);
    }
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

