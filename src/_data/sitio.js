// Todo el contenido de la página sale de la carpeta contenido/.
// Si algún archivo tiene problemas, la construcción se detiene con la lista en español.
import { cargarContenido, formatearError } from '../../lib/contenido.js';
import { prepararSitio } from '../../lib/sitio.js';

export default function () {
  const { contenido, errores } = cargarContenido(process.env.CONTENIDO_DIR ?? 'contenido');
  if (errores.length) {
    throw new Error('El contenido tiene problemas:\n' + errores.map(formatearError).join('\n'));
  }
  return prepararSitio(contenido, new Date());
}
