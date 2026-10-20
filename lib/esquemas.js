// Qué campos lleva cada tipo de archivo de contenido.
// tipo: texto | bilingue | inicio | sino | opcion | email | url
// bilingue: se escribe 'campo' (igual en ambos idiomas) o 'campo_es' + 'campo_en'.

export const ESQUEMAS = {
  general: {
    campos: [
      { nombre: 'nombre_linea_1', tipo: 'texto' },
      { nombre: 'nombre_linea_2', tipo: 'texto' },
      { nombre: 'cargo', tipo: 'bilingue' },
      { nombre: 'universidad', tipo: 'texto' },
      { nombre: 'email', tipo: 'email' },
      { nombre: 'linkedin', tipo: 'url' },
      { nombre: 'github', tipo: 'url' },
      { nombre: 'modo_gamer', tipo: 'sino' }
    ],
    cuerpo: 'con-contacto'
  },
  experiencia: {
    campos: [
      { nombre: 'cargo', tipo: 'bilingue' },
      { nombre: 'empresa', tipo: 'bilingue' },
      { nombre: 'fecha', tipo: 'bilingue' },
      { nombre: 'inicio', tipo: 'inicio' },
      { nombre: 'en_curso', tipo: 'sino' }
    ],
    cuerpo: 'si'
  },
  formacion: {
    campos: [
      { nombre: 'titulo', tipo: 'bilingue' },
      { nombre: 'institucion', tipo: 'texto' },
      { nombre: 'fecha', tipo: 'texto' },
      { nombre: 'inicio', tipo: 'inicio' },
      { nombre: 'memoria_tipo', tipo: 'opcion', opciones: ['', 'memoria', 'monografia'] },
      { nombre: 'memoria', tipo: 'bilingue', soloSi: c => c.memoria_tipo !== '' }
    ],
    cuerpo: 'no'
  },
  cine: {
    campos: [
      { nombre: 'titulo', tipo: 'bilingue' },
      { nombre: 'fecha', tipo: 'bilingue' },
      { nombre: 'inicio', tipo: 'inicio' }
    ],
    cuerpo: 'si'
  }
};

export function camposConocidos(esquema) {
  return esquema.campos.flatMap(c =>
    c.tipo === 'bilingue' ? [c.nombre, `${c.nombre}_es`, `${c.nombre}_en`] : [c.nombre]);
}
