class MatrixDisplay {
    static mostrarMatrizCompetenciasRA(matriz, containerId = 'results-container') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const html = `
            <div class="aneca-matrix">
                <h3>🏛️ MATRIZ ANECA 1: Competencias - Resultados de Aprendizaje</h3>
                <div class="compliance-badge ${matriz.metricas.claridadCompetencias > 0.7 ? 'compliant' : 'non-compliant'}">
                    Cumplimiento: ${(matriz.metricas.claridadCompetencias * 100).toFixed(1)}%
                </div>
                
                <div class="matrix-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Competencia</th>
                                <th>RAs Asociados</th>
                                <th>Nivel Bloom</th>
                                <th>Evidencias</th>
                                <th>Instrumentos Evaluación</th>
                                <th>Estado ANECA</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${matriz.competencias.map(comp => `
                                <tr>
                                    <td class="competence-cell">
                                        <strong>${comp.competencia.codigo || comp.competencia}</strong>
                                        <br><small>${comp.competencia.descripcion?.substring(0, 100) || ''}</small>
                                    </td>
                                    <td>
                                        ${comp.RAs.slice(0, 3).map(ra => 
                                            `<div class="ra-item">• ${ra.descripcion?.substring(0, 80) || ra.substring(0, 80)}...</div>`
                                        ).join('')}
                                        ${comp.RAs.length > 3 ? `<em>+ ${comp.RAs.length - 3} más</em>` : ''}
                                    </td>
                                    <td><span class="bloom-level ${comp.nivel}">${comp.nivel}</span></td>
                                    <td>${comp.evidencias.slice(0, 2).join(', ')}</td>
                                    <td>${comp.instrumentosEvaluacion.slice(0, 2).join(', ')}</td>
                                    <td>
                                        <span class="status ${comp.RAs.length >= 2 ? 'compliant' : 'non-compliant'}">
                                            ${comp.RAs.length >= 2 ? '✅' : '❌'} ${comp.RAs.length} RA(s)
                                        </span>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
                
                ${matriz.alertas.length > 0 ? `
                    <div class="alertas-section">
                        <h4>⚠️ Alertas de Cumplimiento ANECA</h4>
                        ${matriz.alertas.map(alerta => `
                            <div class="alerta ${alerta.gravedad.toLowerCase()}">
                                <strong>${alerta.tipo}</strong>: ${alerta.mensaje}
                                <div class="accion">${alerta.accion}</div>
                            </div>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        container.innerHTML += html;
    }
    
    static mostrarMatrizRAsignaturas(matriz, containerId = 'results-container') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const html = `
            <div class="aneca-matrix">
                <h3>📚 MATRIZ ANECA 2: Resultados Aprendizaje - Asignaturas</h3>
                <div class="compliance-badge ${matriz.cumplimientoANECA > 80 ? 'compliant' : 'non-compliant'}">
                    Cobertura: ${matriz.cumplimientoANECA.toFixed(1)}%
                </div>
                
                <div class="coverage-stats">
                    <div class="stat">
                        <span class="number">${matriz.metricas.porcentajeCoberturaMinima.toFixed(1)}%</span>
                        <span class="label">RA con cobertura mínima</span>
                    </div>
                    <div class="stat">
                        <span class="number">${matriz.metricas.porcentajeConProfundizacion.toFixed(1)}%</span>
                        <span class="label">RA con nivel de dominio</span>
                    </div>
                    <div class="stat">
                        <span class="number">${matriz.metricas.huecosCurriculares}</span>
                        <span class="label">Huecos curriculares</span>
                    </div>
                </div>
                
                <div class="matrix-table compact">
                    <table>
                        <thead>
                            <tr>
                                <th>Resultado de Aprendizaje</th>
                                <th>Asignaturas (I/D/Dp)</th>
                                <th>Cumple Mínimo</th>
                                <th>Tiene Profundización</th>
                                <th>Alertas</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${matriz.matriz.slice(0, 10).map(ra => `
                                <tr>
                                    <td class="ra-cell">
                                        <div class="ra-text">${ra.resultadoAprendizaje.substring(0, 120)}...</div>
                                    </td>
                                    <td>
                                        ${ra.asignaturas.slice(0, 3).map(asig => `
                                            <div class="asignatura-item ${asig.nivelContribucion}">
                                                ${asig.asignatura} 
                                                <span class="nivel">(${asig.nivelContribucion})</span>
                                            </div>
                                        `).join('')}
                                        ${ra.asignaturas.length > 3 ? `<em>+ ${ra.asignaturas.length - 3} más</em>` : ''}
                                    </td>
                                    <td>
                                        <span class="status ${ra.cumpleMinimoANECA ? 'compliant' : 'non-compliant'}">
                                            ${ra.cumpleMinimoANECA ? '✅' : '❌'}
                                        </span>
                                    </td>
                                    <td>
                                        <span class="status ${ra.tieneProfundizacion ? 'compliant' : 'non-compliant'}">
                                            ${ra.tieneProfundizacion ? '✅' : '❌'}
                                        </span>
                                    </td>
                                    <td>
                                        ${ra.alertas.length > 0 ? 
                                            `<span class="alerta-indicator" title="${ra.alertas[0]}">⚠️</span>` : 
                                            '<span class="ok-indicator">✅</span>'
                                        }
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    ${matriz.matriz.length > 10 ? 
                        `<div class="more-items">... y ${matriz.matriz.length - 10} resultados de aprendizaje más</div>` : 
                        ''
                    }
                </div>
            </div>
        `;
        
        container.innerHTML += html;
    }
    
    static mostrarDashboardANECA(dashboardData, containerId = 'results-container') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div class="aneca-dashboard">
                <header class="dashboard-header">
                    <h2>🏛️ DASHBOARD ANECA - ANÁLISIS COMPLETO</h2>
                    <div class="global-score ${dashboardData.validacionANECA.puntuacionGlobal > 80 ? 'compliant' : 'non-compliant'}">
                        Puntuación Global: ${dashboardData.validacionANECA.puntuacionGlobal}/100
                    </div>
                </header>
                
                <!-- Resumen Ejecutivo -->
                <section class="executive-summary">
                    <h3>📊 Resumen Ejecutivo</h3>
                    <div class="summary-grid">
                        <div class="summary-card">
                            <h4>Ámbitos Profesionales</h4>
                            <div class="ambitos-list">
                                ${Object.entries(dashboardData.ambitosProfesionales)
                                    .filter(([_, datos]) => datos.RAs.length > 0)
                                    .map(([ambito, datos]) => `
                                    <div class="ambito-item">
                                        <strong>${this.formatAmbitoName(ambito)}</strong>
                                        <span>${datos.RAs.length} RAs • ${datos.asignaturas.length} asignaturas</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        
                        <div class="summary-card">
                            <h4>Progresión Competencial</h4>
                            <div class="progression-chart">
                                ${this.generarChartProgresion(dashboardData.progresionCompetencial)}
                            </div>
                        </div>
                    </div>
                </section>
                
