import BloomAnalyzer from '/Programazioak/analysis/BloomAnalyzer.js';

export default class CurriculumCoverage_v2 {

  /**
   * Analiza la cobertura curricular basada en niveles reales de Bloom.
   * Reemplaza cualquier heurística basada en palabras clave.
   */
  static analizarCoberturaCompetencias(competencias) {

    return competencias.map(comp => {
      const resultados = comp.resultadosAprendizaje || [];

      // Obtener niveles Bloom reales
      const bloomLevels = resultados.map(r => {
        const bloom = BloomAnalyzer.inferBloomLevel(r.descripcion || '');
        return bloom?.level ?? 1;
      });

      const promedio = bloomLevels.reduce((a, b) => a + b, 0) / bloomLevels.length;

      // Convertimos el promedio Bloom a nivel ANECA
      const nivelANECA = BloomAnalyzer.mapBloomToANECA(promedio);

      return {
        id: comp.id,
        nombre: comp.nombre,
        numRA: resultados.length,
        bloomPromedio: promedio.toFixed(2),
        nivelANECA,
        bloomLevels,
      };
    });
  }
}
