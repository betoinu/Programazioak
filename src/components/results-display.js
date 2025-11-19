export class ResultsDisplay {
    static displayGeneratedResults(markdownText) {
        const htmlText = this.simpleMarkdownToHTML(markdownText);
        const sections = this.parseMarkdownSections(htmlText);
        this.updateResultSections(sections);
        this.showResultsContainer();
    }

    static parseMarkdownSections(htmlText) {
        const sections = {};
        const sectionArray = htmlText.split('<h2>');
        
        if (sectionArray.length > 1) {
            sectionArray.shift(); // Kendu lehen elementu hutsa
            
            sectionArray.forEach(section => {
                const titleEndIndex = section.indexOf('</h2>');
                if (titleEndIndex === -1) return;
                
                const title = section.substring(0, titleEndIndex).trim();
                const content = section.substring(titleEndIndex + 5).trim();
                sections[title] = content;
            });
        }
        
        return sections;
    }

    static updateResultSections(sections) {
        const sectionMap = {
            "1. IE Berrikusiak": "result-ane-ie",
            "2. GJH Integrazioa": "result-ods", 
            "3. Ebaluazio Irizpideak": "result-criteria",
            "4. Eduki Blokeak": "result-contents",
            "5. Praktika Proposamenak": "result-practices",
            "6. Baliabideak": "result-partners"
        };

        // Garbitu aurreko emaitzak
        Object.values(sectionMap).forEach(id => {
            const element = document.getElementById(id);
            if (element) element.innerHTML = '';
        });

        // Betegi atal bakoitza
        Object.entries(sectionMap).forEach(([title, elementId]) => {
            const element = document.getElementById(elementId);
            if (element && sections[title]) {
                element.innerHTML = `<h2>${title}</h2>${sections[title]}`;
            }
        });
    }

    static showResultsContainer() {
        const container = document.getElementById('results-container');
        if (container) {
            container.classList.remove('hidden');
            container.scrollIntoView({ behavior: 'smooth' });
        }
    }

    static simpleMarkdownToHTML(text) {
        if (!text) return "";
        return text
            .replace(/## (.*)/g, '<h2>$1</h2>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/^- (.*)/gm, '<ul><li>$1</li></ul>')
            .replace(/- (.*)/gm, '<ul><li>$1</li></ul>')
            .replace(/<\/ul>\s*<ul>/g, '')
            .replace(/\n/g, '<br>');
    }
}