class CurriculumCoverage {
    static generarMatrizRAsignaturas(curriculumData) {
        const matriz = [];
        const alertas = [];
        
        // Para cada Resultado de Aprendizaje
        curriculumData.resultadosAprendizaje?.forEach(ra => {
            const asignaturasQueCubren = this.identificarAsignaturasPorRA(ra, curriculumData);
            const nivelesContribucion = this.calcularNivelesContribucion(asignaturasQueCubren, ra);
            
            const coberturaRA = {
                resultadoAprendizaje: ra.descripcion || ra,
                asignaturas: asignaturasQueCubren,
                niveles: nivelesContribucion,
                cumpleMinimoANECA: asignaturasQueCubren.length >= 2,
                tieneProfundizacion: nivelesContribucion.includes('Dp'),
                alertas: this.generarAlertasCobertura(asignaturasQueCubren, nivelesContribucion)
            };
            
            matriz.push(coberturaRA);
            
            // Generar alertas ANECA
            if (!coberturaRA.cumpleMinimoANECA) {
                alertas.push({
                    tipo: 'HUECO_CURRICULAR',
                    mensaje: `RA "${ra.descripcion?.substring(0, 50)}..." tiene solo ${asignaturasQueCubren.length} asignatura(s)`,
                    gravedad: 'ALTA',
                    accion: 'Añadir al menos una asignatura más que cubra este RA'
                });
            }
            
            if (!coberturaRA.tieneProfundizacion) {
                alertas.push({
                    tipo: 'FALTA_PROFUNDIZACION',
                    mensaje: `RA "${ra.descripcion?.substring(0, 50)}..." no tiene nivel de dominio/profundización`,
                    gravedad: 'MEDIA',
                    accion: 'Incluir asignatura con nivel Dp para este RA'
                });
            }
        });
        
        return {
            matriz,
            metricas: this.calcularMetricasCobertura(matriz),
            alertas,
            cumplimientoANECA: this.calcularPorcentajeCumplimiento(matriz)
        };
    }
    
    static identificarAsignaturasPorRA(ra, curriculumData) {
        const asignaturas = [];
        const textoRA = ra.descripcion?.toLowerCase() || ra.toLowerCase();
        
        curriculumData.asignaturas?.forEach(asignatura => {
            // Buscar coincidencias en contenidos, objetivos, competencias
            const contenidos = asignatura.contenidos?.join(' ')?.toLowerCase() || '';
            const objetivos = asignatura.objetivos?.join(' ')?.toLowerCase() || '';
            const competencias = asignatura.competencias?.join(' ')?.toLowerCase() || '';
            
            const textoAsignatura = contenidos + ' ' + objetivos + ' ' + competencias;
            
            if (this.hayCoincidenciaRA(textoRA, textoAsignatura)) {
                asignaturas.push({
                    asignatura: asignatura.nombre,
                    curso: asignatura.curso,
                    nivelContribucion: this.determinarNivelContribucion(textoRA, textoAsignatura),
                    evidencias: this.extraerEvidenciasContribucion(asignatura, ra)
                });
            }
        });
        
        return asignaturas;
    }
    
    static determinarNivelContribucion(ra, textoAsignatura) {
        const palabrasIntroductorias = ['introduc', 'básic', 'fundament', 'inicial', 'concepto'];
        const palabrasDesarrollo = ['desarroll', 'aplic', 'implement', 'ejercic', 'práctica'];
        const palabrasProfundizacion = ['profund', 'avanzad', 'complex', 'investig', 'proyecto', 'integrado'];
        
        if (palabrasProfundizacion.some(p => textoAsignatura.includes(p))) return 'Dp';
        if (palabrasDesarrollo.some(p => textoAsignatura.includes(p))) return 'D';
        return 'I';
    }
    
