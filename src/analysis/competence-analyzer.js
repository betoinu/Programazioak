import { GroqAPIService } from '../services/api-service.js';
import { CurriculumLoader } from '../data/curriculum-loader.js';

export class CompetenceAnalyzer {
    static async performGlobalAnalysis() {
        console.log('🔍 Hasiera Globala Kompetentzia Analisia...');
        
        try {
            // 1. Cargar datos REALES del curriculum
            const curriculumData = await CurriculumLoader.loadCompleteCurriculumData();
            
            if (!curriculumData || curriculumData.length === 0) {
                throw new Error('Ezin izan dira curriculum datuak kargatu');
            }
            
            console.log(`📚 Datuak kargatuta: ${curriculumData.length} irakasgai`);
            
            // 2. Organizar datos por áreas
            const organizedData = this.organizeDataByArea(curriculumData);
            const areaAnalyses = [];
            
            // 3. Analizar cada área
            for (const [area, subjects] of Object.entries(organizedData)) {
                console.log(`📊 Analizatzen: ${area} (${subjects.length} irakasgai)`);
                try {
                    const analysis = await this.analyzeKnowledgeArea(area, subjects);
                    areaAnalyses.push(analysis);
                } catch (error) {
                    console.error(`❌ Errorea ${area} analizatzen:`, error);
                    areaAnalyses.push({
                        area,
                        error: true,
                        message: error.message,
                        subjectCount: subjects.length,
                        totalCredits: subjects.reduce((sum, s) => sum + (s.kredituak || 0), 0)
                    });
                }
            }
            
            // 4. Análisis transversal
            const globalAnalysis = await this.performCrossAreaAnalysis(areaAnalyses);
            
            return {
                curriculumStats: this.calculateCurriculumStats(curriculumData),
                areaAnalyses: areaAnalyses.filter(a => !a.error),
                globalAnalysis,
                recommendations: this.generateStrategicRecommendations(areaAnalyses, curriculumData),
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('❌ Errorea analisi globalean:', error);
            throw error;
        }
    }

    static organizeDataByArea(subjects) {
        const areas = {};
        
        subjects.forEach(subject => {
            const area = subject.area || 'Arlo Zehaztugabea';
            if (!areas[area]) {
                areas[area] = [];
            }
            
            areas[area].push({
                izena: subject.izena,
                kredituak: subject.kredituak,
                gradua: subject.gradua,
                kurtsoa: subject.kurtsoa,
                mota: subject.mota,
                ieak: subject.ieak || [],
                aurrekariak: subject.aurrekariak || []
            });
        });
        
        console.log('📁 Datuak antolaturik:', Object.keys(areas).length + ' arlo');
        return areas;
    }

    static calculateCurriculumStats(curriculumData) {
        const areas = new Set(curriculumData.map(s => s.area));
        const courses = {
            1: curriculumData.filter(s => s.kurtsoa === 1).length,
            2: curriculumData.filter(s => s.kurtsoa === 2).length, 
            3: curriculumData.filter(s => s.kurtsoa === 3).length,
            4: curriculumData.filter(s => s.kurtsoa === 4).length
        };
        
        const stats = {
            totalSubjects: curriculumData.length,
            totalCredits: curriculumData.reduce((sum, s) => sum + (s.kredituak || 0), 0),
            areasCount: areas.size,
            courses,
            types: {
                obligatory: curriculumData.filter(s => s.mota === 'Derrigorrezkoa').length,
                optional: curriculumData.filter(s => s.mota === 'Hautazkoa').length
            },
            areasList: Array.from(areas)
        };
        
        return stats;
    }

    static async analyzeKnowledgeArea(area, subjects) {
        const prompt = this.buildAreaAnalysisPrompt(area, subjects);
        
        try {
            const analysis = await GroqAPIService.generateResponse(prompt);
            return {
                area,
                subjectCount: subjects.length,
                totalCredits: subjects.reduce((sum, s) => sum + (s.kredituak || 0), 0),
                analysis: this.parseAnalysisResult(analysis),
                rawResult: analysis,
                subjectsPreview: subjects.slice(0, 3).map(s => s.izena) // Primeras 3 asignaturas
            };
        } catch (error) {
            console.error(`❌ Errorea ${area} arloan analizatzen:`, error);
            throw error;
        }
    }

    static buildAreaAnalysisPrompt(area, subjects) {
        const subjectsByCourse = this.groupSubjectsByCourse(subjects);
        const totalCredits = subjects.reduce((sum, s) => sum + (s.kredituak || 0), 0);
        
        return `
ANALISI KOMPETENTZIAL SAKONA - ${area} ARLOA

HELBURUA: ${area} arloaren analisi integrala egitea, Barne Diseinu Graduaren ikuspegi orokortik.

DATU BASEA:
- IRAKASGAI KOPURUA: ${subjects.length}
- KREDITU TOTALAK: ${totalCredits}
- KURTSO BANAKETA: ${Object.keys(subjectsByCourse).length} kurso

IRAKASGAIEN BANAKETA:
${this.formatSubjectsInfo(subjectsByCourse)}

IE ADIBIDE NABARMENAK:
${this.sampleLearningOutcomes(subjects)}

---

GALDERAK ANALISI SAKONERAKO:

1. KONPETENTZIA NUKLEAR GARRANTZITSUENAK
   - Zein dira 3-5 konpetentzia NAGUSIENAK ${area} arlotik ateratzen diren egresatuentzat?
   - NOLA garatzen dira konpetentzia hauek 4 urteetan zehar?

2. IE-ESKALAREN PROGRESIOA
   - Ikusi IEak kurtsoen arabera: zein da MAILAKATZE logikoa?
   - Ba al da sekuentzia ARRAZOITUA konplexutasunean?
   - Zein hutsuneak daude progresioan?

3. LOTURA-GUNE KRITIKOAK  
   - NOLA lotzen da ${area} beste arloekin?
   - Zein dira SINERGIA garrantzitsuenak?
   - Zein da AURRERAPEN koherentzia gradu osoan?

4. HOBSETZE-AUKERAK
   - Zein konpetentzia BERRIK gehitu litezke?
   - NOLA indartu LOTURA TRANSVERSALAK?
   - Zein da ORAIN ETA GEROKO ikuspegia?

---

GIDATZAILE ESPEZIFIKOAK:
- Eman IKUSPEGI PRAGMATIKOA gradu osoaren ikuspegitik
- Identifikatu BENETAKO BALIOA ekarpen arloan
- Eman ADIBIDE ZEHATZAK egungo IEetatik abiatuta
- Aztertu IRAKASGAIEN ARTEBANAKETA optimoa
- Erabili ANECA/AUDIT terminologia
- Erantzun EUSKARA formalean
`;
    }

    static groupSubjectsByCourse(subjects) {
        const byCourse = {};
        subjects.forEach(subject => {
            if (!byCourse[subject.kurtsoa]) {
                byCourse[subject.kurtsoa] = [];
            }
            byCourse[subject.kurtsoa].push(subject);
        });
        return byCourse;
    }

    static formatSubjectsInfo(subjectsByCourse) {
        let info = '';
        for (const [course, subjects] of Object.entries(subjectsByCourse).sort()) {
            info += `\nKURTSOA ${course} (${subjects.length} irakasgai):\n`;
            subjects.forEach(subject => {
                info += `  - ${subject.izena} (${subject.kredituak}k) - ${subject.mota}\n`;
            });
        }
        return info;
    }

    static sampleLearningOutcomes(subjects) {
        let samples = '';
        const sampleSubjects = subjects.slice(0, 3); // Primeras 3 asignaturas
        
        sampleSubjects.forEach(subject => {
            if (subject.ieak && subject.ieak.length > 0) {
                samples += `\n${subject.izena}:\n`;
                subject.ieak.slice(0, 2).forEach(ie => {
                    samples += `  • ${ie.substring(0, 100)}...\n`;
                });
            }
        });
        
        return samples || '  (Ez dago IE adibiderik)';
    }

    static parseAnalysisResult(rawAnalysis) {
        try {
            const lines = rawAnalysis.split('\n');
            const competencies = [];
            let currentSection = '';
            
            lines.forEach(line => {
                const trimmedLine = line.trim();
                
                if (trimmedLine.includes('KONPETENTZIA NUKLEAR') || trimmedLine.match(/^1\./)) {
                    currentSection = 'competencies';
                } else if (trimmedLine.includes('IE-ESKALA') || trimmedLine.match(/^2\./)) {
                    currentSection = 'progression';
                } else if (trimmedLine.includes('LOTURA-GUNE') || trimmedLine.match(/^3\./)) {
                    currentSection = 'connections';
                } else if (trimmedLine.includes('HOBSETZE') || trimmedLine.match(/^4\./)) {
                    currentSection = 'improvements';
                }
                
                // Konpetentziak identifikatu
                if (currentSection === 'competencies' && 
                    (trimmedLine.startsWith('-') || trimmedLine.startsWith('•') || 
                     (trimmedLine.match(/^[A-Z]/) && trimmedLine.length > 20))) {
                    competencies.push(trimmedLine);
                }
            });
            
            return {
                coreCompetencies: competencies.filter(c => c.length > 10).slice(0, 5),
                rawAnalysis: rawAnalysis
            };
        } catch (error) {
            console.error('❌ Errorea analisi emaitzak parseatzen:', error);
            return { coreCompetencies: [], rawAnalysis: rawAnalysis };
        }
    }

    static async performCrossAreaAnalysis(areaAnalyses) {
        try {
            const prompt = this.buildCrossAreaPrompt(areaAnalyses);
            return await GroqAPIService.generateResponse(prompt);
        } catch (error) {
            console.error('❌ Errorea analisi transbersalean:', error);
            return 'Analisi transbersala ezin izan da burutu.';
        }
    }

    static buildCrossAreaPrompt(areaAnalyses) {
        const validAnalyses = areaAnalyses.filter(a => !a.error);
        const areasSummary = validAnalyses.map(a => `
${a.area}:
- ${a.subjectCount} irakasgai, ${a.totalCredits} kreditu
- Konpetentzia nagusiak: ${a.analysis?.coreCompetencies?.slice(0, 2).join('; ') || 'Analisi etenik'}
`).join('\n');

        return `
ANALISI TRANSVERSALA - BARNE DISEINU GRADUA OSOA

HELBURUA: Gradu osoaren ikuspegitik analisia egitea, arloen arteko harremanak eta koherentzia orokorra ebaluatzea.

ARLOEN LABURPENA:
${areasSummary}

GALDERAK ANALISI TRANSVERSALERAKO:

1. SINERJIAK eta LOTURA-GUNEAK
   - Zein konpetentziak GURUTZATZEN dira arlo desberdinen artean?
   - NOLA ELKAR-ERAGITEN dute arloek konpetentzien garapenean?

2. KOHEMENTZIA GLOBALA
   - Ba al da PROGRESIO koherentea 4 urteetan zehar?
   - Zein da KURTSOEN ARTEBANAKETA optimoa konpetentzientzat?

3. OSATU GABEKO EREMAK
   - Zein konpetentzia TRANSVERSAL falta dira gradu osoan?
   - NOLA INTEGRA litezke (sostenibilitatea, digitalizazioa, nazioartekotasuna...)?

4. AURREKARI-SAREA
   - Ba al da AURREKARI-SAREA koherentea arloen artean?
   - Identifikatu AURREKARI-GABEKO LOTURAK

GOMENDIOAK:
- Eman ikuspegi INTEGRATZAILEA
- Identifikatu hobespen espezifikoak curriculum diseinurako
- Eman adibide praktikoak konpetentzien integraziorako
- Erabili ANECA/AUDIT ikuspegia
`;
    }

    static generateStrategicRecommendations(areaAnalyses, curriculumData) {
        const validAnalyses = areaAnalyses.filter(a => !a.error);
        
        // Identificar áreas con pocas competencias
        const weakAreas = validAnalyses.filter(a => 
            !a.analysis?.coreCompetencies || 
            a.analysis.coreCompetencies.length < 2
        ).map(a => a.area);
        
        // Identificar áreas con muchos créditos pero pocas asignaturas (posible sobrecarga)
        const overloadedAreas = validAnalyses.filter(a => 
            a.totalCredits > 30 && a.subjectCount < 4
        ).map(a => a.area);
        
        return {
            totalAreas: validAnalyses.length,
            totalSubjects: validAnalyses.reduce((sum, a) => sum + a.subjectCount, 0),
            totalCredits: validAnalyses.reduce((sum, a) => sum + a.totalCredits, 0),
            priorityAreas: this.identifyPriorityAreas(validAnalyses),
            weakAreas,
            overloadedAreas,
            strategicGaps: this.identifyStrategicGaps(validAnalyses)
        };
    }

    static identifyPriorityAreas(analyses) {
        return analyses
            .sort((a, b) => b.totalCredits - a.totalCredits)
            .slice(0, 3)
            .map(a => ({
                area: a.area,
                credits: a.totalCredits,
                subjects: a.subjectCount
            }));
    }

    static identifyStrategicGaps(analyses) {
        const gaps = [];
        
        analyses.forEach(analysis => {
            if (analysis.analysis?.coreCompetencies?.length < 2) {
                gaps.push(`${analysis.area}: Konpetentzia nuklear gutxi (${analysis.analysis.coreCompetencies.length})`);
            }
            
            if (analysis.subjectCount < 2) {
                gaps.push(`${analysis.area}: Irakasgai gutsi (${analysis.subjectCount}) eskala osatzeko`);
            }
        });
        
        return gaps;
    }
}