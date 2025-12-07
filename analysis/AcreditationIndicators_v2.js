import BloomAnalyzer from '/Programazioak/analysis/BloomAnalyzer.js';
import CurriculumCoverage_v2 from '/Programazioak/analysis/CurriculumCoverage_v2.js';
import ContentAlignment_v2 from '/Programazioak/analysis/ContentAlignment_v2.js';

export default class AccreditationIndicators_v2 {

  /**
   * Punto de entrada principal llamado por main.js
   * Devuelve TODOS los indicadores ANECA ya calculados.
   */
  static generarIndicadoresANECACurriculum(competencias, ras, contenidos) {

    // === 1. Indicadores Bloom globales ===
    const bloomIndicators = BloomAnalyzer.getIndicators({
      competencias,
      ras,
      contenidos
    });

    // === 2. Cobertura Bloom por competencia ===
    const coberturaCompetencias = CurriculumCoverage_v2.analizarCoberturaCompetencias(competencias);

    // === 3. Alineación Bloom contenidos ↔ RA ===
    const alineaciones = contenidos.map(cont => {
      const rasAsociados = ras.filter(r => r.contenidos?.includes(cont.id));
      return ContentAlignment_v2.evaluarAlineacionContenido(cont.descripcion, rasAsociados);
    });

    // === 4. Progresión curricular Bloom (1º → 4º curso) ===
    const progresion = BloomAnalyzer.analyzeBloomProgression(ras);

    // === 5. Evaluación: ¿hay instrumentos adecuados para el nivel Bloom? ===
    const instrumentosAdecuados = this.evaluarAdecuacionInstrumentos(ras);

    // === 6. Coherencia global ANECA ===
    const estadoGeneral = this.calcularEstadoGeneral({
      bloomIndicators,
      coberturaCompetencias,
      alineaciones,
      progresion,
      instrumentosAdecuados
    });

    // === SALIDA FINAL UNIFICADA ===
    return {
      bloomIndicators,
      coberturaCompetencias,
      alineaciones,
      progresion,
      instrumentosAdecuados,
      estadoGeneral
    };
  }


  // ========================================================
  // === 5. Evaluación de instrumentos por nivel Bloom ======
  // ========================================================

  /**
   * Comprobar si los instrumentos de evaluación son adecuados
   * para el nivel cognitivo real del RA.
   */
  static evaluarAdecuacionInstrumentos(ras) {
    return ras.map(ra => {
      const bloom = BloomAnalyzer.inferBloomLevel(ra.descripcion || '');
      const instrumento = ra.instrumentos || [];

      const adecuado = instrumento.some(inst => {
        if (bloom.level >= 4) return ['proyecto', 'portafolio', 'presentación'].includes(inst);
        if (bloom.level >= 2) return ['prueba_práctica', 'ejercicio', 'tarea'].includes(inst);
        return ['test', 'preguntas_cortas'].includes(inst);
      });

      return {
        ra: ra.id,
        bloom: bloom.name,
        instrumentos: instrumento,
        adecuado
      };
    });
  }



  // ========================================================
  // === 6. Estado general ANECA =============================
  // ========================================================

  /**
   * Determina el estado global ANECA del plan de estudios.
   */
  static calcularEstadoGeneral({ bloomIndicators, coberturaCompetencias, alineaciones, progresion, instrumentosAdecuados }) {

    let score = 0;

    // 1) Cobertura Bloom equilibrada
    if (bloomIndicators.bloomCoverageGlobal.alto > 20) score += 20;
    if (bloomIndicators.bloomCoverageGlobal.medio > 40) score += 20;
    if (bloomIndicators.bloomCoverageGlobal.bajo < 30) score += 20;

    // 2) Alineación media aceptable
    const mediaAlineacion = alineaciones
      .map(a => parseFloat(a.alineacionPromedio))
      .reduce((a, b) => a + b, 0) / alineaciones.length;
    if (mediaAlineacion > 0.6) score += 20;

    // 3) Progresión Bloom adecuada por cursos
    if (progresion.progresion >= 0.3) score += 20;

    // 4) Instrumentos adecuados
    const porcentajeInstrumentosCorrectos =
      instrumentosAdecuados.filter(i => i.adecuado).length / instrumentosAdecuados.length;

    if (porcentajeInstrumentosCorrectos > 0.7) score += 20;

    // Resultado final
    return {
      score,
      nivelANECA:
        score >= 85 ? "EXCELENTE" :
        score >= 70 ? "ADECUADO" :
        score >= 50 ? "EN DESARROLLO" :
        "DEFICIENTE"
    };
  }
}
