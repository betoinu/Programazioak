export class CurriculumLoader {
    static async loadCompleteCurriculumData() {
        try {
            console.log('📥 Cargando datos del curriculum BD...');
            
            // Cargar el JSON existente
            const response = await fetch('./public/json/curriculumBD.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const curriculumData = await response.json();
            console.log('✅ JSON cargado correctamente');
            
            return this.structureCurriculumData(curriculumData);
            
        } catch (error) {
            console.error('❌ Error cargando curriculum:', error);
            console.log('🔄 Usando datos de ejemplo para prueba...');
            return this.getSampleData();
        }
    }

    static structureCurriculumData(rawData) {
        const structuredData = [];
        const gradoPrincipal = "Barne Diseinuko Goi Mailako Arte Irakaskuntzetako Gradua";
        
        if (!rawData[gradoPrincipal]) {
            console.warn('⚠️ No se encuentra el grado principal en los datos');
            return this.getSampleData();
        }
        
        // Procesar cada curso
        for (const [cursoNum, asignaturas] of Object.entries(rawData[gradoPrincipal])) {
            if (asignaturas && Array.isArray(asignaturas)) {
                asignaturas.forEach(asignatura => {
                    if (asignatura && asignatura.izena) {
                        structuredData.push({
                            izena: asignatura.izena,
                            area: asignatura.arloa || 'Arlo Zehaztugabea',
                            kredituak: asignatura.kredituak || 0,
                            gradua: gradoPrincipal,
                            kurtsoa: parseInt(cursoNum),
                            mota: asignatura.mota || 'Derrigorrezkoa',
                            ieak: asignatura.currentOfficialRAs || [],
                            aurrekariak: asignatura.prerequisiteRAs || []
                        });
                    }
                });
            }
        }
        
        console.log(`✅ Curriculum estructurado: ${structuredData.length} asignaturas en ${new Set(structuredData.map(s => s.area)).size} áreas`);
        return structuredData;
    }

    static getSampleData() {
        // Datos de ejemplo mínimos para prueba
        return [
            {
                izena: "Diseinuaren oinarriak",
                area: "DISEINU PROIEKTUAK ETA METODOLOGIAK",
                kredituak: 10,
                gradua: "Barne Diseinuko Gradua",
                kurtsoa: 1,
                mota: "Derrigorrezkoa",
                ieak: [
                    "Diseinuaren oinarrizko kontzeptuak ulertzen ditu",
                    "Forma, konposizioa eta espazioa erabiltzen ditu"
                ],
                aurrekariak: []
            },
            {
                izena: "Proiektuak I", 
                area: "DISEINU PROIEKTUAK ETA METODOLOGIAK",
                kredituak: 9,
                gradua: "Barne Diseinuko Gradua", 
                kurtsoa: 2,
                mota: "Derrigorrezkoa",
                ieak: [
                    "Diseinu-proiektuak asmatzen eta planifikatzen ditu",
                    "Betebehar tekniko eta funtzionalak kontuan hartzen ditu"
                ],
                aurrekariak: ["Diseinuaren oinarriak: Oinarrizko konposizioa ulertzen du"]
            }
        ];
    }

}
