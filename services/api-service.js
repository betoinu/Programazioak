import { APP_CONFIG } from '../config/app-config.js';
import { APIKeyManager } from '../components/api-key-manager.js';

export class GroqAPIService {
    static async generateResponse(prompt) {
        const apiKey = APIKeyManager.getAPIKey();
        
        // ✅ API gakoa balidatu
        if (!apiKey || apiKey === "erabiltzaileak-konfiguratuko-du") {
            throw new Error('API gakoa beharrezkoa da. Mesedez, sartu zure Groq API gakoa.');
        }

        try {
            const response = await fetch(APP_CONFIG.API.BASE_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'system',
                            content: 'Erantzun BETI euskaraz formalean. Erabili markdown formatua. Zure lana curriculum diseinuan laguntzea da.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    model: APP_CONFIG.API.MODEL,
                    temperature: APP_CONFIG.API.TEMPERATURE,
                    max_tokens: APP_CONFIG.API.MAX_TOKENS,
                    stream: false
                })
            });

            if (!response.ok) {
                if (response.status === 401) {
                    // API gako okerra
                    localStorage.removeItem('groq_api_key');
                    APIKeyManager.showAPIKeyInput();
                    throw new Error('API gakoa baliogabea. Mesedez, sartu gako berri bat.');
                }
                throw new Error(`Groq API Error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
            
        } catch (error) {
            console.error('❌ Groq API errorea:', error);
            throw error;
        }
    }
}