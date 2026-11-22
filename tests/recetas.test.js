// Las recetas de COMO-EDITAR.md no deben poner en rojo el check del PR:
// se aplican a una copia del proyecto y se corre la suite completa ahí.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const RAIZ = process.cwd();

function copiaDelProyecto() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'proyecto-'));
  for (const item of ['lib', 'src', 'tests', 'scripts', 'contenido', 'package.json', 'eleventy.config.js']) {
    fs.cpSync(path.join(RAIZ, item), path.join(dir, item), { recursive: true });
  }
  fs.symlinkSync(path.join(RAIZ, 'node_modules'), path.join(dir, 'node_modules'));
  return dir;
}

// Archivos publicados de una carpeta (sin _EJEMPLO), sean los que sean hoy: así las recetas no dependen del contenido actual.
function publicados(c, carpeta) {
  return fs.readdirSync(path.join(c, carpeta)).filter(f => f.endsWith('.md') && !f.startsWith('_')).map(f => path.join(c, carpeta, f));
}

function terminarTodos(c) {
  for (const ruta of publicados(c, 'experiencia')) {
    fs.writeFileSync(ruta, fs.readFileSync(ruta, 'utf8').replace(/^en_curso: sí$/m, 'en_curso: no'));
  }
}

function suiteEn(dir) {
  const pruebas = fs.readdirSync(path.join(dir, 'tests')).filter(f => f.endsWith('.test.js') && f !== 'recetas.test.js');
  const env = { ...process.env };
  delete env.NODE_TEST_CONTEXT; // si no, el hijo reporta al runner padre y siempre sale con 0
  const r = spawnSync(process.execPath, ['--test', ...pruebas.map(f => `tests/${f}`)], { cwd: dir, env, encoding: 'utf8' });
  const v = spawnSync(process.execPath, ['scripts/validar.js'], { cwd: dir, encoding: 'utf8' });
  return { tests: r.status, salida: r.stdout.split('\n').filter(l => l.startsWith('not ok') || l.includes('✖')).join('\n'), validar: v.status };
}

test('todas las recetas juntas mantienen el check verde', () => {
  const dir = copiaDelProyecto();
  const c = path.join(dir, 'contenido');
  terminarTodos(c);
  const general = path.join(c, 'general.md');
  fs.writeFileSync(general, fs.readFileSync(general, 'utf8')
    .replace(/^modo_gamer: .*$/m, 'modo_gamer: no')
    .replace('## Español\n', '## Español\nHoy, '));
  fs.copyFileSync(path.join(c, 'experiencia/_EJEMPLO.md'), path.join(c, 'experiencia/2027-empresa.md'));
  fs.copyFileSync(path.join(c, 'cine/_EJEMPLO.md'), path.join(c, 'cine/2027-cortometraje.md'));
  fs.copyFileSync(path.join(c, 'formacion/_EJEMPLO.md'), path.join(c, 'formacion/2027-magister.md'));
  for (const ruta of publicados(c, 'cine').slice(0, 1)) fs.rmSync(ruta);
  const r = suiteEn(dir);
  assert.equal(r.validar, 0);
  assert.equal(r.tests, 0, r.salida);
});

test('sin trabajos en curso ni cine el check sigue verde', () => {
  const dir = copiaDelProyecto();
  const c = path.join(dir, 'contenido');
  terminarTodos(c);
  for (const ruta of publicados(c, 'cine')) fs.rmSync(ruta);
  const r = suiteEn(dir);
  assert.equal(r.validar, 0);
  assert.equal(r.tests, 0, r.salida);
});
