export class AnalysisDisplay {
    static buildSummaryHTML(results) {
        const stats = results.curriculumStats;
        
        return `
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div class="text-2xl font-bold text-blue-600">${stats.totalSubjects}</div>
                    <div class="text-sm text-blue-800 font-medium">Irakasgai Guztira</div>
                </div>
                <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div class="text-2xl font-bold text-green-600">${stats.totalCredits}</div>
                    <div class="text-sm text-green-800 font-medium">Kreditu ECTS</div>
                </div>
                <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div class="text-2xl font-bold text-purple-600">${stats.areasCount}</div>
                    <div class="text-sm text-purple-800 font-medium">Jakintza Arlo</div>
                </div>
                <div class="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <div class="text-2xl font-bold text-orange-600">${stats.types.obligatory}</div>
                    <div class="text-sm text-orange-800 font-medium">Derrigorrezkoak</div>
                </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="bg-white p-4 rounded-lg border border-gray-200">
                    <h4 class="font-semibold text-gray-800 mb-3">📊 Kurtsoen Banaketa</h4>
                    <div class="space-y-2 text-sm">
                        ${Object.entries(stats.courses).map(([curso, count]) => `
                            <div class="flex justify-between items-center">
                                <span class="text-gray-600">${curso}. Kurtsoa</span>
                                <span class="font-medium text-gray-800">${count} irakasgai</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                    <h4 class="font-semibold text-yellow-800 mb-2">🏆 Arlo Nagusiak</h4>
                    <ul class="text-sm text-yellow-700 list-disc list-inside space-y-1">
                        ${results.recommendations.priorityAreas.slice(0, 3).map(area => `
                            <li><strong>${area.area}:</strong> ${area.credits}k ${area.subjects} irakasgai</li>
                        `).join('')}
                    </ul>
                </div>
            </div>
            
            ${results.globalAnalysis ? `
            <div class="mt-6 bg-gray-50 p-4 rounded-lg border border-gray-300">
                <h4 class="font-semibold text-gray-800 mb-2">🔍 Aurkikuntza Nagusiak</h4>
                <div class="text-sm text-gray-700 whitespace-pre-line">${results.globalAnalysis.substring(0, 300)}...</div>
            </div>
            ` : ''}
        `;
    }

    static buildAreaAnalysisHTML(areaAnalyses) {
        if (!areaAnalyses || areaAnalyses.length === 0) {
            return '<div class="text-center text-gray-500 py-8">Ez dago analisirik erakusteko</div>';
        }

        return areaAnalyses.map(area => `
            <div class="border border-gray-200 rounded-lg p-4 mb-4 bg-white shadow-sm">
                <div class="flex justify-between items-start mb-3">
                    <h4 class="font-semibold text-lg text-gray-800">${area.area}</h4>
                    <div class="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        ${area.subjectCount} irakasgai • ${area.totalCredits} kreditu
                    </div>
                </div>
                
                ${area.analysis && area.analysis.coreCompetencies && area.analysis.coreCompetencies.length > 0 ? `
                <div class="mb-3">
                    <h5 class="font-medium text-gray-700 mb-2">🎯 Konpetentzia Nuklearrak:</h5>
                    <ul class="text-sm text-gray-600 list-disc list-inside space-y-1">
                        ${area.analysis.coreCompetencies.slice(0, 3).map(comp => 
                            `<li class="pl-2">${comp}</li>`
                        ).join('')}
                    </ul>
                </div>
                ` : `
                <div class="mb-3">
                    <p class="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">Analisi etenik edo konpetentziak zehaztu gabe</p>
                </div>
                `}
                
                <div class="text-xs text-gray-500 border-t pt-2 mt-2">
                    Adibide irakasgaiak: ${area.subjectsPreview ? area.subjectsPreview.join(', ') : 'Ez dago'}
                </div>
            </div>
        `).join('');
    }

    static buildRecommendationsHTML(results) {
        const rec = results.recommendations;
        
        return `
            <div class="space-y-4">
                ${rec.weakAreas.length > 0 ? `
                <div class="bg-red-50 p-4 rounded-lg border border-red-200">
                    <h5 class="font-semibold text-red-800 mb-2">⚠️ Arlo Ahulak</h5>
                    <ul class="text-sm text-red-700 list-disc list-inside">
                        ${rec.weakAreas.map(area => `<li>${area}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${rec.overloadedAreas.length > 0 ? `
                <div class="bg-orange-50 p-4 rounded-lg border border-orange-200">
                    <h5 class="font-semibold text-orange-800 mb-2">📚 Karga Handiko Arloak</h5>
                    <ul class="text-sm text-orange-700 list-disc list-inside">
                        ${rec.overloadedAreas.map(area => `<li>${area}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                ${rec.strategicGaps.length > 0 ? `
                <div class="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <h5 class="font-semibold text-purple-800 mb-2">🔍 Hutsune Estrategikoak</h5>
                    <ul class="text-sm text-purple-700 list-disc list-inside">
                        ${rec.strategicGaps.map(gap => `<li>${gap}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                
                <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h5 class="font-semibold text-blue-800 mb-2">💡 Hurrengo Urratsak</h5>
                    <div class="text-sm text-blue-700 space-y-2">
                        <p><strong>1. Konpetentzia Mapa Osatua:</strong> Jarraitu IE espezifikoak garatzen analisi honetan oinarrituta.</p>
                        <p><strong>2. Progresio Vertikala:</strong> Berrikusi IEak mailakaturik dauden konplexutasunaren arabera.</p>
                        <p><strong>3. Lotura Transbersalak:</strong> Indartu arloen arteko harremanak.</p>
                        <p><strong>4. Eguneraketa Jarraitua:</strong> Eguneratu analisia curriculum aldaketekin.</p>
                    </div>
                </div>
                
                <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h5 class="font-semibold text-green-800 mb-2">✅ Datu Oinarria</h5>
                    <div class="text-xs text-green-700">
                        <p>Analisia: ${new Date(results.timestamp).toLocaleString('eu-ES')}</p>
                        <p>Datu basea: ${rec.totalSubjects} irakasgai, ${rec.totalCredits} kreditu, ${rec.totalAreas} arlo</p>
                    </div>
                </div>
            </div>
        `;
    }
}