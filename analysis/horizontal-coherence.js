export class HorizontalCoherence {
    static generarMatrizCompetenciasAsignaturas(curriculumData) {
        const matriz = [];
        const distribucionCarga = {};
        
        curriculumData.asignaturas?.forEach(asignatura => {
            const fila = {
                asignatura: asignatura.nombre,
                curso: asignatura.curso,
                creditos: asignatura.creditos,
                competencias: [],
                observaciones: ''
            };
            
            // Mapear competencias de la asignatura
            asignatura.competencias?.forEach(competencia => {
                const competenciaInfo = {
                    codigo: competencia.codigo || competencia,
                    nivel: this.determinarNivelCompetencia(competencia, asignatura),
                    peso: this.calcularPesoCompetencia(competencia, asignatura)
                };
                
                fila.competencias.push(competenciaInfo);
                
                // Acumular para análisis de distribución
                if (!distribucionCarga[competencia]) {
                    distribucionCarga[competencia] = { totalCreditos: 0, asignaturas: [] };
                }
                distribucionCarga[competencia].totalCreditos += asignatura.creditos || 3;
                distribucionCarga[competencia].asignaturas.push(asignatura.nombre);
            });
            
            // Analizar equilibrio de la asignatura
            fila.observaciones = this.analizarEquilibrioAsignatura(fila);
            matriz.push(fila);
        });
        
        return {
            matriz,
            distribucionCarga,
            desequilibrios: this.identificarDesequilibrios(distribucionCarga),
            recomendaciones: this.generarRecomendacionesEquilibrio(desequilibrios)
        };
    }
    
    static identificarDesequilibrios(distribucionCarga) {
        const desequilibrios = [];
        const creditosPorCompetencia = Object.values(distribucionCarga).map(d => d.totalCreditos);
        const promedio = creditosPorCompetencia.reduce((a, b) => a + b, 0) / creditosPorCompetencia.length;
        
        Object.entries(distribucionCarga).forEach(([competencia, datos]) => {
            const diferencia = Math.abs(datos.totalCreditos - promedio);
            if (diferencia > promedio * 0.4) { // 40% de desviación
                desequilibrios.push({
                    competencia,
                    tipo: datos.totalCreditos > promedio ? 'SOBRECARGADA' : 'SUBCARGADA',
                    creditos: datos.totalCreditos,
                    diferencia: diferencia,
                    asignaturas: datos.asignaturas
                });
            }
        });
        
        return desequilibrios;
    }
    
    static generarRecomendacionesEquilibrio(desequilibrios) {
        return desequilibrios.map(deseq => {
            if (deseq.tipo === 'SOBRECARGADA') {
                return {
                    competencia: deseq.competencia,
                    accion: 'Redistribuir carga hacia competencias subcargadas',
                    asignaturasRevisar: deseq.asignaturas.slice(0, 3)
                };
            } else {
                return {
                    competencia: deseq.competencia,
                    accion: 'Reforzar con nuevas actividades o asignaturas',
                    sugerencia: 'Considerar taller específico o proyecto integrador'
                };
            }
        });
    }

}
