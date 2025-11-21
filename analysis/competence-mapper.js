// 📁 analysis/competence-mapper.js - ACTUALIZADO
class CompetenceMapper {
    static async generarMatrizCompetenciasRA(curriculumData) {
        console.log("🔄 Generando matriz de competencias desde API...");
        
        try {
            // 1. Llamar a la API para interpretar competencias
            const competenciasAgrupadas = await AnecaAPI.interpretarCompetencias(curriculumData);
            
            // 2. Calcular métricas
            const metricas = this.calcularMetricasCompetencias(competenciasAgrupadas);
            
            // 3. Generar alertas
            const alertas = this.generarAlertasCompetencias(competenciasAgrupadas, metricas);
            
            return {
                matriz: {
                    competencias: this.aplanarCompetencias(competenciasAgrupadas),
                    ambitos: competenciasAgrupadas,
                    coberturaRA: this.calcularCoberturaRA(competenciasAgrupadas),
                    nivelesBloom: this.analizarNivelesBloom(competenciasAgrupadas),
                    evidencias: this.generarEvidencias(competenciasAgrupadas)
                },
                metricas: metricas,
                alertas: alertas
            };
            
        } catch (error) {
            console.error("❌ Error al generar competencias:", error);
            return this.estructuraVacia();
        }
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
