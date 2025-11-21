export class MatrixDisplay {
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

    // === ✅ NUEVOS MÉTODOS PARA LAS 4 MATRICES ANECA ===

    // ✅ MATRIZ 3: Competencias - Asignaturas (Coherencia Horizontal)
    static mostrarMatrizCompetenciasAsignaturas(matriz, containerId = 'results-container') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const html = `
            <div class="aneca-matrix">
                <h3>🔄 MATRIZ ANECA 3: Competencias - Asignaturas (Coherencia Horizontal)</h3>
                <div class="compliance-badge ${matriz.cumplimientoANECA?.puntuacion > 70 ? 'compliant' : 'non-compliant'}">
                    Equilibrio: ${(matriz.cumplimientoANECA?.puntuacion || 0).toFixed(1)}%
                </div>
                
                <div class="matrix-stats-horizontal">
                    <div class="stat">
                        <span class="number">${matriz.metricasANECA?.totalAsignaturas || 0}</span>
                        <span class="label">Asignaturas analizadas</span>
                    </div>
                    <div class="stat">
                        <span class="number">${matriz.metricasANECA?.asignaturasSobrecargadas || 0}</span>
                        <span class="label">Sobrecargadas</span>
                    </div>
                    <div class="stat">
                        <span class="number">${matriz.metricasANECA?.asignaturasSubcargadas || 0}</span>
                        <span class="label">Subcargadas</span>
                    </div>
                </div>
                
                <div class="matrix-table compact">
                    <table>
                        <thead>
                            <tr>
                                <th>Asignatura</th>
                                <th>Curso</th>
                                <th>Créditos</th>
                                <th>Competencias</th>
                                <th>Equilibrio</th>
                                <th>Observaciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${matriz.matriz.slice(0, 15).map(asignatura => `
                                <tr>
                                    <td class="asignatura-cell">
                                        <strong>${asignatura.asignatura}</strong>
                                        ${asignatura.codigo ? `<br><small>${asignatura.codigo}</small>` : ''}
                                    </td>
                                    <td>${asignatura.curso || '-'}</td>
                                    <td>${asignatura.creditos || '0'}</td>
                                    <td>
                                        <div class="competencias-list">
                                            ${asignatura.competencias.slice(0, 3).map(comp => `
                                                <span class="competencia-tag ${comp.nivel?.toLowerCase()}" 
                                                      title="${comp.codigo}: ${comp.nivel}">
                                                    ${comp.codigo || comp.competencia}
                                                </span>
                                            `).join('')}
                                            ${asignatura.competencias.length > 3 ? 
                                                `<span class="more-tag">+${asignatura.competencias.length - 3}</span>` : 
                                                ''
                                            }
                                        </div>
                                    </td>
                                    <td>
                                        <span class="equilibrium ${this.getEquilibriumClass(asignatura.analisisANECA?.equilibrioAdecuado)}">
                                            ${asignatura.analisisANECA?.equilibrioAdecuado ? '✅' : '⚠️'}
                                        </span>
                                    </td>
                                    <td class="observations-cell">
                                        <small>${asignatura.observaciones || 'Sin observaciones'}</small>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    ${matriz.matriz.length > 15 ? 
                        `<div class="more-items">... y ${matriz.matriz.length - 15} asignaturas más</div>` : 
                        ''
                    }
                </div>
                
                <!-- Análisis de desequilibrios -->
                ${matriz.desequilibrios && matriz.desequilibrios.length > 0 ? `
                    <div class="desequilibrios-section">
                        <h4>⚖️ Análisis de Desequilibrios</h4>
                        <div class="desequilibrios-grid">
                            ${matriz.desequilibrios.map(des => `
                                <div class="desequilibrio-item ${des.tipo.toLowerCase()}">
                                    <strong>${des.competencia}</strong>
                                    <div class="des-details">
                                        <span>${des.tipo}: ${des.creditos} créditos</span>
                                        <small>${des.asignaturas.slice(0, 3).join(', ')}</small>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        container.innerHTML += html;
    }

    // ✅ MATRIZ 4: Contenidos - RA (Alineación)
    static mostrarMatrizContenidosRA(matriz, containerId = 'results-container') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const html = `
            <div class="aneca-matrix">
                <h3>🎯 MATRIZ ANECA 4: Contenidos - Resultados de Aprendizaje</h3>
                <div class="compliance-badge ${matriz.analisisGlobalANECA?.puntuacionGlobal > 75 ? 'compliant' : 'non-compliant'}">
                    Alineación: ${(matriz.analisisGlobalANECA?.puntuacionGlobal || 0).toFixed(1)}%
                </div>
                
                <div class="alignment-stats">
                    <div class="stat">
                        <span class="number">${matriz.metricasAdecuacion?.porcentajeAdecuacion.toFixed(1) || 0}%</span>
                        <span class="label">Contenidos alineados</span>
                    </div>
                    <div class="stat">
                        <span class="number">${matriz.metricasAdecuacion?.contenidosDesalineados || 0}</span>
                        <span class="label">Contenidos desalineados</span>
                    </div>
                    <div class="stat">
                        <span class="number">${matriz.metricasAdecuacion?.relacionPromedio?.toFixed(2) || 0}</span>
                        <span class="label">Fuerza relación promedio</span>
                    </div>
                </div>
                
                <div class="matrix-table compact">
                    <table>
                        <thead>
                            <tr>
                                <th>Asignatura</th>
                                <th>Contenido</th>
                                <th>RAs Relacionados</th>
                                <th>Nivel Contribución</th>
                                <th>Adecuación</th>
                                <th>Sugerencias</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${matriz.matriz.slice(0, 12).map(item => `
                                <tr>
                                    <td class="asignatura-cell">
                                        <strong>${item.asignatura}</strong>
                                    </td>
                                    <td class="contenido-cell">
                                        <div class="contenido-text">${item.contenido.substring(0, 100)}...</div>
                                    </td>
                                    <td>
                                        <div class="ras-list">
                                            ${item.RAsRelacionados.slice(0, 2).map(ra => `
                                                <div class="ra-item-small" title="${ra.ra}">
                                                    • ${ra.ra.substring(0, 60)}...
                                                    <span class="fuerza">${(ra.fuerzaRelacion * 100).toFixed(0)}%</span>
                                                </div>
                                            `).join('')}
                                            ${item.RAsRelacionados.length > 2 ? 
                                                `<em>+ ${item.RAsRelacionados.length - 2} más</em>` : 
                                                ''
                                            }
                                        </div>
                                    </td>
                                    <td>
                                        <span class="nivel-contribucion ${item.nivelContribucion?.toLowerCase()}">
                                            ${item.nivelContribucion}
                                        </span>
                                    </td>
                                    <td>
                                        <span class="adecuacion ${item.adecuacion.adecuado ? 'adequate' : 'inadequate'}">
                                            ${item.adecuacion.adecuado ? '✅' : '❌'}
                                            <small>${item.adecuacion.severidad}</small>
                                        </span>
                                    </td>
                                    <td class="sugerencias-cell">
                                        <small>${item.sugerencias.slice(0, 1).join(' ')}</small>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    ${matriz.matriz.length > 12 ? 
                        `<div class="more-items">... y ${matriz.matriz.length - 12} contenidos más</div>` : 
                        ''
                    }
                </div>
                
                <!-- Contenidos desalineados -->
                ${matriz.contenidosDesalineados && matriz.contenidosDesalineados.length > 0 ? `
                    <div class="desalineados-section">
                        <h4>🚨 Contenidos Críticos Desalineados</h4>
                        <div class="desalineados-list">
                            ${matriz.contenidosDesalineados.slice(0, 5).map(contenido => `
                                <div class="desalineado-item">
                                    <strong>${contenido.asignatura}</strong>
                                    <div class="contenido-problema">${contenido.contenido.substring(0, 120)}...</div>
                                    <div class="problema-details">
                                        <span class="problema">${contenido.problema}</span>
                                        <small class="sugerencia">${contenido.sugerencias.slice(0, 1)}</small>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                ` : ''}
            </div>
        `;
        
        container.innerHTML += html;
    }

    // ✅ NUEVO: DASHBOARD COMPLETO CON LAS 4 MATRICES
    static mostrarDashboardCompletoANECA(resultadosCompletos, containerId = 'results-container') {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        const { matrices, indicadoresAcreditacion, metadata } = resultadosCompletos;
        
        container.innerHTML = `
            <div class="aneca-dashboard-completo">
                <header class="dashboard-header">
                    <h2>🏛️ DASHBOARD ANECA COMPLETO - 4 MATRICES</h2>
                    <div class="global-score ${indicadoresAcreditacion?.cumplimientoGlobal?.puntuacion > 80 ? 'compliant' : 'non-compliant'}">
                        Cumplimiento Global: ${Math.round(indicadoresAcreditacion?.cumplimientoGlobal?.puntuacion || 0)}%
                    </div>
                </header>
                
                <!-- Resumen Ejecutivo Mejorado -->
                <section class="executive-summary-enhanced">
                    <h3>📊 Resumen Ejecutivo ANECA</h3>
                    <div class="summary-grid-enhanced">
                        <div class="summary-card">
                            <h4>📈 Métricas Clave</h4>
                            <div class="metrics-enhanced">
                                <div class="metric-item">
                                    <span class="metric-value">${metadata.totalCompetencias}</span>
                                    <span class="metric-label">Competencias</span>
                                </div>
                                <div class="metric-item">
                                    <span class="metric-value">${metadata.totalAsignaturas}</span>
                                    <span class="metric-label">Asignaturas</span>
                                </div>
                                <div class="metric-item">
                                    <span class="metric-value">${metadata.totalRA}</span>
                                    <span class="metric-label">Resultados Aprendizaje</span>
                                </div>
                                <div class="metric-item">
                                    <span class="metric-value">${matrices.contenidosRA?.matriz?.length || 0}</span>
                                    <span class="metric-label">Contenidos Analizados</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="summary-card">
                            <h4>🎯 Cumplimiento por Criterio</h4>
                            <div class="compliance-breakdown">
                                ${indicadoresAcreditacion?.resumenEjecutivo ? 
                                    this.renderComplianceBreakdown(indicadoresAcreditacion.resumenEjecutivo) : 
                                    '<p>No hay datos de cumplimiento</p>'
                                }
                            </div>
                        </div>
                    </div>
                </section>
                
                <!-- Navegación Rápida a Matrices -->
                <section class="matrices-quick-nav">
                    <h3>📋 Navegación Rápida a Matrices</h3>
                    <div class="matrices-nav-grid">
                        <div class="matrix-nav-card" onclick="MatrixDisplay.mostrarMatrizCompetenciasRA(matrices.competenciasRA)">
                            <div class="nav-icon">🔗</div>
                            <h5>Matriz 1</h5>
                            <p>Competencias - RA</p>
                            <span class="nav-stats">${matrices.competenciasRA?.competencias?.length || 0} competencias</span>
                        </div>
                        
                        <div class="matrix-nav-card" onclick="MatrixDisplay.mostrarMatrizRAsignaturas(matrices.RAsignaturas)">
                            <div class="nav-icon">📚</div>
                            <h5>Matriz 2</h5>
                            <p>RA - Asignaturas</p>
                            <span class="nav-stats">${matrices.RAsignaturas?.matriz?.length || 0} RAs</span>
                        </div>
                        
                        <div class="matrix-nav-card" onclick="MatrixDisplay.mostrarMatrizCompetenciasAsignaturas(matrices.competenciasAsignaturas)">
                            <div class="nav-icon">🔄</div>
                            <h5>Matriz 3</h5>
                            <p>Competencias - Asignaturas</p>
                            <span class="nav-stats">${matrices.competenciasAsignaturas?.matriz?.length || 0} asignaturas</span>
                        </div>
                        
                        <div class="matrix-nav-card" onclick="MatrixDisplay.mostrarMatrizContenidosRA(matrices.contenidosRA)">
                            <div class="nav-icon">🎯</div>
                            <h5>Matriz 4</h5>
                            <p>Contenidos - RA</p>
                            <span class="nav-stats">${matrices.contenidosRA?.matriz?.length || 0} contenidos</span>
                        </div>
                    </div>
                </section>
                
                <!-- Indicadores de Acreditación -->
                <section class="accreditation-indicators">
                    <h3>✅ Indicadores Clave ANECA</h3>
                    ${indicadoresAcreditacion ? 
                        this.renderAccreditationIndicators(indicadoresAcreditacion.indicadores) : 
                        '<p>No hay datos de indicadores</p>'
                    }
                </section>
            </div>
        `;
    }

    // === ✅ MÉTODOS AUXILIARES NUEVOS ===
    
    static getEquilibriumClass(equilibrioAdecuado) {
        return equilibrioAdecuado ? 'balanced' : 'unbalanced';
    }

    static renderComplianceBreakdown(resumenEjecutivo) {
        if (!resumenEjecutivo.fortalezasPrincipales || !resumenEjecutivo.debilidadesCriticas) {
            return '<p>Datos de cumplimiento no disponibles</p>';
        }
        
        return `
            <div class="compliance-details">
                <div class="fortalezas">
                    <h6>Fortalezas:</h6>
                    <ul>
                        ${resumenEjecutivo.fortalezasPrincipales.slice(0, 3).map(f => `<li>${f}</li>`).join('')}
                    </ul>
                </div>
                <div class="debilidades">
                    <h6>Áreas de Mejora:</h6>
                    <ul>
                        ${resumenEjecutivo.debilidadesCriticas.slice(0, 3).map(d => `<li>${d}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    static renderAccreditationIndicators(indicadores) {
        if (!indicadores) return '<p>No hay indicadores disponibles</p>';
        
        let html = '<div class="indicators-grid-complete">';
        
        Object.entries(indicadores).forEach(([criterio, datosCriterio]) => {
            html += `<div class="criterion-group">`;
            html += `<h4 class="criterion-title">Criterio ${criterio}</h4>`;
            
            Object.entries(datosCriterio).forEach(([codigo, indicador]) => {
                html += `
                    <div class="indicator-item-complete ${indicador.estado?.toLowerCase().replace('_', '-') || 'no-evaluado'}">
                        <div class="indicator-header">
                            <span class="indicator-code">${codigo}</span>
                            <span class="indicator-status-badge">${indicador.estado || 'No evaluado'}</span>
                        </div>
                        <div class="indicator-name">${indicador.indicador}</div>
                        <div class="indicator-progress">
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${indicador.puntuacion || 0}%"></div>
                            </div>
                            <span class="progress-text">${Math.round(indicador.puntuacion || 0)}%</span>
                        </div>
                        ${indicador.recomendaciones ? `
                            <div class="indicator-recommendations">
                                <small>${Array.isArray(indicador.recomendaciones) ? 
                                    indicador.recomendaciones[0] : indicador.recomendaciones}</small>
                            </div>
                        ` : ''}
                    </div>
                `;
            });
            
            html += `</div>`;
        });
        
        html += '</div>';
        return html;
    }
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


