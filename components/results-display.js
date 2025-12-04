export class ResultsDisplay {
    static displayGeneratedResults(markdownText) {
        const htmlText = this.simpleMarkdownToHTML(markdownText);
        const sections = this.parseMarkdownSections(htmlText);
        this.updateResultSections(sections);
        this.showResultsContainer();
    }

    // ✅ NUEVO MÉTODO: Mostrar resultados ANECA completos
    static displayAnecaResults(resultadosCompletos) {
        console.log("🎯 Mostrando resultados ANECA completos...");
        
        try {
            // ✅ 1. CREAR ESTRUCTURA DE NAVEGACIÓN ANECA
            this.crearNavegacionAneca();
            
            // ✅ 2. MOSTRAR DASHBOARD PRINCIPAL
            this.mostrarDashboardAneca(resultadosCompletos);
            
            // ✅ 3. PREPARAR SECCIONES PARA MATRICES
            this.prepararSeccionesMatrices(resultadosCompletos);
            
            this.showResultsContainer();
            
        } catch (error) {
            console.error('❌ Error mostrando resultados ANECA:', error);
            this.mostrarErrorAneca(error);
        }
    }

    // ✅ NUEVO: Crear navegación para matrices ANECA
    static crearNavegacionAneca() {
        const container = document.getElementById('results-container');
        if (!container) return;

        // Limpiar contenedor
        container.innerHTML = '';

        // Crear navegación
        container.innerHTML += `
            <div class="aneca-navigation">
                <h2>🏛️ SISTEMA DE EVALUACIÓN ANECA/AUDIT</h2>
                <div class="nav-tabs">
                    <button class="nav-tab active" data-tab="dashboard">📊 Dashboard</button>
                    <button class="nav-tab" data-tab="matriz1">🔗 Matriz 1: Comp-RA</button>
                    <button class="nav-tab" data-tab="matriz2">📚 Matriz 2: RA-Asig</button>
                    <button class="nav-tab" data-tab="matriz3">🔄 Matriz 3: Comp-Asig</button>
                    <button class="nav-tab" data-tab="matriz4">🎯 Matriz 4: Cont-RA</button>
                    <button class="nav-tab" data-tab="acreditacion">✅ Acreditación</button>
                </div>
            </div>
            
            <div class="aneca-content">
                <div id="aneca-dashboard" class="tab-content active"></div>
                <div id="aneca-matriz1" class="tab-content"></div>
                <div id="aneca-matriz2" class="tab-content"></div>
                <div id="aneca-matriz3" class="tab-content"></div>
                <div id="aneca-matriz4" class="tab-content"></div>
                <div id="aneca-acreditacion" class="tab-content"></div>
            </div>
        `;

        // Configurar eventos de navegación
        this.configurarNavegacionAneca();
    }

    // ✅ NUEVO: Configurar navegación entre pestañas
    static configurarNavegacionAneca() {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const targetTab = e.target.dataset.tab;
                
                // Actualizar pestañas activas
                document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                
                e.target.classList.add('active');
                document.getElementById(`aneca-${targetTab}`).classList.add('active');
            });
        });
    }

    // ✅ NUEVO: Mostrar dashboard principal ANECA
    static mostrarDashboardAneca(resultados) {
        const dashboardContainer = document.getElementById('aneca-dashboard');
        if (!dashboardContainer) return;

        const { matrices, indicadoresAcreditacion, metadata } = resultados;

        dashboardContainer.innerHTML = `
            <div class="aneca-dashboard">
                <!-- HEADER CON MÉTRICAS PRINCIPALES -->
                <div class="dashboard-header">
                    <div class="global-score">
                        <div class="score-circle ${this.getScoreClass(indicadoresAcreditacion?.cumplimientoGlobal?.puntuacion || 0)}">
                            <span class="score">${Math.round(indicadoresAcreditacion?.cumplimientoGlobal?.puntuacion || 0)}%</span>
                            <span class="label">Cumplimiento ANECA</span>
                        </div>
                    </div>
                    
                    <div class="metrics-grid">
                        <div class="metric-card">
                            <span class="metric-value">${metadata.totalCompetencias}</span>
                            <span class="metric-label">Competencias</span>
                        </div>
                        <div class="metric-card">
                            <span class="metric-value">${metadata.totalAsignaturas}</span>
                            <span class="metric-label">Asignaturas</span>
                        </div>
                        <div class="metric-card">
                            <span class="metric-value">${metadata.totalRA}</span>
                            <span class="metric-label">Resultados Aprendizaje</span>
                        </div>
                        <div class="metric-card">
                            <span class="metric-value">${matrices.contenidosRA?.matriz?.length || 0}</span>
                            <span class="metric-label">Contenidos Analizados</span>
                        </div>
                    </div>
                </div>

                <!-- ACCESO RÁPIDO A MATRICES -->
                <div class="quick-access">
                    <h3>📋 Acceso Rápido a Matrices</h3>
                    <div class="matrices-grid">
                        <div class="matrix-quick-card" onclick="ResultsDisplay.mostrarMatriz1()">
                            <div class="matrix-icon">🔗</div>
                            <h4>Matriz 1</h4>
                            <p>Competencias - RA</p>
                            <span class="matrix-stats">${matrices.competenciasRA?.competencias?.length || 0} competencias</span>
                        </div>
                        
                        <div class="matrix-quick-card" onclick="ResultsDisplay.mostrarMatriz2()">
                            <div class="matrix-icon">📚</div>
                            <h4>Matriz 2</h4>
                            <p>RA - Asignaturas</p>
                            <span class="matrix-stats">${matrices.RAsignaturas?.matriz?.length || 0} RAs</span>
                        </div>
                        
                        <div class="matrix-quick-card" onclick="ResultsDisplay.mostrarMatriz3()">
                            <div class="matrix-icon">🔄</div>
                            <h4>Matriz 3</h4>
                            <p>Competencias - Asignaturas</p>
                            <span class="matrix-stats">${matrices.competenciasAsignaturas?.matriz?.length || 0} asignaturas</span>
                        </div>
                        
                        <div class="matrix-quick-card" onclick="ResultsDisplay.mostrarMatriz4()">
                            <div class="matrix-icon">🎯</div>
                            <h4>Matriz 4</h4>
                            <p>Contenidos - RA</p>
                            <span class="matrix-stats">${matrices.contenidosRA?.matriz?.length || 0} contenidos</span>
                        </div>
                    </div>
                </div>

                <!-- INDICADORES CLAVE -->
                <div class="key-indicators">
                    <h3>✅ Indicadores Clave de Acreditación</h3>
                    ${this.renderIndicadoresClave(indicadoresAcreditacion?.indicadores)}
                </div>

                <!-- ALERTAS PRIORITARIAS -->
                <div class="priority-alerts">
                    <h3>⚠️ Alertas Prioritarias</h3>
                    ${this.renderAlertasPrioritarias(indicadoresAcreditacion)}
                </div>
            </div>
        `;
        this.actualizarPestanasInferiores(resultados);
        // Guardar datos para acceso rápido
        window.anecaResults = resultados;
    }

    static actualizarPestanasInferiores(resultados) {
        // 1. Pestaña Competencias
        const competenceContent = document.getElementById('competence-content');
        if (competenceContent && resultados.matrices?.competenciasRA) {
            competenceContent.innerHTML = this.generarTablaCompetencias(resultados.matrices.competenciasRA);
        }
        
        // 2. Pestaña Huecos
        const gapContent = document.getElementById('gap-content');
        if (gapContent && resultados.huecos) {
            gapContent.innerHTML = this.generarTablaHuecos(resultados.huecos);
        }
        
        // 3. Pestaña Matrices
        const matrixContent = document.getElementById('matrix-content');
        if (matrixContent) {
            matrixContent.innerHTML = `
                <div class="matrix-links">
                    <h4>Matrices ANECA Disponibles</h4>
                    <div class="matrix-link" onclick="ResultsDisplay.mostrarMatriz1()">
                        🔗 Matriz Competencias-RA
                    </div>
                    <div class="matrix-link" onclick="ResultsDisplay.mostrarMatriz2()">
                        📚 Matriz RA-Asignaturas
                    </div>
                    <div class="matrix-link" onclick="ResultsDisplay.mostrarMatriz3()">
                        🔄 Matriz Competencias-Asignaturas
                    </div>
                    <div class="matrix-link" onclick="ResultsDisplay.mostrarMatriz4()">
                        🎯 Matriz Contenidos-RA
                    </div>
                </div>
            `;
        }
    }

    static generarTablaCompetencias(competenciasRA) {
    if (!competenciasRA?.competencias) return '<p>No hay datos de competencias</p>';
    
    let html = '<table class="competence-table"><thead><tr><th>Competencia</th><th>RAs</th><th>Ámbito</th></tr></thead><tbody>';
    
    competenciasRA.competencias.forEach(comp => {
        html += `
            <tr>
                <td><strong>${comp.nombre}</strong></td>
                <td>${comp.RAs?.length || 0}</td>
                <td>${comp.ambito || 'No especificado'}</td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    return html;
}

    static generarTablaHuecos(huecos) {
        if (!huecos?.huecos?.length) return '<p>✅ No se detectaron huecos críticos</p>';
        
        let html = '<div class="gap-list">';
        
        huecos.huecos.forEach(hueco => {
            html += `
                <div class="gap-item ${hueco.prioridad}">
                    <div class="gap-header">
                        <strong>${hueco.tipo}</strong>
                        <span class="gap-priority">${hueco.prioridad}</span>
                    </div>
                    <div class="gap-description">${hueco.descripcion}</div>
                    ${hueco.recomendacion ? `<div class="gap-recommendation">📝 ${hueco.recomendacion}</div>` : ''}
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }
    
    // ✅ NUEVO: Preparar secciones para matrices individuales
    static prepararSeccionesMatrices(resultados) {
        // Las matrices se cargarán bajo demanda cuando el usuario haga clic
        console.log("✅ Secciones de matrices preparadas para carga bajo demanda");
    }

    // ✅ NUEVO: Métodos para mostrar matrices individuales
    static mostrarMatriz1() {
        this.cambiarPestana('matriz1');
        const container = document.getElementById('aneca-matriz1');
        
        if (window.anecaResults?.matrices?.competenciasRA && window.MatrixDisplay) {
            // Asegúrate de que MatrixDisplay tenga el método correcto
            if (MatrixDisplay.mostrarMatrizCompetenciasRA) {
                MatrixDisplay.mostrarMatrizCompetenciasRA(
                    window.anecaResults.matrices.competenciasRA, 
                    'aneca-matriz1'
                );
            } else {
                container.innerHTML = this.generarMatrizSimple(
                    window.anecaResults.matrices.competenciasRA,
                    'Matriz 1: Competencias - RA'
                );
            }
        } else {
            container.innerHTML = '<p>❌ No hay datos de matriz disponibles</p>';
        }
    }

    static generarMatrizSimple(datosMatriz, titulo) {
        if (!datosMatriz?.competencias) return '<p>No hay datos de matriz</p>';
        
        let html = `<h3>${titulo}</h3><div class="matrix-container">`;
        
        datosMatriz.competencias.forEach(competencia => {
            html += `
                <div class="matrix-row">
                    <div class="competence-cell"><strong>${competencia.nombre}</strong></div>
                    <div class="ra-cell">${competencia.RAs?.length || 0} RAs</div>
                </div>
            `;
        });
        
        html += '</div>';
        return html;
    }

    static mostrarMatriz2() {
        this.cambiarPestana('matriz2');
        const container = document.getElementById('aneca-matriz2');
        if (window.anecaResults && window.MatrixDisplay) {
            MatrixDisplay.mostrarMatrizRAsignaturas(window.anecaResults.matrices.RAsignaturas, 'aneca-matriz2');
        }
    }

    static mostrarMatriz3() {
        this.cambiarPestana('matriz3');
        const container = document.getElementById('aneca-matriz3');
        if (window.anecaResults && window.MatrixDisplay) {
            MatrixDisplay.mostrarMatrizCompetenciasAsignaturas(window.anecaResults.matrices.competenciasAsignaturas, 'aneca-matriz3');
        }
    }

    static mostrarMatriz4() {
        this.cambiarPestana('matriz4');
        const container = document.getElementById('aneca-matriz4');
        if (window.anecaResults && window.MatrixDisplay) {
            MatrixDisplay.mostrarMatrizContenidosRA(window.anecaResults.matrices.contenidosRA, 'aneca-matriz4');
        }
    }

    // ✅ NUEVO: Métodos auxiliares
    static cambiarPestana(tabName) {
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(`aneca-${tabName}`).classList.add('active');
    }

    static getScoreClass(score) {
        if (score >= 80) return 'score-high';
        if (score >= 60) return 'score-medium';
        return 'score-low';
    }

    static renderIndicadoresClave(indicadores) {
        if (!indicadores) return '<p>No hay datos de indicadores</p>';
        
        let html = '<div class="indicators-grid">';
        
        // Tomar solo los primeros indicadores de cada criterio para el dashboard
        Object.entries(indicadores).forEach(([criterio, datos]) => {
            const primerIndicador = Object.values(datos)[0];
            if (primerIndicador) {
                html += `
                    <div class="indicator-card ${primerIndicador.estado?.toLowerCase()}">
                        <div class="indicator-header">
                            <span class="criterio">${criterio}</span>
                            <span class="estado">${primerIndicador.estado || 'No evaluado'}</span>
                        </div>
                        <div class="indicador-nombre">${primerIndicador.indicador}</div>
                        <div class="indicador-puntuacion">
                            <span class="puntuacion">${Math.round(primerIndicador.puntuacion || 0)}%</span>
                            <div class="progress-bar">
                                <div class="progress" style="width: ${primerIndicador.puntuacion || 0}%"></div>
                            </div>
                        </div>
                    </div>
                `;
            }
        });
        
        html += '</div>';
        return html;
    }

    static renderAlertasPrioritarias(indicadoresAcreditacion) {
        const alertas = [];
        
        // Buscar indicadores con baja puntuación
        if (indicadoresAcreditacion?.indicadores) {
            Object.entries(indicadoresAcreditacion.indicadores).forEach(([criterio, datos]) => {
                Object.entries(datos).forEach(([codigo, indicador]) => {
                    if (indicador.puntuacion < 60) {
                        alertas.push({
                            codigo,
                            criterio,
                            indicador: indicador.indicador,
                            puntuacion: indicador.puntuacion,
                            recomendaciones: indicador.recomendaciones
                        });
                    }
                });
            });
        }
        
        if (alertas.length === 0) {
            return '<div class="no-alerts">✅ No hay alertas críticas</div>';
        }
        
        let html = '<div class="alerts-list">';
        alertas.slice(0, 5).forEach(alerta => {
            html += `
                <div class="alerta-item">
                    <div class="alerta-header">
                        <strong>${alerta.codigo}</strong>
                        <span class="alerta-puntuacion">${Math.round(alerta.puntuacion)}%</span>
                    </div>
                    <div class="alerta-texto">${alerta.indicador}</div>
                    <div class="alerta-criterio">Criterio: ${alerta.criterio}</div>
                </div>
            `;
        });
        html += '</div>';
        
        return html;
    }

    static mostrarErrorAneca(error) {
        const container = document.getElementById('results-container');
        if (container) {
            container.innerHTML = `
                <div class="error-container">
                    <h3>❌ Error en el análisis ANECA</h3>
                    <p>${error.message}</p>
                    <button onclick="ResultsDisplay.reintentarAnalisis()" class="retry-btn">
                        Reintentar Análisis
                    </button>
                </div>
            `;
        }
    }

    static reintentarAnalisis() {
        if (window.initializeGlobalAnalysis) {
            window.initializeGlobalAnalysis();
        }
    }

    static parseMarkdownSections(htmlText) {
        const sections = {};
        const sectionArray = htmlText.split('<h2>');
        
        if (sectionArray.length > 1) {
            sectionArray.shift(); // Kendu lehen elementu hutsa
            
            sectionArray.forEach(section => {
                const titleEndIndex = section.indexOf('</h2>');
                if (titleEndIndex === -1) return;
                
                const title = section.substring(0, titleEndIndex).trim();
                const content = section.substring(titleEndIndex + 5).trim();
                sections[title] = content;
            });
        }
        
        return sections;
    }

    static updateResultSections(sections) {
        const sectionMap = {
            "1. IE Berrikusiak": "result-ane-ie",
            "2. GJH Integrazioa": "result-ods", 
            "3. Ebaluazio Irizpideak": "result-criteria",
            "4. Eduki Blokeak": "result-contents",
            "5. Praktika Proposamenak": "result-practices",
            "6. Baliabideak": "result-partners"
        };

        // Garbitu aurreko emaitzak
        Object.values(sectionMap).forEach(id => {
            const element = document.getElementById(id);
            if (element) element.innerHTML = '';
        });

        // Betegi atal bakoitza
        Object.entries(sectionMap).forEach(([title, elementId]) => {
            const element = document.getElementById(elementId);
            if (element && sections[title]) {
                element.innerHTML = `<h2>${title}</h2>${sections[title]}`;
            }
        });
    }

    static showResultsContainer() {
        const container = document.getElementById('results-container');
        if (container) {
            container.classList.remove('hidden');
            container.scrollIntoView({ behavior: 'smooth' });
        }
    }

    static simpleMarkdownToHTML(text) {
        if (!text) return "";
        return text
            .replace(/## (.*)/g, '<h2>$1</h2>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^- (.*)/gm, '<ul><li>$1</li></ul>')
            .replace(/- (.*)/gm, '<ul><li>$1</li></ul>')
            .replace(/<\/ul>\s*<ul>/g, '')
            .replace(/\n/g, '<br>');
    }

}
window.ResultsDisplay = ResultsDisplay;

