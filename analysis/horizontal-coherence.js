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
            recomendaciones: this.generarRecomendacionesEquilibrio(this.identificarDesequilibrios(distribucionCarga))
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

    static determinarNivelCompetencia(competencia, asignatura) {
    const texto = (asignatura.contenidos?.join(' ') + ' ' + asignatura.objetivos?.join(' ')).toLowerCase();
    const competenciaText = competencia.descripcion?.toLowerCase() || competencia.toLowerCase();
    
    if (texto.includes('avanzado') || texto.includes('profund')) return 'AVANZADO';
    if (texto.includes('intermedio') || texto.includes('desarroll')) return 'INTERMEDIO';
    return 'BÁSICO';
}

    static calcularPesoCompetencia(competencia, asignatura) {
        // Peso basado en créditos y nivel de competencia
        const creditos = asignatura.creditos || 3;
        const nivel = this.determinarNivelCompetencia(competencia, asignatura);
        
        const pesos = { 'BÁSICO': 0.3, 'INTERMEDIO': 0.6, 'AVANZADO': 1.0 };
        return creditos * (pesos[nivel] || 0.5);
    }
    
    static analizarEquilibrioAsignatura(fila) {
        const totalCompetencias = fila.competencias.length;
        
        if (totalCompetencias === 0) return 'Sin competencias definidas';
        if (totalCompetencias > 5) return 'Posible sobrecarga de competencias';
        if (totalCompetencias === 1) return 'Competencia única - considerar diversificar';
        
        return 'Equilibrio adecuado';
    }
    
}




