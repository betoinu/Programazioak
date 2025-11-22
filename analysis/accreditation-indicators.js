// 📁 analysis/accreditation-indicators.js - NUEVO ARCHIVO
export class AccreditationIndicators {
    static generarReporteAcreditacionCompleto(curriculumData, matrices) {
        console.log("📊 Generando reporte de acreditación ANECA/AUDIT...");
        
        try {
            const reporte = {
                // ✅ INFORMACIÓN BÁSICA
                metadata: {
                    fechaGeneracion: new Date().toISOString(),
                    version: '1.0',
                    estandar: 'ANECA/AUDIT',
                    titulacion: curriculumData.titulacion || 'No especificado'
                },
                
                // ✅ INDICADORES CLAVE ORGANIZADOS POR CRITERIOS ANECA
                indicadores: {
                    // CRITERIO A: Claridad y coherencia del perfil de egreso
                    claridadCoherencia: this.evaluarClaridadCoherencia(curriculumData, matrices),
                    
                    // CRITERIO B: Cobertura curricular  
                    coberturaCurricular: this.evaluarCoberturaCurricular(matrices),
                    
                    // CRITERIO C: Evaluación del aprendizaje
                    evaluacionAprendizaje: this.evaluarSistemaEvaluacion(curriculumData, matrices),
                    
                    // CRITERIO D: Mejora continua
                    mejoraContinua: this.evaluarSistemaMejoraContinua(curriculumData)
                },
                
                // ✅ PUNTUACIÓN GLOBAL Y RECOMENDACIONES
                resumenEjecutivo: this.generarResumenEjecutivo(curriculumData, matrices),
                cumplimientoGlobal: this.calcularCumplimientoGlobal(),
                recomendacionesPrioritarias: this.generarRecomendacionesPrioritarias()
            };
            
            return reporte;
            
        } catch (error) {
            console.error('❌ Error al generar reporte de acreditación:', error);
            throw error;
        }
    }

    // === CRITERIO A: CLARIDAD Y COHERENCIA DEL PERFIL DE EGRESO ===
    static evaluarClaridadCoherencia(curriculumData, matrices) {
        const competencias = matrices.competenciaRA?.competencias || [];
        const coherenciaVertical = matrices.competenciaRA?.coherenciaVertical || {};
        
        return {
            A1: {
                indicador: "Competencias claramente formuladas",
                criterio: "Redactadas según estándares internacionales (Bloom, Tuning)",
                estado: this.evaluarFormulacionCompetencias(competencias),
                evidencias: {
                    documento: "Plan de estudios oficial",
                    matriz: "Matriz Competencias-RA",
                    metricas: CompetenceMapper.calcularMetricasCompetencias(competencias),
                },
                puntuacion: this.calcularPuntuacionCompetencias(competencias),
                recomendaciones: this.generarRecomendacionesCompetencias(competencias)
            },
            
            A2: {
                indicador: "RA medibles y verificables", 
                criterio: "Verbos observables, condiciones y criterios específicos",
                estado: this.evaluarRAMedibles(matrices.competenciaRA),
                evidencias: {
                    matriz: "Matriz RA-Competencias",
                    verbos: this.analizarVerbosAccion(matrices.competenciaRA),
                    criterios: this.extraerCriteriosEvaluacion(curriculumData)
                },
                puntuacion: this.calcularPuntuacionRAMedibles(matrices.competenciaRA),
                recomendaciones: this.generarRecomendacionesRA(matrices.competenciaRA)
            },
            
            // ✅ NUEVO INDICADOR: Coherencia vertical
            A3: {
                indicador: "Coherencia vertical competencias-RA",
                criterio: "Alineación clara entre competencias y resultados de aprendizaje",
                estado: coherenciaVertical.estado || 'NO_EVALUADO',
                evidencias: {
                    porcentaje: coherenciaVertical.porcentajeCoherencia || 0,
                    competenciasConRA: coherenciaVertical.competenciasConRA || 0,
                    competenciasSinRA: coherenciaVertical.competenciasSinRA || 0
                },
                puntuacion: coherenciaVertical.porcentajeCoherencia || 0,
                recomendaciones: this.generarRecomendacionesCoherenciaVertical(coherenciaVertical)
            }
        };
    }