                <!-- Matrices ANECA -->
                <section class="matrices-section">
                    <h3>📋 Matrices de Coherencia ANECA</h3>
                    <div class="matrices-grid">
                        <div class="matrix-card" onclick="MatrixDisplay.mostrarMatrizCompetenciasRA(dashboardData.matrices.competenciasRA)">
                            <h4>Competencias - RA</h4>
                            <div class="matrix-stats">
                                <span class="stat">${dashboardData.matrices.competenciasRA.competencias.length} competencias</span>
                                <span class="compliance ${dashboardData.matrices.competenciasRA.metricas.claridadCompetencias > 0.7 ? 'good' : 'bad'}">
                                    ${(dashboardData.matrices.competenciasRA.metricas.claridadCompetencias * 100).toFixed(1)}%
                                </span>
                            </div>
                        </div>
                        
                        <div class="matrix-card" onclick="MatrixDisplay.mostrarMatrizRAsignaturas(dashboardData.matrices.RAsignaturas)">
                            <h4>RA - Asignaturas</h4>
                            <div class="matrix-stats">
                                <span class="stat">${dashboardData.matrices.RAsignaturas.matriz.length} RAs</span>
                                <span class="compliance ${dashboardData.matrices.RAsignaturas.cumplimientoANECA > 80 ? 'good' : 'bad'}">
                                    ${dashboardData.matrices.RAsignaturas.cumplimientoANECA.toFixed(1)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </section>
                
                <!-- Checklist ANECA -->
                <section class="checklist-section">
                    <h3>✅ Checklist ANECA</h3>
                    <div class="checklist">
                        ${dashboardData.validacionANECA.informeANECA.checklistANECA.map(item => `
                            <div class="checklist-item ${item.cumplido ? 'checked' : 'unchecked'}">
                                <span class="check-icon">${item.cumplido ? '✅' : '❌'}</span>
                                <div class="check-content">
                                    <strong>${item.item}</strong>
                                    <div class="check-details">
                                        <span class="evidence">${item.evidencia}</span>
                                        <span class="observations">${item.observaciones}</span>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </section>
            </div>
        `;
    }
    
    static formatAmbitoName(ambito) {
        const names = {
            disenoGrafico: 'Diseño Gráfico',
            disenoProducto: 'Diseño de Producto', 
            disenoInteriores: 'Diseño de Interiores',
            disenoDigital: 'Diseño Digital',
            gestionDiseno: 'Gestión del Diseño'
        };
        return names[ambito] || ambito;
    }
    
    static generarChartProgresion(progresion) {
        // Simulación de chart simple con texto
        return `
            <div class="progression-bars">
                ${Object.entries(progresion).map(([curso, competencias]) => `
                    <div class="progression-bar">
                        <label>Curso ${curso}</label>
                        <div class="bar">
                            <div class="fill" style="width: ${Object.keys(competencias).length * 10}%"></div>
                        </div>
                        <span>${Object.keys(competencias).length} competencias</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

}
