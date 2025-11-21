// 📁 analysis/competence-mapper.js - ACTUALIZADO
export class CompetenceMapper {
    // REEMPLAZAR el método generarMatrizCompetenciasRA
static async generarMatrizCompetenciasRA(curriculumData) {
    console.log("🔄 Generando matriz de competencias agrupadas...");
    
    try {
        // Obtener competencias ya agrupadas desde la API
        const competenciasAgrupadas = await AnecaAPI.interpretarCompetencias(curriculumData);
        
        // Aplanar todas las competencias de todos los ámbitos
        const todasCompetencias = Object.values(competenciasAgrupadas).flat();
        
        console.log(`📊 Procesando ${todasCompetencias.length} competencias agrupadas`);
        
        // Crear matriz con la nueva estructura
        const matriz = {
            competencias: todasCompetencias.map(comp => ({
                id: comp.id,
                nombre: comp.nombre,
                descripcion: comp.descripcion,
                ambito: comp.ambito,
                nivelBloom: comp.nivelBloom,
                cursos: comp.cursos,
                asignaturas: comp.asignaturasRelacionadas,
                rasConstituyentes: comp.rasConstituyentes?.length || 0,
                creditos: comp.creditosTotales,
                progresion: comp.progresion,
                instrumentosEvaluacion: comp.instrumentosEvaluacion
            })),
            metricas: this.calcularMetricasCompetencias(todasCompetencias),
            ambitos: this.agruparPorAmbitos(todasCompetencias),
            distribucionBloom: this.analizarDistribucionBloom(todasCompetencias),
            progresionCurricular: this.analizarProgresionCurricular(todasCompetencias)
        };
        
        return matriz;
        
    } catch (error) {
        console.error('❌ Error al generar matriz de competencias:', error);
        throw error;
    }
}

// NUEVOS MÉTODOS PARA LA NUEVA ESTRUCTURA
static calcularMetricasCompetencias(competencias) {
    return {
        totalCompetencias: competencias.length,
        totalRAs: competencias.reduce((sum, comp) => sum + (comp.rasConstituyentes?.length || 0), 0),
        promedioRAsPorCompetencia: competencias.length > 0 ? 
            (competencias.reduce((sum, comp) => sum + (comp.rasConstituyentes?.length || 0), 0) / competencias.length).toFixed(1) : 0,
        competenciasConProgresion: competencias.filter(comp => comp.cursos.length > 1).length,
        distribucionCursos: this.calcularDistribucionCursos(competencias)
    };
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
    
    static calcularMetricasCompetencias(competenciasAgrupadas) {
        const metricas = {
            totalCompetencias: 0,
            porAmbito: {},
            porNivelBloom: {},
            porCurso: {1: 0, 2: 0, 3: 0, 4: 0}
        };
        
        Object.entries(competenciasAgrupadas).forEach(([ambito, competencias]) => {
            metricas.porAmbito[ambito] = competencias.length;
            metricas.totalCompetencias += competencias.length;
            
            competencias.forEach(comp => {
                // Contar por nivel Bloom
                metricas.porNivelBloom[comp.nivelBloom] = (metricas.porNivelBloom[comp.nivelBloom] || 0) + 1;
                
                // Contar por curso
                if (comp.cursoRecomendado && metricas.porCurso[comp.cursoRecomendado] !== undefined) {
                    metricas.porCurso[comp.cursoRecomendado]++;
                }
            });
        });
        
        return metricas;
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




