import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { cargarContenido, formatearError } from '../lib/contenido.js';
import { crearContenido, contenidoValido, experiencia, FORMACION } from './ayuda.js';

function cargar(cambios = {}) {
  const archivos = { ...contenidoValido(), ...cambios };
  for (const [k, v] of Object.entries(archivos)) if (v === null) delete archivos[k];
  return cargarContenido(crearContenido(archivos));
}

test('contenido válido se carga, bilingüe y ordenado', () => {
  const { contenido, errores, archivosRevisados } = cargar();
  assert.deepEqual(errores, []);
  assert.equal(archivosRevisados, 5);
  assert.deepEqual(contenido.experiencia[0].cargo, { es: 'Product Engineer', en: 'Product Engineer' });
  assert.equal(contenido.experiencia[0].enCurso, true);
  assert.equal(contenido.experiencia[1].enCurso, false);
  assert.equal(contenido.general.modoGamer, true);
  assert.deepEqual(contenido.general.cargo, { es: 'Ingeniero Civil en Computación', en: 'Software Engineer' });
  assert.equal(contenido.formacion[0].institucion, 'Universidad de Chile');
  assert.deepEqual(contenido.formacion[0].memoria, { es: '“Participación lúdica.”', en: '“Ludic Engagement.”' });
  assert.deepEqual(contenido.cine[0].descripcion, { es: 'Organicé proyecciones.', en: 'Organized screenings.' });
});

test('orden: inicio desc, empate por archivo asc', () => {
  const { contenido } = cargar({
    'experiencia/2025-aida.md': null,
    'experiencia/2025-fusat.md': experiencia({ empresa: 'FUSAT', inicio: '2025-03', enCurso: 'no' }),
    'experiencia/2025-aida.md': experiencia({ empresa: 'AIDA', inicio: '2025-03', enCurso: 'no' }),
    'experiencia/2025-calmly.md': experiencia({ empresa: 'Calmly', inicio: '2025-03', enCurso: 'no' })
  });
  assert.deepEqual(contenido.experiencia.map(e => e.archivo),
    ['experiencia/2026-japs.md', 'experiencia/2025-aida.md', 'experiencia/2025-calmly.md', 'experiencia/2025-fusat.md']);
});

test('cuerpo con saltos de línea se colapsa', () => {
  const texto = experiencia().replace('Descripción.', 'Hola\n\n  mundo');
  const { contenido } = cargar({ 'experiencia/2026-japs.md': texto });
  assert.equal(contenido.experiencia[0].descripcion.es, 'Hola mundo');
});

test('general separa pitch y contacto', () => {
  const { contenido } = cargar();
  assert.deepEqual(contenido.general.pitch, { es: 'Me interesa la tecnología.', en: 'I care about technology.' });
  assert.deepEqual(contenido.general.contacto, { es: 'Escríbeme.', en: 'Drop me a line.' });
});

test('general sin ### Contacto', () => {
  const { contenido, errores } = cargar({ 'general.md': contenidoValido()['general.md'].replace('### Contacto\nEscríbeme.\n', '') });
  assert.equal(contenido, null);
  assert.deepEqual(errores, [{ archivo: 'general.md', campo: null, mensaje: 'Falta "### Contacto" dentro de "## Español"' }]);
});

test('bilingüe: falta del todo', () => {
  const { errores } = cargar({ 'experiencia/2026-japs.md': experiencia().replace('cargo: Product Engineer\n', '') });
  assert.deepEqual(errores, [{ archivo: 'experiencia/2026-japs.md', campo: 'cargo',
    mensaje: "Falta 'cargo'. Escribe 'cargo: ...' si es igual en ambos idiomas, o 'cargo_es: ...' y 'cargo_en: ...' si cambia" }]);
});

test('bilingüe: solo una variante', () => {
  const { errores } = cargar({ 'experiencia/2026-japs.md': experiencia().replace('cargo: Product Engineer', 'cargo_es: Ingeniero') });
  assert.deepEqual(errores, [{ archivo: 'experiencia/2026-japs.md', campo: 'cargo_en',
    mensaje: "Falta 'cargo_en': agrega la versión en inglés" }]);
});

test('bilingüe: base y variante a la vez', () => {
  const { errores } = cargar({ 'experiencia/2026-japs.md': experiencia({ extra: 'cargo_es: Ingeniero\n' }) });
  assert.deepEqual(errores, [{ archivo: 'experiencia/2026-japs.md', campo: 'cargo',
    mensaje: "Usa 'cargo' o bien 'cargo_es' y 'cargo_en', pero no ambos" }]);
});

