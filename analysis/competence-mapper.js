// 📁 analysis/competence-mapper.js - ACTUALIZADO
export class CompetenceMapper {
    // REEMPLAZAR el método generarMatrizCompetenciasRA
static async generarMatrizCompetenciasRA(curriculumData) {
    console.log("🔄 Generando matriz de competencias agrupadas...");
    
    try {
        const competenciasAgrupadas = await AnecaAPI.interpretarCompetencias(curriculumData);
        const todasCompetencias = Object.values(competenciasAgrupadas).flat();
        
        console.log(`📊 Procesando ${todasCompetencias.length} competencias agrupadas`);
        
        // ✅ AÑADIR dentro del método existente:
        const matrizCompetenciasRA = todasCompetencias.map(comp => ({
            // Campos existentes que ya tienes:
            id: comp.id,
            nombre: comp.nombre,
            descripcion: comp.descripcion,
            ambito: comp.ambito,
            nivelBloom: comp.nivelBloom,
            cursos: comp.cursos,
            asignaturas: comp.asignaturasRelacionadas,
            rasConstituyentes: (comp.rasConstituyentes && comp.rasConstituyentes.length) || 0,
            creditos: comp.creditosTotales,
            progresion: comp.progresion,
            instrumentosEvaluacion: comp.instrumentosEvaluacion,
            
            // ✅ NUEVOS CAMPOS PARA MATRIZ ANECA:
            codigo: comp.codigo || this.generarCodigoCompetencia(comp), // NUEVO
            resultadosAprendizaje: this.extraerResultadosAprendizaje(comp), // NUEVO
            nivel: this.determinarNivelANECA(comp.nivelBloom), // NUEVO
            evidenciasLogro: this.generarEvidenciasLogro(comp), // NUEVO
            instrumentosEvaluacionEstandar: this.mapearInstrumentosEvaluacion(comp.instrumentosEvaluacion) // NUEVO
        }));
        
        const matriz = {
            competencias: matrizCompetenciasRA, // ✅ Esto reemplaza tu estructura actual
            metricas: this.calcularMetricasCompetencias(todasCompetencias),
            ambitos: this.agruparPorAmbitos(todasCompetencias),
            distribucionBloom: this.analizarDistribucionBloom(todasCompetencias),
            progresionCurricular: this.analizarProgresionCurricular(todasCompetencias),
            // ✅ NUEVA SECCIÓN:
            coherenciaVertical: this.analizarCoherenciaVertical(todasCompetencias) // NUEVO
        };
        
        return matriz;
        
    } catch (error) {
        console.error('❌ Error al generar matriz de competencias:', error);
        throw error;
    }
}

// ✅ AÑADIR ESTE MÉTODO FALTANTE:
static calcularDistribucionCursos(competencias) {
    const distribucion = {};
    competencias.forEach(comp => {
        if (comp.cursos && Array.isArray(comp.cursos)) {
            comp.cursos.forEach(curso => {
                distribucion[curso] = (distribucion[curso] || 0) + 1;
            });
        }
    });
    return distribucion;
}
    
// NUEVOS MÉTODOS PARA LA NUEVA ESTRUCTURA
static calcularMetricasCompetencias(competencias) {
    // ✅ MANTENER tu código exactamente como está:
    const metricasBase = {
        totalCompetencias: competencias.length,
        totalRAs: competencias.reduce((sum, comp) => sum + (comp.rasConstituyentes?.length || 0), 0),
        promedioRAsPorCompetencia: competencias.length > 0 ? 
            (competencias.reduce((sum, comp) => sum + (comp.rasConstituyentes?.length || 0), 0) / competencias.length).toFixed(1) : 0,
        competenciasConProgresion: competencias.filter(comp => comp.cursos && comp.cursos.length > 1).length,
        distribucionCursos: this.calcularDistribucionCursos(competencias)
    };

    // ✅ AÑADIR las nuevas métricas ANECA sin modificar las existentes:
    return {
        ...metricasBase, // Tus métricas originales se mantienen intactas
        // === NUEVAS MÉTRICAS PARA MATRIZ ANECA ===
        distribucionNivelesANECA: this.calcularDistribucionNivelesANECA(competencias),
        porcentajeCompetenciasConRA: this.calcularPorcentajeRA(competencias),
        coberturaVertical: this.calcularCoberturaVertical(competencias),
        estadoCumplimientoANECA: this.evaluarCumplimientoANECA(competencias)
    };
}

// === MÉTODOS NUEVOS - AÑADIR AL FINAL ===

// ✅ NUEVO: Calcular distribución de niveles ANECA
static calcularDistribucionNivelesANECA(competencias) {
    const distribucion = { Introductorio: 0, Medio: 0, Avanzado: 0 };
    
    competencias.forEach(comp => {
        const nivel = this.determinarNivelANECA(comp.nivelBloom);
        distribucion[nivel] = (distribucion[nivel] || 0) + 1;
    });
    
    return distribucion;
}

// ✅ NUEVO: Calcular porcentaje de competencias con RA
static calcularPorcentajeRA(competencias) {
    const conRA = competencias.filter(comp => 
        comp.rasConstituyentes && comp.rasConstituyentes.length > 0
    ).length;
    
    return (conRA / competencias.length * 100).toFixed(1);
}

// ✅ NUEVO: Calcular cobertura vertical
static calcularCoberturaVertical(competencias) {
    const conRA = competencias.filter(comp => 
        comp.rasConstituyentes && comp.rasConstituyentes.length > 0
    ).length;
    
    return {
        porcentaje: (conRA / competencias.length * 100).toFixed(1),
        competenciasConRA: conRA,
        competenciasSinRA: competencias.length - conRA,
        estado: conRA === competencias.length ? 'ÓPTIMA' : 
               conRA >= competencias.length * 0.8 ? 'ACEPTABLE' : 'DEFICIENTE'
    };
}

// ✅ NUEVO: Evaluar cumplimiento ANECA
static evaluarCumplimientoANECA(competencias) {
    const cobertura = this.calcularCoberturaVertical(competencias);
    const distribucion = this.calcularDistribucionNivelesANECA(competencias);
    
    const criterios = {
        coberturaMinima: parseFloat(cobertura.porcentaje) >= 80,
        tieneNivelesVariados: distribucion.Avanzado > 0 && distribucion.Medio > 0,
        balanceAdecuado: distribucion.Avanzado >= competencias.length * 0.2
    };
    
    return {
        cumpleRequisitos: criterios.coberturaMinima && criterios.tieneNivelesVariados,
        criterios: criterios,
        puntuacion: this.calcularPuntuacionANECA(criterios, competencias.length)
    };
}

// ✅ NUEVO: Calcular puntuación ANECA
static calcularPuntuacionANECA(criterios, totalCompetencias) {
    let puntuacion = 0;
    if (criterios.coberturaMinima) puntuacion += 40;
    if (criterios.tieneNivelesVariados) puntuacion += 30;
    if (criterios.balanceAdecuado) puntuacion += 30;
    return puntuacion;
}

// ✅ NUEVO: Determinar nivel ANECA (necesario para los métodos anteriores)
static determinarNivelANECA(nivelBloom) {
    const nivel = nivelBloom?.nivel || nivelBloom;
    const mapeoNiveles = {
        'RECORDAR': 'Introductorio', 'COMPRENDER': 'Introductorio', 
        'APLICAR': 'Medio', 'ANALIZAR': 'Medio', 'EVALUAR': 'Avanzado', 'CREAR': 'Avanzado'
    };
    return mapeoNiveles[nivel] || 'Medio';
}
    
static agruparPorAmbitos(competencias) {
    const ambitos = {};
    competencias.forEach(comp => {
        if (!ambitos[comp.ambito]) {
            ambitos[comp.ambito] = [];
        }
        ambitos[comp.ambito].push(comp);
    });
    return ambitos;
}

static analizarDistribucionBloom(competencias) {
    const distribucion = {};
    competencias.forEach(comp => {
        const nivel = comp.nivelBloom?.nivel || 'RECORDAR';
        distribucion[nivel] = (distribucion[nivel] || 0) + 1;
    });
    return distribucion;
}

static analizarProgresionCurricular(competencias) {
    const progresion = { cursos: {} };
    
    competencias.forEach(comp => {
        comp.cursos.forEach(curso => {
            if (!progresion.cursos[curso]) {
                progresion.cursos[curso] = { competencias: 0, creditos: 0 };
            }
            progresion.cursos[curso].competencias++;
            progresion.cursos[curso].creditos += comp.creditosTotales / comp.cursos.length;
        });
    });
    
    return progresion;
}
    
