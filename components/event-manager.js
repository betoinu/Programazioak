import { CurriculumDataService } from '../services/data-service.js';
import { populateCourses, populateSubjects, populateSubjectDetails } from './app-initializer.js';
import { generateSuggestions } from './suggestion-generator.js';

export function setupEventListeners() {
    const specialtySelect = document.getElementById("specialty-select");
    const courseSelect = document.getElementById("course-select");
    const subjectSelect = document.getElementById("subject-select");
    const form = document.getElementById("course-form");

    if (!specialtySelect || !courseSelect || !subjectSelect || !form) {
        console.error('❌ DOM elementuak ez daude aurkitu');
        return;
    }

    specialtySelect.addEventListener("change", handleSpecialtyChange);
    courseSelect.addEventListener("change", handleCourseChange);
    subjectSelect.addEventListener("change", handleSubjectChange);
    form.addEventListener("submit", handleFormSubmit);
}

function handleSpecialtyChange(e) {
    const specialty = e.target.value;
    populateCourses(specialty);
}

function handleCourseChange(e) {
    const specialty = document.getElementById("specialty-select").value;
    const course = e.target.value;
    populateSubjects(specialty, course);
}

function handleSubjectChange(e) {
    const specialty = document.getElementById("specialty-select").value;
    const course = document.getElementById("course-select").value;
    const subjectIndex = e.target.value;
    populateSubjectDetails(specialty, course, subjectIndex);
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData.entries());
    
    // Hautatutako testuak ere bidali
    const specialtySelect = document.getElementById("specialty-select");
    const subjectSelect = document.getElementById("subject-select");
    const courseSelect = document.getElementById("course-select");
    
    data.specialtyName = specialtySelect.options[specialtySelect.selectedIndex]?.text || data.specialty;
    data.subjectName = subjectSelect.options[subjectSelect.selectedIndex]?.text || data.subject;
    data.courseName = courseSelect.options[courseSelect.selectedIndex]?.text || data.course;
    
    generateSuggestions(data);
}