    // === CRITERIO B: COBERTURA CURRICULAR ===
    static evaluarCoberturaCurricular(matrices) {
        const matrizRAsAsignaturas = matrices.raSubject || {};
        const coberturaRA = matrizRAsAsignaturas.cumplimientoANECA || {};
        
        return {
            B1: {
                indicador: "Todos los RA mapeados a asignaturas",
                criterio: "100% de RA con al menos 2 asignaturas",
                estado: this.evaluarMapeoRAAsignaturas(matrizRAsAsignaturas),
                evidencias: {
                    matriz: "Matriz RA-Asignaturas", 
                    porcentaje: coberturaRA.porcentajeCumplimiento || 0,
                    totalRA: coberturaRA.totalRA || 0,
                    raCumplen: coberturaRA.raCumplen || 0
                },
                puntuacion: coberturaRA.porcentajeCumplimiento || 0,
                recomendaciones: this.generarRecomendacionesMapeoRA(matrizRAsAsignaturas)
            },
            
            B2: {
                indicador: "Secuencia lógica de progresión",
                criterio: "Progresión I → D → Dp en el mapa curricular",
                estado: this.evaluarSecuenciaProgresion(matrices),
                evidencias: {
                    mapa: "Mapa curricular",
                    secuencia: matrices.raSubject?.analisisSecuencia || {},
                    problemas: matrices.raSubject?.brechasCobertura || []
                },
                puntuacion: this.calcularPuntuacionSecuencia(matrices),
                recomendaciones: this.generarRecomendacionesSecuencia(matrices)
            },
            
            // ✅ NUEVO INDICADOR: Cobertura de niveles
            B3: {
                indicador: "Cobertura adecuada de niveles de dominio",
                criterio: "Existencia de asignaturas en nivel Dp para cada RA",
                estado: this.evaluarCoberturaNiveles(matrizRAsAsignaturas),
                evidencias: {
                    raConDominio: this.contarRAsConDominio(matrizRAsAsignaturas),
                    totalRA: coberturaRA.totalRA || 0,
                    porcentaje: this.calcularPorcentajeDominio(matrizRAsAsignaturas)
                },
                puntuacion: this.calcularPuntuacionDominio(matrizRAsAsignaturas),
                recomendaciones: this.generarRecomendacionesDominio(matrizRAsAsignaturas)
            }
        };
    }

    // === CRITERIO C: EVALUACIÓN DEL APRENDIZAJE ===
    static evaluarSistemaEvaluacion(curriculumData, matrices) {
        return {
            C1: {
                indicador: "Existencia de rúbricas de evaluación",
                criterio: "Rúbricas alineadas a RA y competencias",
                estado: this.evaluarExistenciaRubricas(curriculumData),
                evidencias: {
                    manual: "Manual de evaluación del título",
                    instrumentos: this.identificarInstrumentosEvaluacion(matrices),
                    cobertura: this.calcularCoberturaRubricas(curriculumData)
                },
                puntuacion: this.calcularPuntuacionRubricas(curriculumData),
                recomendaciones: this.generarRecomendacionesRubricas(curriculumData)
            },
            
            C2: {
                indicador: "Evaluación basada en evidencias",
                criterio: "Portafolios, proyectos, prácticas profesionales",
                estado: this.evaluarEvaluacionEvidencias(curriculumData),
                evidencias: {
                    tiposEvidencias: this.identificarTiposEvidencias(matrices),
                    proyectos: this.identificarProyectosIntegradores(curriculumData),
                    practicas: this.verificarPracticasProfesionales(curriculumData)
                },
                puntuacion: this.calcularPuntuacionEvidencias(curriculumData),
                recomendaciones: this.generarRecomendacionesEvidencias(curriculumData)
            },
            
            // ✅ NUEVO INDICADOR: Diversidad instrumentos evaluación
            C3: {
                indicador: "Diversidad de instrumentos de evaluación",
                criterio: "Múltiples métodos de evaluación por competencia",
                estado: this.evaluarDiversidadInstrumentos(matrices),
                evidencias: {
                    instrumentosPorCompetencia: this.contarInstrumentosPorCompetencia(matrices),
                    variedad: this.calcularVariedadInstrumentos(matrices),
                    cobertura: this.calcularCoberturaInstrumentos(matrices)
                },
                puntuacion: this.calcularPuntuacionInstrumentos(matrices),
                recomendaciones: this.generarRecomendacionesInstrumentos(matrices)
            }
        };
    }

