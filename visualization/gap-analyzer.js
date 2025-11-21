export class GapAnalyzer {
    static analizarHuecosCurriculares(curriculumData, matricesANECA) {
        const huecos = {
            cobertura: this.detectarHuecosCobertura(matricesANECA.RAsignaturas),
            progresion: this.detectarHuecosProgresion(curriculumData),
            evaluacion: this.detectarHuecosEvaluacion(matricesANECA.competenciasRA),
            integracion: this.detectarHuecosIntegracion(curriculumData)
        };
        
        return {
            huecos,
            prioridad: this.calcularPrioridadHuecos(huecos),
            planMejora: this.generarPlanMejora(huecos)
        };
    }
    
    static detectarHuecosCobertura(matrizRAsignaturas) {
        return matrizRAsignaturas.alertas.map(alerta => ({
            tipo: 'COBERTURA',
            descripcion: alerta.mensaje,
            asignaturasAfectadas: this.identificarAsignaturasAfectadas(alerta),
            accionRecomendada: alerta.accion,
            impactoANECA: 'ALTO',
            urgencia: alerta.gravedad === 'ALTA' ? 'INMEDIATA' : 'MEDIA'
        }));
    }
    
    static generarPlanMejora(huecos) {
        const acciones = [];
        
        huecos.cobertura.forEach(hueco => {
            acciones.push({
                accion: `Resolver: ${hueco.descripcion}`,
                responsable: 'Coordinación académica',
                plazo: hueco.urgencia === 'INMEDIATA' ? '1 mes' : '3 meses',
                recursos: 'Revisión plan de estudios',
                indicadorExito: 'RA cubierto por al menos 2 asignaturas'
            });
        });
        
        return {
            accionesPrioritarias: acciones.slice(0, 3),
            accionesMedioPlazo: acciones.slice(3),
            seguimiento: this.generarSistemaSeguimiento()
        };
    }
}