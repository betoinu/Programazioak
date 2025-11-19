import { APP_CONFIG } from '../config/app-config.js';

export class APIKeyManager {
    static init() {
        this.checkAPIKey();
        this.setupAPIKeyListener();
    }

    static checkAPIKey() {
        // 1. Lehenik localStorage-ean bilatu
        let apiKey = localStorage.getItem('groq_api_key');
        
        // 2. Gero APP_CONFIG-ean
        if (!apiKey && APP_CONFIG.API.GROQ_API_KEY && APP_CONFIG.API.GROQ_API_KEY !== "erabiltzaileak-konfiguratuko-du") {
            apiKey = APP_CONFIG.API.GROQ_API_KEY;
            localStorage.setItem('groq_api_key', apiKey);
        }
        
        // 3. Ez badago, eskatu
        if (!apiKey) {
            this.showAPIKeyInput();
        } else {
            APP_CONFIG.API.GROQ_API_KEY = apiKey;
            this.hideAPIKeyAlert();
        }
    }

    static showAPIKeyInput() {
        const apiKey = prompt(
            "🔑 Groq API Gakoa beharrezkoa da\n\n" +
            "1. Joan: https://console.groq.com\n" +
            "2. Sortu API gako bat (doakoa)\n" +
            "3. Itsatsi hemen:"
        );
        
        if (apiKey && apiKey.trim()) {
            localStorage.setItem('groq_api_key', apiKey.trim());
            APP_CONFIG.API.GROQ_API_KEY = apiKey.trim();
            this.hideAPIKeyAlert();
            alert('✅ API gakoa gordeta! Orain erabili dezakezu aplikazioa.');
        } else {
            this.showAPIKeyAlert();
        }
    }

    static showAPIKeyAlert() {
        // Interfazean alerta bat erakutsi
        const alertHTML = `
            <div id="api-key-alert" class="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 rounded shadow-lg max-w-md">
                <div class="flex justify-between items-start">
                    <div>
                        <strong class="font-bold">🔑 API Gakoa beharrezkoa</strong>
                        <p class="text-sm mt-1">Aplikazioa erabiltzeko Groq API gako bat behar duzu.</p>
                    </div>
                    <button onclick="APIKeyManager.showAPIKeyInput()" class="ml-4 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm">
                        Sartu
                    </button>
                </div>
                <div class="mt-2 text-xs">
                    <a href="https://console.groq.com" target="_blank" class="text-blue-600 hover:underline">Lortu API gakoa hemen</a>
                </div>
            </div>
        `;
        
        const existingAlert = document.getElementById('api-key-alert');
        if (!existingAlert) {
            document.body.insertAdjacentHTML('beforeend', alertHTML);
        }
    }

    static hideAPIKeyAlert() {
        const alert = document.getElementById('api-key-alert');
        if (alert) {
            alert.remove();
        }
    }

    static setupAPIKeyListener() {
        // Eskuin goiko izenean "API Gakoa" aukera gehitu
        this.addAPIKeyToUserMenu();
    }

    static addAPIKeyToUserMenu() {
        // Etorkizunerako: erabiltzaile menu batean sartu
        setTimeout(() => {
            const header = document.querySelector('header');
            if (header) {
                const apiButton = document.createElement('button');
                apiButton.textContent = '🔑 API Gakoa';
                apiButton.className = 'absolute top-4 right-4 text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded';
                apiButton.onclick = () => this.showAPIKeyInput();
                header.style.position = 'relative';
                header.appendChild(apiButton);
            }
        }, 1000);
    }

    static getAPIKey() {
        return APP_CONFIG.API.GROQ_API_KEY;
    }

    static validateAPIKey(apiKey) {
        return apiKey && apiKey.startsWith('gsk_') && apiKey.length > 20;
    }
}