    // === CRITERIO D: MEJORA CONTINUA ===
    static evaluarSistemaMejoraContinua(curriculumData) {
        return {
            D1: {
                indicador: "Uso de resultados de evaluación para mejora",
                criterio: "Plan de mejora documentado y ejecutado",
                estado: this.evaluarPlanMejora(curriculumData),
                evidencias: {
                    planes: this.identificarPlanesMejora(curriculumData),
                    informes: "Informes de comisiones académicas",
                    acciones: this.identificarAccionesMejora(curriculumData)
                },
                puntuacion: this.calcularPuntuacionMejora(curriculumData),
                recomendaciones: this.generarRecomendacionesMejora(curriculumData)
            },
            
            D2: {
                indicador: "Participación de stakeholders",
                criterio: "Estudiantes, empleadores, egresados en evaluación",
                estado: this.evaluarParticipacionStakeholders(curriculumData),
                evidencias: {
                    encuestas: this.verificarEncuestasStakeholders(curriculumData),
                    actas: "Actas de comisiones de seguimiento",
                    mecanismos: this.identificarMecanismosParticipacion(curriculumData)
                },
                puntuacion: this.calcularPuntuacionStakeholders(curriculumData),
                recomendaciones: this.generarRecomendacionesStakeholders(curriculumData)
            },
            
            // ✅ NUEVO INDICADOR: Seguimiento de egresados
            D3: {
                indicador: "Sistema de seguimiento de egresados",
                criterio: "Mecanismos para evaluar desempeño profesional",
                estado: this.evaluarSeguimientoEgresados(curriculumData),
                evidencias: {
                    sistema: this.verificarSistemaSeguimiento(curriculumData),
                    informes: this.identificarInformesSeguimiento(curriculumData),
                    indicadores: this.identificarIndicadoresDesempeno(curriculumData)
                },
                puntuacion: this.calcularPuntuacionSeguimiento(curriculumData),
                recomendaciones: this.generarRecomendacionesSeguimiento(curriculumData)
            }
        };
    }

    // === MÉTODOS DE EVALUACIÓN PARA CRITERIO A ===
    static evaluarFormulacionCompetencias(competencias) {
        if (!competencias || competencias.length === 0) return 'NO_CUMPLE';
        
        const competenciasBienFormuladas = competencias.filter(comp => 
            comp.descripcion && 
            comp.descripcion.length > 20 &&
            this.contieneVerboAccion(comp.descripcion)
        ).length;
        
        const porcentaje = (competenciasBienFormuladas / competencias.length) * 100;
        
        if (porcentaje >= 90) return 'CUMPLE_TOTALMENTE';
        if (porcentaje >= 70) return 'CUMPLE_PARCIALMENTE';
        return 'NO_CUMPLE';
    }

    static evaluarRAMedibles(matrizCompetenciaRA) {
        if (!matrizCompetenciaRA?.competencias) return 'NO_EVALUADO';
        
        const rasMedibles = matrizCompetenciaRA.competencias.reduce((count, competencia) => {
            if (competencia.resultadosAprendizaje) {
                return count + competencia.resultadosAprendizaje.filter(ra =>
                    this.esRAMedible(ra.descripcion)
                ).length;
            }
            return count;
        }, 0);
        
        const totalRAs = matrizCompetenciaRA.competencias.reduce((count, competencia) => {
            return count + (competencia.resultadosAprendizaje?.length || 0);
        }, 0);
        
        const porcentaje = totalRAs > 0 ? (rasMedibles / totalRAs) * 100 : 0;
        
        if (porcentaje >= 80) return 'CUMPLE_TOTALMENTE';
        if (porcentaje >= 60) return 'CUMPLE_PARCIALMENTE';
        return 'NO_CUMPLE';
    }

