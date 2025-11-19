export class PromptBuilder {
    static buildCurriculumPrompt(formData) {
        const {
            specialtyName,
            courseName,
            subjectName,
            area,
            credits,
            optional,
            prerequisitesRAs,
            draftRAs
        } = formData;

        return `
**HELBURUA:** ${subjectName} irakasgairako curriculum osoa diseinatu

**TESTINGURUA:**
- **Gradua:** ${specialtyName}
- **Kurtsoa:** ${courseName}
- **Irakasgaia:** ${subjectName}
- **Arloa:** ${area}
- **Kredituak:** ${credits} ECTS
- **Mota:** ${optional === "on" ? "Hautazkoa" : "Derrigorrezkoa"}

**SARRERAKO DATUAK:**
- **Aurrekariak:** ${prerequisitesRAs || "Ez da aurrekaririk"}
- **IE Zirriborroa:** ${draftRAs || "Ez da zirriborrorik"}

**ESKATZEN DIREN 6 ATALAK:**

## 1. IE Berrikusiak (ANECA/AUDIT)
Berridatzi IEak ekintza-aditzekin. Kopurua: ${Math.round(credits / 1.5)}-${Math.round(credits)} IE.

## 2. GJH Integrazioa
2-3 Garapen Jasangarriren Helburu.

## 3. Ebaluazio Irizpideak
Nola ebaluatuko diren IE bakoitza.

## 4. Eduki Blokeak
Eduki espezifikoak.

## 5. Praktika Proposamenak
2-3 jarduera praktiko.

## 6. Baliabideak
Erakunde/baliabide gomendioak.

**GOGORATU:** Erantzun euskaraz, Markdown formatuan.
        `;
    }
}