    static aplanarCompetencias(competenciasAgrupadas) {
        const todasCompetencias = [];
        Object.values(competenciasAgrupadas).forEach(competenciasAmbito => {
            todasCompetencias.push(...competenciasAmbito);
        });
        return todasCompetencias;
    }
       
    static generarAlertasCompetencias(competenciasAgrupadas, metricas) {
        const alertas = [];
        
        // Alerta si hay muchos RAs en primer curso
        if (metricas.porCurso[1] > 20) {
            alertas.push({
                tipo: 'SOBRECARGA',
                mensaje: `Demasiadas competencias (${metricas.porCurso[1]}) en primer curso`,
                gravedad: 'MEDIA'
            });
        }
        
        // Alerta si falta diversidad de niveles Bloom
        if (metricas.porNivelBloom['CREAR'] < 5) {
            alertas.push({
                tipo: 'NIVEL_BLOOM',
                mensaje: 'Faltan competencias de nivel CREAR',
                gravedad: 'ALTA'
            });
        }
        
        return alertas;
    }
    
    static calcularCoberturaRA(competenciasAgrupadas) {
        // Lógica para calcular cobertura de resultados de aprendizaje
        return {
            coberturaTotal: Object.keys(competenciasAgrupadas).length,
            ambitosCubiertos: Object.keys(competenciasAgrupadas)
        };
    }
    
