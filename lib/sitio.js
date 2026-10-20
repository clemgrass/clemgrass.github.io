// Arma lo que necesita la plantilla a partir del contenido ya validado.
import { mesYAnio } from './fechas.js';
import { textosInterfaz } from './textos.js';

const DESPLAZAMIENTOS = ['0', 'auto', '12%'];

export function prepararSitio(contenido, ahora) {
  const { general, experiencia, formacion, cine } = contenido;
  return {
    general,
    enCurso: experiencia.filter(e => e.enCurso),
    completadas: experiencia.filter(e => !e.enCurso),
    formacionPrincipal: formacion[0],
    formacionOtras: formacion.slice(1),
    cine: cine.map((c, i) => ({ ...c, desplazamiento: DESPLAZAMIENTOS[i % 3] })),
    textos: textosInterfaz(general.modoGamer),
    guardado: mesYAnio(ahora),
    anio: String(ahora.getFullYear())
  };
}
