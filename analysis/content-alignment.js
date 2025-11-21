export class ContentAlignment {
    static generarMatrizContenidosRA(curriculumData) {
        const matriz = [];
        
        curriculumData.asignaturas?.forEach(asignatura => {
            asignatura.contenidos?.forEach(contenido => {
                const RAsRelacionados = this.identificarRAsPorContenido(contenido, asignatura, curriculumData);
                
                matriz.push({
                    asignatura: asignatura.nombre,
                    contenido: contenido,
                    RAsRelacionados: RAsRelacionados,
                    nivelContribucion: this.determinarNivelContenido(contenido, RAsRelacionados),
                    adecuacion: this.evaluarAdecuacionContenido(contenido, RAsRelacionados),
                    sugerencias: this.generarSugerenciasContenido(contenido, RAsRelacionados)
                });
            });
        });
        
        return {
            matriz,
            metricasAdecuacion: this.calcularMetricasAdecuacion(matriz),
            contenidosDesalineados: this.identificarContenidosDesalineados(matriz)
        };
    }
    
    static identificarRAsPorContenido(contenido, asignatura, curriculumData) {
        const RAs = [];
        const textoContenido = contenido.toLowerCase();
        
        curriculumData.resultadosAprendizaje?.forEach(ra => {
            const textoRA = ra.descripcion?.toLowerCase() || ra.toLowerCase();
            
            if (this.hayCoincidenciaSemantica(textoContenido, textoRA)) {
                RAs.push({
                    ra: ra.descripcion || ra,
                    fuerzaRelacion: this.calcularFuerzaRelacion(textoContenido, textoRA),
                    evidencias: this.identificarEvidenciasRelacion(contenido, ra)
                });
            }
        });
        
        return RAs.sort((a, b) => b.fuerzaRelacion - a.fuerzaRelacion);
    }
    
    static hayCoincidenciaSemantica(textoContenido, textoRA) {
        const palabrasClaveContenido = this.extraerPalabrasClave(textoContenido);
        const palabrasClaveRA = this.extraerPalabrasClave(textoRA);
        
        // Coincidencia por palabras clave significativas
        const coincidencias = palabrasClaveContenido.filter(palabra => 
            palabrasClaveRA.includes(palabra)
        );
        
        return coincidencias.length >= 2; // Mínimo 2 coincidencias
    }
    
    static extraerPalabrasClave(texto) {
        const stopWords = ['de', 'la', 'el', 'y', 'en', 'a', 'los', 'las', 'del', 'se', 'con', 'por', 'para', 'su'];
        const palabras = texto.split(/\s+/)
            .filter(palabra => palabra.length > 3 && !stopWords.includes(palabra))
            .map(palabra => palabra.replace(/[.,;:!?]/g, ''));
            
        return [...new Set(palabras)]; // Eliminar duplicados
    }
    
    static calcularFuerzaRelacion(textoContenido, textoRA) {
        const palabrasContenido = this.extraerPalabrasClave(textoContenido);
        const palabrasRA = this.extraerPalabrasClave(textoRA);
        
        const coincidencias = palabrasContenido.filter(palabra => 
            palabrasRA.includes(palabra)
        );
        
        return coincidencias.length / Math.max(palabrasContenido.length, palabrasRA.length);
    }
    
    static determinarNivelContenido(contenido, RAsRelacionados) {
        if (RAsRelacionados.length === 0) return 'SIN_RELACION';
        
        const fuerzaPromedio = RAsRelacionados.reduce((sum, ra) => sum + ra.fuerzaRelacion, 0) / RAsRelacionados.length;
        
        if (fuerzaPromedio > 0.7) return 'ALTO';
        if (fuerzaPromedio > 0.4) return 'MEDIO';
        return 'BAJO';
    }
    
    static evaluarAdecuacionContenido(contenido, RAsRelacionados) {
        if (RAsRelacionados.length === 0) {
            return {
                adecuado: false,
                motivo: 'Contenido no relacionado con ningún Resultado de Aprendizaje',
                severidad: 'ALTA'
            };
        }
        
        const fuerzaMaxima = Math.max(...RAsRelacionados.map(ra => ra.fuerzaRelacion));
        
        if (fuerzaMaxima < 0.3) {
            return {
                adecuado: false,
                motivo: 'Relación débil con los Resultados de Aprendizaje',
                severidad: 'MEDIA'
            };
        }
        
        return {
            adecuado: true,
            motivo: 'Contenido alineado con los Resultados de Aprendizaje',
            severidad: 'NINGUNA'
        };
    }
    
    static generarSugerenciasContenido(contenido, RAsRelacionados) {
        const sugerencias = [];
        
        if (RAsRelacionados.length === 0) {
            sugerencias.push('Revisar la pertinencia de este contenido en el curriculum');
            sugerencias.push('Considerar eliminar o reformular para alinear con RAs existentes');
        } else if (RAsRelacionados[0].fuerzaRelacion < 0.5) {
            sugerencias.push('Reforzar la conexión entre contenido y RAs mediante actividades específicas');
            sugerencias.push('Reformular el contenido para usar terminología similar a los RAs');
        }
        
        return sugerencias;
    }
    
    static calcularMetricasAdecuacion(matriz) {
        const totalContenidos = matriz.length;
        const contenidosAdecuados = matriz.filter(item => item.adecuacion.adecuado).length;
        const contenidosSinRelacion = matriz.filter(item => item.nivelContribucion === 'SIN_RELACION').length;
        
        return {
            porcentajeAdecuacion: (contenidosAdecuados / totalContenidos) * 100,
            contenidosDesalineados: contenidosSinRelacion,
            relacionPromedio: matriz.reduce((sum, item) => {
                const fuerzaPromedio = item.RAsRelacionados.length > 0 ? 
                    item.RAsRelacionados.reduce((s, ra) => s + ra.fuerzaRelacion, 0) / item.RAsRelacionados.length : 0;
                return sum + fuerzaPromedio;
            }, 0) / totalContenidos
        };
    }
    
    static identificarContenidosDesalineados(matriz) {
        return matriz.filter(item => 
            !item.adecuacion.adecuado || 
            item.nivelContribucion === 'SIN_RELACION' ||
            item.RAsRelacionados.length === 0
        ).map(item => ({
            asignatura: item.asignatura,
            contenido: item.contenido,
            problema: item.adecuacion.motivo,
            sugerencias: item.sugerencias
        }));
    }
    
    static identificarEvidenciasRelacion(contenido, ra) {
        // Simular identificación de evidencias basada en palabras clave
        const evidencias = [];
        const textoCombinado = (contenido + ' ' + ra.descripcion).toLowerCase();
        
        if (textoCombinado.includes('proyecto') || textoCombinado.includes('trabajo')) {
            evidencias.push('Trabajos prácticos');
        }
        if (textoCombinado.includes('ejercicio') || textoCombinado.includes('práctica')) {
            evidencias.push('Ejercicios aplicados');
        }
        if (textoCombinado.includes('caso') || textoCombinado.includes('estudio')) {
            evidencias.push('Estudios de caso');
        }
        
        return evidencias.length > 0 ? evidencias : ['Actividades de aprendizaje'];
    }
}
