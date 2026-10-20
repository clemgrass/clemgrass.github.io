import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { cargarContenido } from '../lib/contenido.js';

test('el contenido real es válido', () => {
  assert.deepEqual(cargarContenido('contenido').errores, []);
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