    static calcularMetricasCobertura(matriz) {
        const totalRAs = matriz.length;
        const RAsCumplenMinimo = matriz.filter(ra => ra.cumpleMinimoANECA).length;
        const RAsConProfundizacion = matriz.filter(ra => ra.tieneProfundizacion).length;
        
        return {
            porcentajeCoberturaMinima: (RAsCumplenMinimo / totalRAs) * 100,
            porcentajeConProfundizacion: (RAsConProfundizacion / totalRAs) * 100,
            huecosCurriculares: totalRAs - RAsCumplenMinimo,
            asignaturasSobrecargadas: this.identificarAsignaturasSobrecargadas(matriz)
        };
    }
    
    static identificarAsignaturasSobrecargadas(matriz) {
        const asignaturaCount = {};
        
        // Contar cuántos RAs tiene cada asignatura
        matriz.forEach(ra => {
            ra.asignaturas.forEach(asignatura => {
                const nombre = asignatura.asignatura;
                if (!asignaturaCount[nombre]) {
                    asignaturaCount[nombre] = 0;
                }
                asignaturaCount[nombre]++;
            });
        });
        
        // Identificar asignaturas con más de 5 RAs
        return Object.entries(asignaturaCount)
            .filter(([_, count]) => count > 5)
            .map(([nombre, count]) => ({
                asignatura: nombre,
                totalRAs: count,
                recomendacion: 'Considerar redistribuir carga'
            }));
    }

    static calcularNivelesContribucion(asignaturasQueCubren, ra) {
        const niveles = [];
        
        asignaturasQueCubren.forEach(asignatura => {
            if (asignatura.nivelContribucion) {
                niveles.push(asignatura.nivelContribucion);
            }
        });
        
        return [...new Set(niveles)]; // Eliminar duplicados
    }
    
    static generarAlertasCobertura(asignaturasQueCubren, nivelesContribucion) {
        const alertas = [];
        
        if (asignaturasQueCubren.length === 0) {
            alertas.push('RA no cubierto por ninguna asignatura');
        } else if (asignaturasQueCubren.length === 1) {
            alertas.push('RA cubierto por solo una asignatura');
        }
        
        if (!nivelesContribucion.includes('Dp')) {
            alertas.push('Falta nivel de profundización (Dp)');
        }
        
        return alertas;
    }
    
    static calcularPorcentajeCumplimiento(matriz) {
        const totalRAs = matriz.length;
        const RAsCumplenMinimo = matriz.filter(ra => ra.cumpleMinimoANECA).length;
        
        return (RAsCumplenMinimo / totalRAs) * 100;
    }
    
    static hayCoincidenciaRA(textoRA, textoAsignatura) {
        // Coincidencia básica por palabras clave
        const palabrasClave = textoRA.toLowerCase().split(' ').filter(p => p.length > 4);
        const textoAsignaturaLower = textoAsignatura.toLowerCase();
        
        return palabrasClave.some(palabra => 
            textoAsignaturaLower.includes(palabra)
        );
    }

    static extraerEvidenciasContribucion(asignatura, ra) {
    const evidencias = [];
    
    // Buscar evidencias en contenidos, objetivos, actividades
    const textoCombinado = [
        ...(asignatura.contenidos || []),
        ...(asignatura.objetivos || []),
        ...(asignatura.actividades || [])
    ].join(' ').toLowerCase();
    
    const textoRA = ra.descripcion?.toLowerCase() || ra.toLowerCase();
    
    // Coincidencias básicas
    if (textoCombinado.includes('proyecto') && textoRA.includes('proyecto')) {
        evidencias.push('Proyecto aplicado');
    }
    if (textoCombinado.includes('ejercicio') && textoRA.includes('aplicar')) {
        evidencias.push('Ejercicios prácticos');
    }
    if (textoCombinado.includes('caso') && textoRA.includes('analizar')) {
        evidencias.push('Estudios de caso');
    }
    
    return evidencias.length > 0 ? evidencias : ['Actividades de aprendizaje'];
}
    
}


