// Textos fijos de la interfaz. modo_gamer elige entre títulos de videojuego y neutros.
export function textosInterfaz(modoGamer) {
  const g = (gamer, neutro) => (modoGamer ? gamer : neutro);
  return {
    enCurso: g({ es: 'Partida en curso', en: 'Currently playing' }, { es: 'Actualmente', en: 'Currently' }),
    completadas: g({ es: 'Misiones completadas', en: 'Completed quests' }, { es: 'Experiencia previa', en: 'Previous experience' }),
    cine: g({ es: 'Misión secundaria: cine', en: 'Side quest: film' }, { es: 'Cine', en: 'Film' }),
    contacto: g({ es: '¿Guardamos la partida?', en: 'Save and continue?' }, { es: 'Contacto', en: 'Contact' }),
    etiquetaEnCurso: { es: 'En curso', en: 'Current' },
    desplazate: { es: 'Desplázate para continuar', en: 'Scroll to continue' },
    palabraFormacion: { es: 'Formación', en: 'Education' },
    palabraCine: { es: 'Cine', en: 'Film' },
    memoria: { es: 'Memoria', en: 'Thesis' },
    monografia: { es: 'Monografía', en: 'Monograph' },
    ultimoGuardado: { es: 'Último guardado', en: 'Last saved' }
  };
}
