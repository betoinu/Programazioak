export class CurriculumCoverage {
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
}