// 📁 analysis/aneca-api.js
export class AnecaAPI {
    static async interpretarCompetencias(curriculumData) {
        console.log("🧠 API: Interpretando competencias desde RAs reales en euskera...");
        
        // Extraer y analizar RAs reales
        const competencias = await this.generarCompetenciasDesdeRAs(curriculumData);
        
        // Agrupar por ámbitos profesionales
        const competenciasAgrupadas = this.agruparPorAmbitos(competencias);
        
        console.log(`✅ API: Generadas ${competencias.length} competencias desde ${this.contarRAsTotal(curriculumData)} RAs reales`);
        
        return competenciasAgrupadas;
    }
    
    static async generarCompetenciasDesdeRAs(curriculumData) {
        const competencias = [];
        let idCounter = 1;
        
        // Procesar cada grado y asignatura
        Object.values(curriculumData).forEach((grado, gradoIndex) => {
            Object.entries(grado).forEach(([cursoKey, asignaturasCurso]) => {
                asignaturasCurso.forEach((asignatura, index) => {
                    if (asignatura.currentOfficialRAs && asignatura.currentOfficialRAs.length > 0) {
                        const competenciasAsignatura = this.procesarRAsAsignatura(
                            asignatura, 
                            parseInt(cursoKey), // curso como número
                            idCounter
                        );
                        competencias.push(...competenciasAsignatura);
                        idCounter += competenciasAsignatura.length;
                    }
                });
            });
        });
        
        return competencias;
    }
    
    static procesarRAsAsignatura(asignatura, curso, idCounter) {
        const competencias = [];
        const area = asignatura.arloa || 'Orokorra';
        
        asignatura.currentOfficialRAs.forEach((ra, index) => {
            // Crear competencia desde cada RA
            const competencia = {
                id: `C${idCounter + index}`,
                nombre: this.extraerNombreCompetencia(ra, asignatura.izena),
                descripcion: ra,
                ambito: this.mapearAreaAAmbito(area),
                nivelBloom: this.analizarNivelBloom(ra),
                instrumentosEvaluacion: this.generarInstrumentosDesdeRA(ra, area),
                cursoRecomendado: curso,
                asignaturasRelacionadas: [asignatura.izena],
                areaConocimiento: area,
                creditos: asignatura.kredituak || 6,
                raOrigen: ra,
                tipoAsignatura: asignatura.mota
            };
            
            competencias.push(competencia);
        });
        
        return competencias;
    }
    
    static extraerNombreCompetencia(ra, nombreAsignatura) {
        // Extraer verbo acción del RA (en euskera)
        const verbosAccion = {
            'ulertzea': 'Comprender',
            'garatzea': 'Desarrollar', 
            'erabiltzea': 'Utilizar',
            'ezagutzea': 'Conocer',
            'ebaluatzea': 'Evaluar',
            'sortzea': 'Crear',
            'aztertzea': 'Analizar',
            'identifikatzea': 'Identificar',
            'jakiteko': 'Conocer',
            'baliatzeko': 'Utilizar'
        };
        
        // Buscar verbo en euskera
        let verboCastellano = 'Aplicar';
        Object.entries(verbosAccion).forEach(([eusk, cast]) => {
            if (ra.toLowerCase().includes(eusk)) {
                verboCastellano = cast;
            }
        });
        
        // Extraer objeto del RA (primeras palabras después de :)
        const partes = ra.split(':');
        const objeto = partes.length > 1 ? partes[0] : ra.split(' ').slice(0, 4).join(' ');
        
        return `${verboCastellano} ${objeto} en ${nombreAsignatura}`;
    }
    
    static mapearAreaAAmbito(area) {
        const areaLower = area.toLowerCase();
        
        if (areaLower.includes('diseinu') || areaLower.includes('proiektu')) return 'diseño_creativo';
        if (areaLower.includes('teknologia') || areaLower.includes('tekniko')) return 'tecnologico_digital';
        if (areaLower.includes('komunikazio') || areaLower.includes('bisual')) return 'comunicacion_visual';
        if (areaLower.includes('kudeaketa') || areaLower.includes('gestión')) return 'gestion_proyectos';
        if (areaLower.includes('teoria') || areaLower.includes('oinarri')) return 'fundamental_teorico';
        if (areaLower.includes('eraikuntza')) return 'tecnologico_constructivo';
        if (areaLower.includes('arte') || areaLower.includes('kultura')) return 'arte_cultura';
        
        return 'transversal';
    }
    
    static analizarNivelBloom(ra) {
        const raLower = ra.toLowerCase();
        
        if (raLower.includes('sortzea') || raLower.includes('diseinatzea')) return 'CREAR';
        if (raLower.includes('ebaluatzea') || raLower.includes('baloratzea')) return 'EVALUAR';
        if (raLower.includes('aztertzea') || raLower.includes('konparatzea')) return 'ANALIZAR';
        if (raLower.includes('aplikatzea') || raLower.includes('erabiltzea')) return 'APLICAR';
        if (raLower.includes('ulertzea') || raLower.includes('azaltzea')) return 'COMPRENDER';
        
        return 'RECORDAR';
    }
    
    static generarInstrumentosDesdeRA(ra, area) {
        const instrumentosBase = ['azterketa teorikoa', 'lan praktikoa'];
        
        if (area.toLowerCase().includes('diseinu') || area.includes('PROIEKTU')) {
            return ['portfolio', 'proiektu finala', 'aurkezpen oral', ...instrumentosBase];
        }
        if (area.toLowerCase().includes('teknologia') || area.includes('TEKNIKO')) {
            return ['ariketa praktikoak', 'software proiektua', 'ebaluazio jarraitua', ...instrumentosBase];
        }
        if (area.toLowerCase().includes('eraikuntza')) {
            return ['proiektu teknikoa', 'planos', 'maquetas', ...instrumentosBase];
        }
        
        return instrumentosBase;
    }
    
    static contarRAsTotal(curriculumData) {
        let total = 0;
        Object.values(curriculumData).forEach(grado => {
            Object.values(grado).forEach(asignaturasCurso => {
                asignaturasCurso.forEach(asignatura => {
                    if (asignatura.currentOfficialRAs) {
                        total += asignatura.currentOfficialRAs.length;
                    }
                });
            });
        });
        return total;
    }
    
    static agruparPorAmbitos(competencias) {
        const agrupadas = {};
        
        competencias.forEach(competencia => {
            if (!agrupadas[competencia.ambito]) {
                agrupadas[competencia.ambito] = [];
            }
            agrupadas[competencia.ambito].push(competencia);
        });
        
        return agrupadas;
    }
    
    // Método para pruebas rápidas
    static async probarAPI() {
        console.log("🧪 Probando API...");
        const response = await fetch('data/curriculumBD.json');
        const curriculumData = await response.json();
        
        const competencias = await this.interpretarCompetencias(curriculumData);
        console.log("✅ Resultado prueba API:", competencias);
        
        return competencias;
    }

}
