import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parsearArchivo } from '../lib/parser.js';

test('lee campos y cuerpo bilingüe', () => {
  const r = parsearArchivo('---\ncargo: Product Engineer\nen_curso: sí\n---\n\n## Español\nHola\nmundo\n\n## English\nHi\n');
  assert.deepEqual(r.campos, { cargo: 'Product Engineer', en_curso: 'sí' });
  assert.deepEqual(r.cuerpo, { es: 'Hola\nmundo', en: 'Hi' });
  assert.deepEqual(r.problemas, []);
});

test('[RF 1] CRLF y BOM se leen igual', () => {
  const r = parsearArchivo('﻿---\r\ncargo: X\r\n---\r\n## Español\r\nA\r\n## English\r\nB\r\n');
  assert.deepEqual(r.campos, { cargo: 'X' });
  assert.deepEqual(r.cuerpo, { es: 'A', en: 'B' });
  assert.deepEqual(r.problemas, []);
});

test('[RF 2] valor con dos puntos, comillas y # es literal', () => {
  const r = parsearArchivo('---\ntitulo_es: Producción: "Festival" #8\nempresa: "Niñas Pro"\n---\n');
  assert.equal(r.campos.titulo_es, 'Producción: "Festival" #8');
  assert.equal(r.campos.empresa, 'Niñas Pro');
});

test('comentarios y líneas vacías se ignoran', () => {
  const r = parsearArchivo('---\n# una nota\n\n  # otra nota\ncargo: X\n---\n');
  assert.deepEqual(r.campos, { cargo: 'X' });
  assert.deepEqual(r.problemas, []);
});

test('sin --- inicial', () => {
  const r = parsearArchivo('cargo: X\n');
  assert.equal(r.problemas[0].mensaje, 'El archivo debe empezar con una línea que diga solo ---');
});

test('sin --- de cierre', () => {
  const r = parsearArchivo('---\ncargo: X\n');
  assert.equal(r.problemas[0].mensaje, 'Falta la línea --- que cierra los datos del principio');
});

test('línea sin dos puntos', () => {
  const r = parsearArchivo('---\ncargo Product\n---\n');
  assert.deepEqual(r.problemas, [{ campo: null, mensaje: 'La línea "cargo Product" debería verse así: campo: valor' }]);
});

test('campo repetido', () => {
  const r = parsearArchivo('---\ncargo: A\ncargo: B\n---\n');
  assert.deepEqual(r.problemas, [{ campo: 'cargo', mensaje: "El campo 'cargo' aparece dos veces; deja solo uno" }]);
});

test('encabezado desconocido y texto suelto', () => {
  const r = parsearArchivo('---\ncargo: A\n---\ntexto suelto\n## Español\nHola\n## Frances\nBonjour\n');
  assert.deepEqual(r.problemas.map(p => p.mensaje), [
    'Hay texto antes de "## Español" que no se mostrará; muévelo debajo del título correcto',
    'El título "## Frances" no se reconoce: usa "## Español" o "## English"'
  ]);
  assert.equal(r.cuerpo.es, 'Hola');
});

test('encabezados tolerantes', () => {
  const r = parsearArchivo('---\ncargo: A\n---\n## espanol\nHola\n## INGLÉS\nHi\n');
  assert.deepEqual(r.cuerpo, { es: 'Hola', en: 'Hi' });
  assert.deepEqual(r.problemas, []);
});

test('sección ausente es null', () => {
  const r = parsearArchivo('---\ncargo: A\n---\n## Español\nHola\n');
  assert.equal(r.cuerpo.en, null);
});

test('### es texto normal de la sección', () => {
  const r = parsearArchivo('---\na: b\n---\n## Español\nUno\n### Contacto\nDos\n');
  assert.equal(r.cuerpo.es, 'Uno\n### Contacto\nDos');
});
