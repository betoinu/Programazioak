export class CurriculumCoverage {
    static generarMatrizRAsignaturas(curriculumData) {
        const matriz = [];
        const alertas = [];
        
        // Para cada Resultado de Aprendizaje
        curriculumData.resultadosAprendizaje?.forEach(ra => {
            const asignaturasQueCubren = this.identificarAsignaturasPorRA(ra, curriculumData);
            const nivelesContribucion = this.calcularNivelesContribucion(asignaturasQueCubren, ra);
            const analisisANECA = this.analizarCumplimientoANECA(asignaturasQueCubren, nivelesContribucion);
            
            const coberturaRA = {
                resultadoAprendizaje: ra.descripcion || ra,
                codigo: ra.codigo || `RA${ra.id}`,
                asignaturas: asignaturasQueCubren,
                niveles: nivelesContribucion,
                cumpleMinimoANECA: asignaturasQueCubren.length >= 2,
                tieneProfundizacion: nivelesContribucion.includes('Dp'),
                // ✅ NUEVOS CAMPOS ANECA:
                analisisANECA: analisisANECA,
                secuenciaProgresion: this.analizarSecuenciaProgresion(asignaturasQueCubren),
                evidenciasDetalladas: this.generarEvidenciasDetalladas(asignaturasQueCubren, ra),
                alertas: this.generarAlertasCobertura(asignaturasQueCubren, nivelesContribucion)
            };
            
            matriz.push(coberturaRA);
            
            // ✅ MEJORA: Alertas ANECA más específicas
            if (!coberturaRA.cumpleMinimoANECA) {
                alertas.push({
                    tipo: 'HUECO_CURRICULAR_ANECA',
                    mensaje: `RA "${ra.codigo || 'Sin código'}" - ${ra.descripcion?.substring(0, 50)}... tiene solo ${asignaturasQueCubren.length} asignatura(s)`,
                    gravedad: 'ALTA',
                    criterioANECA: 'B1: Todos los RA deben estar mapeados a al menos 2 asignaturas',
                    accion: 'Añadir al menos una asignatura más que cubra este RA',
                    asignaturasSugeridas: this.sugerirAsignaturasCompatibles(ra, curriculumData)
                });
            }
            
            if (!coberturaRA.tieneProfundizacion) {
                alertas.push({
                    tipo: 'FALTA_PROFUNDIZACION',
                    mensaje: `RA "${ra.descripcion?.substring(0, 50)}..." no tiene nivel de dominio/profundización`,
                    gravedad: 'MEDIA',
                    criterioANECA: 'B2: Debe existir al menos una asignatura en nivel Dp por RA',
                    accion: 'Incluir asignatura con nivel Dp para este RA',
                    asignaturasSugeridas: this.sugerirAsignaturasDominio(ra, curriculumData)
                });
            }

            // ✅ NUEVO: Alerta por secuencia incorrecta
            if (!coberturaRA.secuenciaProgresion.esValida) {
                alertas.push({
                    tipo: 'SECUENCIA_PROGRESION',
                    mensaje: `RA "${ra.codigo}" tiene problemas en la secuencia I→D→Dp`,
                    gravedad: 'MEDIA',
                    detalles: coberturaRA.secuenciaProgresion.problemas
                });
            }
        });
        
        return {
            matriz,
            metricas: this.calcularMetricasCobertura(matriz),
            alertas,
            cumplimientoANECA: this.calcularPorcentajeCumplimiento(matriz),
            // ✅ NUEVO: Análisis ANECA completo
            analisisANECA: this.generarAnalisisANECACompleto(matriz, curriculumData)
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
        const palabrasIntroductorias = ['introduc', 'básic', 'fundament', 'inicial', 'concepto', 'definir'];
        const palabrasDesarrollo = ['desarroll', 'aplic', 'implement', 'ejercic', 'práctica', 'analizar', 'comparar'];
        const palabrasProfundizacion = ['profund', 'avanzad', 'complex', 'investig', 'proyecto', 'integrado', 'evaluar', 'diseñar', 'crear'];
        
        // ✅ MEJORA: Análisis más preciso por verbos de Bloom
        const textoCompleto = textoAsignatura.toLowerCase();
        let puntuacion = 0;
        
        if (palabrasProfundizacion.some(p => textoCompleto.includes(p))) puntuacion += 3;
        if (palabrasDesarrollo.some(p => textoCompleto.includes(p))) puntuacion += 2;
        if (palabrasIntroductorias.some(p => textoCompleto.includes(p))) puntuacion += 1;
        
        // ✅ NUEVO: Determinar nivel basado en puntuación
        if (puntuacion >= 3) return 'Dp';
        if (puntuacion >= 2) return 'D';
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
            asignaturasSobrecargadas: this.identificarAsignaturasSobrecargadas(matriz),
            
            // ✅ NUEVAS MÉTRICAS ANECA:
            distribucionNiveles: this.calcularDistribucionNiveles(matriz),
            progresionGlobal: this.evaluarProgresionGlobal(matriz),
            puntuacionANECA: this.calcularPuntuacionANECA(matriz)
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

    // === MÉTODOS ANECA FALTANTES ===

    static analizarCumplimientoANECA(asignaturas, niveles) {
        return {
            cumpleCriterioB1: asignaturas.length >= 2,
            cumpleCriterioB2: niveles.includes('Dp'),
            asignaturasContribuyentes: asignaturas.length,
            nivelesPresentes: niveles,
            estado: (asignaturas.length >= 2 && niveles.includes('Dp')) ? 'CUMPLE' : 'NO_CUMPLE',
            recomendaciones: this.generarRecomendacionesANECA(asignaturas, niveles)
        };
    }

    static analizarSecuenciaProgresion(asignaturas) {
        const cursos = {};
        const problemas = [];
        
        asignaturas.forEach(asignatura => {
            if (asignatura.curso && asignatura.nivelContribucion) {
                if (!cursos[asignatura.curso]) {
                    cursos[asignatura.curso] = [];
                }
                cursos[asignatura.curso].push(asignatura.nivelContribucion);
            }
        });
        
        // Validar secuencia I→D→Dp
        const cursosOrdenados = Object.keys(cursos).sort();
        for (let i = 0; i < cursosOrdenados.length - 1; i++) {
            const cursoActual = cursos[cursosOrdenados[i]];
            const cursoSiguiente = cursos[cursosOrdenados[i + 1]];
            
            if (cursoActual.includes('Dp') && !cursoSiguiente.includes('Dp')) {
                problemas.push(`Curso ${cursosOrdenados[i]} tiene Dp pero ${cursosOrdenados[i + 1]} no`);
            }
        }
        
        return {
            cursos: cursos,
            esValida: problemas.length === 0,
            problemas: problemas
        };
    }

    static generarEvidenciasDetalladas(asignaturas, ra) {
        return asignaturas.map(asignatura => ({
            asignatura: asignatura.asignatura,
            nivel: asignatura.nivelContribucion,
            evidencias: asignatura.evidencias || this.generarEvidenciasPorNivel(asignatura.nivelContribucion),
            instrumentosEvaluacion: this.mapearInstrumentosEvaluacion(asignatura.nivelContribucion),
            actividades: this.sugerirActividadesPorNivel(asignatura.nivelContribucion)
        }));
    }

    static calcularDistribucionNiveles(matriz) {
        const distribucion = { I: 0, D: 0, Dp: 0 };
        
        matriz.forEach(ra => {
            ra.asignaturas.forEach(asignatura => {
                if (distribucion[asignatura.nivelContribucion] !== undefined) {
                    distribucion[asignatura.nivelContribucion]++;
                }
            });
        });
        
        return distribucion;
    }

    static evaluarProgresionGlobal(matriz) {
        let progresionCorrecta = 0;
        let totalRA = 0;
        
        matriz.forEach(ra => {
            if (ra.secuenciaProgresion.esValida) {
                progresionCorrecta++;
            }
            totalRA++;
        });
        
        return {
            porcentaje: (progresionCorrecta / totalRA) * 100,
            totalRA: totalRA,
            conProgresionCorrecta: progresionCorrecta
        };
    }

    static calcularPuntuacionANECA(matriz) {
        let puntuacion = 0;
        const totalRA = matriz.length;
        
        matriz.forEach(ra => {
            if (ra.cumpleMinimoANECA) puntuacion += 40;
            if (ra.tieneProfundizacion) puntuacion += 30;
            if (ra.secuenciaProgresion.esValida) puntuacion += 30;
        });
        
        return totalRA > 0 ? (puntuacion / totalRA) : 0;
    }

    static generarAnalisisANECACompleto(matriz, curriculumData) {
        return {
            criterioB1: this.evaluarCriterioB1(matriz),
            criterioB2: this.evaluarCriterioB2(matriz),
            mapaCurricular: this.generarMapaCurricular(matriz, curriculumData),
            recomendacionesGlobales: this.generarRecomendacionesGlobales(matriz)
        };
    }

    static evaluarCriterioB1(matriz) {
        const totalRA = matriz.length;
        const raCumplen = matriz.filter(ra => ra.cumpleMinimoANECA).length;
        
        return {
            cumplido: raCumplen === totalRA,
            porcentaje: (raCumplen / totalRA) * 100,
            totalRA: totalRA,
            raCumplen: raCumplen
        };
    }

    static evaluarCriterioB2(matriz) {
        const totalRA = matriz.length;
        const raConDominio = matriz.filter(ra => ra.tieneProfundizacion).length;
        
        return {
            cumplido: raConDominio > 0,
            porcentaje: (raConDominio / totalRA) * 100,
            totalRA: totalRA,
            raConDominio: raConDominio
        };
    }

    static generarMapaCurricular(matriz, curriculumData) {
        return {
            asignaturas: curriculumData.asignaturas?.length || 0,
            cursos: this.obtenerCursos(curriculumData),
            distribucion: this.calcularDistribucionCursos(matriz)
        };
    }

    static generarRecomendacionesGlobales(matriz) {
        const problemas = [];
        
        if (matriz.filter(ra => !ra.cumpleMinimoANECA).length > 0) {
            problemas.push("Algunos RA no tienen cobertura mínima de 2 asignaturas");
        }
        
        if (matriz.filter(ra => !ra.tieneProfundizacion).length > 0) {
            problemas.push("Falta nivel de dominio (Dp) en algunos RA");
        }
        
        return problemas.length > 0 ? problemas : ["Cumple con los criterios ANECA"];
    }

    // === MÉTODOS AUXILIARES ===

    static obtenerCursos(curriculumData) {
        const cursos = new Set();
        curriculumData.asignaturas?.forEach(asig => {
            if (asig.curso) cursos.add(asig.curso);
        });
        return Array.from(cursos).sort();
    }

    static calcularDistribucionCursos(matriz) {
        const distribucion = {};
        matriz.forEach(ra => {
            ra.asignaturas?.forEach(asig => {
                if (asig.curso) {
                    distribucion[asig.curso] = (distribucion[asig.curso] || 0) + 1;
                }
            });
        });
        return distribucion;
    }

    static sugerirAsignaturasCompatibles(ra, curriculumData) {
        return curriculumData.asignaturas
            ?.filter(a => this.esAsignaturaCompatible(a, ra))
            ?.slice(0, 3)
            ?.map(a => a.nombre) || [];
    }

    static sugerirAsignaturasDominio(ra, curriculumData) {
        return curriculumData.asignaturas
            ?.filter(a => a.curso === 4 || a.tipo === 'proyecto' || a.tipo === 'tfg')
            ?.slice(0, 2)
            ?.map(a => a.nombre) || [];
    }

    static generarEvidenciasPorNivel(nivel) {
        const evidencias = {
            'I': ['Ejercicios básicos', 'Cuestionarios', 'Participación'],
            'D': ['Casos prácticos', 'Informes', 'Simulaciones'],
            'Dp': ['Proyectos complejos', 'Investigaciones', 'Defensas']
        };
        return evidencias[nivel] || ['Actividades de aprendizaje'];
    }

    static mapearInstrumentosEvaluacion(nivel) {
        const instrumentos = {
            'I': ['Rúbrica básica', 'Lista de cotejo'],
            'D': ['Rúbrica analítica', 'Escala de valoración'],
            'Dp': ['Rúbrica compleja', 'Portafolio', 'Evaluación por pares']
        };
        return instrumentos[nivel] || ['Instrumento de evaluación'];
    }

    static sugerirActividadesPorNivel(nivel) {
        const actividades = {
            'I': ['Ejercicios guiados', 'Lecturas básicas', 'Discusiones dirigidas'],
            'D': ['Casos prácticos', 'Simulaciones', 'Proyectos pequeños'],
            'Dp': ['Proyectos integradores', 'Investigaciones', 'Defensas públicas']
        };
        return actividades[nivel] || ['Actividades de aprendizaje'];
    }

    static generarRecomendacionesANECA(asignaturas, niveles) {
        const recomendaciones = [];
        if (asignaturas.length < 2) {
            recomendaciones.push('Añadir al menos una asignatura más para cumplir criterio ANECA');
        }
        if (!niveles.includes('Dp')) {
            recomendaciones.push('Incluir asignatura con nivel de dominio (Dp)');
        }
        return recomendaciones;
    }

    static esAsignaturaCompatible(asignatura, ra) {
        // Lógica básica de compatibilidad
        const textoAsignatura = [
            ...(asignatura.contenidos || []),
            ...(asignatura.objetivos || []),
            ...(asignatura.competencias || [])
        ].join(' ').toLowerCase();
        
        const textoRA = ra.descripcion?.toLowerCase() || ra.toLowerCase();
        return this.hayCoincidenciaRA(textoRA, textoAsignatura);
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
} // ✅ ÚNICA LLAVE DE CIERRE AL FINAL
