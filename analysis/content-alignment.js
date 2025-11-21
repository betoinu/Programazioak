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
                    nivelContribution: this.determinarNivelContenido(contenido, RAsRelacionados),
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
}