test('campo de texto vacío cuenta como ausente', () => {
  const { errores } = cargar({ 'formacion/2021-uchile.md': FORMACION.replace('institucion: Universidad de Chile', 'institucion:') });
  assert.deepEqual(errores, [{ archivo: 'formacion/2021-uchile.md', campo: 'institucion',
    mensaje: "Falta 'institucion'. Agrega una línea así: institucion: ..." }]);
});

test('inicio mal formado', () => {
  const { errores } = cargar({ 'experiencia/2026-japs.md': experiencia({ inicio: '2026-4' }) });
  assert.deepEqual(errores, [{ archivo: 'experiencia/2026-japs.md', campo: 'inicio',
    mensaje: "'inicio' debe verse así: 2026-04 (año y mes con dos dígitos)" }]);
});

test('sí/no tolerante', () => {
  for (const valor of ['SI', 'Sí', 'si', 'NO']) {
    assert.deepEqual(cargar({ 'experiencia/2026-japs.md': experiencia({ enCurso: valor }) }).errores, [], valor);
  }
});

test('sí/no inválido', () => {
  const { errores } = cargar({ 'experiencia/2026-japs.md': experiencia({ enCurso: 'tal vez' }) });
  assert.deepEqual(errores, [{ archivo: 'experiencia/2026-japs.md', campo: 'en_curso', mensaje: "'en_curso' debe ser sí o no" }]);
});

test('campo desconocido sugiere', () => {
  const texto = experiencia().replace('empresa:', 'empressa:');
  const { errores } = cargar({ 'experiencia/2026-japs.md': texto });
  assert.ok(errores.some(e => e.mensaje === "El campo 'empressa' no existe. ¿Quisiste decir 'empresa'?"));
});

test('campo desconocido sin parecido', () => {
  const { errores } = cargar({ 'experiencia/2026-japs.md': experiencia({ extra: 'color: rojo\n' }) });
  assert.deepEqual(errores, [{ archivo: 'experiencia/2026-japs.md', campo: 'color', mensaje: "El campo 'color' no existe" }]);
});

test('email y urls', () => {
  const general = contenidoValido()['general.md']
    .replace('email: cgrassdev@gmail.com', 'email: cgrassdev')
    .replace('github: https://github.com/clemgrass', 'github: github.com/clemgrass');
  const { errores } = cargar({ 'general.md': general });
  assert.deepEqual(errores.map(e => e.mensaje), [
    "'email' no parece un correo",
    "'github' debe ser un enlace que empiece con https://"
  ]);
});

test('memoria obligatoria solo con memoria_tipo', () => {
  const sinMemoria = FORMACION.replace('memoria_tipo: memoria', 'memoria_tipo:').replace(/memoria_(es|en):.*\n/g, '');
  const ok = cargar({ 'formacion/2021-uchile.md': sinMemoria });
  assert.deepEqual(ok.errores, []);
  assert.equal(ok.contenido.formacion[0].memoria, null);
  assert.equal(ok.contenido.formacion[0].memoriaTipo, '');

  const mono = cargar({ 'formacion/2021-uchile.md': sinMemoria.replace('memoria_tipo:', 'memoria_tipo: Monografía') });
  assert.deepEqual(mono.errores.map(e => e.campo), ['memoria']);
});

test('memoria_tipo inválido', () => {
  const { errores } = cargar({ 'formacion/2021-uchile.md': FORMACION.replace('memoria_tipo: memoria', 'memoria_tipo: tesis') });
  assert.deepEqual(errores.map(e => e.mensaje), ["'memoria_tipo' debe ser memoria, monografia o quedar vacío"]);
});

test('formación con texto debajo es error', () => {
  const { errores } = cargar({ 'formacion/2021-uchile.md': FORMACION + '\n## Español\nAlgo\n' });
  assert.deepEqual(errores.map(e => e.mensaje), ['Los estudios no llevan texto debajo de los datos; bórralo']);
});

test('cuerpo: falta sección y sección vacía', () => {
  const sinEn = experiencia().replace('## English\nDescription.\n', '');
  const vacio = experiencia().replace('Descripción.', '');
  assert.deepEqual(cargar({ 'experiencia/2026-japs.md': sinEn }).errores.map(e => e.mensaje),
    ['Falta el título "## English" con el texto en inglés']);
  assert.deepEqual(cargar({ 'experiencia/2026-japs.md': vacio }).errores.map(e => e.mensaje),
    ['El texto debajo de "## Español" está vacío']);
});

