import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { crearContenido, contenidoValido, experiencia, GENERAL } from './ayuda.js';

function construir(contenidoDir = 'contenido') {
  const salida = fs.mkdtempSync(path.join(os.tmpdir(), 'sitio-'));
  const r = spawnSync(process.execPath, ['node_modules/@11ty/eleventy/cmd.cjs', '--output', salida, '--quiet'],
    { env: { ...process.env, CONTENIDO_DIR: contenidoDir }, encoding: 'utf8' });
  const indice = path.join(salida, 'index.html');
  return { status: r.status, stderr: r.stderr + r.stdout, html: fs.existsSync(indice) ? fs.readFileSync(indice, 'utf8') : '' };
}

test('build real', () => {
  const { status, html, stderr } = construir();
  assert.equal(status, 0, stderr);
  assert.match(html, /<html lang="es"/);
  assert.equal((html.match(/class="tarjeta"/g) || []).length, 2);
  assert.ok(html.indexOf('Niñas Pro') < html.indexOf('JAPS Engineering SpA'));
  assert.ok(html.includes('Partida en curso') && html.includes('Currently playing'));
  assert.ok(!/Descargar CV|Download CV|\.pdf|7999/.test(html));
  assert.ok(!/fonts\.googleapis|(href|src)="\//.test(html));
  const iF = html.indexOf('Festival Cine Joven'), iQ = html.indexOf('Querida Beauchefiana'), iL = html.indexOf('Líder de grupo de cine');
  assert.ok(iF < iQ && iQ < iL);
  assert.ok(html.includes('mailto:cgrassdev@gmail.com'));
});

test('[RF 4] texto con < & se escapa', () => {
  const dir = crearContenido({ ...contenidoValido(), 'experiencia/2026-japs.md': experiencia({ cargo: 'A<b>&C' }) });
  const { status, html } = construir(dir);
  assert.equal(status, 0);
  assert.ok(html.includes('A&lt;b&gt;&amp;C'));
  assert.ok(!html.includes('A<b>&C'));
});

test('[RF 5] sin en curso ni cine se omiten las secciones', () => {
  const archivos = contenidoValido();
  delete archivos['experiencia/2026-japs.md'];
  delete archivos['cine/2023-lider.md'];
  const { status, html } = construir(crearContenido(archivos));
  assert.equal(status, 0);
  assert.ok(!html.includes('class="en-curso"'));
  assert.ok(!html.includes('class="cine"'));
  assert.ok(html.includes('class="completadas"'));
});

test('modo neutro', () => {
  const dir = crearContenido({ ...contenidoValido(), 'general.md': GENERAL.replace('modo_gamer: sí', 'modo_gamer: no') });
  const { status, html } = construir(dir);
  assert.equal(status, 0);
  assert.ok(html.includes('Experiencia previa'));
  assert.ok(!html.includes('Misiones completadas'));
});

test('contenido roto rompe el build con mensaje humano', () => {
  const dir = crearContenido({ ...contenidoValido(), 'experiencia/2026-japs.md': experiencia({ inicio: '2026-4' }) });
  const { status, stderr } = construir(dir);
  assert.notEqual(status, 0);
  assert.ok(stderr.includes("'inicio' debe verse así"), stderr);
});
