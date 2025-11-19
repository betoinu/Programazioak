import { GroqAPIService } from '../services/api-service.js';
import { PromptBuilder } from '../utils/prompt-builder.js';
import { ResultsDisplay } from './results-display.js';
import { setLoadingState, showError, hideError } from '../js/main.js';

export async function generateSuggestions(data) {
    setLoadingState(true);
    hideError();
    
    // Emaitzak ezkutatu
    const resultsContainer = document.getElementById("results-container");
    if (resultsContainer) {
        resultsContainer.classList.add("hidden");
    }

    try {
        const prompt = PromptBuilder.buildCurriculumPrompt(data);
        const result = await GroqAPIService.generateResponse(prompt);
        
        ResultsDisplay.displayGeneratedResults(result);

    } catch (error) {
        console.error("❌ Errorea iradokizunak sortzean:", error);
        showError(`Errore bat gertatu da iradokizunak sortzean: ${error.message}`);
    } finally {
        setLoadingState(false);
    }

}