test('los problemas del parser llegan como errores con archivo', () => {
  const { errores } = cargar({ 'cine/2023-lider.md': 'hola' });
  assert.deepEqual(errores, [{ archivo: 'cine/2023-lider.md', campo: null,
    mensaje: 'El archivo debe empezar con una línea que diga solo ---' }]);
});

test('[RF 3] archivo no .md da error; _ y . se ignoran; .MD vale', () => {
  const { errores, archivosRevisados } = cargar({
    'experiencia/nuevo.txt': experiencia(),
    'experiencia/_EJEMPLO.md': 'roto',
    'experiencia/.DS_Store': 'x',
    'cine/2024-otro.MD': contenidoValido()['cine/2023-lider.md']
  });
  assert.deepEqual(errores, [{ archivo: 'experiencia/nuevo.txt', campo: null,
    mensaje: 'Solo se leen archivos .md; cambia el nombre o bórralo' }]);
  assert.equal(archivosRevisados, 6);
});

test('[RF 5] formación vacía es error; experiencia y cine vacíos son válidos', () => {
  const sinTrabajosNiCine = cargar({ 'experiencia/2026-japs.md': null, 'experiencia/2025-aida.md': null, 'cine/2023-lider.md': null });
  assert.deepEqual(sinTrabajosNiCine.errores, []);
  assert.deepEqual(sinTrabajosNiCine.contenido.experiencia, []);
  assert.deepEqual(sinTrabajosNiCine.contenido.cine, []);

  const sinFormacion = cargar({ 'formacion/2021-uchile.md': null });
  assert.deepEqual(sinFormacion.errores, [{ archivo: 'formacion/', campo: null, mensaje: 'Debe haber al menos un estudio en formacion/' }]);
});

test('faltan general.md y una carpeta', () => {
  const archivos = contenidoValido();
  delete archivos['general.md'];
  const dir = crearContenido(archivos);
  fs.rmSync(path.join(dir, 'cine'), { recursive: true });
  const { errores } = cargarContenido(dir);
  assert.deepEqual(errores, [
    { archivo: 'general.md', campo: null, mensaje: 'No se encontró general.md' },
    { archivo: 'cine/', campo: null, mensaje: 'No se encontró la carpeta cine' }
  ]);
});

test('reporta todos los errores de todos los archivos', () => {
  const { contenido, errores } = cargar({
    'experiencia/2026-japs.md': experiencia({ inicio: 'x', enCurso: 'quizás' }),
    'cine/2023-lider.md': 'roto'
  });
  assert.equal(contenido, null);
  assert.deepEqual(errores.map(e => e.archivo), ['experiencia/2026-japs.md', 'experiencia/2026-japs.md', 'cine/2023-lider.md']);
});

test('formatearError', () => {
  assert.equal(formatearError({ archivo: 'cine/a.md', campo: 'inicio', mensaje: 'X' }), 'cine/a.md → X');
});

test('archivos o carpetas sueltos en contenido/ dan error', () => {
  const { errores } = cargar({
    '2027-nuevo.md': experiencia(),
    'experiencias/x.md': experiencia(),
    'notas.txt': 'hola',
    '_borrador.md': 'se ignora',
    '.gitkeep': ''
  });
  const mensaje = 'Esto no se usa: los trabajos van en experiencia/, los estudios en formacion/ y el cine en cine/. Muévelo o bórralo';
  assert.deepEqual(errores, [
    { archivo: '2027-nuevo.md', campo: null, mensaje },
    { archivo: 'experiencias/', campo: null, mensaje },
    { archivo: 'notas.txt', campo: null, mensaje }
  ]);
});

test('email con mailto: o espacios es error', () => {
  for (const valor of ['mailto:cgrassdev@gmail.com', 'cgrass dev@gmail.com']) {
    const { errores } = cargar({ 'general.md': contenidoValido()['general.md'].replace('email: cgrassdev@gmail.com', `email: ${valor}`) });
    assert.deepEqual(errores.map(e => e.mensaje), ["'email' debe ser solo la dirección, sin 'mailto:' ni espacios (ej. nombre@gmail.com)"], valor);
  }
});
