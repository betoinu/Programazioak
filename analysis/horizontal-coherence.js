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
            
            // ✅ MEJORA: Añadir análisis ANECA detallado
            const analisisANECA = this.analizarCumplimientoHorizontalANECA(fila, asignatura);
            
            // ✅ AMPLIAR la fila con análisis ANECA
            fila.analisisANECA = analisisANECA;
            fila.equilibrioCompetencias = this.evaluarEquilibrioCompetencias(fila.competencias);
            fila.coberturaTipos = this.analizarCoberturaTiposCompetencias(fila.competencias, curriculumData);
            fila.alertas = this.generarAlertasHorizontalANECA(fila, analisisANECA);
            
            // ✅ ACTUALIZAR observaciones con información ANECA
            fila.observaciones = this.generarObservacionesANECA(fila, analisisANECA);
            
            matriz.push(fila);
        });
        
        return {
            matriz,
            distribucionCarga,
            desequilibrios: this.identificarDesequilibrios(distribucionCarga),
            recomendaciones: this.generarRecomendacionesEquilibrio(this.identificarDesequilibrios(distribucionCarga)),
            // ✅ NUEVO: Métricas ANECA para coherencia horizontal
            metricasANECA: this.calcularMetricasHorizontalANECA(matriz, distribucionCarga),
            cumplimientoANECA: this.evaluarCumplimientoHorizontalGlobal(matriz)
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
                    asignaturas: datos.asignaturas,
                    // ✅ NUEVO: Información ANECA
                    criterioANECA: 'Distribución equilibrada de carga formativa',
                    impacto: datos.totalCreditos > promedio ? 'Saturación de contenidos' : 'Falta de desarrollo competencial'
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
                    asignaturasRevisar: deseq.asignaturas.slice(0, 3),
                    // ✅ NUEVO: Recomendación ANECA específica
                    criterioANECA: 'Evitar concentración excesiva en competencias específicas',
                    prioridad: 'ALTA'
                };
            } else {
                return {
                    competencia: deseq.competencia,
                    accion: 'Reforzar con nuevas actividades o asignaturas',
                    sugerencia: 'Considerar taller específico o proyecto integrador',
                    // ✅ NUEVO: Recomendación ANECA específica
                    criterioANECA: 'Garantizar desarrollo suficiente de todas las competencias',
                    prioridad: 'MEDIA'
                };
            }
        });
    }

    static determinarNivelCompetencia(competencia, asignatura) {
        const texto = (asignatura.contenidos?.join(' ') + ' ' + asignatura.objetivos?.join(' ')).toLowerCase();
        const competenciaText = competencia.descripcion?.toLowerCase() || competencia.toLowerCase();
        
        // ✅ MEJORA: Niveles alineados con ANECA (I/D/Dp)
        if (texto.includes('avanzado') || texto.includes('profund') || texto.includes('complex') || texto.includes('investig')) 
            return 'Dp';
        if (texto.includes('intermedio') || texto.includes('desarroll') || texto.includes('aplic') || texto.includes('analizar')) 
            return 'D';
        return 'I';
    }
    static calcularPesoCompetencia(competencia, asignatura) {
        // Peso basado en créditos y nivel de competencia
        const creditos = asignatura.creditos || 3;
        const nivel = this.determinarNivelCompetencia(competencia, asignatura);
        
        // ✅ MEJORA: Pesos alineados con importancia ANECA
        const pesos = { 'I': 1, 'D': 2, 'Dp': 3 };
        return creditos * (pesos[nivel] || 1);
    }
    
    static analizarEquilibrioAsignatura(fila) {
        const totalCompetencias = fila.competencias.length;
        
        if (totalCompetencias === 0) return 'Sin competencias definidas';
        if (totalCompetencias > 5) return 'Posible sobrecarga de competencias';
        if (totalCompetencias === 1) return 'Competencia única - considerar diversificar';
        
        return 'Equilibrio adecuado';
    }
        // === MÉTODOS NUEVOS PARA MATRIZ 3 ANECA ===

    // ✅ NUEVO: Analizar cumplimiento ANECA para coherencia horizontal
    static analizarCumplimientoHorizontalANECA(fila, asignatura) {
        const totalCompetencias = fila.competencias.length;
        const sumaPesos = fila.competencias.reduce((sum, comp) => sum + comp.peso, 0);
        const niveles = fila.competencias.map(comp => comp.nivel);
        
        return {
            totalCompetencias: totalCompetencias,
            sumaPesos: sumaPesos,
            nivelesPresentes: [...new Set(niveles)],
            sobrecargada: totalCompetencias > 5 || sumaPesos > (asignatura.creditos * 2),
            subcargada: totalCompetencias < 2 && asignatura.creditos >= 3,
            equilibrioAdecuado: totalCompetencias >= 2 && totalCompetencias <= 5 && sumaPesos <= (asignatura.creditos * 2),
            problemasEquilibrio: this.identificarProblemasEquilibrio(fila.competencias, asignatura)
        };
    }

    // ✅ NUEVO: Evaluar equilibrio de competencias
    static evaluarEquilibrioCompetencias(competencias) {
        if (competencias.length === 0) return { puntuacion: 0, estado: 'SIN_COMPETENCIAS' };
        
        const pesos = competencias.map(c => c.peso);
        const promedio = pesos.reduce((a, b) => a + b, 0) / pesos.length;
        const desviacion = Math.sqrt(pesos.reduce((acc, peso) => acc + Math.pow(peso - promedio, 2), 0) / pesos.length);
        
        return {
            puntuacion: Math.max(0, 100 - (desviacion * 20)),
            estado: desviacion < 1 ? 'EQUILIBRADO' : desviacion < 2 ? 'MODERADO' : 'DESEQUILIBRADO',
            desviacion: desviacion,
            competenciaMaxima: competencias.reduce((max, c) => c.peso > max.peso ? c : max, competencias[0]),
            competenciaMinima: competencias.reduce((min, c) => c.peso < min.peso ? c : min, competencias[0])
        };
    }

    // ✅ NUEVO: Analizar cobertura de tipos de competencias
    static analizarCoberturaTiposCompetencias(competencias, curriculumData) {
        const tipos = {
            basicas: 0,
            transversales: 0,
            especificas: 0
        };
        
        competencias.forEach(comp => {
            const competenciaObj = this.buscarCompetenciaCompleta(comp.codigo, curriculumData);
            if (competenciaObj?.ambito) {
                if (competenciaObj.ambito.includes('básic') || competenciaObj.ambito.includes('general')) {
                    tipos.basicas++;
                } else if (competenciaObj.ambito.includes('transversal') || competenciaObj.ambito.includes('genéric')) {
                    tipos.transversales++;
                } else {
                    tipos.especificas++;
                }
            }
        });
        
        return {
            ...tipos,
            total: competencias.length,
            balance: this.calcularBalanceTipos(tipos),
            recomendacion: this.generarRecomendacionTipos(tipos)
        };
    }

    // ✅ NUEVO: Generar alertas ANECA para coherencia horizontal
    static generarAlertasHorizontalANECA(fila, analisisANECA) {
        const alertas = [];
        
        if (analisisANECA.sobrecargada) {
            alertas.push({
                tipo: 'SOBRECARGA_ANECA',
                mensaje: `Asignatura con posible sobrecarga competencial (${fila.competencias.length} competencias)`,
                gravedad: 'MEDIA',
                criterio: 'Distribución equilibrada de carga formativa'
            });
        }
        
        if (analisisANECA.subcargada) {
            alertas.push({
                tipo: 'SUBCARGA_ANECA',
                mensaje: `Asignatura con insuficiente desarrollo competencial`,
                gravedad: 'BAJA',
                criterio: 'Cobertura adecuada de competencias por asignatura'
            });
        }
        
        if (fila.equilibrioCompetencias.estado === 'DESEQUILIBRADO') {
            alertas.push({
                tipo: 'DESEQUILIBRIO_INTERNO',
                mensaje: `Distribución interna desequilibrada entre competencias`,
                gravedad: 'MEDIA',
                detalles: `Competencia máxima: ${fila.equilibrioCompetencias.competenciaMaxima.codigo}`
            });
        }
        
        return alertas;
    }

    // ✅ NUEVO: Generar observaciones ANECA
    static generarObservacionesANECA(fila, analisisANECA) {
        const observaciones = [];
        
        if (analisisANECA.equilibrioAdecuado) {
            observaciones.push('Equilibrio competencial adecuado según criterios ANECA');
        } else {
            observaciones.push('Revisar distribución competencial para cumplir criterios ANECA');
        }
        
        if (fila.coberturaTipos.balance === 'BALANCEADO') {
            observaciones.push('Buena distribución de tipos de competencias');
        } else {
            observaciones.push(`Distribución de tipos: ${fila.coberturaTipos.recomendacion}`);
        }
        
        return observaciones.join('. ');
    }

    // ✅ NUEVO: Calcular métricas ANECA para coherencia horizontal
    static calcularMetricasHorizontalANECA(matriz, distribucionCarga) {
        const totalAsignaturas = matriz.length;
        const asignaturasEquilibradas = matriz.filter(a => a.analisisANECA.equilibrioAdecuado).length;
        const asignaturasSobrecargadas = matriz.filter(a => a.analisisANECA.sobrecargada).length;
        const asignaturasSubcargadas = matriz.filter(a => a.analisisANECA.subcargada).length;
        
        return {
            totalAsignaturas: totalAsignaturas,
            porcentajeEquilibrio: (asignaturasEquilibradas / totalAsignaturas) * 100,
            asignaturasSobrecargadas: asignaturasSobrecargadas,
            asignaturasSubcargadas: asignaturasSubcargadas,
            distribucionGlobal: this.analizarDistribucionGlobal(matriz),
            puntuacionCoherencia: this.calcularPuntuacionCoherenciaHorizontal(matriz)
        };
    }

    // ✅ NUEVO: Evaluar cumplimiento horizontal global
    static evaluarCumplimientoHorizontalGlobal(matriz) {
        const metricas = this.calcularMetricasHorizontalANECA(matriz, {});
        const puntuacion = metricas.puntuacionCoherencia;
        
        return {
            puntuacion: puntuacion,
            estado: puntuacion >= 80 ? 'CUMPLE' : puntuacion >= 60 ? 'PARCIAL' : 'NO_CUMPLE',
            criterios: {
                equilibrioAsignaturas: metricas.porcentajeEquilibrio >= 70,
                sinSobrecargasGraves: metricas.asignaturasSobrecargadas <= matriz.length * 0.1,
                distribucionAdecuada: metricas.distribucionGlobal.balance === 'ADEQUADO'
            }
        };
    }

    // ✅ NUEVO: Métodos auxiliares
    static identificarProblemasEquilibrio(competencias, asignatura) {
        const problemas = [];
        const creditos = asignatura.creditos || 3;
        
        if (competencias.length === 0) {
            problemas.push('Asignatura sin competencias definidas');
        }
        
        if (competencias.length > creditos * 2) {
            problemas.push(`Demasiadas competencias (${competencias.length}) para ${creditos} créditos`);
        }
        
        const niveles = competencias.map(c => c.nivel);
        if (!niveles.includes('Dp') && creditos >= 6) {
            problemas.push('Asignatura de muchos créditos sin nivel de profundización');
        }
        
        return problemas;
    }

    static calcularBalanceTipos(tipos) {
        const total = tipos.basicas + tipos.transversales + tipos.especificas;
        if (total === 0) return 'SIN_DATOS';
        
        const max = Math.max(tipos.basicas, tipos.transversales, tipos.especificas);
        const min = Math.min(tipos.basicas, tipos.transversales, tipos.especificas);
        
        return (max - min) <= 1 ? 'BALANCEADO' : 'DESBALANCEADO';
    }

    static generarRecomendacionTipos(tipos) {
        if (tipos.basicas === 0) return 'Incluir competencias básicas';
        if (tipos.transversales === 0) return 'Incorporar competencias transversales';
        if (tipos.especificas === 0) return 'Añadir competencias específicas';
        return 'Distribución adecuada de tipos';
    }

    static analizarDistribucionGlobal(matriz) {
        const competenciasCount = {};
        
        matriz.forEach(asignatura => {
            asignatura.competencias.forEach(comp => {
                competenciasCount[comp.codigo] = (competenciasCount[comp.codigo] || 0) + 1;
            });
        });
        
        const counts = Object.values(competenciasCount);
        const promedio = counts.reduce((a, b) => a + b, 0) / counts.length;
        const desviacion = Math.sqrt(counts.reduce((acc, count) => acc + Math.pow(count - promedio, 2), 0) / counts.length);
        
        return {
            promedioPorCompetencia: promedio,
            desviacion: desviacion,
            balance: desviacion < 1 ? 'ADEQUADO' : desviacion < 2 ? 'MODERADO' : 'INADECUADO'
        };
    }

    static calcularPuntuacionCoherenciaHorizontal(matriz) {
        let puntuacion = 0;
        const totalAsignaturas = matriz.length;
        
        matriz.forEach(asignatura => {
            if (asignatura.analisisANECA.equilibrioAdecuado) puntuacion += 40;
            if (asignatura.equilibrioCompetencias.estado === 'EQUILIBRADO') puntuacion += 30;
            if (asignatura.coberturaTipos.balance === 'BALANCEADO') puntuacion += 30;
        });
        
        return totalAsignaturas > 0 ? (puntuacion / totalAsignaturas) : 0;
    }

    static buscarCompetenciaCompleta(codigo, curriculumData) {
        // Buscar competencia completa en los datos del curriculum
        if (!curriculumData.competencias) return null;
        
        return curriculumData.competencias.find(comp => 
            comp.codigo === codigo || comp.id === codigo
        );
    }
}




