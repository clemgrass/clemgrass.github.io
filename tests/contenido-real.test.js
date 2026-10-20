import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { cargarContenido } from '../lib/contenido.js';

test('el contenido real es válido', () => {
  assert.deepEqual(cargarContenido('contenido').errores, []);
});

test('cantidades y orden', () => {
  const c = cargarContenido('contenido').contenido;
  assert.deepEqual(c.experiencia.filter(e => e.enCurso).map(e => e.empresa.es), ['Niñas Pro', 'JAPS Engineering SpA']);
  assert.equal(c.experiencia.filter(e => !e.enCurso).length, 6);
  assert.deepEqual(c.formacion.map(f => f.institucion), ['Universidad de Chile', 'Universidad de Chile', 'Saint George’s College']);
  assert.equal(c.cine.length, 3);
  assert.match(c.cine[0].titulo.es, /Festival Cine Joven/);
  assert.match(c.cine[1].titulo.es, /Querida Beauchefiana/);
  assert.match(c.cine[2].titulo.es, /Líder de grupo de cine/);
});

test('los archivos de ejemplo también son válidos', () => {
  for (const carpeta of ['experiencia', 'formacion', 'cine']) {
    const ejemplo = fs.readFileSync(`contenido/${carpeta}/_EJEMPLO.md`, 'utf8');
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'ejemplo-'));
    fs.cpSync('contenido', dir, { recursive: true });
    fs.writeFileSync(`${dir}/${carpeta}/2099-ejemplo.md`, ejemplo);
    assert.deepEqual(cargarContenido(dir).errores, [], carpeta);
  }
});

test('sin teléfono en ningún archivo', () => {
  for (const archivo of fs.readdirSync('contenido', { recursive: true })) {
    const ruta = `contenido/${archivo}`;
    if (!fs.statSync(ruta).isFile()) continue;
    const texto = fs.readFileSync(ruta, 'utf8');
    assert.ok(!texto.includes('7999') && !texto.includes('+56'), ruta);
  }
});