    // === MÉTODOS DE EVALUACIÓN PARA CRITERIO B ===
    static evaluarMapeoRAAsignaturas(matrizRAsAsignaturas) {
        if (!matrizRAsAsignaturas?.matriz) return 'NO_EVALUADO';
        
        const raConCoberturaMinima = matrizRAsAsignaturas.matriz.filter(ra =>
            ra.cumpleMinimoANECA
        ).length;
        
        const totalRA = matrizRAsAsignaturas.matriz.length;
        const porcentaje = totalRA > 0 ? (raConCoberturaMinima / totalRA) * 100 : 0;
        
        if (porcentaje === 100) return 'CUMPLE_TOTALMENTE';
        if (porcentaje >= 80) return 'CUMPLE_PARCIALMENTE';
        return 'NO_CUMPLE';
    }

    static evaluarSecuenciaProgresion(matrices) {
        const secuencia = matrices.raSubject?.analisisSecuencia;
        if (!secuencia) return 'NO_EVALUADO';
        
        return secuencia.esValida ? 'CUMPLE_TOTALMENTE' : 'NO_CUMPLE';
    }

    // === MÉTODOS AUXILIARES GENERALES ===
    static contieneVerboAccion(texto) {
        const verbosAccion = ['analizar', 'aplicar', 'calcular', 'clasificar', 'comparar', 'crear',
                            'demostrar', 'diseñar', 'evaluar', 'explicar', 'identificar', 'implementar'];
        return verbosAccion.some(verbo => texto.toLowerCase().includes(verbo));
    }

    static esRAMedible(descripcionRA) {
        if (!descripcionRA) return false;
        
        const verbosObservables = ['analizar', 'aplicar', 'calcular', 'clasificar', 'comparar', 'crear',
                                 'demostrar', 'diseñar', 'evaluar', 'explicar', 'identificar', 'implementar'];
        
        const primerVerbo = descripcionRA.toLowerCase().split(' ')[0];
        return verbosObservables.includes(primerVerbo);
    }

    // === RESÚMENES Y PUNTUACIONES GLOBALES ===
    static generarResumenEjecutivo(curriculumData, matrices) {
        const indicadores = this.generarReporteAcreditacionCompleto(curriculumData, matrices).indicadores;
        
        return {
            puntuacionGlobal: this.calcularPuntuacionGlobal(indicadores),
            estadoGeneral: this.determinarEstadoGeneral(indicadores),
            fortalezasPrincipales: this.identificarFortalezasPrincipales(indicadores),
            debilidadesCriticas: this.identificarDebilidadesCriticas(indicadores),
            prioridadesAccion: this.establecerPrioridadesAccion(indicadores)
        };
    }

    static calcularCumplimientoGlobal() {
        // Lógica para calcular cumplimiento global basado en todos los indicadores
        return {
            puntuacionTotal: 0, // Se calculará dinámicamente
            nivelCumplimiento: 'EN_PROCESO', // AUTOEVALUACIÓN, CUMPLE, NO_CUMPLE
            criteriosCumplidos: 0,
            criteriosPendientes: 0,
            fechaProximaEvaluacion: this.calcularFechaProximaEvaluacion()
        };
    }

    static generarRecomendacionesPrioritarias() {
        return [
            {
                prioridad: 'ALTA',
                area: 'Cobertura Curricular',
                accion: 'Completar mapeo de todos los RA con al menos 2 asignaturas',
                plazo: '3 meses',
                responsable: 'Coordinación de titulación'
            },
            {
                prioridad: 'MEDIA', 
                area: 'Sistema de Evaluación',
                accion: 'Desarrollar rúbricas para todas las competencias',
                plazo: '6 meses',
                responsable: 'Comisión de garantía de calidad'
            },
            {
                prioridad: 'BAJA',
                area: 'Mejora Continua',
                accion: 'Implementar sistema de seguimiento de egresados',
                plazo: '12 meses',
                responsable: 'Unidad de calidad'
            }
        ];
    }

