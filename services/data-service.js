export class CurriculumDataService {
    static curriculumData = {};

    static async loadData() {
        try {
            const response = await fetch('./public/json/curriculumBD.json');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            this.curriculumData = await response.json();
            console.log('📊 Curriculum datuak kargatuta');
            return this.curriculumData;
        } catch (error) {
            console.error('❌ Errorea datuak kargatzean:', error);
            throw error;
        }
    }

    static getSpecialties() {
        return Object.keys(this.curriculumData);
    }

    static getCourses(specialty) {
        return Object.keys(this.curriculumData[specialty] || {});
    }

    static getSubjects(specialty, course) {
        return this.curriculumData[specialty]?.[course] || [];
    }

    // ✅ GEHITU FUNTZIO HAU!
    static getSubjectDetails(specialty, course, subjectIndex) {
        const subjects = this.curriculumData[specialty]?.[course];
        if (subjects && subjects[subjectIndex]) {
            return subjects[subjectIndex];
        }
        return null;
    }
}

