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
                    metricas: this.calcularMetricasCompetencias(competencias)
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

    // === MÉTODOS DE FECHA Y TEMPORALIDAD ===
    static calcularFechaProximaEvaluacion() {
        const fecha = new Date();
        fecha.setMonth(fecha.getMonth() + 6); // 6 meses desde ahora
        return fecha.toISOString().split('T')[0];
    }
}