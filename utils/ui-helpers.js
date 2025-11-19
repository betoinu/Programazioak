// utils/ui-helpers.js

export function setLoadingState(isLoading) {
    const loader = document.getElementById('loadingIndicator');
    if (loader) {
        loader.style.display = isLoading ? 'block' : 'none';
    }
    
    // También deshabilitar/habilitar botones si es necesario
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        if (isLoading) {
            button.setAttribute('disabled', 'true');
            button.style.opacity = '0.6';
        } else {
            button.removeAttribute('disabled');
            button.style.opacity = '1';
        }
    });
}

export function showError(message) {
    console.error('❌ Error:', message);
    
    let errorDiv = document.getElementById('errorDisplay');
    if (!errorDiv) {
        errorDiv = document.createElement('div');
        errorDiv.id = 'errorDisplay';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fee;
            color: #d00;
            padding: 15px;
            border: 2px solid #f00;
            border-radius: 5px;
            z-index: 10000;
            max-width: 400px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        `;
        document.body.appendChild(errorDiv);
    }
    
    errorDiv.textContent = `Error: ${message}`;
    errorDiv.style.display = 'block';
    
    // Auto-ocultar después de 5 segundos
    setTimeout(() => {
        hideError();
    }, 5000);
}

export function hideError() {
    const errorDiv = document.getElementById('errorDisplay');
    if (errorDiv) {
        errorDiv.style.display = 'none';
    }
}
