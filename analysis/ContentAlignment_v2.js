import BloomAnalyzer from '/Programazioak/analysis/BloomAnalyzer.js';

export default class ContentAlignment_v2 {

  /**
   * Evalúa el alineamiento Bloom entre un contenido y sus RAs asociados.
   */
  static evaluarAlineacionContenido(contenido, rasAsociados) {

    // Bloom del contenido
    const bloomContenido = BloomAnalyzer.inferBloomLevel(contenido);

    // Bloom de cada RA
    const bloomsRA = rasAsociados.map(ra => BloomAnalyzer.inferBloomLevel(ra.descripcion));

    // Calcular similitud Bloom
    const alineaciones = bloomsRA.map(bloomRA =>
      BloomAnalyzer.calculateBloomAlignment(bloomContenido, bloomRA)
    );

    const promedio = alineaciones.reduce((a, b) => a + b, 0) / alineaciones.length;

    // Convertimos la media a ANECA
    const nivelANECA = BloomAnalyzer.mapBloomToANECAFromAlignment(promedio);

    return {
      contenido,
      bloomContenido,
      bloomsRA,
      alineaciones,
      alineacionPromedio: promedio.toFixed(2),
      nivelANECA
    };
  }
}
