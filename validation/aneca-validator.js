export class AnecaValidator {
    static validarCumplimientoCompleto(curriculumData) {
        const validaciones = {
            perfilEgreso: this.validarPerfilEgreso(curriculumData),
            coberturaCurricular: this.validarCoberturaCurricular(curriculumData),
            sistemaEvaluacion: this.validarSistemaEvaluacion(curriculumData),
            mejoraContinua: this.validarMejoraContinua(curriculumData)
        };
        
        return {
            validaciones,
            puntuacionGlobal: this.calcularPuntuacionGlobal(validaciones),
            cumplimientoPorcentaje: this.calcularPorcentajeCumplimiento(validaciones),
            informeANECA: this.generarInformeANECA(validaciones)
        };
    }
    
    static validarPerfilEgreso(curriculumData) {
        const competencias = curriculumData.competencias || [];
        const RAs = curriculumData.resultadosAprendizaje || [];
        
        return {
            criterio: "Claridad y coherencia del perfil de egreso",
            cumplimiento: {
                competenciasClaras: this.evaluarClaridadCompetencias(competencias),
                RAsMedibles: this.evaluarMedibilidadRAs(RAs),
                alineacionCompetenciasRAs: this.evaluarAlineacion(competencias, RAs)
            },
            evidencias: this.recopilarEvidenciasPerfilEgreso(curriculumData),
            puntuacion: this.calcularPuntuacionPerfil(competencias, RAs)
        };
    }
    
    static validarCoberturaCurricular(curriculumData) {
        const matrizCobertura = CurriculumCoverage.generarMatrizRAsignaturas(curriculumData);
        
        return {
            criterio: "Cobertura curricular completa y equilibrada",
            cumplimiento: {
                coberturaMinima: matrizCobertura.metricas.porcentajeCoberturaMinima >= 90,
                profundizacionSuficiente: matrizCobertura.metricas.porcentajeConProfundizacion >= 70,
                secuenciaLogica: this.validarSecuenciaProgresion(curriculumData)
            },
            metricas: matrizCobertura.metricas,
            alertas: matrizCobertura.alertas,
            puntuacion: this.calcularPuntuacionCobertura(matrizCobertura)
        };
    }
    
    static generarInformeANECA(validaciones) {
        const informe = {
            fechaGeneracion: new Date().toISOString(),
            resumenEjecutivo: this.generarResumenEjecutivo(validaciones),
            puntosFuertes: this.identificarPuntosFuertes(validaciones),
            areasMejora: this.identificarAreasMejora(validaciones),
            recomendacionesPrioritarias: this.generarRecomendacionesPrioritarias(validaciones),
            checklistANECA: this.generarChecklistANECA(validaciones)
        };
        
        return informe;
    }
    
    static generarChecklistANECA(validaciones) {
        return [
            {
                item: "A1. Competencias claramente formuladas",
                cumplido: validaciones.perfilEgreso.cumplimiento.competenciasClaras,
                evidencia: validaciones.perfilEgreso.evidencias,
                observaciones: "Verificar uso de verbos observables"
            },
            {
                item: "B1. Todos los RA mapeados a asignaturas", 
                cumplido: validaciones.coberturaCurricular.cumplimiento.coberturaMinima,
                evidencia: `Cobertura: ${validaciones.coberturaCurricular.metricas.porcentajeCoberturaMinima}%`,
                observaciones: validaciones.coberturaCurricular.alertas.length > 0 ? 
                    `Existen ${validaciones.coberturaCurricular.alertas.length} alertas` : "OK"
            },
            {
                item: "C1. Existencia de rúbricas de evaluación",
                cumplido: validaciones.sistemaEvaluacion.cumplimiento.rubricasExisten,
                evidencia: validaciones.sistemaEvaluacion.evidencias,
                observaciones: "Documentar en manual de evaluación"
            }
        ];
    }
    static evaluarClaridadCompetencias(competencias) {
    let score = 0;
    competencias.forEach(comp => {
        if (comp.descripcion && comp.descripcion.length > 20) score += 1;
        if (comp.codigo) score += 1;
        if (comp.descripcion?.includes('ser capaz de')) score += 1;
    });
    return score / (competencias.length * 3);
}

    static evaluarMedibilidadRAs(RAs) {
        let score = 0;
        const verbosMedibles = ['analizar', 'diseñar', 'evaluar', 'crear', 'resolver', 'implementar'];
        
        RAs.forEach(ra => {
            const texto = ra.descripcion?.toLowerCase() || ra.toLowerCase();
            if (verbosMedibles.some(verbo => texto.includes(verbo))) score += 1;
        });
        
        return score / RAs.length;
    }
    
    static evaluarAlineacion(competencias, RAs) {
        const competenciasText = competencias.map(c => c.descripcion?.toLowerCase() || c.toLowerCase()).join(' ');
        const RAsText = RAs.map(ra => ra.descripcion?.toLowerCase() || ra.toLowerCase()).join(' ');
        
        const palabrasComunes = competenciasText.split(' ')
            .filter(palabra => RAsText.includes(palabra) && palabra.length > 4);
        
        return palabrasComunes.length / Math.max(competencias.length, RAs.length);
    }
    
    static recopilarEvidenciasPerfilEgreso(curriculumData) {
        return [
            'Documento de plan de estudios',
            'Matriz de competencias', 
            'Resultados de aprendizaje definidos'
        ];
    }
    
    static validarSecuenciaProgresion(curriculumData) {
    // Validación básica de secuencia
    const cursos = [1, 2, 3, 4];
    let secuenciaValida = true;
    
    cursos.forEach(curso => {
        const asignaturasCurso = curriculumData.asignaturas?.filter(a => a.curso === curso) || [];
        if (asignaturasCurso.length === 0) secuenciaValida = false;
    });
    
    return secuenciaValida;
}
    static calcularPuntuacionPerfil(competencias, RAs) {
        const claridad = this.evaluarClaridadCompetencias(competencias);
        const medibilidad = this.evaluarMedibilidadRAs(RAs);
        const alineacion = this.evaluarAlineacion(competencias, RAs);
        
        return (claridad + medibilidad + alineacion) / 3;
    }
    static calcularPuntuacionCobertura(matrizCobertura) {
    return matrizCobertura.cumplimientoANECA || 75;
}
    static validarSistemaEvaluacion(curriculumData) {
    return {
        criterio: "Sistema de evaluación basado en evidencias",
        cumplimiento: {
            rubricasExisten: this.verificarExistenciaRubricas(curriculumData),
            evidenciasDefinidas: this.verificarEvidenciasEvaluacion(curriculumData),
            portafoliosUtilizados: this.verificarPortafolios(curriculumData)
        },
        evidencias: this.recopilarEvidenciasEvaluacion(curriculumData),
        puntuacion: this.verificarExistenciaRubricas(curriculumData) ? 0.7 : 0.3
    };
}

static validarMejoraContinua(curriculumData) {
    return {
        criterio: "Sistema de mejora continua documentado",
        cumplimiento: {
            planMejoraExiste: curriculumData.planMejora !== undefined,
            participacionStakeholders: curriculumData.stakeholders !== undefined,
            usoResultadosEvaluacion: curriculumData.resultadosEvaluacion !== undefined
        },
        evidencias: curriculumData.planMejora ? ['Plan de mejora documentado'] : ['Plan de mejora pendiente'],
        puntuacion: curriculumData.planMejora ? 0.6 : 0.2
    };
}

static calcularPuntuacionGlobal(validaciones) {
    const puntuaciones = Object.values(validaciones).map(v => v.puntuacion || 0);
    return (puntuaciones.reduce((a, b) => a + b, 0) / puntuaciones.length) * 100;
}

static calcularPorcentajeCumplimiento(validaciones) {
    const cumplimientos = Object.values(validaciones).flatMap(v => 
        Object.values(v.cumplimiento || {})
    );
    const cumplidos = cumplimientos.filter(c => c === true).length;
    return (cumplidos / cumplimientos.length) * 100;
}

static generarResumenEjecutivo(validaciones) {
    const puntuacionGlobal = this.calcularPuntuacionGlobal(validaciones);
    const porcentajeCumplimiento = this.calcularPorcentajeCumplimiento(validaciones);
    
    return `RESUMEN EJECUTIVO ANECA
• Puntuación Global: ${puntuacionGlobal.toFixed(1)}/100
• Cumplimiento: ${porcentajeCumplimiento.toFixed(1)}%
• Perfil de Egreso: ${(validaciones.perfilEgreso?.puntuacion * 100 || 0).toFixed(1)}%
• Cobertura Curricular: ${(validaciones.coberturaCurricular?.puntuacion * 100 || 0).toFixed(1)}%
• Sistema Evaluación: ${(validaciones.sistemaEvaluacion?.puntuacion * 100 || 0).toFixed(1)}%`;
}

static identificarPuntosFuertes(validaciones) {
    const puntos = [];
    if (validaciones.perfilEgreso?.puntuacion > 0.7) puntos.push('Perfil de egreso bien definido');
    if (validaciones.coberturaCurricular?.puntuacion > 0.7) puntos.push('Cobertura curricular adecuada');
    if (validaciones.sistemaEvaluacion?.puntuacion > 0.6) puntos.push('Sistema de evaluación implementado');
    return puntos.length > 0 ? puntos : ['Estructura básica establecida'];
}

static identificarAreasMejora(validaciones) {
    const areas = [];
    if (!validaciones.sistemaEvaluacion?.cumplimiento?.rubricasExisten) areas.push('Implementar rúbricas de evaluación');
    if (!validaciones.mejoraContinua?.cumplimiento?.planMejoraExiste) areas.push('Desarrollar plan de mejora continua');
    if (validaciones.perfilEgreso?.puntuacion < 0.6) areas.push('Mejorar definición del perfil de egreso');
    return areas;
}

static generarRecomendacionesPrioritarias(validaciones) {
    return [
        'Completar sistema de evaluación con rúbricas detalladas',
        'Documentar procedimientos de mejora continua',
        'Fortalecer la participación de stakeholders en la evaluación',
        'Revisar la secuenciación de competencias complejas'
    ];
}

// MÉTODOS AUXILIARES
static verificarExistenciaRubricas(curriculumData) {
    return curriculumData.rubricas !== undefined && curriculumData.rubricas.length > 0;
}

static verificarEvidenciasEvaluacion(curriculumData) {
    return curriculumData.evidenciasEvaluacion !== undefined;
}

static verificarPortafolios(curriculumData) {
    return curriculumData.portafolios !== undefined;
}

static recopilarEvidenciasEvaluacion(curriculumData) {
    const evidencias = [];
    if (this.verificarExistenciaRubricas(curriculumData)) evidencias.push('Rúbricas de evaluación');
    if (this.verificarPortafolios(curriculumData)) evidencias.push('Portafolios estudiantiles');
    if (curriculumData.evidenciasEvaluacion) evidencias.push('Evidencias de evaluación documentadas');
    return evidencias.length > 0 ? evidencias : ['Sistema de evaluación en desarrollo'];
}
  }