    // === MÉTODOS DE CÁLCULO DE PUNTUACIONES ===
    static calcularPuntuacionCompetencias(competencias) {
        if (!competencias || competencias.length === 0) return 0;
        
        const competenciasBienFormuladas = competencias.filter(comp => 
            comp.descripcion && 
            comp.descripcion.length > 20 &&
            this.contieneVerboAccion(comp.descripcion)
        ).length;
        
        return (competenciasBienFormuladas / competencias.length) * 100;
    }

    static calcularPuntuacionRAMedibles(matrizCompetenciaRA) {
        if (!matrizCompetenciaRA?.competencias) return 0;
        
        const rasMedibles = matrizCompetenciaRA.competencias.reduce((count, competencia) => {
            if (competencia.resultadosAprendizaje) {
                return count + competencia.resultadosAprendizaje.filter(ra =>
                    this.esRAMedible(ra.descripcion)
                ).length;
            }
            return count;
        }, 0);
        
        const totalRAs = matrizCompetenciaRA.competencias.reduce((count, competencia) => {
            return count + (competencia.resultadosAprendizaje?.length || 0);
        }, 0);
        
        return totalRAs > 0 ? (rasMedibles / totalRAs) * 100 : 0;
    }

    static calcularPuntuacionGlobal(indicadores) {
        // Calcular promedio ponderado de todos los indicadores
        let puntuacionTotal = 0;
        let totalIndicadores = 0;
        
        Object.values(indicadores).forEach(criterio => {
            Object.values(criterio).forEach(indicador => {
                puntuacionTotal += indicador.puntuacion || 0;
                totalIndicadores++;
            });
        });
        
        return totalIndicadores > 0 ? puntuacionTotal / totalIndicadores : 0;
    }
    // === MÉTODOS DE RECOMENDACIONES PARA CRITERIO A ===

static generarRecomendacionesCompetencias(competencias) {
    console.log("🎯 Generando recomendaciones para competencias...");
    
    const recomendaciones = {
        fortalezas: [],
        mejoras: [],
        criticas: []
    };

    if (!competencias || competencias.length === 0) {
        recomendaciones.criticas.push({
            problema: "No se encontraron competencias definidas",
            recomendacion: "Definir el perfil de competencias del título"
        });
        return recomendaciones;
    }

    // Analizar claridad de las competencias
    competencias.forEach((competencia, index) => {
        const descripcion = competencia.descripcion || competencia.nombre || '';
        const palabras = descripcion.split(' ').length;
        
        // Recomendaciones basadas en longitud y claridad
        if (palabras < 8) {
            recomendaciones.mejoras.push({
                competencia: `Competencia ${index + 1}`,
                problema: "Descripción demasiado breve",
                recomendacion: "Ampliar la descripción para mayor claridad"
            });
        } else if (palabras > 25) {
            recomendaciones.mejoras.push({
                competencia: `Competencia ${index + 1}`,
                problema: "Descripción demasiado extensa",
                recomendacion: "Simplificar la redacción para mejor comprensión"
            });
        } else {
            recomendaciones.fortalezas.push({
                competencia: `Competencia ${index + 1}`,
                aspecto: "Longitud adecuada de la descripción"
            });
        }

        // Verificar verbos de acción
        const verbosAccion = ['analizar', 'diseñar', 'implementar', 'evaluar', 'crear', 'gestionar', 
                            'aplicar', 'desarrollar', 'resolver', 'planificar'];
        const tieneVerboAccion = verbosAccion.some(verbo => 
            descripcion.toLowerCase().includes(verbo)
        );

        if (!tieneVerboAccion) {
            recomendaciones.mejoras.push({
                competencia: `Competencia ${index + 1}`,
                problema: "Falta verbo de acción claro",
                recomendacion: "Incluir verbos de acción medibles (analizar, diseñar, implementar, etc.)"
            });
        }

        // Verificar especificidad
        const palabrasVagas = ['conocer', 'saber', 'entender', 'familiarizarse', 'comprender'];
        const tienePalabraVaga = palabrasVagas.some(palabra =>
            descripcion.toLowerCase().includes(palabra)
        );

        if (tienePalabraVaga) {
            recomendaciones.criticas.push({
                competencia: `Competencia ${index + 1}`,
                problema: "Verbo no medible o muy vago",
                recomendacion: "Reemplazar por verbos de acción específicos y medibles"
            });
        }

        // Verificar contexto y criterios
        const tieneContexto = descripcion.includes('en ') || descripcion.includes('para ') || 
                            descripcion.includes('mediante ') || descripcion.includes('utilizando ');
        
        if (!tieneContexto) {
            recomendaciones.mejoras.push({
                competencia: `Competencia ${index + 1}`,
                problema: "Falta contexto o criterios de desempeño",
                recomendacion: "Especificar contexto, condiciones o criterios de evaluación"
            });
        }
    });

    // Análisis de coherencia global
    const totalCompetencias = competencias.length;
    const competenciasConProblemas = recomendaciones.mejoras.length + recomendaciones.criticas.length;
    const porcentajeProblemas = (competenciasConProblemas / totalCompetencias) * 100;

    if (porcentajeProblemas > 50) {
        recomendaciones.criticas.push({
            problema: "Alta proporción de competencias con problemas de formulación",
            recomendacion: "Revisión integral del perfil de competencias del título"
        });
    }

    // Recomendación general basada en el análisis
    if (recomendaciones.fortalezas.length > recomendaciones.mejoras.length + recomendaciones.criticas.length) {
        recomendaciones.fortalezas.push({
            aspecto: "Formulación general de competencias",
            observacion: "La mayoría de competencias están bien formuladas"
        });
    }

    return recomendaciones;
}

// También necesitas estos métodos auxiliares que se llaman:

static generarRecomendacionesRA(matrizCompetenciaRA) {
    const recomendaciones = [];
    
    if (!matrizCompetenciaRA?.competencias) {
        return [{
            problema: "No hay datos de resultados de aprendizaje",
            recomendacion: "Definir los resultados de aprendizaje asociados a las competencias"
        }];
    }

    // Analizar RAs por competencia
    matrizCompetenciaRA.competencias.forEach((competencia, index) => {
        const ras = competencia.resultadosAprendizaje || [];
        
        if (ras.length === 0) {
            recomendaciones.push({
                competencia: `Competencia ${index + 1}`,
                problema: "No tiene resultados de aprendizaje asociados",
                recomendacion: "Definir al menos 2-3 resultados de aprendizaje medibles"
            });
        } else if (ras.length < 2) {
            recomendaciones.push({
                competencia: `Competencia ${index + 1}`,
                problema: "Tiene muy pocos resultados de aprendizaje",
                recomendacion: "Ampliar a 2-3 resultados de aprendizaje para cubrir diferentes niveles"
            });
        }

        // Verificar si los RAs son medibles
        const rasNoMedibles = ras.filter(ra => !this.esRAMedible(ra.descripcion));
        if (rasNoMedibles.length > 0) {
            recomendaciones.push({
                competencia: `Competencia ${index + 1}`,
                problema: `${rasNoMedibles.length} RA no son medibles`,
                recomendacion: "Reformular RAs con verbos de acción observables"
            });
        }
    });

    return recomendaciones;
}

static generarRecomendacionesCoherenciaVertical(coherenciaVertical) {
    const recomendaciones = [];
    
    if (coherenciaVertical.competenciasSinRA > 0) {
        recomendaciones.push({
            problema: `${coherenciaVertical.competenciasSinRA} competencias sin RA asociados`,
            recomendacion: "Definir resultados de aprendizaje para todas las competencias"
        });
    }

    if (coherenciaVertical.porcentajeCoherencia < 80) {
        recomendaciones.push({
            problema: "Baja coherencia vertical competencias-RA",
            recomendacion: "Revisar y mejorar la alineación entre competencias y resultados de aprendizaje"
        });
    }

    return recomendaciones.length > 0 ? recomendaciones : [{
        aspecto: "Coherencia vertical",
        observacion: "La alineación entre competencias y RA es adecuada"
    }];
}

// === MÉTODOS PARA OTROS CRITERIOS ===

static generarRecomendacionesMapeoRA(matrizRAsAsignaturas) {
    const recomendaciones = [];
    
    if (!matrizRAsAsignaturas?.matriz) {
        return [{
            problema: "No hay datos de mapeo RA-Asignaturas",
            recomendacion: "Completar la matriz de relación RA-Asignaturas"
        }];
    }

    const raSinCobertura = matrizRAsAsignaturas.matriz.filter(ra => !ra.cumpleMinimoANECA);
    
    if (raSinCobertura.length > 0) {
        recomendaciones.push({
            problema: `${raSinCobertura.length} RA no cumplen cobertura mínima ANECA`,
            recomendacion: "Asignar al menos 2 asignaturas por RA"
        });
    }

    return recomendaciones;
}

static generarRecomendacionesSecuencia(matrices) {
    const secuencia = matrices.raSubject?.analisisSecuencia;
    const recomendaciones = [];
    
    if (!secuencia) {
        return [{
            problema: "No se pudo analizar la secuencia de progresión",
            recomendacion: "Verificar la estructura del mapa curricular"
        }];
    }

    if (!secuencia.esValida) {
        recomendaciones.push({
            problema: "Problemas en la secuencia de progresión de aprendizajes",
            recomendacion: "Revisar la distribución de niveles (I → D → Dp) en el plan de estudios"
        });
    }

    if (secuencia.brechas && secuencia.brechas.length > 0) {
        recomendaciones.push({
            problema: `Se detectaron ${secuencia.brechas.length} brechas en la secuencia`,
            recomendacion: "Completar la progresión de aprendizajes en las brechas identificadas"
        });
    }

    return recomendaciones;
}

// Métodos de evaluación que también pueden faltar:

static determinarEstadoGeneral(indicadores) {
    const puntuacionGlobal = this.calcularPuntuacionGlobal(indicadores);
    
    if (puntuacionGlobal >= 80) return 'EXCELENTE';
    if (puntuacionGlobal >= 60) return 'SATISFACTORIO';
    if (puntuacionGlobal >= 40) return 'MEJORABLE';
    return 'CRÍTICO';
}

static identificarFortalezasPrincipales(indicadores) {
    const fortalezas = [];
    
    Object.entries(indicadores).forEach(([criterio, subindicadores]) => {
        Object.entries(subindicadores).forEach(([codigo, indicador]) => {
            if (indicador.puntuacion >= 80) {
                fortalezas.push({
                    criterio: codigo,
                    indicador: indicador.indicador,
                    puntuacion: indicador.puntuacion
                });
            }
        });
    });
    
    return fortalezas;
}

static identificarDebilidadesCriticas(indicadores) {
    const debilidades = [];
    
    Object.entries(indicadores).forEach(([criterio, subindicadores]) => {
        Object.entries(subindicadores).forEach(([codigo, indicador]) => {
            if (indicador.puntuacion < 60) {
                debilidades.push({
                    criterio: codigo,
                    indicador: indicador.indicador,
                    puntuacion: indicador.puntuacion,
                    estado: indicador.estado
                });
            }
        });
    });
    
    return debilidades;
}

static establecerPrioridadesAccion(indicadores) {
    const debilidades = this.identificarDebilidadesCriticas(indicadores);
    
    return debilidades.map(debilidad => ({
        prioridad: debilidad.puntuacion < 40 ? 'ALTA' : 'MEDIA',
        area: debilidad.criterio,
        accion: `Mejorar ${debilidad.indicador.toLowerCase()}`,
        plazo: debilidad.puntuacion < 40 ? '3 meses' : '6 meses',
        responsable: 'Coordinación de titulación'
    }));
}
    
    // === MÉTODOS DE FECHA Y TEMPORALIDAD ===
    static calcularFechaProximaEvaluacion() {
        const fecha = new Date();
        fecha.setMonth(fecha.getMonth() + 6); // 6 meses desde ahora
        return fecha.toISOString().split('T')[0];
    }

}

