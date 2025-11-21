export class ContentAlignment {
    static generarMatrizContenidosRA(curriculumData) {
        const matriz = [];
        const alertasANECA = [];
        
        curriculumData.asignaturas?.forEach(asignatura => {
            asignatura.contenidos?.forEach(contenido => {
                const RAsRelacionados = this.identificarRAsPorContenido(contenido, asignatura, curriculumData);
                
                // ✅ MEJORA: Añadir análisis ANECA detallado
                const analisisANECA = this.analizarAlineacionANECA(contenido, RAsRelacionados, asignatura);
                
                const entradaMatriz = {
                    asignatura: asignatura.nombre,
                    codigoAsignatura: asignatura.codigo,
                    curso: asignatura.curso,
                    contenido: contenido,
                    RAsRelacionados: RAsRelacionados,
                    nivelContribucion: this.determinarNivelContenido(contenido, RAsRelacionados),
                    adecuacion: this.evaluarAdecuacionContenido(contenido, RAsRelacionados),
                    sugerencias: this.generarSugerenciasContenido(contenido, RAsRelacionados),
                    // ✅ NUEVOS CAMPOS ANECA:
                    analisisANECA: analisisANECA,
                    tipoContenido: this.determinarTipoContenidoANECA(contenido),
                    nivelBloom: this.determinarNivelBloomContenido(contenido),
                    evidenciasANECA: this.generarEvidenciasANECA(contenido, RAsRelacionados),
                    instrumentosEvaluacion: this.mapearInstrumentosEvaluacion(contenido)
                };
                
                matriz.push(entradaMatriz);
                
                // ✅ NUEVO: Alertas ANECA específicas
                if (analisisANECA.estado === 'NO_ALINEADO') {
                    alertasANECA.push({
                        tipo: 'CONTENIDO_NO_ALINEADO',
                        asignatura: asignatura.nombre,
                        contenido: contenido.substring(0, 80) + '...',
                        problema: 'Contenido sin relación clara con resultados de aprendizaje',
                        criterioANECA: 'Los contenidos deben soportar el logro de los RA',
                        accion: 'Revisar pertinencia o reformular contenido'
                    });
                }
                
                if (analisisANECA.fuerzaRelacion < 0.3 && RAsRelacionados.length > 0) {
                    alertasANECA.push({
                        tipo: 'RELACION_DEBIL',
                        asignatura: asignatura.nombre,
                        contenido: contenido.substring(0, 80) + '...',
                        problema: `Relación débil con RA (${(analisisANECA.fuerzaRelacion * 100).toFixed(1)}%)`,
                        criterioANECA: 'Alineación sólida entre contenidos y RA',
                        accion: 'Reforzar conexión mediante actividades específicas'
                    });
                }
            });
        });
        
        return {
            matriz,
            metricasAdecuacion: this.calcularMetricasAdecuacion(matriz),
            contenidosDesalineados: this.identificarContenidosDesalineados(matriz),
            // ✅ NUEVO: Análisis ANECA global
            analisisGlobalANECA: this.generarAnalisisGlobalANECA(matriz),
            alertasANECA: alertasANECA,
            cumplimientoANECA: this.evaluarCumplimientoANECA(matriz)
        };
    }
    
    static identificarRAsPorContenido(contenido, asignatura, curriculumData) {
        const RAs = [];
        const textoContenido = contenido.toLowerCase();
        
        curriculumData.resultadosAprendizaje?.forEach(ra => {
            const textoRA = ra.descripcion?.toLowerCase() || ra.toLowerCase();
            
            if (this.hayCoincidenciaSemantica(textoContenido, textoRA)) {
                RAs.push({
                    ra: ra.descripcion || ra,
                    codigoRA: ra.codigo || `RA${ra.id}`,
                    fuerzaRelacion: this.calcularFuerzaRelacion(textoContenido, textoRA),
                    // ✅ MEJORA: Añadir información ANECA
                    nivelContribucion: this.determinarNivelContribucionRA(textoContenido, textoRA),
                    verbosAccion: this.extraerVerbosAccion(textoRA),
                    evidencias: this.identificarEvidenciasRelacion(contenido, ra),
                    criteriosEvaluacion: this.extraerCriteriosEvaluacion(ra)
                });
            }
        });
        
        return RAs.sort((a, b) => b.fuerzaRelacion - a.fuerzaRelacion);
    }
    
    static hayCoincidenciaSemantica(textoContenido, textoRA) {
        const palabrasClaveContenido = this.extraerPalabrasClave(textoContenido);
        const palabrasClaveRA = this.extraerPalabrasClave(textoRA);
        
        // ✅ MEJORA: Coincidencia más inteligente con verbos de acción
        const verbosComunes = this.extraerVerbosComunes(textoContenido, textoRA);
        if (verbosComunes.length > 0) {
            return true;
        }
        
        // Coincidencia por palabras clave significativas
        const coincidencias = palabrasClaveContenido.filter(palabra => 
            palabrasClaveRA.includes(palabra)
        );
        
        return coincidencias.length >= 2; // Mínimo 2 coincidencias
    }
    
    static extraerPalabrasClave(texto) {
        const stopWords = ['de', 'la', 'el', 'y', 'en', 'a', 'los', 'las', 'del', 'se', 'con', 'por', 'para', 'su'];
        const palabras = texto.split(/\s+/)
            .filter(palabra => palabra.length > 3 && !stopWords.includes(palabra))
            .map(palabra => palabra.replace(/[.,;:!?]/g, ''));
            
        return [...new Set(palabras)]; // Eliminar duplicados
    }
    
    static calcularFuerzaRelacion(textoContenido, textoRA) {
        const palabrasContenido = this.extraerPalabrasClave(textoContenido);
        const palabrasRA = this.extraerPalabrasClave(textoRA);
        
        const coincidencias = palabrasContenido.filter(palabra => 
            palabrasRA.includes(palabra)
        );
        
        // ✅ MEJORA: Considerar verbos de acción en el cálculo
        const verbosComunes = this.extraerVerbosComunes(textoContenido, textoRA);
        const bonusVerbos = verbosComunes.length * 0.2;
        
        return Math.min(1, (coincidencias.length / Math.max(palabrasContenido.length, palabrasRA.length)) + bonusVerbos);
    }
    
    static determinarNivelContenido(contenido, RAsRelacionados) {
        if (RAsRelacionados.length === 0) return 'SIN_RELACION';
        
        const fuerzaPromedio = RAsRelacionados.reduce((sum, ra) => sum + ra.fuerzaRelacion, 0) / RAsRelacionados.length;
        
        // ✅ MEJORA: Alinear con niveles ANECA I/D/Dp
        if (fuerzaPromedio > 0.7) return 'Dp'; // Domina/Profundiza
        if (fuerzaPromedio > 0.4) return 'D';  // Desarrolla
        return 'I'; // Introduce
    }
    
    static evaluarAdecuacionContenido(contenido, RAsRelacionados) {
        if (RAsRelacionados.length === 0) {
            return {
                adecuado: false,
                motivo: 'Contenido no relacionado con ningún Resultado de Aprendizaje',
                severidad: 'ALTA',
                // ✅ NUEVO: Criterio ANECA
                criterioANECA: 'Todos los contenidos deben contribuir al logro de RA'
            };
        }
        
        const fuerzaMaxima = Math.max(...RAsRelacionados.map(ra => ra.fuerzaRelacion));
        
        if (fuerzaMaxima < 0.3) {
            return {
                adecuado: false,
                motivo: 'Relación débil con los Resultados de Aprendizaje',
                severidad: 'MEDIA',
                // ✅ NUEVO: Criterio ANECA
                criterioANECA: 'Alineación sólida entre contenidos y RA'
            };
        }
        
        return {
            adecuado: true,
            motivo: 'Contenido alineado con los Resultados de Aprendizaje',
            severidad: 'NINGUNA',
            // ✅ NUEVO: Criterio ANECA
            criterioANECA: 'Cumple con estándares de alineación curricular'
        };
    }
    
    static generarSugerenciasContenido(contenido, RAsRelacionados) {
        const sugerencias = [];
        
        if (RAsRelacionados.length === 0) {
            sugerencias.push('Revisar la pertinencia de este contenido en el curriculum');
            sugerencias.push('Considerar eliminar o reformular para alinear con RAs existentes');
            // ✅ NUEVO: Sugerencia ANECA
            sugerencias.push('Documentar justificación pedagógica del contenido');
        } else if (RAsRelacionados[0].fuerzaRelacion < 0.5) {
            sugerencias.push('Reforzar la conexión entre contenido y RAs mediante actividades específicas');
            sugerencias.push('Reformular el contenido para usar terminología similar a los RAs');
            // ✅ NUEVO: Sugerencia ANECA
            sugerencias.push('Incluir evidencias de aprendizaje más específicas');
        }
        
        return sugerencias;
    }
    
    static calcularMetricasAdecuacion(matriz) {
        const totalContenidos = matriz.length;
        const contenidosAdecuados = matriz.filter(item => item.adecuacion.adecuado).length;
        const contenidosSinRelacion = matriz.filter(item => item.nivelContribucion === 'SIN_RELACION').length;
        
        // ✅ MEJORA: Añadir métricas ANECA
        const contenidosConAltaAlineacion = matriz.filter(item => 
            item.analisisANECA?.fuerzaRelacion > 0.7
        ).length;
        
        return {
            porcentajeAdecuacion: (contenidosAdecuados / totalContenidos) * 100,
            contenidosDesalineados: contenidosSinRelacion,
            relacionPromedio: matriz.reduce((sum, item) => {
                const fuerzaPromedio = item.RAsRelacionados.length > 0 ? 
                    item.RAsRelacionados.reduce((s, ra) => s + ra.fuerzaRelacion, 0) / item.RAsRelacionados.length : 0;
                return sum + fuerzaPromedio;
            }, 0) / totalContenidos,
            // ✅ NUEVAS MÉTRICAS ANECA:
            porcentajeAltaAlineacion: (contenidosConAltaAlineacion / totalContenidos) * 100,
            distribucionNiveles: this.calcularDistribucionNiveles(matriz),
            coberturaRA: this.calcularCoberturaRA(matriz)
        };
    }
    
    static identificarContenidosDesalineados(matriz) {
        return matriz.filter(item => 
            !item.adecuacion.adecuado || 
            item.nivelContribucion === 'SIN_RELACION' ||
            item.RAsRelacionados.length === 0
        ).map(item => ({
            asignatura: item.asignatura,
            contenido: item.contenido,
            problema: item.adecuacion.motivo,
            sugerencias: item.sugerencias
        }));
    }
    
    static identificarEvidenciasRelacion(contenido, ra) {
        // Simular identificación de evidencias basada en palabras clave
        const evidencias = [];
        const textoCombinado = (contenido + ' ' + ra.descripcion).toLowerCase();
        
        if (textoCombinado.includes('proyecto') || textoCombinado.includes('trabajo')) {
            evidencias.push('Trabajos prácticos');
        }
        if (textoCombinado.includes('ejercicio') || textoCombinado.includes('práctica')) {
            evidencias.push('Ejercicios aplicados');
        }
        if (textoCombinado.includes('caso') || textoCombinado.includes('estudio')) {
            evidencias.push('Estudios de caso');
        }
        
        return evidencias.length > 0 ? evidencias : ['Actividades de aprendizaje'];
    }

        // === MÉTODOS NUEVOS PARA MATRIZ 4 ANECA ===

    // ✅ NUEVO: Analizar alineación ANECA
    static analizarAlineacionANECA(contenido, RAsRelacionados, asignatura) {
        const fuerzaMaxima = RAsRelacionados.length > 0 ? 
            Math.max(...RAsRelacionados.map(ra => ra.fuerzaRelacion)) : 0;
        
        return {
            contenidoId: this.generarIdContenido(contenido),
            fuerzaRelacion: fuerzaMaxima,
            totalRAsRelacionados: RAsRelacionados.length,
            estado: fuerzaMaxima > 0.5 ? 'ALINEADO' : fuerzaMaxima > 0.2 ? 'PARCIAL' : 'NO_ALINEADO',
            nivelSoporte: this.determinarNivelSoporte(RAsRelacionados),
            criteriosCumplidos: this.evaluarCriteriosCumplidos(contenido, RAsRelacionados),
            recomendaciones: this.generarRecomendacionesANECA(contenido, RAsRelacionados, fuerzaMaxima)
        };
    }

    // ✅ NUEVO: Determinar tipo de contenido ANECA
    static determinarTipoContenidoANECA(contenido) {
        const texto = contenido.toLowerCase();
        
        if (texto.includes('teoría') || texto.includes('concepto') || texto.includes('fundamento')) 
            return 'TEÓRICO';
        if (texto.includes('práctica') || texto.includes('ejercicio') || texto.includes('laboratorio')) 
            return 'PRÁCTICO';
        if (texto.includes('proyecto') || texto.includes('caso') || texto.includes('aplicación')) 
            return 'APLICADO';
        if (texto.includes('seminar') || texto.includes('taller') || texto.includes('workshop')) 
            return 'SEMINARIO';
            
        return 'TEÓRICO';
    }

    // ✅ NUEVO: Determinar nivel Bloom del contenido
    static determinarNivelBloomContenido(contenido) {
        const texto = contenido.toLowerCase();
        const verbos = this.extraerVerbosAccion(texto);
        
        const nivelesBloom = {
            'RECORDAR': ['definir', 'identificar', 'listar', 'nombrar', 'recordar'],
            'COMPRENDER': ['describir', 'explicar', 'interpretar', 'parafrasear', 'resumir'],
            'APLICAR': ['aplicar', 'calcular', 'demostrar', 'emplear', 'usar'],
            'ANALIZAR': ['analizar', 'comparar', 'contrastar', 'diferenciar', 'organizar'],
            'EVALUAR': ['evaluar', 'criticar', 'justificar', 'valorar', 'verificar'],
            'CREAR': ['crear', 'diseñar', 'desarrollar', 'formular', 'planificar']
        };
        
        for (const [nivel, verbosNivel] of Object.entries(nivelesBloom)) {
            if (verbos.some(verbo => verbosNivel.includes(verbo))) {
                return nivel;
            }
        }
        
        return 'COMPRENDER'; // Por defecto
    }

    // ✅ NUEVO: Generar evidencias ANECA
    static generarEvidenciasANECA(contenido, RAsRelacionados) {
        const tipo = this.determinarTipoContenidoANECA(contenido);
        const evidencias = {
            'TEÓRICO': ['Exámenes teóricos', 'Cuestionarios conceptuales', 'Mapas conceptuales'],
            'PRÁCTICO': ['Informes de laboratorio', 'Ejercicios resueltos', 'Simulaciones'],
            'APLICADO': ['Proyectos aplicados', 'Casos de estudio', 'Portafolios'],
            'SEMINARIO': ['Presentaciones orales', 'Debates documentados', 'Ensayo crítico']
        };
        
        return evidencias[tipo] || ['Evidencias de aprendizaje diversificadas'];
    }

    // ✅ NUEVO: Mapear instrumentos de evaluación
    static mapearInstrumentosEvaluacion(contenido) {
        const tipo = this.determinarTipoContenidoANECA(contenido);
        const instrumentos = {
            'TEÓRICO': ['Rúbrica de evaluación teórica', 'Prueba objetiva', 'Lista de cotejo conceptual'],
            'PRÁCTICO': ['Rúbrica de prácticas', 'Guía de observación', 'Informe de resultados'],
            'APLICADO': ['Rúbrica de proyectos', 'Escala de valoración', 'Evaluación por pares'],
            'SEMINARIO': ['Rúbrica de presentación', 'Guión de debate', 'Matriz de evaluación']
        };
        
        return instrumentos[tipo] || ['Instrumentos de evaluación adecuados'];
    }

    // ✅ NUEVO: Métodos auxiliares
    static determinarNivelContribucionRA(textoContenido, textoRA) {
        const verbosContenido = this.extraerVerbosAccion(textoContenido);
        const verbosRA = this.extraerVerbosAccion(textoRA);
        
        const verbosAvanzados = ['evaluar', 'crear', 'diseñar', 'proponer', 'investigar'];
        if (verbosContenido.some(v => verbosAvanzados.includes(v)) && 
            verbosRA.some(v => verbosAvanzados.includes(v))) {
            return 'ALTA';
        }
        
        return verbosContenido.length > 0 ? 'MEDIA' : 'BAJA';
    }

    static extraerVerbosAccion(texto) {
        const verbos = ['analizar', 'aplicar', 'calcular', 'clasificar', 'comparar', 'crear',
                       'demostrar', 'diseñar', 'evaluar', 'explicar', 'identificar', 'implementar',
                       'justificar', 'proponer', 'resolver', 'sintetizar', 'validar'];
        
        return texto.toLowerCase().split(' ')
            .filter(palabra => verbos.includes(palabra))
            .filter((v, i, a) => a.indexOf(v) === i);
    }

    static extraerVerbosComunes(textoContenido, textoRA) {
        const verbosContenido = this.extraerVerbosAccion(textoContenido);
        const verbosRA = this.extraerVerbosAccion(textoRA);
        
        return verbosContenido.filter(verbo => verbosRA.includes(verbo));
    }

    static extraerCriteriosEvaluacion(ra) {
        // Simular extracción de criterios basados en el RA
        const texto = ra.descripcion?.toLowerCase() || ra.toLowerCase();
        const criterios = [];
        
        if (texto.includes('precisión') || texto.includes('exactitud')) criterios.push('Precisión técnica');
        if (texto.includes('claridad') || texto.includes('coherencia')) criterios.push('Claridad expositiva');
        if (texto.includes('profundidad') || texto.includes('rigor')) criterios.push('Rigor analítico');
        if (texto.includes('innovación') || texto.includes('creatividad')) criterios.push('Creatividad');
        
        return criterios.length > 0 ? criterios : ['Cumplimiento de objetivos'];
    }

    static generarAnalisisGlobalANECA(matriz) {
        const metricas = this.calcularMetricasAdecuacion(matriz);
        
        return {
            criterio: 'Alineación adecuada entre contenidos y resultados de aprendizaje',
            puntuacionGlobal: metricas.porcentajeAdecuacion,
            estado: metricas.porcentajeAdecuacion >= 80 ? 'CUMPLE' : 
                   metricas.porcentajeAdecuacion >= 60 ? 'PARCIAL' : 'NO_CUMPLE',
            fortalezas: this.identificarFortalezasAlineacion(matriz),
            areasMejora: this.identificarAreasMejoraAlineacion(matriz)
        };
    }

    static evaluarCumplimientoANECA(matriz) {
        const metricas = this.calcularMetricasAdecuacion(matriz);
        const puntuacion = metricas.porcentajeAdecuacion;
        
        return {
            puntuacion: puntuacion,
            estado: puntuacion >= 80 ? 'CUMPLE' : puntuacion >= 60 ? 'PARCIAL' : 'NO_CUMPLE',
            criterios: {
                alineacionMinima: metricas.porcentajeAdecuacion >= 70,
                coberturaSuficiente: metricas.coberturaRA.porcentaje >= 80,
                diversidadContenidos: metricas.distribucionNiveles.balanceado
            }
        };
    }
}


