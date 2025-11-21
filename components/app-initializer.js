const CurriculumDataService = window.CurriculumDataService;

export async function initializeApp() {
    try {
        console.log('🚀 Aplikazioa hasieratzen...');
        
        // Datu-basea kargatu
        await CurriculumDataService.loadData();
        
        // Menuak bete
        populateSpecialties();
        
        console.log('✅ Aplikazioa prest!');
        return true;
    } catch (error) {
        console.error('❌ Errorea aplikazioa hasieratzean:', error);
        throw error;
    }
}

function populateSpecialties() {
    const specialtySelect = document.getElementById("specialty-select");
    if (!specialtySelect) {
        console.error('❌ specialty-select ez dago');
        return;
    }
    
    const specialties = CurriculumDataService.getSpecialties();
    specialtySelect.innerHTML = '<option value="">Aukeratu bat...</option>';
    
    specialties.forEach(spec => {
        const option = document.createElement("option");
        option.value = spec;
        option.textContent = spec;
        specialtySelect.appendChild(option);
    });
}

// Menuak betetzeko funtzio laguntzaileak
export function populateCourses(specialty) {
    const courseSelect = document.getElementById("course-select");
    const subjectSelect = document.getElementById("subject-select");
    
    if (!courseSelect || !subjectSelect) return;
    
    const courses = CurriculumDataService.getCourses(specialty);
    courseSelect.innerHTML = '<option value="">Aukeratu bat...</option>';
    subjectSelect.innerHTML = '<option value="">Aukeratu kurtso bat...</option>';
    
    if (courses.length > 0) {
        courses.forEach(course => {
            const option = document.createElement("option");
            option.value = course;
            option.textContent = `${course}. Kurtsoa`;
            courseSelect.appendChild(option);
        });
        courseSelect.disabled = false;
    } else {
        courseSelect.disabled = true;
    }
    subjectSelect.disabled = true;
    resetSubjectDetails();
}

export function populateSubjects(specialty, course) {
    const subjectSelect = document.getElementById("subject-select");
    if (!subjectSelect) return;
    
    const subjects = CurriculumDataService.getSubjects(specialty, course);
    subjectSelect.innerHTML = '<option value="">Aukeratu bat...</option>';
    
    if (subjects.length > 0) {
        subjects.forEach((subject, index) => {
            const option = document.createElement("option");
            option.value = index;
            option.textContent = subject.izena;
            subjectSelect.appendChild(option);
        });
        subjectSelect.disabled = false;
    } else {
        subjectSelect.disabled = true;
    }
    resetSubjectDetails();
}

export function populateSubjectDetails(specialty, course, subjectIndex) {
    const subject = CurriculumDataService.getSubjectDetails(specialty, course, subjectIndex);
    const areaInput = document.getElementById("area-input");
    const creditsInput = document.getElementById("credits-input");
    const optionalCheckbox = document.getElementById("optional-checkbox");
    const draftRAs = document.getElementById("draftRAs");
    const prerequisitesRAs = document.getElementById("prerequisitesRAs");
    
    if (subject && areaInput && creditsInput && optionalCheckbox && draftRAs && prerequisitesRAs) {
        areaInput.value = subject.arloa || "";
        creditsInput.value = subject.kredituak || "";
        optionalCheckbox.checked = subject.mota === "Hautazkoa";
        draftRAs.value = subject.currentOfficialRAs ? subject.currentOfficialRAs.join("\n") : "";
        prerequisitesRAs.value = subject.prerequisiteRAs ? subject.prerequisiteRAs.join("\n") : "";
    } else {
        resetSubjectDetails();
    }
}

function resetSubjectDetails() {
    const areaInput = document.getElementById("area-input");
    const creditsInput = document.getElementById("credits-input");
    const optionalCheckbox = document.getElementById("optional-checkbox");
    const draftRAs = document.getElementById("draftRAs");
    const prerequisitesRAs = document.getElementById("prerequisitesRAs");
    
    if (areaInput) areaInput.value = "";
    if (creditsInput) creditsInput.value = "";
    if (optionalCheckbox) optionalCheckbox.checked = false;
    if (draftRAs) draftRAs.value = "";
    if (prerequisitesRAs) prerequisitesRAs.value = "";

}