    static analizarNivelesBloom(competenciasAgrupadas) {
        const niveles = {};
        Object.values(competenciasAgrupadas).forEach(competencias => {
            competencias.forEach(comp => {
                niveles[comp.nivelBloom] = (niveles[comp.nivelBloom] || 0) + 1;
            });
        });
        return niveles;
    }
    
    static generarEvidencias(competenciasAgrupadas) {
        const evidencias = {};
        Object.entries(competenciasAgrupadas).forEach(([ambito, competencias]) => {
            evidencias[ambito] = competencias.map(comp => ({
                competencia: comp.nombre,
                instrumentos: comp.instrumentosEvaluacion,
                evidencias: comp.instrumentosEvaluacion.map(instr => `${instr} de ${comp.nombre}`)
            }));
        });
        return evidencias;
    }

    // ✅ AÑADIR MÉTODOS AUXILIARES FALTANTES:
    static analizarDistribucionBloom(competencias) {
        const distribucion = {};
        competencias.forEach(comp => {
            const nivel = comp.nivelBloom?.nivel || comp.nivelBloom || 'RECORDAR';
            distribucion[nivel] = (distribucion[nivel] || 0) + 1;
        });
        return distribucion;
    }
    
    static analizarProgresionCurricular(competencias) {
        const progresion = { cursos: {} };
        
        competencias.forEach(comp => {
            if (comp.cursos && Array.isArray(comp.cursos)) {
                comp.cursos.forEach(curso => {
                    if (!progresion.cursos[curso]) {
                        progresion.cursos[curso] = { competencias: 0, creditos: 0 };
                    }
                    progresion.cursos[curso].competencias++;
                    progresion.cursos[curso].creditos += (comp.creditosTotales || 0) / comp.cursos.length;
                });
            }
        });
        
        return progresion;
    }
    
    static agruparPorAmbitos(competencias) {
        const ambitos = {};
        competencias.forEach(comp => {
            if (comp.ambito) {
                if (!ambitos[comp.ambito]) {
                    ambitos[comp.ambito] = [];
                }
                ambitos[comp.ambito].push(comp);
            }
        });
        return ambitos;
    }
    
    static estructuraVacia() {
        return {
            matriz: {
                competencias: [],
                ambitos: {},
                coberturaRA: {},
                nivelesBloom: {},
                evidencias: {}
            },
            metricas: {
                totalCompetencias: 0,
                porAmbito: {},
                porNivelBloom: {},
                porCurso: {1: 0, 2: 0, 3: 0, 4: 0}
            },
            alertas: []
        };
    }
}









